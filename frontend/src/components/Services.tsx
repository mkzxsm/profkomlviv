import React from 'react';
import { Building, HandCoins, TentTree, Users, CreditCard } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      icon: <Building className="h-8 w-8" />,
      title: "Звільнення від оплати",
      subtitle: "Гуртожиток",
      description:
        "Профком студентів оформлює звільнення від оплати за проживання в гуртожитках для дітей-пільговиків",
      color: "from-blue-500 to-blue-700",
      url: "https://forms.office.com/e/enQBJqB4SN",
    },
    {
      icon: <HandCoins className="h-8 w-8" />,
      title: "Матеріальна допомога",
      subtitle: "Підтримка",
      description: "Надання матеріальної допомоги студентам у скрутних життєвих випадках",
      color: "from-pink-500 to-pink-700",
      url: "https://www.google.com/maps",
    },
    {
      icon: <TentTree className="h-8 w-8" />,
      title: "Відпочинок у таборі",
      subtitle: "Дозвілля",
      description: "Організований відпочинок у спортивно-оздоровчому таборі «Карпати» з активними іграми та спортивними заходами",
      color: "from-green-500 to-green-700",
      url: "https://forms.office.com/e/enQBJqB4SN",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Консультації та захист прав",
      subtitle: "Права",
      description:
        "Консультації щодо оформлення соціальних стипендій та захист прав студентів (звернення щодо корупції, харасменту та булінгу)",
      color: "from-red-500 to-red-700",
      url: "https://www.google.com/maps",
    },
    {
      icon: <CreditCard className="h-8 w-8" />,
      title: "Студентська смарт-картка",
      subtitle: "Леокарт",
      description: "Оформлення та виготовлення безконтактної смарт-картки для оплати у громадському транспорті Львова",
      color: "from-purple-500 to-purple-700",
      url: "https://forms.office.com/e/enQBJqB4SN",
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Заголовок сторінки */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Наші сервіси
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Ми надаємо комплексну підтримку студентам у різних сферах життя. 
            Обирайте необхідний сервіс та дізнавайтесь деталі.
          </p>
        </div>

        {/* Сітка карток: 1 стовпчик на мобільному, 2 стовпчики на планшетах і вище */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-items-center">
          {services.map((service, index) => (
            <a
              key={index}
              href={service.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative w-full max-w-lg rounded-3xl shadow-md transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br ${service.color} overflow-hidden`}
              style={{ minHeight: '320px' }} // Фіксуємо мінімальну висоту, щоб картки були схожі на оригінал
            >
              <div className="p-8 h-full flex flex-col justify-between text-white">
                {/* Верхня частина: Іконка та підзаголовок */}
                <div className="flex items-center mb-4">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    {service.icon}
                  </div>
                  <span className="ml-3 text-lg font-semibold opacity-90 tracking-wide">
                    {service.subtitle}
                  </span>
                </div>

                {/* Нижня частина: Заголовок, Опис та Стрілка */}
                <div>
                  <h3 className="text-3xl font-bold leading-tight mb-4">
                    {service.title}
                  </h3>
                  
                  <div className="flex justify-between items-end gap-4">
                    <p className="text-sm opacity-90 leading-relaxed font-medium">
                      {service.description}
                    </p>
                    
                    {/* Іконка стрілки з анімацією */}
                    <svg 
                      className="w-8 h-8 transform group-hover:translate-x-2 transition-transform duration-300 flex-shrink-0" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;