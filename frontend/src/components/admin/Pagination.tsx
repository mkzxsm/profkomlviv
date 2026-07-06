import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const maxVisibleButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
  if (endPage - startPage + 1 < maxVisibleButtons) {
    startPage = Math.max(1, endPage - maxVisibleButtons + 1);
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex justify-center items-center gap-2 sm:gap-3 mt-10 mb-4 border-t border-gray-100 pt-8">
      <div className="flex gap-1 bg-white p-1.5 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100">
        {totalPages > 5 && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="w-10 h-10 flex justify-center items-center rounded-xl text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ChevronsLeft className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 flex justify-center items-center rounded-xl text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="hidden sm:flex gap-1 bg-white p-1.5 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100">
        {Array.from({ length: endPage - startPage + 1 }, (_, idx) => {
          const page = startPage + idx;
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 flex justify-center items-center rounded-xl font-semibold transition-all duration-300 ${
                page === currentPage
                  ? 'bg-blue-600 text-white shadow-[0_4px_12px_rgba(37,99,235,0.3)] scale-105'
                  : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>

      <div className="flex sm:hidden bg-white px-5 h-[52px] items-center justify-center rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100 text-sm font-semibold text-gray-700">
        <span className="text-gray-400 mr-1">Стор.</span> {currentPage} / {totalPages}
      </div>

      <div className="flex gap-1 bg-white p-1.5 rounded-2xl shadow-[0_2px_15px_rgb(0,0,0,0.04)] border border-gray-100">
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex justify-center items-center rounded-xl text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        {totalPages > 5 && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex justify-center items-center rounded-xl text-gray-500 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
          >
            <ChevronsRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Pagination;