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
    selectedFile: File | null;
    setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
    editingItem: News | null;
    onSubmit: (e: React.FormEvent) => void;
    onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({
    formData,
    setFormData,
    selectedFile,
    setSelectedFile,
    editingItem,
    onSubmit,
    onClose
}) => {
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (selectedFile) {
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreviewImageUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }
        setPreviewImageUrl(null);
    }, [selectedFile]);

    const imageUrlForPreview = previewImageUrl
        ? previewImageUrl
        : editingItem?.imageUrl
        ? editingItem.imageUrl
        : undefined;

    const previewNews: News = {
        id: editingItem?.id || 0,
        title: formData.title || "Заголовок новини",
        content: formData.content || "<p>Тут буде ваш контент</p>",
        publishedAt: new Date().toISOString(),
        isImportant: formData.isImportant,
        imageUrl: imageUrlForPreview,
    };

    return (
        <form onSubmit={onSubmit} className="p-6 space-y-6">
            <style>
                {`.ck-editor__editable_inline { min-height: 200px; }`}
            </style>
            <div>
                <ModalLabel required htmlFor="title">Заголовок</ModalLabel>
                <ModalInput
                    id="title"
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Іван Франко відвідав власний університет!"
                />
            </div>

            <div>
                <ModalLabel htmlFor="fileInput">
                    {editingItem ? 'Змінити зображення' : 'Зображення'}
                </ModalLabel>
                <ModalInput
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                <p className="mt-2 text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : !editingItem ? "Файл не вибрано" : null}
                </p>
            </div>

            <div>
                <ModalLabel required>Контент</ModalLabel>
                <CKEditor
                    editor={ClassicEditor}
                    data={formData.content}
                    onChange={(_, editor: any) => {
                        const data = editor.getData();
                        setFormData(prev => ({ ...prev, content: data }));
                    }}
                    config={{
                        toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', '|', 'undo', 'redo']
                    }}
                />
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
                <ModalLabel>Попередній перегляд</ModalLabel>
                <div className="w-full max-w-sm mx-auto"> 
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