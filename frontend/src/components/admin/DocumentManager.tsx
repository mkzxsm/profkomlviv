import React, { useState, useCallback } from 'react';
import { X, FilePlus } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import { Document, DocumentFormData } from '../../types/documents';
import DocumentTable from './DocumentTable';
import DocumentModal from './DocumentModal';

interface DocumentManagerProps {
  data: Document[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

const DocumentManager: React.FC<DocumentManagerProps> = ({ data, loading, fetchData }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Document | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getInitialFormData = (): DocumentFormData => ({
    title: '',
    description: '',
  });

  const [formData, setFormData] = useState<DocumentFormData>(getInitialFormData());

  const handleOpenAddModal = useCallback(() => {
    setEditingItem(null);
    setFormData(getInitialFormData());
    setSelectedFile(null);
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((doc: Document) => {
    setEditingItem(doc);
    setFormData({
      title: doc.title,
      description: doc.description || '',
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
    setSelectedFile(null);
    setFormData(getInitialFormData());
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSend = new FormData();
    dataToSend.append('Title', formData.title);
    dataToSend.append('Description', formData.description || '');

    if (selectedFile) {
      dataToSend.append('File', selectedFile);
    } else if (!editingItem) {
      alert('Будь ласка, додайте файл.');
      return;
    }

    const headers = {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    };

    const url = editingItem
      ? `${import.meta.env.VITE_API_URL}/api/documents/${editingItem.id}`
      : `${import.meta.env.VITE_API_URL}/api/documents`;
    const method = editingItem ? 'PUT' : 'POST';

    try {
      await axios({ method, url, data: dataToSend, headers });
      await fetchData();
      handleCloseModal();
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      console.error('Помилка збереження документа:', axiosError.response?.data || axiosError.message);
      alert(axiosError.response?.data?.message || 'Помилка збереження');
    }
  }, [formData, selectedFile, editingItem, fetchData, handleCloseModal]);

  const handleDelete = useCallback(async (id: number) => {
    const docToDelete = data.find(d => d.id === id);
    if (!docToDelete) return;

    if (window.confirm(`Ви впевнені, що хочете видалити документ "${docToDelete.title}"?`)) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/documents/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        await fetchData();
      } catch (error) {
        console.error('Помилка видалення документа:', error);
        alert('Не вдалося видалити документ.');
      }
    }
  }, [data, fetchData]);

  const modalTitle = editingItem ? 'Редагувати документ' : 'Додати документ';
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Управління документами</h2>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <FilePlus className="h-5 w-5" />
          <span>Додати документ</span>
        </button>
      </div>

      <DocumentTable
        data={data}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-semibold text-gray-900">
                {modalTitle}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700" title="Закрити">
                <X className="h-6 w-6" />
              </button>
            </div>
            <DocumentModal
              formData={formData}
              setFormData={setFormData}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              editingItem={editingItem}
              onSubmit={handleSubmit}
              onClose={handleCloseModal}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentManager;