import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
import { Search, Filter, Calendar, ChevronLeft, ChevronsLeft, ChevronRight, ChevronsRight, ChevronDown } from 'lucide-react';
=======
import { Search, Filter, Calendar, ChevronLeft, ChevronsLeft, ChevronRight, ChevronsRight } from 'lucide-react';
>>>>>>> upstream/main
import NewsCard from '../components/NewsCard';
import axios from 'axios';

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null; // Змінено з image_url
  publishedAt: string; // Змінено з created_at
  isImportant: boolean; // Змінено з is_important
}

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;
<<<<<<< HEAD
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const filterOptions = [
    { id: 'all', label: 'Всі новини' },
    { id: 'important', label: 'Важливі' },
    { id: 'regular', label: 'Звичайні' }
  ];
=======
>>>>>>> upstream/main

  useEffect(() => {
    fetchNews();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const fetchNews = async () => {
    try {
<<<<<<< HEAD
      const response = await axios.get<News[]>(`${import.meta.env.VITE_API_URL}/api/news`, {
=======
      const response = await axios.get<News[]>('http://localhost:5068/api/news', {
>>>>>>> upstream/main
        params: {
          orderBy: 'publishedAt',
          order: 'desc',
        },
      });
      console.log('News:', response.data); // Логування для діагностики
      console.log("Fetched news:", response.data.map(n => n.imageUrl));

      setNews(response.data || []);
    } catch (error) {
      console.error('Помилка при отриманні новин:', error);
      if (axios.isAxiosError(error)) {
        console.error('Деталі помилки:', error.response?.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === 'all' ||
      (filterType === 'important' && article.isImportant) ||
      (filterType === 'regular' && !article.isImportant);
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredNews.length / newsPerPage);
  const startIndex = (currentPage - 1) * newsPerPage;
  const endIndex = startIndex + newsPerPage;
  const currentNews = filteredNews.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => setCurrentPage(page);

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    const maxVisibleButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    // Left Buttons
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

    // Center Buttons
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

    // Right Buttons
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Новини</h1>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Слідкуйте за останніми подіями та оголошеннями профкому студентів
          </p>
        </div>
      </section>

<<<<<<< HEAD
{/* Search & Filter */}
      <section className="bg-white py-8 shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Головний контейнер: вертикальне розташування (flex-col) */}
          <div className="flex flex-col gap-4">
            
            {/* 1. Блок з пошуком і фільтром (верхній ряд) */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              
              {/* Пошук (flex-1 змушує його розтягнутися на весь доступний простір) */}
              <div className="relative flex-1 shadow-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Пошук новин..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 h-[46px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>

              {/* Кастомний Дропдаун Фільтру */}
              <div className="relative w-full sm:w-[220px] shadow-sm">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between w-full h-[46px] bg-white border border-gray-300 rounded-lg pl-10 pr-4 text-[#1E2A5A] font-medium transition-all duration-300 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <span className="truncate pr-2 text-sm md:text-base">
                    {filterOptions.find(opt => opt.id === filterType)?.label}
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Шар для закриття кліком поза меню */}
                {isDropdownOpen && (
                  <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                )}

                {/* Меню опцій */}
                <div
                  className={`absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-20 transition-all duration-200 origin-top ${
                    isDropdownOpen 
                      ? 'opacity-100 scale-y-100 translate-y-0' 
                      : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                  }`}
                >
                  <div className="py-1">
                    {filterOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setFilterType(opt.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 flex items-center ${
                          filterType === opt.id
                            ? 'bg-blue-50 text-blue-700 font-semibold'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-[#1E2A5A]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* 2. Лічильник (нижній ряд, автоматично вирівнюється по лівому краю) */}
            <div className="text-sm text-gray-600">
              Знайдено новин: <span className="font-semibold">{filteredNews.length}</span>
              {totalPages > 1 && (
                <span className="ml-2">(сторінка {currentPage} з {totalPages})</span>
              )}
            </div>

=======
      {/* Search & Filter */}
      <section className="bg-white py-8 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Пошук новин..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
              >
                <option value="all">Всі новини</option>
                <option value="important">Важливі</option>
                <option value="regular">Звичайні</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Знайдено новин: {filteredNews.length}
            {totalPages > 1 && (
              <span className="ml-2">(сторінка {currentPage} з {totalPages})</span>
            )}
>>>>>>> upstream/main
          </div>
        </div>
      </section>

      {/* News Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300" />
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2" />
                    <div className="h-4 bg-gray-300 rounded mb-4 w-3/4" />
                    <div className="h-3 bg-gray-300 rounded mb-2" />
                    <div className="h-3 bg-gray-300 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || filterType !== 'all' ? 'Новини не знайдено' : 'Новин поки немає'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all'
                  ? 'Спробуйте змінити критерії пошуку'
                  : 'Слідкуйте за оновленнями на нашому сайті'}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 will-change-transform">
                {currentNews.map((article) => (
                  <NewsCard key={article.id} news={article} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && renderPaginationButtons()}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewsPage;