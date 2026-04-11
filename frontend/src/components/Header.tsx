import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Головна', href: '/' },
    { name: 'Про нас', href: '/about-us' },
    { name: 'Наша структура', href: '/structure' },
    { name: 'Сервіси', href: '/services', mobileOnly: true },
    { name: 'Документи', href: '/documents' },
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
      <header className="relative bg-white/40 backdrop-blur-lg shadow-[0_4px_30px_rgba(0,0,0,0.05)] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Логотип */}
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src="/logo.png"
                alt="Логотип профкому студентів ЛНУ"
                className="h-14 w-14 object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <div className="hidden h-10 w-10 bg-white/50 backdrop-blur-sm border border-white/60 rounded-xl items-center justify-center text-[#1E2A5A] font-bold text-lg shadow-sm">
                ЛНУ
              </div>
              <div className="hidden xxs:block">
                <h1 className="text-md font-bold text-[#1E2A5A]">Профком студентів</h1>
                <p className="text-sm text-[#1E2A5A]/80">ЛНУ ім. Івана Франка</p>
              </div>
            </Link>

            {/* Десктоп-навігація */}
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
            </nav>

            {/* Кнопка меню */}
            <div className="lg:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-[#1E2A5A] bg-white/20 border border-transparent hover:border-white/50 hover:bg-white/40 backdrop-blur-sm transition-all duration-300 shadow-sm"
              >
                <div className="relative w-6 h-6">
                  <Menu
                    className={`absolute inset-0 h-6 w-6 transform transition-all duration-300 ${
                      isMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                    }`}
                  />
                  <X
                    className={`absolute inset-0 h-6 w-6 transform text-blue-600 transition-all duration-300 ${
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
        className={`lg:hidden fixed top-16 left-0 w-full bg-white/50 backdrop-blur-xl border-t border-white/50 shadow-lg overflow-hidden transition-all duration-500 ease-in-out z-40 ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-3 pb-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`block px-4 py-3 rounded-2xl text-base font-medium transition-all duration-300 border ${
                isActive(item.href)
                  ? 'text-blue-700 bg-white/60 backdrop-blur-md border-white/70 shadow-[0_4px_12px_rgba(0,0,0,0.05)] translate-x-1'
                  : 'text-[#1E2A5A]/80 border-transparent hover:bg-white/30 hover:border-white/40 hover:translate-x-1'
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