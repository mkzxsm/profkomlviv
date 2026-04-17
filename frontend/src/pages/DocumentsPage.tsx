<<<<<<< HEAD
import React, { useState, useEffect, useMemo } from 'react';
import { FileText, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Document } from '../types/documents';
import DocumentCard from '../components/DocumentCard';
=======
import React, { useState } from 'react';
import { FileText, Download, Search, Filter, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Document {
  id: number;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  uploadDate: string;
  fileSize: string;
}
>>>>>>> upstream/main

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
<<<<<<< HEAD
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/documents`);
        setDocuments(response.data);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [documents, searchTerm]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    const maxVisibleButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    const leftButtons = (
      <div key="left" className="flex gap-1">
        {totalPages > 5 && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex justify-center items-center rounded-lg border border-gray-300 text-gray-700 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
        {totalPages > 1 && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex justify-center items-center rounded-lg border border-gray-300 text-gray-700 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>
    );

    const centerButtons = (
      <div key="center" className="flex gap-1">
        {Array.from({ length: endPage - startPage + 1 }, (_, idx) => {
          const page = startPage + idx;
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 flex justify-center items-center rounded-lg border font-medium transition-colors duration-200 ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
    );

    const rightButtons = (
      <div key="right" className="flex gap-1">
        {totalPages > 1 && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex justify-center items-center rounded-lg border border-gray-300 text-gray-700 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {totalPages > 5 && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex justify-center items-center rounded-lg border border-gray-300 text-gray-700 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>
    );

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        {leftButtons}
        {centerButtons}
        {rightButtons}
      </div>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(itemsPerPage)].map((_, idx) => (
        <div key={idx} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="h-8 w-8 bg-gray-300 rounded"/>
            <div className="h-4 w-12 bg-gray-300 rounded"/>
          </div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2"/>
          <div className="h-4 bg-gray-300 rounded mb-4"/>
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-6"/>
          <div className="h-10 bg-gray-300 rounded-md w-full"/>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
=======
  const [selectedCategory, setSelectedCategory] = useState('all');

  const documents: Document[] = [
    {
      id: 1,
      title: "Заява на матеріальну допомогу",
      description: "Бланк заяви для отримання одноразової матеріальної допомоги",
      category: "forms",
      fileUrl: "/docs/material-help-form.pdf",
      uploadDate: "2024-01-15",
      fileSize: "245 KB"
    },
    {
      id: 2,
      title: "Статут профспілки студентів",
      description: "Офіційний статут профспілкової організації студентів ЛНУ",
      category: "statute",
      fileUrl: "/docs/statute.pdf",
      uploadDate: "2024-01-10",
      fileSize: "1.2 MB"
    },
    {
      id: 3,
      title: "Положення про соціальну допомогу",
      description: "Детальне положення про надання соціальної допомоги студентам",
      category: "regulations",
      fileUrl: "/docs/social-help-regulation.pdf",
      uploadDate: "2024-01-12",
      fileSize: "680 KB"
    },
    {
      id: 4,
      title: "Заява на поселення в гуртожиток",
      description: "Форма заяви для студентів, які потребують місця в гуртожитку",
      category: "forms",
      fileUrl: "/docs/dormitory-form.pdf",
      uploadDate: "2024-01-08",
      fileSize: "320 KB"
    },
    {
      id: 5,
      title: "Звіт про діяльність профкому 2023",
      description: "Річний звіт про діяльність профспілкової організації",
      category: "reports",
      fileUrl: "/docs/annual-report-2023.pdf",
      uploadDate: "2024-01-05",
      fileSize: "2.1 MB"
    },
    {
      id: 6,
      title: "Правила користування гуртожитком",
      description: "Основні правила та вимоги для мешканців гуртожитків",
      category: "regulations",
      fileUrl: "/docs/dormitory-rules.pdf",
      uploadDate: "2024-01-03",
      fileSize: "450 KB"
    }
  ];

  const categories = [
    { value: 'all', label: 'Всі документи' },
    { value: 'forms', label: 'Форми та заяви' },
    { value: 'regulations', label: 'Положення' },
    { value: 'statute', label: 'Статутні документи' },
    { value: 'reports', label: 'Звіти' }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
>>>>>>> upstream/main
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Документи
            </h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Знайдіть всі необхідні документи, форми та положення для взаємодії з профкомом
            </p>
          </div>
        </div>
      </section>

<<<<<<< HEAD
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Пошук документів..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
=======
      {/* Search and Filter Section */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Пошук документів..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
>>>>>>> upstream/main
          </div>
        </div>
      </section>

<<<<<<< HEAD
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            renderLoadingSkeleton()
          ) : currentData.length === 0 ? (
=======
      {/* Documents Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredDocuments.length === 0 ? (
>>>>>>> upstream/main
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Документи не знайдено
              </h3>
<<<<<<< HEAD
              <p className="text-gray-500">
                {searchTerm
                  ? "Спробуйте змінити критерії пошуку"
                  : "Наразі документи відсутні."}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 will-change-transform">
                {currentData.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                  />
                ))}
              </div>
              {renderPaginationButtons()}
            </>
=======
              <p className="text-gray-500">Спробуйте змінити критерії пошуку</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 will-change: transform">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="group flex flex-col overflow-visible bg-white hover:bg-blue-50 rounded-xl transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-300"
                >
                  <div className="p-6 flex flex-col flex-1">
                    {/* Верхня частина */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-blue-600">
                        <FileText className="h-8 w-8" />
                      </div>
                      <span className="text-xs font-semibold text-[#1E2A5A] group-hover:text-blue-600">
                        {document.fileSize}
                      </span>
                    </div>

                    {/* Основний контент */}
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#1E2A5A] mb-2 line-clamp-2 group-hover:text-blue-600">
                        {document.title}
                      </h3>

                      <p className="text-[#1E2A5A] text-sm mb-4 line-clamp-3 italic">
                        {document.description}
                      </p>
                    </div>

                    <div className="flex items-center text-[#1E2A5A] text-xs mb-4 font-semibold">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(document.uploadDate)}
                    </div>

                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200 flex items-center justify-center mt-auto">
                      <Download className="h-4 w-4 mr-2" />
                      Завантажити
                    </button>
                  </div>
                </div>
              ))}
            </div>
>>>>>>> upstream/main
          )}
        </div>
      </section>

<<<<<<< HEAD
=======
      {/* Help Section */}
>>>>>>> upstream/main
      <section className="bg-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Не знайшли потрібний документ?
          </h2>
          <p className="text-gray-600 mb-6">
            Зв'яжіться з нами, і ми допоможемо знайти необхідну інформацію або документ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            onClick={() => { navigate('/contacts');}}>
              Зв'язатися з нами
            </button>
            <button className="border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200">
              Задати питання
            </button>
          </div>
        </div>
      </section>
<<<<<<< HEAD

=======
>>>>>>> upstream/main
    </div>
  );
};

<<<<<<< HEAD
export default DocumentsPage;
=======
export default DocumentsPage;
>>>>>>> upstream/main
