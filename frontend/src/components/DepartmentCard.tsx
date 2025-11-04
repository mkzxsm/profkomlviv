import React, { useState, useRef } from "react";
import { Mail, User } from "lucide-react";
import { Department } from '../types/department';

interface DepartmentCardProps {
  department: Department;
  index: number;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, index }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const getGradientColor = (i: number) => {
    const colors = [
      "from-blue-500 to-blue-600",
      "from-green-500 to-green-600",
      "from-purple-500 to-purple-600",
      "from-red-500 to-red-600",
      "from-yellow-500 to-yellow-600",
      "from-indigo-500 to-indigo-600",
      "from-pink-500 to-pink-600",
      "from-teal-500 to-teal-600",
    ];
    return colors[i % colors.length];
  };

  const headName = department.head?.name || "Наразі не призначений";

  return (
    <div
      className="bg-white rounded-xl transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-300 overflow-hidden"
      style={{
        transitionDelay: `${index * 40}ms`,
        animationDelay: `${index * 40}ms`,
      }}
    >
      <div
        className="relative flex flex-col md:flex-row items-start md:items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Color line */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b ${getGradientColor(index)}`}
        />

        <div className="flex w-full md:w-auto ml-4">
          {/* Photo */}
          <div className="relative flex-shrink-0 w-24 h-24 md:w-[140px] md:h-[140px]">
            <div className="w-full h-full overflow-hidden">
              <img
                src={department.logoUrl ? `${import.meta.env.VITE_API_URL}${department.logoUrl}` : `${import.meta.env.VITE_API_URL}/uploads/default_department_logo.png`}
                alt={department.name}
                loading="lazy"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `${import.meta.env.VITE_API_URL}/uploads/default_department_logo.png`;
                }}
              />
            </div>
          </div>

          {/* Title on mobile */}
          <div className="flex-1 min-w-0 px-4 py-2 flex items-center md:hidden text-left">
            <h3 className="font-bold text-base text-[#1E2A5A] leading-tight break-words">
              {department.name}
            </h3>
          </div>
        </div>

        <div className="flex-1 min-w-0 px-4 pb-4 md:py-4 md:pr-6 w-full text-left">
          {/* Title on desktop */}
          <h3 className="hidden md:block font-bold text-lg text-[#1E2A5A] leading-tight mb-2 break-words">
            {department.name}
          </h3>
          
          {/* Description */}
          {department.description && (
            <p className="text-[#1E2A5A] italic text-sm md:text-base leading-relaxed">
              {department.description}
            </p>
          )}
        </div>
      </div>

      {/* Expanded card */}
      <div
        ref={contentRef}
        className={`overflow-hidden rounded-b-xl transition-all duration-700 ease-in-out ${
          isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 md:px-6 pb-4 md:pb-6 border-t border-gray-100 bg-gray-50">
          <div className="text-[#1E2A5A] pt-4 lg:pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm">Голова відділу</p>
                  <p className="font-medium text-sm flex-shrink-0 italic">
                    {headName}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Mail className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm">Електронна пошта</p>
                  {department.head?.email ? (
                    <a
                      href={`mailto:${department.head.email}`}
                      className="font-medium text-sm hover:text-blue-600 transition-colors flex-shrink-0 italic break-words"
                    >
                      {department.head.email}
                    </a>
                  ) : (
                    <span className="font-medium text-sm italic">
                      Недоступна
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentCard;