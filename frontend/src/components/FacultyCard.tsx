import React from 'react';
import { Mail, MapPin, Clock, Users } from 'lucide-react';
import { Faculty } from '../types/faculty';

interface FacultyCardProps {
  union: Faculty;
  index: number;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const FacultyCard: React.FC<FacultyCardProps> = ({ union, index }) => {
  // Формуємо повний URL для логотипу або ставимо заглушку
  const getFullImageUrl = (url?: string): string => {
    if (!url) return `${import.meta.env.VITE_API_URL}/uploads/default_profburo_logo.png`;
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  const logoUrl = getFullImageUrl(union.imageUrl);

  // Ті самі сучасні градієнти, що й у відділах
  const gradients = [
    "from-blue-500 to-cyan-400",
    "from-indigo-500 to-purple-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-rose-400 to-red-500"
  ];
  const activeGradient = gradients[index % gradients.length];

  return (
    <div 
      className="group relative bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-500 ease-out flex flex-col md:flex-row gap-6 md:gap-8 overflow-hidden hover:-translate-y-1"
      style={{
        animationFillMode: 'both',
        animationDelay: `${index * 50}ms`,
      }}
    >
      {/* Декоративне розмите світіння на фоні */}
      <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${activeGradient} rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />

      {/* 1. Блок Логотипу */}
      <div className="flex-shrink-0 flex justify-center md:justify-start z-10">
        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${activeGradient} p-[2px] shadow-md group-hover:scale-105 transition-transform duration-500`}>
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden p-2">
            <img 
              src={logoUrl} 
              alt={union.name} 
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `${import.meta.env.VITE_API_URL}/uploads/default_profburo_logo.png`;
              }}
            />
          </div>
        </div>
      </div>

      {/* 2. Основна інформація */}
      <div className="flex-1 flex flex-col justify-center text-center md:text-left z-10">
        <h3 className="text-2xl font-bold text-[#1E2A5A] mb-3 group-hover:text-blue-600 transition-colors duration-300">
          {union.name}
        </h3>
        
        {union.summary && (
          <p className="text-gray-600 leading-relaxed text-sm md:text-base max-w-3xl mb-4">
            {union.summary}
          </p>
        )}

        {/* Додаткова інформація (Локація та Графік) у вигляді сучасних пігулок */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-auto">
          {(union.address || union.room) && (
            <a 
              href={`http://maps.google.com/?q=$${encodeURIComponent("м. Львів, " + (union.address || ""))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-blue-50 hover:text-blue-600 px-3 py-1.5 rounded-full border border-gray-200 transition-colors"
            >
              <MapPin className="w-3.5 h-3.5" />
              {union.address}{union.room ? `, ${union.room}` : ""}
            </a>
          )}
          
          {union.schedule && (
            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <Clock className="w-3.5 h-3.5" />
              {union.schedule}
            </div>
          )}
        </div>
      </div>

      {/* 3. Блок Голови профбюро (Міні-картка) */}
      {union.head ? (
        <div className="flex-shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 mt-4 md:mt-0 z-10">
          <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300 w-full sm:w-64">
            
            <div className="flex items-center gap-3 mb-3">
              {/* Аватарка голови */}
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${activeGradient} p-[2px]`}>
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center overflow-hidden">
                  {union.head.imageUrl ? (
                     <img 
                       src={getFullImageUrl(union.head.imageUrl)} 
                       alt={union.head.name}
                       className="w-full h-full object-cover"
                     />
                  ) : (
                    <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-700 to-gray-900">
                      {getInitials(union.head.name)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Ім'я та посада */}
              <div className="flex-1 overflow-hidden">
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5 truncate">
                  Голова профбюро
                </p>
                <p className="text-sm font-bold text-[#1E2A5A] truncate">
                  {union.head.name}
                </p>
              </div>
            </div>

            {/* Кнопка Email */}
            {union.head.email && (
              <a 
                href={`mailto:${union.head.email}`} 
                className="flex items-center justify-center gap-2 w-full text-xs font-medium text-gray-600 hover:text-blue-600 bg-white hover:bg-blue-50 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
              >
                <Mail className="w-4 h-4" />
                <span className="truncate">{union.head.email}</span>
              </a>
            )}

          </div>
        </div>
      ) : (
        /* Якщо голову не призначено */
        <div className="flex-shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 mt-4 md:mt-0 z-10">
           <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 w-full sm:w-64 flex items-center justify-center text-gray-400 gap-2 h-full min-h-[100px]">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Наразі не призначений</span>
           </div>
        </div>
      )}

    </div>
  );
};

export default FacultyCard;