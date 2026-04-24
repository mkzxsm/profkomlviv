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
    { name: 'Сервіси', href: '/services' },
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
      {/* Хедер (Вужчий варіант) */}
      <header className="sticky top-0 z-50 bg-white/75 backdrop-blur-xl border-b border-white/50 shadow-[0_4px_30px_rgba(0,0,0,0.05)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Зменшена висота: h-14 (56px) для мобільних, h-16 (64px) для десктопу */}
          <div className="flex justify-between items-center h-14 md:h-16">
            
            {/* Логотип */}
            <Link to="/" className="flex items-center space-x-2.5 group">
              <img
                src="/logo.png"
                alt="Логотип профкому студентів ЛНУ"
                /* Пропорційно зменшений логотип */
                className="h-10 w-10 md:h-12 md:w-12 object-contain transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              {/* Заглушка, якщо логотип не завантажився */}
              <div className="hidden h-9 w-9 bg-blue-50 border border-blue-100 rounded-xl items-center justify-center text-blue-800 font-bold text-sm shadow-sm">
                ЛНУ
              </div>
              <div className="hidden sm:block">
                <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight leading-tight">Профком студентів</h1>
                <p className="text-[11px] md:text-xs text-slate-600 font-medium">ЛНУ ім. Івана Франка</p>
              </div>
            </Link>

            {/* Десктоп-навігація */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    /* Трохи менші вертикальні відступи (py-1.5) для вужчого хедера */
                    className={`relative px-3.5 py-1.5 rounded-xl text-sm font-semibold transition-all duration-300 ease-out border
                      ${active
                        ? 'text-blue-700 bg-white border-white/80 shadow-[0_4px_12px_rgba(0,0,0,0.06)] scale-105'
                        : 'text-slate-600 border-transparent hover:text-blue-600 hover:bg-white/60 hover:border-white/50 hover:shadow-sm'
                      }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Кнопка мобільного меню */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-700 bg-white/50 border border-white/50 hover:bg-white/80 backdrop-blur-md transition-all duration-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <div className="relative w-5 h-5">
                  <Menu
                    className={`absolute inset-0 h-5 w-5 transform transition-all duration-300 ${
                      isMenuOpen ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                    }`}
                  />
                  <X
                    className={`absolute inset-0 h-5 w-5 transform text-blue-600 transition-all duration-300 ${
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
        /* Висота відступу адаптована під нову висоту хедера (56px та 64px) */
        className={`lg:hidden fixed top-[56px] md:top-[64px] left-0 w-full bg-white/85 backdrop-blur-xl border-t border-gray-100 shadow-2xl overflow-hidden transition-all duration-400 ease-in-out z-40 ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 space-y-1.5">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 border ${
                  active
                    ? 'text-blue-700 bg-white border-white shadow-[0_4px_12px_rgba(0,0,0,0.06)] translate-x-2'
                    : 'text-slate-700 border-transparent hover:bg-white/60 hover:text-blue-600 hover:translate-x-1'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Header;