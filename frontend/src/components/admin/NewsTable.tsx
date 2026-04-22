import React from 'react';
import { Edit, Trash2, Image } from 'lucide-react';
import { News } from '../../types/news';

interface NewsTableProps {
    data: News[];
    loading: boolean;
    onEdit: (item: News) => void;
    onDelete: (id: number) => void;
    formatDate: (dateString: string) => string;
}

const NewsTable: React.FC<NewsTableProps> = ({ data, loading, onEdit, onDelete, formatDate }) => {
    return (
        <div className="overflow-x-auto rounded-xl border">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">Заголовок</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">Зображення</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">Дата створення</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">Статус</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-900 uppercase tracking-wider">Дії</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                        <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Завантаження...</td></tr>
                    ) : data.length === 0 ? (
                        <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">Новин поки немає</td></tr>
                    ) : (
                        data.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="text-sm text-gray-900 max-w-xs truncate" title={item.title}>
                                            {item.title}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="flex items-center justify-center h-full"> 
                                        {item.imageUrl ? (
                                            <a href={`${import.meta.env.VITE_API_URL}${item.imageUrl}`} target="_blank" rel="noopener noreferrer">
                                                <Image className="h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-900" />
                                            </a>
                                        ) : (
                                            <span className="text-gray-300">—</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">{formatDate(item.publishedAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${item.isImportant ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                        {item.isImportant ? 'Важлива' : 'Звичайна'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <div className="flex justify-center space-x-2">
                                        <button onClick={() => onEdit(item)} className="text-blue-600 hover:text-blue-900 p-1"><Edit className="h-5 w-5" /></button>
                                        <button onClick={() => onDelete(item.id)} className="text-red-600 hover:text-red-900 p-1"><Trash2 className="h-5 w-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default React.memo(NewsTable);