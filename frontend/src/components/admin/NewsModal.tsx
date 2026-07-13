import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditorBuild from '@ckeditor/ckeditor5-build-classic';
import { News, NewsFormData } from '../../types/news';
import NewsCard from '../NewsCard';
import { ModalInput, ModalLabel, ModalCheckbox, ModalButton } from './ui/ModalStyles';

const ClassicEditor = ClassicEditorBuild as any;

interface NewsModalProps {
    formData: NewsFormData;
    setFormData: React.Dispatch<React.SetStateAction<NewsFormData>>;
    
    // ЗМІНА 1: Приймаємо список файлів
    selectedFiles: FileList | null;
    setSelectedFiles: React.Dispatch<React.SetStateAction<FileList | null>>;
    
    editingItem: News | null;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

// CKEditor рендерить звичайний <div>, а не <input>/<textarea>,
// тому атрибут required з ModalLabel ніяк не перевіряється браузером.
// Через DOMParser дістаємо саме видимий текст (він сам розкодовує будь-яку форму
// пробілу — &nbsp;, &#160;, реальний символ U+00A0 тощо), а тоді прибираємо
// невидимі пробіли, щоб рядок з самих пробілів теж вважався пустим контентом.
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

const NewsModal: React.FC<NewsModalProps> = ({
    formData,
    setFormData,
    selectedFiles,
    setSelectedFiles,
    editingItem,
    onSubmit,
    onClose
}) => {
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [contentError, setContentError] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);

    // ЗМІНА 2: Логіка прев'ю для першого файлу зі списку
    useEffect(() => {
        if (selectedFiles && selectedFiles.length > 0) {
            // Беремо перший файл для попереднього перегляду
            const file = selectedFiles[0];
            const objectUrl = URL.createObjectURL(file);
            setPreviewImageUrl(objectUrl);
            
            // Чистка пам'яті
            return () => URL.revokeObjectURL(objectUrl);
        }
        setPreviewImageUrl(null);
    }, [selectedFiles]);

    // Визначаємо URL для прев'ю: або новий файл, або старе фото з сервера
    const imageUrlForPreview = previewImageUrl
        ? previewImageUrl
        : (editingItem?.images && editingItem.images.length > 0)
            ? editingItem.images[0].imagePath // Якщо у вас структура NewsImage { imagePath: string }
            : editingItem?.imageUrl // Фоллбек для старої структури
            ? editingItem.imageUrl
            : undefined;

   const previewNews: News = {
        id: editingItem?.id || 0,
        title: formData.title || "Заголовок новини",
        content: formData.content || "<p>Тут буде ваш контент</p>",
        publishedAt: new Date().toISOString(),
        isImportant: formData.isImportant,
        
        // ОСЬ ТУТ БУЛА ПОМИЛКА. Додаємо newsId: 0
        imageUrl: imageUrlForPreview, 
        images: imageUrlForPreview ? [{ id: 0, imagePath: imageUrlForPreview, newsId: 0 }] : [],
    };

    // Перевіряємо КОЖЕН обраний файл — з декількох зображень досить одного завеликого,
    // щоб зіпсувати завантаження, тож відхиляємо весь вибір і просимо обрати заново.
    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files || files.length === 0) {
            setFileError(null);
            setSelectedFiles(null);
            return;
        }

        const oversized = Array.from(files).filter(f => f.size > MAX_FILE_SIZE_BYTES);

        if (oversized.length > 0) {
            const list = oversized
                .map(f => `${f.name} (${(f.size / (1024 * 1024)).toFixed(1)} МБ)`)
                .join(', ');
            setFileError(
                `Занадто великі файли (максимум ${MAX_FILE_SIZE_MB} МБ на файл): ${list}`
            );
            setSelectedFiles(null);
            e.target.value = ''; // дозволяємо вибрати файли повторно після виправлення
            return;
        }

        setFileError(null);
        setSelectedFiles(files);
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
                {`.ck-editor__editable_inline { min-height: 200px; }`}
            </style>
            <div>
                <ModalLabel required htmlFor="title">Заголовок</ModalLabel>
                <ModalInput
                    id="title"
                    type="text"
                    required
                    maxLength={200}
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Іван Франко відвідав власний університет!"
                />
            </div>

            <div>
                <ModalLabel htmlFor="fileInput">
                    {editingItem ? 'Додати/Змінити зображення' : 'Зображення (можна декілька)'}
                </ModalLabel>
                
                {/* ЗМІНА 3: Input type="file" з атрибутом multiple */}
                <ModalInput
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    multiple 
                    onChange={handleFilesChange}
                />
                {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
                
                <div className="mt-2 text-sm text-gray-500">
                    {selectedFiles && selectedFiles.length > 0 ? (
                        <div>
                            <p className="font-medium text-green-600">Обрано файлів: {selectedFiles.length}</p>
                            <ul className="list-disc list-inside mt-1">
                                {Array.from(selectedFiles).map((file, index) => (
                                    <li key={index} className="truncate">{file.name}</li>
                                ))}
                            </ul>
                        </div>
                    ) : !editingItem ? (
                        "Файли не вибрано"
                    ) : null}
                </div>
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
                <div className="w-full max-w-sm mx-auto border rounded-lg overflow-hidden shadow-sm"> 
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