import React, { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditorBuild from '@ckeditor/ckeditor5-build-classic';
import { News, NewsFormData } from '../../types/news';
import NewsCard from '../NewsCard';
import { ModalInput, ModalLabel, ModalCheckbox, ModalButton, CharCounter } from './ui/ModalStyles';
import { FIELD_LIMITS } from '../../constants/fieldLimits';

const ClassicEditor = ClassicEditorBuild as any;

interface NewsModalProps {
    formData: NewsFormData;
    setFormData: React.Dispatch<React.SetStateAction<NewsFormData>>;
    selectedFiles: FileList | null;
    setSelectedFiles: React.Dispatch<React.SetStateAction<FileList | null>>;
    editingItem: News | null;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

const isContentEmpty = (html: string | undefined) => {
    if (!html) return true;
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const text = (doc.body.textContent || '')
        .replace(/[\s\u00A0\u200B\uFEFF]/g, '')
        .trim();
    return text.length === 0;
};

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_FILES_COUNT = 5;

// НОВЕ: Уніфікований тип для черги зображень
type UnifiedMedia = {
    uniqueId: string;
    isNew: boolean;
    url: string;
    file?: File;         // Тільки для нових
    serverId?: number;   // Тільки для існуючих на сервері
};

const NewsModal: React.FC<NewsModalProps> = ({
    formData,
    setFormData,
    selectedFiles,
    setSelectedFiles,
    editingItem,
    onSubmit,
    onClose
}) => {
    const [contentError, setContentError] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    
    // НОВЕ: Єдина черга для сортування старих і нових зображень
    const [mediaQueue, setMediaQueue] = useState<UnifiedMedia[]>([]);
    const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
    
    // Реф для інпуту, щоб скидати його після вибору
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ініціалізація існуючих зображень при завантаженні (тільки один раз)
    useEffect(() => {
        if (editingItem) {
            let initialQueue: UnifiedMedia[] = [];
            
            if (editingItem.images && editingItem.images.length > 0) {
                initialQueue = editingItem.images.map(img => ({
                    uniqueId: `old-${img.id}`,
                    isNew: false,
                    url: img.imagePath,
                    serverId: img.id
                }));
            } else if (editingItem.imageUrl) {
                // Фоллбек для старої структури бази (якщо є тільки 1 фото)
                initialQueue = [{
                    uniqueId: 'old-fallback',
                    isNew: false,
                    url: editingItem.imageUrl,
                    serverId: -1 // Або інший маркер для бекенду
                }];
            }
            setMediaQueue(initialQueue);
        }
    }, [editingItem]); // Виконується при монтуванні або зміні новини

    // НОВЕ: Синхронізація візуальної черги з батьківським станом
    useEffect(() => {
        const dt = new DataTransfer();
        const orderForBackend: (number | string)[] = [];

        mediaQueue.forEach(media => {
            if (media.isNew && media.file) {
                dt.items.add(media.file);
                orderForBackend.push('new');
            } else if (!media.isNew && media.serverId) {
                orderForBackend.push(media.serverId);
            }
        });

        // 1. Оновлюємо реальний FileList для завантаження
        setSelectedFiles(dt.files.length > 0 ? dt.files : null);
        
        // 2. Оновлюємо formData для бекенду (видалені + новий порядок)
        // [!] Рекомендую додати поле mediaOrder у NewsFormData
        setFormData(prev => ({ 
            ...prev, 
            removedImageIds,
            // mediaOrder: orderForBackend 
        }));
    }, [mediaQueue, removedImageIds, setFormData, setSelectedFiles]);

    // Обробка додавання нових файлів
    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        if (mediaQueue.length + files.length > MAX_FILES_COUNT) {
            setFileError(`Максимальна кількість файлів: ${MAX_FILES_COUNT}. У черзі вже ${mediaQueue.length}, ви обрали ще ${files.length}.`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        const oversized = files.filter(f => f.size > MAX_FILE_SIZE_BYTES);
        if (oversized.length > 0) {
            const list = oversized.map(f => `${f.name} (${(f.size / (1024 * 1024)).toFixed(1)} МБ)`).join(', ');
            setFileError(`Занадто великі файли (максимум ${MAX_FILE_SIZE_MB} МБ на файл): ${list}`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }

        setFileError(null);

        // Перетворюємо файли у формат UnifiedMedia
        const newMedia: UnifiedMedia[] = files.map(file => ({
            uniqueId: `new-${URL.createObjectURL(file)}`, 
            isNew: true,
            file: file,
            url: URL.createObjectURL(file)
        }));

        setMediaQueue(prev => [...prev, ...newMedia]);
        if (fileInputRef.current) fileInputRef.current.value = ''; // Скидаємо інпут
    };

    // НОВЕ: Функція для зміни порядку елементів
    const moveMedia = (index: number, direction: 'left' | 'right') => {
        const newQueue = [...mediaQueue];
        if (direction === 'left' && index > 0) {
            [newQueue[index - 1], newQueue[index]] = [newQueue[index], newQueue[index - 1]];
        } else if (direction === 'right' && index < newQueue.length - 1) {
            [newQueue[index], newQueue[index + 1]] = [newQueue[index + 1], newQueue[index]];
        }
        setMediaQueue(newQueue);
    };

    // НОВЕ: Функція для видалення елемента з черги
    const removeMedia = (index: number) => {
        const item = mediaQueue[index];
        if (!item.isNew && item.serverId) {
            // Відправляємо ID в масив на видалення
            setRemovedImageIds(prev => [...prev, item.serverId]);
        } else {
            // Очищаємо пам'ять браузера для нових файлів
            URL.revokeObjectURL(item.url);
        }
        setMediaQueue(prev => prev.filter((_, i) => i !== index));
    };

    // Формуємо об'єкт для прев'ю на основі поточної черги
    const previewNewsImages = mediaQueue.map((media, index) => ({
        id: media.serverId || -index - 1,
        imagePath: media.url,
        newsId: 0
    }));

    const previewNews: News = {
        id: editingItem?.id || 0,
        title: formData.title || "Заголовок новини",
        content: formData.content || "<p>Тут буде ваш контент</p>",
        publishedAt: new Date().toISOString(),
        isImportant: Boolean(formData.isImportant),
        
        imageUrl: previewNewsImages.length > 0 ? previewNewsImages[0].imagePath : undefined,
        images: previewNewsImages, 
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isContentEmpty(formData.content)) {
            setContentError(true);
            return;
        }
        setContentError(false);
        onSubmit(e);
    };

    return (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <style>
                {`
                .ck-editor__editable_inline { 
                    min-height: 200px; 
                    word-wrap: break-word; 
                    word-break: break-word; 
                }
                `}
            </style>
            <div>
                <ModalLabel required htmlFor="title">Заголовок</ModalLabel>
                <ModalInput
                    id="title"
                    type="text"
                    required
                    maxLength={FIELD_LIMITS.title}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Іван Франко відвідав власний університет!"
                />
                <CharCounter current={formData.title.length} max={FIELD_LIMITS.title} />
            </div>

            <div>
                <ModalLabel htmlFor="fileInput">
                    {`Зображення (до ${MAX_FILES_COUNT} шт, можна змінювати порядок)`}
                </ModalLabel>
                
                {/* Інпут тепер слугує тільки "провідником" для додавання у загальну чергу */}
                <ModalInput
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    multiple 
                    ref={fileInputRef}
                    onChange={handleFilesChange}
                    disabled={mediaQueue.length >= MAX_FILES_COUNT}
                />
                {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
                
                {/* НОВИЙ БЛОК ВІДОБРАЖЕННЯ ТА СОРТУВАННЯ */}
                {mediaQueue.length > 0 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Черга відображення (зліва направо):</p>
                        <div className="flex flex-wrap gap-4">
                            {mediaQueue.map((media, index) => (
                                <div key={media.uniqueId} className="relative group w-24 h-24">
                                    <img 
                                        src={media.url} 
                                        alt={`media-${index}`} 
                                        className={`w-full h-full object-cover rounded border-2 ${index === 0 ? 'border-green-500 shadow-sm' : 'border-gray-300'}`} 
                                    />
                                    
                                    {/* Індикатор обкладинки (перше фото) */}
                                    {index === 0 && (
                                        <div className="absolute top-0 left-0 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-br-lg rounded-tl font-bold z-10 shadow">
                                            Головне
                                        </div>
                                    )}

                                    {/* Кнопки переміщення і видалення з'являються при наведенні */}
                                    <div className="absolute inset-0 bg-black bg-opacity-40 rounded opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1">
                                        <button
                                            type="button"
                                            onClick={() => removeMedia(index)}
                                            className="self-end bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-sm"
                                            title="Видалити"
                                        >✕</button>
                                        
                                        <div className="flex justify-between w-full pb-1 px-1">
                                            <button
                                                type="button"
                                                onClick={() => moveMedia(index, 'left')}
                                                disabled={index === 0}
                                                className={`bg-white text-gray-800 rounded w-6 h-6 flex items-center justify-center text-xs shadow-sm ${index === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                                            >◀</button>
                                            
                                            <button
                                                type="button"
                                                onClick={() => moveMedia(index, 'right')}
                                                disabled={index === mediaQueue.length - 1}
                                                className={`bg-white text-gray-800 rounded w-6 h-6 flex items-center justify-center text-xs shadow-sm ${index === mediaQueue.length - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}`}
                                            >▶</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div>
                <ModalLabel required>Контент</ModalLabel>
                <div className={contentError ? 'rounded-lg ring-2 ring-red-500' : ''}>
                    <CKEditor
                        editor={ClassicEditor}
                        data={formData.content}
                        onChange={(_, editor: any) => {
                            const data = editor.getData();
                            setFormData(prev => ({ ...prev, content: data }));
                            if (contentError && !isContentEmpty(data)) {
                                setContentError(false);
                            }
                        }}
                        config={{
                            toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
                        }}
                    />
                </div>
                {contentError && (
                    <p className="mt-1 text-sm text-red-600">Поле "Контент" є обов'язковим і не може бути порожнім.</p>
                )}
            </div>

            <div className="flex items-center">
                <ModalCheckbox
                    id="isImportant"
                    checked={formData.isImportant}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                />
                <label htmlFor="isImportant" className="ml-2 text-md font-medium text-gray-700">Важлива новина</label>
            </div>
            
            <div>
                <ModalLabel>Попередній перегляд (обкладинка)</ModalLabel>
                <div className="w-full max-w-sm mx-auto border rounded-lg overflow-hidden shadow-sm break-words"> 
                    <NewsCard news={previewNews} isPreview={true} />
                </div>
            </div>

            <div className="flex justify-end space-x-4 border-t pt-4">
                <ModalButton type="button" onClick={onClose} variant="secondary">
                    Скасувати
                </ModalButton>
                <ModalButton type="submit" variant="primary">
                    {editingItem ? 'Зберегти зміни' : 'Створити новину'}
                </ModalButton>
            </div>
        </form>
    );
};

export default React.memo(NewsModal);