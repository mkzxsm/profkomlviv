import React from 'react';
import { Edit, Trash2, Download } from 'lucide-react';
import { Document } from '../../types/documents';
import {
  TableContainer,
  Table,
  TableHeader,
  TableTh,
  TableBody,
  TableRow,
  TableTd
} from './ui/TableStyles'; 

interface DocumentTableProps {
  data: Document[];
  loading: boolean;
  onEdit: (doc: Document) => void;
  onDelete: (id: number) => void;
}

const DocumentTable: React.FC<DocumentTableProps> = ({ data, loading, onEdit, onDelete }) => {
  
  const colSpanValue = 6;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <tr>
            <TableTh>Назва</TableTh>
            <TableTh>Опис</TableTh>
            <TableTh>Дата</TableTh>
            <TableTh>Файл</TableTh>
            <TableTh>Розмір</TableTh>
            <TableTh>Дії</TableTh>
          </tr>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableTd colSpan={colSpanValue} className="text-center text-gray-500">
                Завантаження...
              </TableTd>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableTd colSpan={colSpanValue} className="text-center text-gray-500">
                Документів поки немає
              </TableTd>
            </TableRow>
          ) : (
            data.map((doc) => {
              const fileUrl = `${import.meta.env.VITE_API_URL}${doc.filePath}`;
              return (
                <TableRow key={doc.id}>
                  <TableTd className="text-left font-medium">{doc.title}</TableTd>
                  <TableTd className="text-left text-sm text-gray-700 max-w-xs truncate">
                    {doc.description || <span className="text-gray-400">—</span>}
                  </TableTd>
                  <TableTd className="text-center">{formatDate(doc.createdAt)}</TableTd>
                  <TableTd className="text-center">
                    <a
                      href={fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-center text-blue-600 hover:text-blue-800 p-1"
                      title="Переглянути файл"
                    >
                      <Download className="h-5 w-5" />
                    </a>
                  </TableTd>
                  <TableTd className="text-center text-sm">{formatFileSize(doc.fileSize)}</TableTd>
                  <TableTd className="text-center">
                    <div className="flex justify-center space-x-2">
                      <button onClick={() => onEdit(doc)} className="text-blue-600 hover:text-blue-900 p-1">
                        <Edit className="h-5 w-5" />
                      </button>
                      <button onClick={() => onDelete(doc.id)} className="text-red-600 hover:text-red-900 p-1">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </TableTd>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DocumentTable;