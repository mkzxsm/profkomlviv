<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star, ChevronLeft, ChevronRight } from 'lucide-react';

// Оновлюємо інтерфейс, додаючи масив images
interface NewsImage {
  id: number;
  imagePath: string;
}
=======
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Star } from 'lucide-react';
>>>>>>> upstream/main

interface News {
  id: number;
  title: string;
  content: string;
<<<<<<< HEAD
  imageUrl?: string | null; // Для сумісності
  images?: NewsImage[];     // Нове поле
=======
  imageUrl?: string | null;
>>>>>>> upstream/main
  publishedAt: string;
  isImportant: boolean;
}

interface NewsCardProps {
  news: News;
<<<<<<< HEAD
  isPreview?: boolean;
=======
>>>>>>> upstream/main
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

<<<<<<< HEAD
const NewsCard: React.FC<NewsCardProps> = ({ news, isPreview = false }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 1. Формуємо список усіх доступних зображень
  // Якщо є масив images - беремо його, якщо ні - пробуємо взяти старе imageUrl
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

  // 2. Функція для отримання повного URL зображення
  const getImageUrl = (path: string) => {
    if (path.startsWith('blob:') || path.startsWith('http')) {
      return path;
    }
    return `${import.meta.env.VITE_API_URL}${path}`;
  };

  // 3. Автоматичне перемикання кожні 10 секунд
  useEffect(() => {
    if (!hasMultipleImages) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
    }, 10000); // 10000 мс = 10 секунд

    return () => clearInterval(interval);
  }, [hasMultipleImages, availableImages.length]);

  // Навігація: Наступне фото
  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); // Щоб не спрацював перехід по Link
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % availableImages.length);
  };

  // Навігація: Попереднє фото
  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length);
  };

  // Навігація: Клік по кружечку
  const handleDotClick = (e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const className = `group relative flex flex-col p-4 bg-white rounded-xl transition-all duration-300 border border-gray-200 shadow-sm hover:bg-blue-50 hover:-translate-y-2 hover:shadow-lg hover:border-blue-300`;

  const cardContent = (
    <>
      {/* Контейнер для зображення */}
      <div className="relative mb-3 aspect-[4/5] rounded-md overflow-hidden bg-gray-100 group/image">
        {availableImages.length > 0 ? (
          <>
            <img
              src={getImageUrl(availableImages[currentImageIndex])}
              alt={news.title}
              loading="lazy"
              className="w-full h-full object-cover transition-opacity duration-500"
            />

            {/* Елементи управління (показуємо тільки якщо картинок > 1) */}
            {hasMultipleImages && (
              <>
                {/* Стрілка вліво */}
                <button
                  onClick={handlePrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 z-10"
                >
                  <ChevronLeft size={20} />
                </button>

                {/* Стрілка вправо */}
                <button
                  onClick={handleNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 rounded-full opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 z-10"
                >
                  <ChevronRight size={20} />
                </button>

                {/* Кружечки (індикатори) */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
                  {availableImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => handleDotClick(e, idx)}
                      className={`transition-all duration-300 rounded-full shadow-sm ${
                        currentImageIndex === idx
                          ? 'bg-white w-2.5 h-2.5'
                          : 'bg-white/50 hover:bg-white/80 w-2 h-2'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          // Заглушка, якщо фото немає
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-xl font-semibold">Фото</span>
=======
const NewsCard: React.FC<NewsCardProps> = ({ news }) => {
  const imageSrc = news.imageUrl
    ? `http://localhost:5068${news.imageUrl}`
    : undefined;

  return (
    <Link
      to={`/news/${news.id}`}
      className="group relative flex flex-col p-4 bg-white hover:bg-blue-50 rounded-xl transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-300"
    >
      {/* Image Section */}
      <div className="relative mb-3 aspect-[4/5] rounded-md overflow-hidden">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={news.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">Новина</span>
>>>>>>> upstream/main
          </div>
        )}
      </div>

<<<<<<< HEAD
      {news.isImportant && (
        <div className="absolute top-6 right-6 text-white bg-blue-600 p-1.5 rounded-full shadow-md z-20">
=======
      {/* Star Icon */}
      {news.isImportant && (
        <div className="absolute top-6 right-6 text-white bg-blue-600 p-1.5 rounded-full shadow-md">
>>>>>>> upstream/main
          <Star className="h-3 w-3 fill-current" />
        </div>
      )}

<<<<<<< HEAD
      <div className="flex flex-col flex-1">
        <h3 className="text-xl font-semibold text-[#1E2A5A] mb-3 leading-tight min-h-[3rem] line-clamp-2 group-hover:text-blue-600">
          {news.title}
        </h3>
        
        {/* Виведення HTML контенту (обережно з XSS, якщо контент не з довіреного джерела) */}
        <div 
            className="text-[#1E2A5A] text-sm line-clamp-3 mb-4 leading-relaxed italic" 
            dangerouslySetInnerHTML={{ __html: news.content || '' }} 
        />
        
=======
      {/* Content Section */}
      <div className="flex flex-col flex-1">
        <h3 className="text-xl font-semibold text-[#1E2A5A] group-hover:text-blue-600 mb-3 leading-tight min-h-[3rem] line-clamp-2">
          {news.title}
        </h3>
        <p className="text-[#1E2A5A] text-sm line-clamp-3 mb-4 leading-relaxed italic" dangerouslySetInnerHTML={{ __html: news.content }} />
>>>>>>> upstream/main
        <div className="flex justify-between items-center mt-auto pt-2">
          <div className="flex items-center text-[#1E2A5A] text-sm font-semibold">
            <Calendar className="h-4 w-4 mr-2" />
            {formatDate(news.publishedAt)}
          </div>
<<<<<<< HEAD
          {!isPreview && (
            <span className="text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              Читати →
            </span>
          )}
        </div>
      </div>
    </>
  );

  return isPreview ? (
    <div className={className}>
      {cardContent}
    </div>
  ) : (
    <Link to={`/news/${news.id}`} className={className}>
      {cardContent}
=======
          <span className="text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Читати →
          </span>
        </div>
      </div>
>>>>>>> upstream/main
    </Link>
  );
};

<<<<<<< HEAD
export default NewsCard;
=======
export default NewsCard;
>>>>>>> upstream/main
