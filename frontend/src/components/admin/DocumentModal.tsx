import React from 'react';
import { Document, DocumentFormData } from '../../types/documents';
import { ModalInput, ModalButton, ModalLabel } from './ui/ModalStyles';

interface DocumentModalProps {
  formData: DocumentFormData;
  setFormData: React.Dispatch<React.SetStateAction<DocumentFormData>>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  editingItem: Document | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const DocumentModal: React.FC<DocumentModalProps> = ({
  formData,
  setFormData,
  selectedFile,
  setSelectedFile,
  editingItem,
  onSubmit,
  onClose
}) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files?.[0] || null);
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || 'file';
  };

  const fileInputHelperText = selectedFile
    ? selectedFile.name
    : (editingItem?.filePath ? `Поточний файл: ${getFileName(editingItem.filePath)}` : "Файл не вибрано");

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      
      <div>
        <ModalLabel required htmlFor="title">
          Назва документа
        </ModalLabel>
        <ModalInput
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Назва документа"
        />
      </div>

      <div>
        <ModalLabel htmlFor="description">
          Опис
        </ModalLabel>
        <textarea
          id="description"
          rows={3}
          value={formData.description || ''}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Короткий опис документа..."
        />
      </div>

      <div>
        <ModalLabel required={!editingItem} htmlFor="file">
          Файл
        </ModalLabel>
        <ModalInput
          id="file"
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          onChange={handleFileChange}
        />
        <p className="mt-1 text-xs text-gray-500">{fileInputHelperText}</p>
      </div>

      <div className="flex justify-end space-x-4 border-t pt-6">
        <ModalButton type="button" onClick={onClose} variant="secondary">
          Скасувати
        </ModalButton>
        <ModalButton
          type="submit"
          variant="primary"
        >
          {editingItem ? 'Зберегти зміни' : 'Додати документ'}
        </ModalButton>
      </div>
    </form>
  );
};

export default DocumentModal;