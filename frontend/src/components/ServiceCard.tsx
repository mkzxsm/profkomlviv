import React, { ReactNode, useId } from "react";
import { ChevronRight } from "lucide-react";

export interface ServiceProps {
  icon: ReactNode;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  url: string;
}

const ServiceCard: React.FC<{ service: ServiceProps }> = ({ service }) => {
  const titleId = useId();
  const descriptionId = useId();

  return (
    <article
      className="group relative h-full rounded-3xl bg-white border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden flex flex-col"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${service.color}`}
        aria-hidden="true"
      />

      <div
        className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${service.color} rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500`}
        aria-hidden="true"
      />

      <div className="relative p-8 flex flex-col flex-grow z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="relative" aria-hidden="true">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${service.color} blur-md opacity-40 rounded-2xl group-hover:opacity-60 transition-opacity duration-300`}
            />
            <div
              className={`relative p-3.5 rounded-2xl bg-gradient-to-br ${service.color} text-white shadow-sm transform group-hover:scale-105 group-hover:-rotate-3 transition-all duration-300`}
            >
              {service.icon}
            </div>
          </div>
          <p className="px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-gray-500 bg-gray-50 rounded-full border border-gray-100 group-hover:border-gray-200 transition-colors">
            {service.subtitle}
          </p>
        </div>

        <div className="flex-grow">
          <h3
            id={titleId}
            className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors duration-300 leading-tight"
          >
            {service.title}
          </h3>
          <p
            id={descriptionId}
            className="text-gray-500 text-base leading-relaxed"
          >
            {service.description}
          </p>
        </div>
      </div>

      <div className="relative z-10 p-6 pt-0 mt-auto">
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 px-6 rounded-xl flex items-center justify-between border border-gray-100 bg-gray-50 group-hover:bg-white group-hover:border-transparent group-hover:shadow-[0_4px_15px_-3px_rgba(0,0,0,0.05)] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 after:absolute after:inset-0 after:z-20 after:content-['']"
          aria-label={`Сервіс «${service.title}». ${service.subtitle}. ${service.description}. Відкрити форму в новій вкладці`}
        >
          <span className="text-sm font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
            Перейти до форми
          </span>
          <ChevronRight
            className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform translate-x-0 group-hover:translate-x-1 transition-all"
            aria-hidden="true"
          />
        </a>
      </div>
    </article>
  );
};

export default ServiceCard;
