import React, { useState, useEffect } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditorBuild from '@ckeditor/ckeditor5-build-classic';
import { News, NewsFormData } from '../../types/news';
import NewsCard from '../NewsCard';

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
        <form onSubmit={onSubmit} className="px-6 pb-6 space-y-6">
            <style>
                {`.ck-editor__editable_inline { min-height: 200px; }`}
            </style>
            <div>
                <label className="block text-md font-medium text-gray-700 mb-2">Заголовок <span className="text-red-600">*</span></label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="Іван Франко відвідав власний університет!"
                />
            </div>

            <div>
                <label className="block text-md font-medium text-gray-700 mb-2">
                    {editingItem ? 'Змінити зображення' : 'Зображення'}
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
                
                <p className="mt-2 text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : !editingItem ? "Файл не вибрано" : null}
                </p>
            </div>

            <div>
                <label className="block text-md font-medium text-gray-700 mb-2">Контент <span className="text-red-600">*</span></label>
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
                <input
                    type="checkbox"
                    id="isImportant"
                    checked={formData.isImportant}
                    onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
                    className="h-4 w-4 border-gray-300 rounded"
                />
                <label htmlFor="isImportant" className="ml-2 text-md font-medium text-gray-700">Важлива новина</label>
            </div>
            
            <div className="px-6 pt-6"> 
    <div className="w-full max-w-sm mx-auto"> 
     <NewsCard news={previewNews} isPreview={true} />
    </div>
   </div>

            <hr className="border-t border-gray-200" />

            <div className="flex justify-end space-x-4">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                    Скасувати
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                    {editingItem ? 'Зберегти зміни' : 'Створити новину'}
                </button>
            </div>
        </form>
    );
};

export default React.memo(NewsModal);