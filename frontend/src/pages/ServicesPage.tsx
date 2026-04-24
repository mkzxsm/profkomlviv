import React from 'react';
import { Building, HandCoins, TentTree, Users, CreditCard } from 'lucide-react';
import ServiceCard, { ServiceProps } from '../components/ServiceCard';

export const servicesData: ServiceProps[] = [
  {
    icon: <Building className="h-6 w-6" />,
    title: "Звільнення від оплати",
    subtitle: "Гуртожиток",
    description: "Профком студентів оформлює звільнення від оплати за проживання в гуртожитках для дітей-пільговиків",
    color: "from-blue-500 to-blue-700",
    url: "https://forms.office.com/e/enQBJqB4SN",
  },
  {
    icon: <HandCoins className="h-6 w-6" />,
    title: "Матеріальна допомога",
    subtitle: "Підтримка",
    description: "Надання матеріальної допомоги студентам у скрутних життєвих випадках",
    color: "from-pink-500 to-pink-700",
    url: "https://www.google.com/maps",
  },
  {
    icon: <TentTree className="h-6 w-6" />,
    title: "Відпочинок у таборі",
    subtitle: "Дозвілля",
    description: "Організований відпочинок у спортивно-оздоровчому таборі «Карпати» з активними іграми та спортивними заходами",
    color: "from-green-500 to-green-700",
    url: "https://forms.office.com/e/enQBJqB4SN",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Консультації та захист прав",
    subtitle: "Права",
    description: "Консультації щодо оформлення соціальних стипендій та захист прав студентів (звернення щодо корупції, харасменту та булінгу)",
    color: "from-red-500 to-red-700",
    url: "https://www.google.com/maps",
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Студентська смарт-картка",
    subtitle: "Леокарт",
    description: "Оформлення та виготовлення безконтактної смарт-картки для оплати у громадському транспорті Львова",
    color: "from-purple-500 to-purple-700",
    url: "https://forms.office.com/e/enQBJqB4SN",
  }
];

const ServicesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
{/* Header Section */}
      <section className="relative bg-[#10183a] text-white py-20 lg:py-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[20%] right-[5%] w-[40%] h-[80%] rounded-full bg-[#ca8a04]/20 blur-[120px]" />
          <div className="absolute top-[30%] -left-[10%] w-[45%] h-[90%] rounded-full bg-[#ca8a04]/15 blur-[130px]" />
          <div className="absolute -bottom-[30%] right-[20%] w-[50%] h-[100%] rounded-full bg-[#ca8a04]/20 blur-[140px]" />
          <div className="absolute bottom-[20%] left-[30%] w-[50%] h-[70%] rounded-full bg-[#1e3a8a]/30 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Декоративна іконка в стилі Glassmorphism */}
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/10">
              <Building className="w-8 h-8 text-[#facc15]" /> 
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6">
              Наші сервіси
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl text-slate-300 mx-auto leading-relaxed">
              Профком студентів надає комплексну підтримку у різних сферах студентського життя. 
              Тут ви можете швидко знайти потрібний сервіс та подати заявку онлайн.
            </p>
          </div>
        </div>
      </section>

      <div className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 -mt-8 sm:-mt-12 relative z-10 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {servicesData.map((service, index) => (
            <div 
              key={index} 
              className="animate-fade-in-up" 
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ServiceCard service={service} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;