import React, { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Document } from "../types/documents";
import DocumentCard from "../components/DocumentCard";

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/documents`,
        );
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
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description &&
          doc.description.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }, [documents, searchTerm]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredDocuments.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    const maxVisibleButtons = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2),
    );
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
        <div
          key={idx}
          className="bg-white rounded-xl shadow-md p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="h-8 w-8 bg-gray-300 rounded" />
            <div className="h-4 w-12 bg-gray-300 rounded" />
          </div>
          <div className="h-6 bg-gray-300 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-300 rounded mb-4" />
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-6" />
          <div className="h-10 bg-gray-300 rounded-md w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="relative bg-[#10183a] text-white pt-20 pb-32 overflow-hidden w-full">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[10%] -left-[10%] w-[60%] h-[100%] rounded-full bg-[#1e3a8a]/40 blur-[120px]" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[120%] rounded-full bg-[#ca8a04]/20 blur-[130px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Декоративна іконка */}
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/10">
            <FileText className="w-8 h-8 text-[#facc15]" />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Документи
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Знайдіть всі необхідні документи, форми та положення для взаємодії з
            профкомом
          </p>
        </div>
      </section>

      {/* Search Section (Накладається на Header) */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-4 sm:p-6 border border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
          {/* Пошук */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Пошук документів..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 h-[46px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none shadow-sm"
            />
          </div>

          {/* Лічильник */}
          <div className="text-sm text-gray-600 flex items-center gap-1 sm:ml-auto whitespace-nowrap">
            <span>Знайдено:</span>
            <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md ml-1">
              {filteredDocuments.length}
            </span>
            <span>документів</span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            renderLoadingSkeleton()
          ) : currentData.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Документи не знайдено
              </h3>
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
                  <DocumentCard key={document.id} document={document} />
                ))}
              </div>
              {renderPaginationButtons()}
            </>
          )}
        </div>
      </section>

      {/* Banner Section */}
      <section className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-[#10183a] to-blue-800 text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden text-center">
          {/* Декоративні відблиски для ефекту глибини */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl pointer-events-none z-0" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-40 h-40 bg-[#facc15] opacity-15 rounded-full blur-3xl pointer-events-none z-0" />

          <h2 className="text-2xl md:text-3xl font-bold mb-4 relative z-10">
            Не знайшли потрібний документ?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto text-lg relative z-10 leading-relaxed">
            Зв'яжіться з нами, і ми допоможемо знайти необхідну інформацію або
            документ
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
            {/* Primary Button */}
            <button
              className="border border-white/30 bg-white/10 backdrop-blur-sm text-white py-3 px-8 rounded-xl font-semibold hover:bg-white/20 hover:scale-[1.02] transition-all duration-300 shadow-sm"
              onClick={() => {
                navigate("/contacts");
              }}
            >
              Зв'язатися з нами
            </button>

            {/* Glassmorphism Button */}
            <button className="hidden border border-white/30 bg-white/10 backdrop-blur-sm text-white py-3 px-8 rounded-xl font-semibold hover:bg-white/20 hover:scale-[1.02] transition-all duration-300 shadow-sm">
              Задати питання
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentsPage;
