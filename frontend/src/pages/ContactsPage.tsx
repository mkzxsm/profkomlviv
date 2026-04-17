import React from 'react';
<<<<<<< HEAD
import { MapPin, Phone, Mail, User, MessageSquare } from 'lucide-react';
=======
import { MapPin, Phone, Mail, Clock, User, MessageSquare } from 'lucide-react';
>>>>>>> upstream/main

const ContactsPage: React.FC = () => {
  const contacts = [
    {
      name: "Микола Спересенко",
      position: "Голова профкому",
<<<<<<< HEAD
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
=======
      phone: "+38 (032) 239-41-32",
      email: "profkomhead@lnu.edu.ua",
      office: "Головний корпус, аудиторія 125"
    },
    {
      name: "Катерина Старушенко",
      position: "Заступниця з соціальних питань",
      phone: "+38 (099) 201-01-30",
      email: "social@lnu.edu.ua",
      office: "Головний корпус, аудиторія 125"
    },
    {
      name: "Дарина Плитус",
      position: "Заступниця з розвитку та співпраці",
      phone: "+38 (066) 129-06-71",
      email: "partnership@lnu.edu.ua",
      office: "Головний корпус, аудиторія 125"
    },
    {
      name: "Марія Тацинець",
      position: "Заступниця з медіа та комунікацій",
      phone: "+38 (098) 439-71-54",
      email: "media@lnu.edu.ua",
>>>>>>> upstream/main
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
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Контакти
            </h1>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto">
              Зв'яжіться з нами будь-яким зручним способом. Ми завжди готові допомогти студентам
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-2">
<div className="bg-white rounded-lg shadow-md p-8 mb-8 transform transition-transform duration-500 ease-in-out hover:-translate-y-2 hover:shadow-lg">
  <h2 className="text-2xl font-bold text-gray-900 mb-6">Основна інформація</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Адреса */}
    <div className="flex items-center space-x-4">
      <div className="bg-blue-100 p-3 rounded-lg">
        <MapPin className="h-6 w-6 text-blue-600" />
      </div>
      <p className="text-gray-600">
        вул. Університетська, 1, аудиторія 125<br />
        м. Львів, 79000
      </p>
    </div>

    {/* Телефон */}
    <div className="flex items-center space-x-4">
      <div className="bg-blue-100 p-3 rounded-lg">
        <Phone className="h-6 w-6 text-blue-600" />
      </div>
      <p className="text-gray-600">
<<<<<<< HEAD
        +38 (032) 239-42-71
=======
        +38 (032) 239-41-32
>>>>>>> upstream/main
      </p>
    </div>

    {/* Email */}
    <div className="flex items-center space-x-4">
      <div className="bg-blue-100 p-3 rounded-lg">
        <Mail className="h-6 w-6 text-blue-600" />
      </div>
      <p className="text-gray-600">
<<<<<<< HEAD
        stud.profkom@lnu.edu.ua<br />
=======
        profkom@lnu.edu.ua<br />
        info@lnu.edu.ua
      </p>
    </div>

    {/* Режим роботи */}
    <div className="flex items-center space-x-4">
      <div className="bg-blue-100 p-3 rounded-lg">
        <Clock className="h-6 w-6 text-blue-600" />
      </div>
      <p className="text-gray-600">
        Пн-Пт: 10:00 - 16:00<br />
        Сб-Нд: вихідні
>>>>>>> upstream/main
      </p>
    </div>
  </div>
</div>

            {/* Staff Contacts */}
            <div className="bg-white rounded-lg shadow-md p-8 transform transition-transform duration-500 ease-in-out hover:-translate-y-2 hover:shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Контакти співробітників</h2>
              
              <div className="space-y-6">
                {contacts.map((contact, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-start space-x-4">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <User className="h-6 w-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {contact.name}
                        </h3>
                        <p className="text-blue-600 font-medium mb-3">{contact.position}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center">
<<<<<<< HEAD
=======
                            <Phone className="h-4 w-4 mr-2" />
                            {contact.phone}
                          </div>
                          <div className="flex items-center">
>>>>>>> upstream/main
                            <Mail className="h-4 w-4 mr-2" />
                            {contact.email}
                          </div>
                          <div className="flex items-center sm:col-span-2">
                            <MapPin className="h-4 w-4 mr-2" />
                            {contact.office}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Working Hours */}
            <div className="bg-white rounded-lg shadow-md p-6 transform transition-transform duration-500 ease-in-out hover:-translate-y-2 hover:shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Розклад роботи</h3>
              <div className="space-y-3">
                {workingHours.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-gray-600">{schedule.day}</span>
                    <span className={`font-medium ${
                      schedule.hours === 'Вихідний' ? 'text-red-500' : 'text-gray-900'
                    }`}>
                      {schedule.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Contact */}
            <div className="bg-blue-600 text-white rounded-lg p-6 transform transition-transform duration-500 ease-in-out hover:-translate-y-2 hover:shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Швидкий зв'язок</h3>
              <p className="text-blue-100 mb-4 text-sm">
                Маєте термінове питання? Зв'яжіться з нами прямо зараз!
              </p>
              <div className="space-y-3">
                <button className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Подзвонити
                </button>
                <button className="w-full border border-white text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Написати
                </button>
              </div>
            </div>

            {/* Map placeholder */}
             <div className="bg-white rounded-lg shadow-md overflow-hidden transform transition-transform duration-500 ease-in-out hover:-translate-y-2 hover:shadow-lg">
              <div className="p-6 pb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                  Як нас знайти
                </h3>
              </div>
              
              <div className="relative">
                <div className="h-64 w-full">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1270.2387062472926!2d24.021945236590994!3d49.83940430184256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x473add717532cff9%3A0x1ea627f45b408179!2z0JvRjNCy0ZbQstGB0YzQutC40Lkg0L3QsNGG0ZbQvtC90LDQu9GM0L3QuNC5INGD0L3RltCy0LXRgNGB0LjRgtC10YIg0ZbQvNC10L3RliDQhtCy0LDQvdCwINCk0YDQsNC90LrQsA!5e1!3m2!1suk!2sua!4v1751542025513!5m2!1suk!2sua" 
                    width="100%" 
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-b-lg"
                    title="Карта розташування ЛНУ імені Івана Франка"
                  />
                </div>
                
                {/* Overlay for better visual integration */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                </div>
              </div>
              
              <div className="p-6 pt-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Головний корпус ЛНУ імені Івана Франка знаходиться в історичному центрі Львова, 
                  поруч з головними транспортними вузлами міста. Легко дістатися громадським транспортом.
                </p>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>🚌 Зупинка "Університет"</span>
                    <span>🚶‍♂️ 2 хв пішки</span>
                  </div>
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