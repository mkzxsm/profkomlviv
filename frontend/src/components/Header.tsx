import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Головна', href: '/' },
    { name: 'Про нас', href: '/about-us' },
<<<<<<< HEAD
    { name: 'Наша структура', href: '/structure' },
    { name: 'Сервіси', href: '/services', mobileOnly: true },
    { name: 'Документи', href: '/documents' },
=======
    { name: 'Документи', href: '/documents' },
    { name: 'Профбюро', href: '/fuck' },
>>>>>>> upstream/main
    { name: 'Новини', href: '/news' },
    { name: 'Контакти', href: '/contacts' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Хедер */}
<<<<<<< HEAD
      <header className="relative bg-white/40 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.05)] sticky top-0 z-50">
=======
      <header className="relative bg-white/60 backdrop-blur-md border-b border-gray-200 shadow-lg sticky top-0 z-50">
>>>>>>> upstream/main
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Логотип */}
<<<<<<< HEAD
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="Логотип профкому студентів ЛНУ"
                className="h-14 w-14 object-contain transition-transform duration-300 group-hover:scale-105"
=======
            <Link to="/" className="flex items-center space-x-3">
              <img
                src="/logo.png"
                alt="Логотип профкому студентів ЛНУ"
                className="h-14 w-14 object-contain"
>>>>>>> upstream/main
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
<<<<<<< HEAD
              <div className="hidden h-10 w-10 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl items-center justify-center text-[#1E2A5A] font-bold text-lg shadow-sm">
=======
              <div className="hidden h-10 w-10 bg-white rounded-lg items-center justify-center text-[#1E2A5A] font-bold text-lg">
>>>>>>> upstream/main
                ЛНУ
              </div>
              <div className="hidden xxs:block">
                <h1 className="text-md font-bold text-[#1E2A5A]">Профком студентів</h1>
<<<<<<< HEAD
                <p className="text-sm text-[#1E2A5A]/80">ЛНУ ім. Івана Франка</p>
=======
                <p className="text-sm text-[#1E2A5A]">ЛНУ імені Івана Франка</p>
>>>>>>> upstream/main
              </div>
            </Link>

            {/* Десктоп-навігація */}
<<<<<<< HEAD
            <nav className="hidden lg:flex space-x-2">
              {navigation
                .filter((item) => !item.mobileOnly)
                .map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`relative px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 ease-out border
                      ${active
                        ? 'text-blue-700 bg-white/50 backdrop-blur-md border-white/70 shadow-[0_4px_16px_rgba(0,0,0,0.08)] scale-105'
                        : 'text-[#1E2A5A]/70 border-transparent hover:text-[#1E2A5A] hover:bg-white/20 hover:border-white/40 hover:shadow-sm'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
=======
            <nav className="hidden lg:flex space-x-6">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-3 py-1 rounded-2xl text-sm font-medium transition-all duration-300 border hover:-translate-y-0.5
                      ${active
                        ? 'text-blue-600 bg-white shadow-md border-gray-300'
                        : 'text-[#1E2A5A] border-transparent hover:border-gray-300 hover:shadow-md'
                      }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
>>>>>>> upstream/main
            </nav>

            {/* Кнопка меню */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
<<<<<<< HEAD
                className="inline-flex items-center justify-center p-2 rounded-xl text-[#1E2A5A] bg-white/20 border border-transparent hover:border-white/50 hover:bg-white/40 backdrop-blur-sm transition-all duration-300 shadow-sm"
=======
                className="inline-flex items-center justify-center p-2 rounded-md text-[#1E2A5A] transition-all duration-300"
>>>>>>> upstream/main
              >
                <div className="relative w-6 h-6">
                  <Menu
                    className={`absolute inset-0 h-6 w-6 transform transition-all duration-300 ${
                      isMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                    }`}
                  />
                  <X
<<<<<<< HEAD
                    className={`absolute inset-0 h-6 w-6 transform text-blue-600 transition-all duration-300 ${
=======
                    className={`absolute inset-0 h-6 w-6 transform hover:text-blue-600 transition-all duration-300 ${
>>>>>>> upstream/main
                      isMenuOpen ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Мобільне меню */}
      <div
<<<<<<< HEAD
        className={`lg:hidden fixed top-16 left-0 w-full bg-white/50 backdrop-blur-xl border-t border-white/50 shadow-lg overflow-hidden transition-all duration-500 ease-in-out z-40 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-3 pb-4 space-y-1">
=======
        className={`lg:hidden fixed top-16 left-0 w-full bg-white/60 backdrop-blur-md border-t border-gray-200 shadow-md overflow-hidden transition-[max-height,opacity] duration-500 ease-in-out z-40 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-3 pb-4 space-y-2">
>>>>>>> upstream/main
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMenuOpen(false)}
<<<<<<< HEAD
              className={`block px-4 py-3 rounded-2xl text-base font-medium transition-all duration-300 border ${
                isActive(item.href)
                  ? 'text-blue-700 bg-white/60 backdrop-blur-md border-white/70 shadow-[0_4px_12px_rgba(0,0,0,0.05)] translate-x-1'
                  : 'text-[#1E2A5A]/80 border-transparent hover:bg-white/30 hover:border-white/40 hover:translate-x-1'
=======
              className={`block px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-300 border hover:-translate-y-0.5 ${
                isActive(item.href)
                  ? 'text-blue-600 bg-white shadow-md border-gray-300'
                  : 'text-[#1E2A5A] border-transparent hover:border-gray-300 hover:shadow-md'
>>>>>>> upstream/main
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Header;