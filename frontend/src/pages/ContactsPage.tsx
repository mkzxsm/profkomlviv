import React from 'react';
import { MapPin, Phone, Mail, User, MessageSquare } from 'lucide-react';

const ContactsPage: React.FC = () => {
  const contacts = [
    {
      name: "Микола Спересенко",
      position: "Голова профкому",
      email: "mykola.Speresenko@lnu.edu.ua",
      office: "Головний корпус, аудиторія 125"
    },
    {
      name: "Денис Фещук",
      position: "Заступник з організаційної роботи, комунікацій та інновацій",
      email: "denys.feshchuk@lnu.edu.ua",
      office: "Головний корпус, аудиторія 125"
    },
    {
      name: "Марія-Уляна Кульчицька",
      position: "Заступниця з проєктної діяльності та фандрайзенгу",
      email: "mariia-uliana.kulchytska@lnu.edu.ua",
      office: "Головний корпус, аудиторія 125"
    },
    {
      name: "Тарас Щерба",
      position: "Заступник з соціально-гуманітарної роботи",
      email: "taras.shcherba@lnu.edu.ua",
      office: "Головний корпус, аудиторія 125"
    }
  ];

  const workingHours = [
    { day: "Понеділок", hours: "10:00 - 16:00" },
    { day: "Вівторок", hours: "10:00 - 16:00" },
    { day: "Середа", hours: "10:00 - 16:00" },
    { day: "Четвер", hours: "10:00 - 16:00" },
    { day: "П'ятниця", hours: "10:00 - 16:00" },
    { day: "Субота", hours: "Вихідний" },
    { day: "Неділя", hours: "Вихідний" }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header Section */}
      <section className="relative bg-[#10183a] text-white pt-20 pb-32 overflow-hidden w-full">
        {/* Фонововідблиски */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[30%] -left-[10%] w-[50%] h-[120%] rounded-full bg-[#ca8a04]/20 blur-[130px]" />
          <div className="absolute top-[20%] right-[15%] w-[35%] h-[80%] rounded-full bg-[#ca8a04]/15 blur-[100px]" />
          <div className="absolute -bottom-[40%] -right-[5%] w-[60%] h-[120%] rounded-full bg-[#ca8a04]/25 blur-[140px]" />
          <div className="absolute bottom-[10%] left-[15%] w-[40%] h-[70%] rounded-full bg-[#1e3a8a]/30 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center flex flex-col items-center">
            {/* Декоративна іконка в стилі Glassmorphism */}
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/10">
              <Phone className="w-8 h-8 text-[#facc15]" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
              Контакти
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Зв'яжіться з нами будь-яким зручним способом. Ми завжди готові допомогти студентам
            </p>
          </div>
        </div>
      </section>

      {/* Main Content (Накладається на Header) */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Контактна інформація (Ліва колонка) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Основна інформація */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Основна інформація</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Адреса */}
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100/50">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-gray-600 leading-relaxed mt-1">
                    вул. Університетська, 1, аудиторія 125<br />
                    м. Львів, 79000
                  </p>
                </div>

                {/* Телефон */}
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100/50">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    +38 (032) 239-42-71
                  </p>
                </div>

                {/* Email */}
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100/50">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-gray-600 font-medium">
                    stud.profkom@lnu.edu.ua
                  </p>
                </div>
              </div>
            </div>

            {/* Контакти співробітників */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Контакти співробітників</h2>
              
              <div className="space-y-6">
                {contacts.map((contact, index) => (
                  <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <User className="h-6 w-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {contact.name}
                        </h3>
                        <p className="text-blue-600 font-medium mb-3 text-sm">{contact.position}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center bg-gray-50/50 p-2 rounded-lg">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                          <div className="flex items-center bg-gray-50/50 p-2 rounded-lg sm:col-span-1">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400 shrink-0" />
                            <span className="truncate">{contact.office}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Права колонка) */}
          <div className="space-y-8">
            
            {/* Розклад роботи */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 sm:p-8 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
              <h3 className="text-xl font-bold text-gray-900 mb-5">Розклад роботи</h3>
              <div className="space-y-3">
                {workingHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-gray-600">{schedule.day}</span>
                    <span className={`font-semibold bg-gray-50 px-3 py-1 rounded-lg text-sm ${
                      schedule.hours === 'Вихідний' ? 'text-red-500 bg-red-50' : 'text-gray-900'
                    }`}>
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Швидкий зв'язок */}
            <div className="bg-gradient-to-br from-blue-600 to-[#1e3a8a] text-white rounded-2xl p-6 sm:p-8 shadow-lg relative overflow-hidden">
              {/* Декоративний відблиск */}
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl pointer-events-none" />
              
              <h3 className="text-xl font-bold mb-3 relative z-10">Швидкий зв'язок</h3>
              <p className="text-blue-100 mb-6 text-sm leading-relaxed relative z-10">
                Маєте термінове питання? Зв'яжіться з нами прямо зараз!
              </p>
              <div className="space-y-3 relative z-10">
                <button className="w-full bg-white text-[#1E2A5A] py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 hover:scale-[1.02] transition-all duration-300 flex items-center justify-center shadow-sm">
                  <Phone className="h-4 w-4 mr-2" />
                  Подзвонити
                </button>
                <button className="w-full border border-white/30 bg-white/10 backdrop-blur-sm text-white py-3 px-4 rounded-xl font-semibold hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Написати
                </button>
              </div>
            </div>

            {/* Карта */}
             <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col">
              <div className="p-6 pb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  Як нас знайти
                </h3>
              </div>
              
              <div className="relative flex-1 min-h-[250px]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1270.2387062472926!2d24.021945236590994!3d49.83940430184256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473add717532cff9%3A0x1ea627f45b408179!2z0JvRjNCy0ZbQstGB0YzQutC40Lkg0L3QsNGG0ZbQvtC90LDQu9GM0L3QuNC5INGD0L3RltCy0LXRgNGB0LjRgtC10YIg0ZbQvNC10L3RliDQhtCy0LDQvdCwINCk0YDQsNC90LrQsA!5e1!3m2!1suk!2sua!4v1751542025513!5m2!1suk!2sua" 
                  width="100%" 
                  height="100%"
                  style={{ border: 0, position: 'absolute', top: 0, left: 0 }}
                  allowFullScreen
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Карта розташування ЛНУ імені Івана Франка"
                />
                {/* Overlay for better visual integration */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                </div>
              </div>
              
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Головний корпус ЛНУ імені Івана Франка знаходиться в історичному центрі Львова, 
                  поруч з головними транспортними вузлами міста.
                </p>
                <div className="flex items-center justify-between text-xs font-medium text-gray-500 bg-white p-3 rounded-xl border border-gray-100">
                  <span className="flex items-center"><span className="mr-1 text-lg">🚌</span> Зупинка "Університет"</span>
                  <span className="flex items-center"><span className="mr-1 text-lg">🚶‍♂️</span> 2 хв пішки</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactsPage;