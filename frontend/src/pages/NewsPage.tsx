import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronsLeft,
  ChevronRight,
  ChevronsRight,
  ChevronDown,
  Newspaper,
} from "lucide-react";
import NewsCard from "../components/NewsCard";
import axios from "axios";

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  publishedAt: string;
  isImportant: boolean;
}

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 6;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filterOptions = [
    { id: "all", label: "Всі новини" },
    { id: "important", label: "Важливі" },
    { id: "regular", label: "Звичайні" },
  ];

  useEffect(() => {
    fetchNews();
  }, []);
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get<News[]>(
        `${import.meta.env.VITE_API_URL}/api/news`,
        {
          params: { orderBy: "publishedAt", order: "desc" },
        },
      );
      setNews(response.data || []);
    } catch (error) {
      console.error("Помилка при отриманні новин:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "important" && article.isImportant) ||
      (filterType === "regular" && !article.isImportant);
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredNews.length / newsPerPage);
  const currentNews = filteredNews.slice(
    (currentPage - 1) * newsPerPage,
    currentPage * newsPerPage,
  );

  // Функція пагінації (залишив без змін, вона працює чудово)
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

    return (
      <div className="flex justify-center items-center gap-2 mt-12">
        <div className="flex gap-1">
          {totalPages > 5 && (
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="w-10 h-10 flex justify-center items-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-all"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
          )}
          {totalPages > 1 && (
            <button
              onClick={() => setCurrentPage((prev) => prev - 1)}
              disabled={currentPage === 1}
              className="w-10 h-10 flex justify-center items-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-1">
          {Array.from({ length: endPage - startPage + 1 }, (_, idx) => {
            const page = startPage + idx;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex justify-center items-center rounded-xl font-semibold transition-all duration-300 ${
                  page === currentPage
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <div className="flex gap-1">
          {totalPages > 1 && (
            <button
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex justify-center items-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {totalPages > 5 && (
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="w-10 h-10 flex justify-center items-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 disabled:opacity-50 transition-all"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Декоративний Header */}
      <section className="relative bg-[#10183a] text-white pt-20 pb-32 overflow-hidden">
        {/* Фонововідблиски */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {/* М'який синій відблиск зліва по центру (як на оригіналі) */}
          <div className="absolute top-[10%] -left-[10%] w-[60%] h-[100%] rounded-full bg-[#1e3a8a]/40 blur-[120px]" />

          {/* Золотисто-жовтий відблиск у правому нижньому куті */}
          <div className="absolute -bottom-[40%] -right-[10%] w-[70%] h-[120%] rounded-full bg-[#ca8a04]/25 blur-[140px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/10">
            <Newspaper className="w-8 h-8 text-[#facc15]" />{" "}
            {/* Змінив колір іконки на жовтий для гармонії */}
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Всі новини
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
            Головні події, важливі оголошення та найцікавіше з життя профкому
            студентів нашого університету.
          </p>
        </div>
      </section>

      {/* Пошук та Фільтри (Плаваюча панель) */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-4 sm:p-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            {/* Пошук */}
            <div className="relative flex-1 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Пошук новин..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 h-14 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-gray-700"
              />
            </div>

            {/* Дропдаун Фільтру */}
            <div className="relative w-full sm:w-[240px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Filter
                  className={`h-5 w-5 transition-colors ${isDropdownOpen ? "text-blue-500" : "text-gray-400"}`}
                />
              </div>
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center justify-between w-full h-14 pl-11 pr-4 rounded-xl text-gray-700 font-medium transition-all duration-300 focus:outline-none ${
                  isDropdownOpen
                    ? "bg-white border-blue-500 ring-2 ring-blue-500/20"
                    : "bg-gray-50 border-transparent hover:bg-gray-100"
                } border`}
              >
                <span>
                  {filterOptions.find((opt) => opt.id === filterType)?.label}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-blue-500" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
              )}

              <div
                className={`absolute top-[calc(100%+8px)] left-0 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-20 transition-all duration-200 origin-top ${
                  isDropdownOpen
                    ? "opacity-100 scale-y-100 translate-y-0"
                    : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
                }`}
              >
                <div className="p-2">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setFilterType(opt.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors flex items-center ${
                        filterType === opt.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 px-1 flex items-center text-sm text-gray-500">
            Знайдено результатів:{" "}
            <span className="font-bold text-gray-900 ml-1.5 bg-gray-100 px-2 py-0.5 rounded-md">
              {filteredNews.length}
            </span>
          </div>
        </div>
      </section>

      {/* Grid Новин */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-3xl p-4 shadow-sm animate-pulse"
                >
                  <div className="w-full aspect-[4/3] bg-gray-200 rounded-2xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Нічого не знайдено
              </h3>
              <p className="text-gray-500 max-w-md">
                Спробуйте змінити критерії пошуку або обрати інший фільтр для
                відображення новин.
              </p>
              {(searchTerm || filterType !== "all") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("all");
                  }}
                  className="mt-6 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                >
                  Скинути всі фільтри
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentNews.map((article, index) => (
                  <div
                    key={article.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <NewsCard news={article} />
                  </div>
                ))}
              </div>
              {totalPages > 1 && renderPaginationButtons()}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default NewsPage;
