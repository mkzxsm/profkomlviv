import React from "react";
import { TeamMember } from '../types/team';

interface TeamMemberCardProps {
  member: TeamMember;
}

const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  const getFullImageUrl = (url?: string): string | undefined => {
    if (!url) {
      return undefined;
    }
    if (url.startsWith('http') || url.startsWith('blob:')) {
      return url;
    }
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  const imageUrl = getFullImageUrl(member.imageUrl);

// ... верхня частина файлу без змін ...

  return (
    <div className="group flex flex-col overflow-visible bg-white hover:bg-blue-50 rounded-xl transition-all duration-300 transform-gpu hover:-translate-y-2 shadow-sm hover:shadow-lg border border-gray-200 hover:border-blue-300">
      <div className="relative">
        <div className="aspect-[3/4] rounded-md overflow-hidden">
          {member.imageUrl ? (
            <div className="w-full h-full p-4">
              <img
                src={imageUrl}
                alt={member.name}
                className="w-full h-full object-cover rounded-md"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="w-full h-full p-4">
              <div className="w-full h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center rounded-lg">
                <span className="text-white text-xl font-semibold">
                  {getInitials(member.name)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      {/* ВИДАЛЕНО text-white, оскільки текст і так має свій колір #1E2A5A */}
      <div className="flex flex-col items-center justify-center text-center px-4 pb-4 w-full">
        {/* 1. ЗАМІНЕНО truncate на break-words
          2. ДОДАНО transition-colors duration-300 для плавної зміни кольору на синій
        */}
        <h3 className="text-2xl font-bold text-[#1E2A5A] w-full break-words transition-colors duration-300 group-hover:text-blue-600">
          {member.name}
        </h3>
        <p className="mt-1 text-lg italic text-[#1E2A5A] w-full break-words">
          {member.isTemporary 
            ? member.position.replace("Керівник", "В.О. Керівника") 
            : member.position}
        </p>
      </div>
    </div>
  );
};

export default TeamMemberCard;