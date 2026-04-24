import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Share2, Star, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import DOMPurify from 'dompurify';
import NewsCard from '../components/NewsCard';
import axios from 'axios';

interface NewsImage {
  id: number;
  imagePath: string;
}

interface News {
  id: number;
  title: string;
  content: string;
  imageUrl?: string | null;
  images?: NewsImage[];
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
    window.scrollTo(0, 0); // Прокрутка вгору при зміні новини
  }, [newsId]);

  const fetchCurrentNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get<News>(`${import.meta.env.VITE_API_URL}/api/news/${newsId}`);
      setCurrentNews(response.data);
      setCurrentImageIndex(0);
    } catch (error) {
      console.error('Помилка при отриманні поточної новини:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async () => {
    try {
      const response = await axios.get<News[]>(`${import.meta.env.VITE_API_URL}/api/news`);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!currentNews) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm max-w-md w-full">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Новину не знайдено</h2>
          <p className="text-gray-500 mb-6">Можливо, вона була видалена або посилання більше не дійсне.</p>
          <button 
            onClick={() => navigate('/news')} 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Повернутися до новин
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* М'який градієнт на фоні зверху */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-50/80 to-transparent pointer-events-none" />

      {/* Header with Back button */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100/50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate('/news')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group px-2 py-1 -ml-2 rounded-lg hover:bg-blue-50"
          >
            <ArrowLeft className="h-5 w-5 mr-2 transform group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm tracking-wide">ДО НОВИН</span>
          </button>
          
          <button 
            onClick={handleShare} 
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 transition-all font-medium text-sm border border-gray-100"
          >
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Поділитися</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Main Content Column */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Стаття */}
            <article className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-gray-100">
              
              {/* Image Slider Section */}
              <div className="relative aspect-[16/10] sm:aspect-[21/9] lg:aspect-[16/9] w-full bg-gray-900 group overflow-hidden">
                {availableImages.length > 0 ? (
                  <>
                    <img
                      src={getImageUrl(availableImages[currentImageIndex])}
                      alt={currentNews.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    
                    {/* Градієнтне затемнення знизу для краси */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0" />
                    
                    {/* Стрілки слайдера */}
                    {hasMultipleImages && (
                      <>
                        <button
                          onClick={handlePrevImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full opacity-0 translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 border border-white/20"
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full opacity-0 -translate-x-4 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 border border-white/20"
                        >
                          <ChevronRight size={24} />
                        </button>

                        {/* Кастомний індикатор зображень (1/3) */}
                        <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5" />
                          {currentImageIndex + 1} / {availableImages.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                    <ImageIcon className="w-16 h-16" />
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="p-6 sm:p-10">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {currentNews.isImportant && (
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border border-red-100">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      Важливо
                    </span>
                  )}
                  <span className="inline-flex items-center text-gray-500 text-sm font-medium">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {formatDate(currentNews.publishedAt)}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] mb-8 leading-[1.15] tracking-tight">
                  {currentNews.title}
                </h1>

                {/* Rich Text Content */}
                <div 
                  className="prose prose-lg sm:prose-xl max-w-none prose-headings:font-bold prose-headings:text-[#0f172a] prose-p:text-gray-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-800 prose-img:rounded-2xl prose-img:shadow-sm"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(currentNews.content, { ADD_ATTR: ['target'] })
                      .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
                  }}
                />
              </div>
            </article>
          </div>

          {/* Sidebar: Related News */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="flex items-center gap-3 mb-6 px-1">
                <div className="h-8 w-1 bg-blue-600 rounded-full"></div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Схожі новини</h2>
              </div>
              
              <div className="space-y-5">
                {relatedNews.length > 0 ? (
                  relatedNews.map((news) => (
                    <div key={news.id} className="transform transition-all duration-300 hover:-translate-y-1">
                      {/* Використовуємо твій існуючий NewsCard, але обгортаємо його для меншого розміру в сайдбарі */}
                      <NewsCard news={news} />
                    </div>
                  ))
                ) : (
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center shadow-sm">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">Інших новин поки немає</p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        /* Кастомна стилізація для контенту новини */
        .prose p {
          margin-bottom: 1.5em;
        }
        .prose ul {
          margin-top: 1em;
          margin-bottom: 1.5em;
        }
        .prose li {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
};

export default NewsDetailPage;