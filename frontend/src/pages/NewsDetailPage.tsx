import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import NewsCard from '../components/NewsCard';
import axios from 'axios';

// Оновлений інтерфейс (масив images)
interface NewsImage {
  id: number;
  imagePath: string;
}

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  images?: NewsImage[]; // Нове поле
  publishedAt: string;
  isImportant: boolean;
}

const NewsDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const newsId = parseInt(id || '0');
  const [currentNews, setCurrentNews] = useState<News | null>(null);
  const [relatedNews, setRelatedNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  // Стейт для слайдера
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchCurrentNews();
    fetchRelatedNews();
  }, [newsId]);

  const fetchCurrentNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get<News>(`${import.meta.env.VITE_API_URL}/api/news/${newsId}`);
      setCurrentNews(response.data);
      setCurrentImageIndex(0); // Скидаємо слайдер при завантаженні нової новини
    } catch (error) {
      console.error('Помилка при отриманні поточної новини:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async () => {
    try {
      const response = await axios.get<News[]>(`${import.meta.env.VITE_API_URL}/api/news`);
      // Фільтруємо, щоб не показувати поточну новину в "Схожих"
      const filteredNews = (response.data || []).filter(n => n.id !== newsId);
      setRelatedNews(filteredNews.slice(0, 3));
    } catch (error) {
      console.error('Помилка при отриманні пов’язаних новин:', error);
    }
  };

  // --- ЛОГІКА СЛАЙДЕРА ---
  const availableImages = React.useMemo(() => {
    if (!currentNews) return [];
    if (currentNews.images && currentNews.images.length > 0) {
      return currentNews.images.map(img => img.imagePath);
    }
    if (currentNews.imageUrl) {
      return [currentNews.imageUrl];
    }
    return [];
  }, [currentNews]);

  const hasMultipleImages = availableImages.length > 1;

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
  };

  const getImageUrl = (path: string) => {
    if (path.startsWith('blob:') || path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL}${path}`;
  };
  // -----------------------

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("uk-UA", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const handleShare = async () => {
    if (!currentNews) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentNews.title,
          text: currentNews.content.substring(0, 100) + "...",
          url: window.location.href,
        });
      } catch (err) {
        console.error("Помилка:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Посилання скопійовано!");
    }
  };

  const handleBackToNews = () => navigate(-1);

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Завантаження...</div>;
  }

  if (!currentNews) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <h2 className="text-2xl font-bold mb-4">Новина не знайдена</h2>
        <button onClick={handleBackToNews} className="bg-blue-600 text-white px-4 py-2 rounded">Назад</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Back button */}
      <div className="shadow-sm h-16 flex items-center sticky top-0 z-20 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <button
            onClick={handleBackToNews}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Назад</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Column */}
          <div className="lg:col-span-2">
            <article className="border bg-white rounded-lg shadow-sm overflow-hidden">
              
              {/* Header: Title, Date, Share */}
              <div className="p-6 border-b bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      {currentNews.isImportant && (
                        <div className="bg-blue-600 text-white p-2 rounded-full shadow-md">
                          <Star className="h-4 w-4 fill-current" />
                        </div>
                      )}
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(currentNews.publishedAt)}
                      </div>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                      {currentNews.title}
                    </h1>
                  </div>
                  <button onClick={handleShare} className="ml-4 p-3 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Image Slider Section */}
              <div className="px-6 pt-6">
                <div className="relative rounded-lg overflow-hidden bg-gray-100 shadow-md aspect-[4/3] group/slider">
                  {availableImages.length > 0 ? (
                    <>
                      <img
                        src={getImageUrl(availableImages[currentImageIndex])}
                        alt={currentNews.title}
                        className="w-full h-full object-contain transition-transform duration-500" // object-contain щоб фото влазило повністю
                      />
                      
                      {/* Стрілки слайдера */}
                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={handlePrevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity"
                          >
                            <ChevronLeft size={32} />
                          </button>
                          <button
                            onClick={handleNextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full opacity-0 group-hover/slider:opacity-100 transition-opacity"
                          >
                            <ChevronRight size={32} />
                          </button>

                          {/* Індикатори (кружечки) */}
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                            {availableImages.map((_, idx) => (
                              <div
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-colors ${
                                  currentImageIndex === idx ? 'bg-white shadow' : 'bg-white/50 hover:bg-white/80'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 text-blue-400">
                      <span className="text-6xl">📷</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Text */}
              <div className="p-6">
                <div
                  className="prose prose-lg max-w-none text-gray-700 news-content"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(currentNews.content, { ADD_ATTR: ['target'] })
                      .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
                  }}
                />
              </div>

            </article>
          </div>

          {/* Sidebar: Related News */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="flex items-center mb-6 border-b pb-2">
                <Clock className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Останні новини</h2>
              </div>
              <div className="space-y-6">
                {relatedNews.map((news) => (
                  <div key={news.id} className="transform transition hover:-translate-y-1">
                    <NewsCard news={news} />
                  </div>
                ))}
                {relatedNews.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Більше новин немає</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;