/*import React from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { Document } from '../types/documents';

interface DocumentCardProps {
  document: Document;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  
  const isFullUrl = document.filePath.startsWith('blob:') || 
                    document.filePath.startsWith('http:') || 
                    document.filePath.startsWith('https:');
  
  const fileUrl = document.filePath
    ? (isFullUrl ? document.filePath : `${import.meta.env.VITE_API_URL}${document.filePath}`)
    : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const buttonClasses = "w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center mt-auto";

  return (
    <div
      className="group flex flex-col overflow-visible bg-white hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-sm border border-gray-200"
    >
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="text-blue-600">
            <FileText className="h-8 w-8" />
          </div>
          <span className="text-xs font-semibold text-[#1E2A5A] group-hover:text-blue-600">
            {formatFileSize(document.fileSize)}
          </span>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#1E2A5A] mb-2 line-clamp-2 group-hover:text-blue-600">
            {document.title}
          </h3>
          
          {document.description && (
            <p className="text-[#1E2A5A] text-sm mb-4 line-clamp-3 italic">
              {document.description}
            </p>
          )}
        </div>

        <div className="flex items-center text-[#1E2A5A] text-xs mb-4 font-semibold">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(document.createdAt)}
        </div>

        {fileUrl ? (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${buttonClasses} bg-blue-600 hover:bg-blue-700 text-white`}
          >
            <Download className="h-4 w-4 mr-2" />
            Завантажити
          </a>
        ) : (
          <button
            type="button"
            disabled
            className={`${buttonClasses} bg-gray-300 text-gray-500 cursor-not-allowed`}
          >
            <Download className="h-4 w-4 mr-2" />
            Завантажити
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;*/
import React from 'react';
import { FileText, Calendar } from 'lucide-react';
import { Document } from '../types/documents';

interface DocumentCardProps {
  document: Document;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const isFullUrl = document.filePath.startsWith('blob:') ||
    document.filePath.startsWith('http:') ||
    document.filePath.startsWith('https:');

  const fileUrl = document.filePath
    ? (isFullUrl ? document.filePath : `${import.meta.env.VITE_API_URL}${document.filePath}`)
    : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const buttonClasses = "w-full py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center mt-auto";

  return (
    <div
      className="group flex flex-col overflow-visible bg-white hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-sm border border-gray-200"
    >
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-4">
          <div className="text-blue-600">
            <FileText className="h-8 w-8" />
          </div>
          <span className="text-xs font-semibold text-[#1E2A5A] group-hover:text-blue-600">
            {formatFileSize(document.fileSize)}
          </span>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#1E2A5A] mb-2 line-clamp-2 group-hover:text-blue-600">
            {document.title}
          </h3>

          {document.description && (
            <p className="text-[#1E2A5A] text-sm mb-4 line-clamp-3 italic">
              {document.description}
            </p>
          )}
        </div>

        <div className="flex items-center text-[#1E2A5A] text-xs mb-4 font-semibold">
          <Calendar className="h-4 w-4 mr-1" />
          {formatDate(document.createdAt)}
        </div>

        {fileUrl ? (
          <button
            onClick={() => window.open(fileUrl, '_blank', 'noopener,noreferrer')}
            className={`${buttonClasses} bg-blue-600 hover:bg-blue-700 text-white`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Переглянути
          </button>
        ) : (
          <button
            type="button"
            disabled
            className={`${buttonClasses} bg-gray-300 text-gray-500 cursor-not-allowed`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Переглянути
          </button>
        )}
      </div>
    </div>
  );
};

export default DocumentCard;
