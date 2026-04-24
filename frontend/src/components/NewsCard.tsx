import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

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

interface NewsCardProps {
  news: News;
  isPreview?: boolean;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const NewsCard: React.FC<NewsCardProps> = ({ news, isPreview = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const availableImages = React.useMemo(() => {
    if (news.images && news.images.length > 0) {
      return news.images.map(img => img.imagePath);
    }
    if (news.imageUrl) {
      return [news.imageUrl];
    }
    return [];
  }, [news.images, news.imageUrl]);

  const hasMultipleImages = availableImages.length > 1;

  const getImageUrl = (path: string) => {
    if (path.startsWith('blob:') || path.startsWith('http')) return path;
    return `${import.meta.env.VITE_API_URL}${path}`;
  };

  useEffect(() => {
    if (!hasMultipleImages) return;
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
    }, 7000); // 7 секунд - краще для динаміки
    return () => clearInterval(interval);
  }, [hasMultipleImages, availableImages.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
  };

  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentImageIndex(index);
  };

  // Видаляємо HTML-теги для прев'ю тексту, щоб не з'їжджала верстка
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const className = `group flex flex-col bg-white rounded-3xl overflow-hidden transition-all duration-500 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.12)] hover:-translate-y-1 cursor-pointer h-full`;

  const cardContent = (
    <>
      {/* Блок із зображенням */}
      <div className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-gray-100">
        {availableImages.length > 0 ? (
          <>
            <img
              src={getImageUrl(availableImages[currentImageIndex])}
              alt={news.title}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            {/* Легке затемнення зверху для читабельності бейджиків */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Бейджик "Важливо" */}
            {news.isImportant && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full shadow-lg z-20">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-bold uppercase tracking-wider">Важливо</span>
              </div>
            )}

            {/* Контроли слайдера */}
            {hasMultipleImages && (
              <>
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-1.5 rounded-full opacity-0 -translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-1.5 rounded-full opacity-0 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Індикатори (крапки) */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10 bg-black/20 backdrop-blur-sm px-2 py-1 rounded-full">
                  {availableImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleDotClick(e, idx)}
                      className={`transition-all duration-300 rounded-full ${
                        currentImageIndex === idx
                          ? 'bg-white w-3 h-1.5' // Активний ширший
                          : 'bg-white/50 hover:bg-white/80 w-1.5 h-1.5'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-sm font-medium">Немає фото</span>
          </div>
        )}
      </div>

      {/* Блок з текстом */}
      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-center text-gray-400 text-xs font-medium uppercase tracking-wider mb-3">
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          {formatDate(news.publishedAt)}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
          {news.title}
        </h3>
        
        <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-6 flex-grow">
          {stripHtml(news.content)}
        </p>
        
        {/* Футер карточки */}
        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
          <span className="text-sm font-semibold text-blue-600 flex items-center opacity-80 group-hover:opacity-100 transition-opacity">
            Читати повністю
            <ChevronRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </>
  );

  return isPreview ? (
    <div className={className}>{cardContent}</div>
  ) : (
    <Link to={`/news/${news.id}`} className={className}>{cardContent}</Link>
  );
};

export default NewsCard;