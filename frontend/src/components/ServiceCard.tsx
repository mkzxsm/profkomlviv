import React, { ReactNode } from 'react';
import { ExternalLink, ChevronRight } from 'lucide-react';

export interface ServiceProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  url: string;
}

const ServiceCard: React.FC<{ service: ServiceProps }> = ({ service }) => {
  return (
    <div 
      onClick={() => window.open(service.url, "_blank")}
      className="group relative h-full rounded-3xl bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${service.color}`} />
      
      <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${service.color} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500`} />

      <div className="relative p-8 flex flex-col flex-grow z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="relative">
            <div className={`absolute inset-0 bg-gradient-to-br ${service.color} blur-md opacity-40 rounded-2xl group-hover:opacity-60 transition-opacity duration-300`} />
            <div className={`relative p-3.5 rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-sm transform group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300`}>
              {service.icon}
            </div>
          </div>
          <span className="px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-gray-500 bg-gray-50 rounded-full border border-gray-100 group-hover:border-gray-200 transition-colors">
            {service.subtitle}
          </span>
        </div>
        
        <div className="flex-grow">
          <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
            {service.title}
          </h3>
          <p className="text-gray-500 text-base leading-relaxed">
            {service.description}
          </p>
        </div>
      </div>

      <div className="relative z-10 p-6 pt-0 mt-auto">
        <div className="w-full py-3.5 px-6 rounded-xl flex items-center justify-between border border-gray-100 bg-gray-50 group-hover:bg-white group-hover:border-transparent group-hover:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] transition-all duration-300">
          <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
            Перейти до форми
          </span>
          <div className="flex items-center space-x-1">
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform translate-x-0 group-hover:translate-x-1 transition-all" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;