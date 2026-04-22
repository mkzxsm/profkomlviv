import React, { useEffect } from 'react';
import { X, Download, FileText } from 'lucide-react';
import { Document } from '../types/documents';

interface DocumentPreviewModalProps {
  document: Document | null;
  onClose: () => void;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ document, onClose }) => {
  useEffect(() => {
    if (document) {
      window.document.body.style.overflow = 'hidden';
      return () => {
        window.document.body.style.overflow = 'unset';
      };
    }
  }, [document]);

  if (!document) return null;

  const isFullUrl = document.filePath.startsWith('blob:') ||
                    document.filePath.startsWith('http:') ||
                    document.filePath.startsWith('https:');

  const fileUrl = document.filePath
    ? (isFullUrl ? document.filePath : `${import.meta.env.VITE_API_URL}${document.filePath}`)
    : null;

  const getFileExtension = (path: string) => {
    return path.split('.').pop()?.toLowerCase() || '';
  };

  const fileExtension = getFileExtension(document.filePath);
  const isPDF = fileExtension === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension);
  const isPreviewable = isPDF || isImage;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex-1 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {document.title}
            </h2>
            {document.description && (
              <p className="text-sm text-gray-600 italic">
                {document.description}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Розмір файлу: {formatFileSize(document.fileSize)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {fileUrl && (
              <a
                href={fileUrl}
                download
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
              >
                <Download className="h-4 w-4" />
                Завантажити
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {fileUrl && isPreviewable ? (
            <>
              {isPDF && (
                <iframe
                  src={fileUrl}
                  className="w-full h-full min-h-[600px] border border-gray-200 rounded-lg"
                  title={document.title}
                />
              )}
              {isImage && (
                <div className="flex justify-center items-center h-full">
                  <img
                    src={fileUrl}
                    alt={document.title}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <FileText className="h-24 w-24 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Попередній перегляд недоступний
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Цей тип файлу не підтримує попередній перегляд у браузері.
                Завантажте файл для перегляду на вашому пристрої.
              </p>
              {fileUrl && (
                <a
                  href={fileUrl}
                  download
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  <Download className="h-5 w-5" />
                  Завантажити документ
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
