<<<<<<< HEAD
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
                    {editingItem ? 'Додати/Змінити зображення' : 'Зображення (можна декілька)'}
                </ModalLabel>
                
                {/* ЗМІНА 3: Input type="file" з атрибутом multiple */}
                <ModalInput
                    id="fileInput"
                    type="file"
                    accept="image/*"
                    multiple 
                    onChange={(e) => setSelectedFiles(e.target.files)} // Зберігаємо FileList
                />
                
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
=======
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditorBuild from '@ckeditor/ckeditor5-build-classic';

const ClassicEditor = ClassicEditorBuild as any;

interface NewsFormData {
  title: string;
  content: string;
  isImportant: boolean;
}

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl?: string;
  isImportant: boolean;
  publishedAt: string;
}

interface NewsModalProps {
  formData: NewsFormData;
  setFormData: React.Dispatch<React.SetStateAction<NewsFormData>>;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  editingItem: News | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const NewsModal: React.FC<NewsModalProps> = ({
  formData,
  setFormData,
  setSelectedFile,
  editingItem,
  onSubmit,
  onClose
}) => {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      <style> 
        {`
          .ck-editor__editable_inline {
          min-height: 160px; /* відповідає rows={8} */}
        `}
      </style>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Заголовок *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Введіть заголовок новини"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Зображення (необов’язково)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        {editingItem && editingItem.imageUrl && (
          <p className="mt-2 text-sm text-gray-500">Поточне: {editingItem.imageUrl}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Контент *
        </label>
        <CKEditor
          editor={ClassicEditor}
          data={formData.content}
          onChange={(_, editor: any) => {
            const data = editor.getData();
            setFormData({ ...formData, content: data });
          }}
          config={{
            toolbar: ['bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo']
          }}
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isImportant"
          checked={formData.isImportant}
          onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        />
        <label htmlFor="isImportant" className="ml-2 text-sm font-medium text-gray-700">
          Важлива новина
        </label>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          Скасувати
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          {editingItem ? 'Зберегти зміни' : 'Створити новину'}
        </button>
      </div>
    </form>
  );
};

export default NewsModal;
>>>>>>> upstream/main
