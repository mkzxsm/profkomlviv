import React from 'react';
import { Mail, ShieldCheck } from 'lucide-react';
import { Department } from '../types/department';

interface DepartmentCardProps {
  department: Department;
  index: number;
}

// Функція для отримання ініціалів голови
const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, index }) => {
  // Формуємо повний URL для логотипу (якщо є)
  const getFullImageUrl = (url?: string): string | undefined => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('blob:')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  const logoUrl = getFullImageUrl(department.logoUrl);

  // Масив красивих градієнтів для різних відділів
  const gradients = [
    "from-blue-500 to-cyan-400",
    "from-indigo-500 to-purple-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-rose-400 to-red-500"
  ];
  // Обираємо градієнт на основі індексу
  const activeGradient = gradients[index % gradients.length];

  return (
    <div className="group relative bg-white rounded-3xl p-6 sm:p-8 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-500 ease-out flex flex-col md:flex-row gap-6 md:gap-8 overflow-hidden hover:-translate-y-1">
      
      {/* Декоративне розмите світіння на фоні (видно при наведенні) */}
      <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${activeGradient} rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none`} />

      {/* 1. Блок Логотипу */}
      <div className="flex-shrink-0 flex justify-center md:justify-start">
        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br ${activeGradient} p-[2px] shadow-md group-hover:scale-105 transition-transform duration-500`}>
          <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center overflow-hidden p-2">
            {logoUrl ? (
              <img 
                src={logoUrl} 
                alt={department.name} 
                className="w-full h-full object-contain"
                loading="lazy"
              />
            ) : (
              <ShieldCheck className="w-10 h-10 text-gray-300" />
            )}
          </div>
        </div>
      </div>

      {/* 2. Основна інформація */}
      <div className="flex-1 flex flex-col justify-center text-center md:text-left z-10">
        <h3 className="text-2xl font-bold text-[#1E2A5A] mb-3 group-hover:text-blue-600 transition-colors duration-300">
          {department.name}
        </h3>
        <p className="text-gray-600 leading-relaxed text-sm md:text-base max-w-3xl">
          {department.description}
        </p>
      </div>

      {/* 3. Блок Голови відділу (Міні-картка) */}
      {department.head && (
        <div className="flex-shrink-0 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 mt-2 md:mt-0 z-10">
          <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 group-hover:bg-white group-hover:shadow-md transition-all duration-300 w-full sm:w-64">
            
            <div className="flex items-center gap-3 mb-3">
              {/* Аватарка (Ініціали або фото) */}
              <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${activeGradient} p-[2px]`}>
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  {department.head.imageUrl ? (
                     <img 
                       src={getFullImageUrl(department.head.imageUrl)} 
                       alt={department.head.name}
                       className="w-full h-full rounded-full object-cover"
                     />
                  ) : (
                    <span className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-br from-gray-700 to-gray-900">
                      {getInitials(department.head.name)}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Ім'я та посада */}
              <div className="flex-1 overflow-hidden">
                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">
                  Голова відділу
                </p>
                <p className="text-sm font-bold text-[#1E2A5A] truncate">
                  {department.head.name}
                </p>
              </div>
            </div>

            {/* Кнопка Email */}
            {department.head.email && (
              <a 
                href={`mailto:${department.head.email}`} 
                className="flex items-center justify-center gap-2 w-full text-xs font-medium text-gray-600 hover:text-blue-600 bg-white hover:bg-blue-50 px-3 py-2.5 rounded-xl border border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
              >
                <Mail className="w-4 h-4" />
                <span className="truncate">{department.head.email}</span>
              </a>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default DepartmentCard;