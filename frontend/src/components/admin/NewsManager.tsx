import React, { useState, useCallback } from 'react';
import { PlusCircle, X } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import NewsTable from './NewsTable';
import NewsModal from './NewsModal';
import { News, NewsFormData } from '../../types/news';

interface NewsManagerProps {
    data: News[];
    loading: boolean;
    fetchData: () => Promise<void>;
}

const NewsManager: React.FC<NewsManagerProps> = ({ data, loading, fetchData }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<News | null>(null);
    
    // ЗМІНА 1: Тепер тут зберігаємо список файлів (FileList), а не один файл
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    const getInitialFormData = (): NewsFormData => ({
        title: '',
        content: '',
        imageUrl: '', // Це поле залишається для відображення старих URL при редагуванні
        isImportant: false,
    });

    const [formData, setFormData] = useState<NewsFormData>(getInitialFormData());

    const handleOpenAddModal = useCallback(() => {
        setFormData(getInitialFormData());
        setEditingItem(null);
        setSelectedFiles(null); // Очищаємо файли
        setIsModalOpen(true);
    }, []);

    const handleEdit = useCallback((item: News) => {
        setEditingItem(item);
        setFormData({
            title: item.title,
            content: item.content,
            imageUrl: item.imageUrl || '',
            isImportant: item.isImportant,
        });
        setSelectedFiles(null); // При відкритті редагування нові файли ще не обрані
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingItem(null);
        setSelectedFiles(null);
        setFormData(getInitialFormData());
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        const dataToSend = new FormData();
        dataToSend.append('Title', formData.title);
        // Якщо content null або undefined, відправляємо пустий рядок
        dataToSend.append('Content', formData.content || ''); 
        dataToSend.append('IsImportant', formData.isImportant.toString());

        // ЗМІНА 2: Логіка додавання багатьох картинок
        if (selectedFiles && selectedFiles.length > 0) {
            for (let i = 0; i < selectedFiles.length; i++) {
                // Важливо: ключ має бути 'Images', як у C# DTO (public List<IFormFile> Images)
                dataToSend.append('Images', selectedFiles[i]);
            }
        } 
        
        // Примітка: Ми не відправляємо старий ImageUrl назад на сервер, 
        // бо сервер сам знає старі картинки. Ми відправляємо тільки НОВІ файли.

        const headers = {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        };

        try {
            if (editingItem) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/news/${editingItem.id}`, dataToSend, { headers });
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/news`, dataToSend, { headers });
            }
            await fetchData();
            handleCloseModal();
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Error saving news:', axiosError.response?.data || axiosError.message);
            alert('Помилка при збереженні. Перевірте консоль.');
        }
    }, [formData, selectedFiles, editingItem, fetchData, handleCloseModal]);

    const handleDelete = useCallback(async (id: number) => {
        if (window.confirm('Ви впевнені, що хочете видалити цю новину?')) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/news/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                await fetchData();
            } catch (error) {
                const axiosError = error as AxiosError;
                console.error('Error deleting news:', axiosError.response?.data || axiosError.message);
            }
        }
    }, [fetchData]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('uk-UA', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">Управління новинами</h2>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    <PlusCircle className="h-5 w-5" />
                    <span>Додати новину</span>
                </button>
            </div>

            <NewsTable
                data={data}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                formatDate={formatDate}
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingItem ? 'Редагувати новину' : 'Додати новину'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        
                        {/* ЗМІНА 3: Передаємо selectedFiles (множина) у модальне вікно.
                           Вам також доведеться оновити NewsModal, щоб він приймав ці пропси.
                        */}
                        <NewsModal
                            formData={formData}
                            setFormData={setFormData}
                            selectedFiles={selectedFiles}       // <--- Новий пропс
                            setSelectedFiles={setSelectedFiles} // <--- Новий пропс
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

export default NewsManager;