import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Users, Building, HandCoins, CreditCard, TentTree, ChevronLeft, ChevronRight } from 'lucide-react';
import NewsCard from '../components/NewsCard';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

interface News {
  id: number;
  title: string;
  content: string;
  image_url?: string;
  publishedAt: string;
  isImportant: boolean;
}

interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  description: string;
}

const HomePage: React.FC = () => {
  const [news, setNews] = useState<News[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Easter egg states
  const [showBackground, setShowBackground] = useState(false);
  const showBackgroundRef = useRef(false);
  const [secretClickCount, setSecretClickCount] = useState(0);
  
  const navigate = useNavigate();

  const heroSlides: HeroSlide[] = [
    {
      id: 1,
      image: "/home_page/university.JPG",
      title: 'Профком студентів',
      subtitle: 'Львівський національний університет імені Івана Франка',
      description: 'Це про можливості всебічного поступу, захист прав та представництво інтересів студентів та аспірантів'
    },
    {
      id: 2,
      image: '/home_page/social.JPG',
      title: 'Соціальна підтримка',
      subtitle: 'Матеріальна допомога та стипендії',
      description: 'Надаємо фінансову підтримку студентам у складних життєвих ситуаціях'
    },
    {
      id: 3,
      image: '/home_page/entertainment.jpg',
      title: 'Дозвілля',
      subtitle: 'Посвяти, фестивалі та інші заходи',
      description: 'Це про незабутні події, які роблять твоє студентське життя вайбовим'
    },
    {
      id: 4,
      image: '/home_page/education.JPG',
      title: 'Освітні програми',
      subtitle: 'Додаткові можливості розвитку',
      description: 'Курси, тренінги та програми особистісного зростання'
    },
    {
      id: 5,
      image: '/home_page/sport.png',
      title: 'Спортивне життя',
      subtitle: 'Змагання та спортивні секції',
      description: 'Підтримуємо здоровий спосіб життя та спортивні досягнення'
    },
    {
      id: 6,
      image: '/home_page/hostel.jpg',
      title: 'Студентські гуртожитки',
      subtitle: 'Комфортні умови проживання',
      description: 'Забезпечуємо якісні умови проживання для студентів'
    }
  ];

  const services = [
    {
      icon: <Building className="h-8 w-8" />,
      title: "Звільнення від оплати",
      subtitle: "Гуртожиток",
      description: "Профком студентів оформлює звільнення від оплати за проживання в гуртожитках для дітей-пільговиків",
      color: "from-blue-600 to-blue-800",
      url: "https://forms.office.com/e/enQBJqB4SN",
    },
    {
      icon: <HandCoins className="h-8 w-8" />,
      title: "Матеріальна допомога",
      subtitle: "Підтримка",
      description: "Надання матеріальної допомоги студентам у скрутних життєвих випадках",
      color: "from-pink-500 to-rose-600",
      url: "https://www.google.com/maps",
    },
    {
      icon: <TentTree className="h-8 w-8" />,
      title: "Відпочинок у таборі",
      subtitle: "Дозвілля",
      description: "Організований відпочинок у спортивно-оздоровчому таборі «Карпати» з активними іграми та спортивними заходами",
      color: "from-emerald-500 to-green-700",
      url: "https://forms.office.com/e/enQBJqB4SN",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Консультації та захист прав",
      subtitle: "Права",
      description: "Консультації щодо оформлення соціальних стипендій та захист прав студентів (звернення щодо корупції, харасменту та булінгу)",
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

  // --- Hero Slideshow Logic ---
  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const startAutoPlay = () => {
    stopAutoPlay();
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
  };

  const stopAutoPlay = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    startAutoPlay();
  };

  // --- Fixed & Optimized Scroll Animation for Cards ---
  useEffect(() => {
    const handleScroll = () => {
      const stackArea = document.querySelector('.stack-area') as HTMLElement;
      const cards = document.querySelectorAll('.stack-card');
      if (!stackArea || !cards.length) return;

      const headerHeight = 64; 
      const distance = window.innerHeight * 0.5; // Скільки скролити на одну картку
      const topVal = stackArea.getBoundingClientRect().top - headerHeight;

      // Гарантуємо, що індекс не буде від'ємним і розраховується правильно
      const scrolledPast = Math.max(0, -topVal);
      const index = Math.floor(scrolledPast / distance);

      // requestAnimationFrame забезпечує 60+ FPS без лагів
      window.requestAnimationFrame(() => {
        let visibleCount = 0;
        
        cards.forEach((card, i) => {
          const cardElement = card as HTMLElement;
          if (i < index) {
            // Картка відлетіла (ВАЖЛИВО: translateY і rotate присутні обов'язково)
            cardElement.style.transform = `translateY(-120vh) rotate(-48deg)`;
            cardElement.style.opacity = '0'; // Плавно розчиняється вгорі
          } else {
            // Картка в колоді
            const relativeIndex = i - index;
            const angle = -(relativeIndex * 8);
            // ВАЖЛИВО: translateY(0px) фіксує проблему "матричної інтерполяції"
            cardElement.style.transform = `translateY(0px) rotate(${angle}deg)`;
            cardElement.style.opacity = '1';
            visibleCount++;
          }
          // Z-index змінюємо без анімацій
          cardElement.style.zIndex = `${cards.length - i}`;
        });

        // Обробка видимості пасхалки
        if (visibleCount === 0 && !showBackgroundRef.current) {
          showBackgroundRef.current = true;
          setShowBackground(true);
        } else if (visibleCount > 0 && showBackgroundRef.current) {
          showBackgroundRef.current = false;
          setShowBackground(false);
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Ініціалізація
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- News Fetching ---
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/news`);
      setNews(response.data.slice(0, 6)); 
    } catch (error) {
      console.error('Помилка при отриманні новин:', error);
    } finally {
      setLoading(false);
    }
  };

  // Easter egg handler
  const handleSecretLogoClick = () => {
    const newCount = secretClickCount + 1;
    setSecretClickCount(newCount);
    if (newCount === 5) {
      window.open('https://chromedino.com/', '_blank');
      setSecretClickCount(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#10183a]" style={{ height: "calc(100vh - 64px)" }}>
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
               style={{ 
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                maxWidth: '1920px',
                width: '100%',
                height: '100%',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#10183a]/95 via-[#10183a]/80 to-transparent" />
          </div>
        ))}

        <div className="relative z-10 flex items-center h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl text-left text-white">
            <div key={currentSlide} className="animate-fade-in-up">
              <p className="text-xl md:text-2xl mb-4 text-[#facc15] font-semibold tracking-wide uppercase">
                {heroSlides[currentSlide].subtitle}
              </p>
              <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                {heroSlides[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl mb-10 text-slate-300 leading-relaxed">
                {heroSlides[currentSlide].description}
              </p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/services')}
                className="bg-white text-[#1E2A5A] py-3.5 px-10 rounded-2xl font-bold hover:bg-gray-50 hover:scale-[1.02] transition-all duration-300 shadow-[0_4px_12px_rgb(0,0,0,0.08)]"
              >
                Дізнатися більше
              </button>
            </div>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex space-x-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-[#facc15] scale-125 w-6' : 'bg-white/50 hover:bg-white'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length)}
          className="hidden mdl:flex absolute left-4 top-1/2 transform -translate-y-1/2 z-20 text-white/70 hover:text-white transition-all duration-300 p-3 rounded-2xl hover:bg-white/20 backdrop-blur-md border border-transparent hover:border-white/30"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
        <button
          onClick={() => goToSlide((currentSlide + 1) % heroSlides.length)}
          className="hidden mdl:flex absolute right-4 top-1/2 transform -translate-y-1/2 z-20 text-white/70 hover:text-white transition-all duration-300 p-3 rounded-2xl hover:bg-white/20 backdrop-blur-md border border-transparent hover:border-white/30"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </section>

      {/* Services Section (Stacked Cards) */}
      <section className="hidden xl:block py-16 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto">
          <div className="relative">
            {/* Висота збільшена (120vh в кінці) щоб було достатньо місця проскролити і побачити логотип */}
            <div className="stack-area relative w-full flex" style={{ height: `calc(${services.length * 50}vh + 120vh)` }}>
              
              {/* Left side - Text content */}
              <div className="left sticky h-screen flex-1 flex items-center justify-center box-border" style={{ top: '64px' }}>
                <div className="max-w-lg">
                  <div className="inline-flex items-center justify-center p-3 bg-blue-100/50 rounded-2xl mb-6">
                    <Building className="w-8 h-8 text-blue-600" /> 
                  </div>
                  <h2 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                    Наші сервіси
                  </h2>
                  <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                    Ми надаємо комплексну підтримку студентам у різних сферах життя. 
                    Від соціальної допомоги до правового захисту — завжди поруч з вами.
                  </p>
                  <button 
                    onClick={() => navigate('/services')}
                    className="bg-blue-600 text-white py-3.5 px-8 rounded-2xl font-bold hover:bg-blue-700 hover:scale-[1.02] transition-all duration-300 shadow-[0_4px_12px_rgba(37,99,235,0.3)] flex items-center gap-2 group"
                  >
                    Всі сервіси
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Right side - Stacked cards */}
              <div className="right sticky h-screen flex-1 flex items-center justify-end relative ml-20" style={{ top: '64px' }}>
                
                {/* Пасхалка */}
                <div 
                  className={`absolute flex items-center justify-center w-80 h-80 transition-all duration-700 ease-out ${
                    showBackground ? 'opacity-100 scale-100' : 'opacity-0 scale-75 pointer-events-none'
                  }`}
                  style={{
                    top: 'calc(50% - 160px)',
                    left: 'calc(50% - 160px)',
                    zIndex: 0
                  }}
                >
                  <img 
                    src="/under_cards.png" 
                    alt="Secret Easter Egg Logo"
                    className="w-56 h-56 object-contain cursor-pointer drop-shadow-2xl hover:scale-110 active:scale-90 transition-transform duration-300 select-none"
                    onClick={handleSecretLogoClick}
                    title="Клікни мене 5 разів!"
                  />
                </div>

                {/* Картки */}
                {services.map((service, index) => (
                  <div
                    key={index}
                    className={`stack-card absolute w-80 h-80 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 backdrop-blur-md cursor-pointer bg-gradient-to-br ${service.color} group hover:shadow-2xl`}
                    style={{
                      top: 'calc(50% - 160px)',
                      left: 'calc(50% - 160px)',
                      transformOrigin: 'bottom left',
                      /* ВАЖЛИВО: Анімуємо тільки transform і opacity. Ніяких all або z-index! */
                      transition: 'transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s ease-out' 
                    }}
                    onClick={() => window.open(service.url, "_blank")}
                  >
                    <div className="p-8 h-full flex flex-col justify-between text-white relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none" />
                      
                      <div className="flex items-center mb-4 relative z-10">
                        <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                          {service.icon}
                        </div>
                        <span className="ml-4 text-lg font-semibold opacity-95">
                          {service.subtitle}
                        </span>
                      </div>
                      <div className="relative z-10">
                        <h3 className="text-3xl font-extrabold leading-tight mb-4">
                          {service.title}
                        </h3>
                        <div className="flex justify-between items-center mt-4">
                          <p className="text-sm opacity-90 leading-relaxed mr-4">
                            {service.description}
                          </p>
                          <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300">
                            <ArrowRight className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <style>{`
              html {
                scroll-behavior: smooth;
              }
              .stack-area {
                margin-top: -64px;
                padding-top: 64px;
              }
            `}</style>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="bg-white py-16 sm:py-24 rounded-t-[3rem] shadow-[0_-10px_40px_rgb(0,0,0,0.03)] relative z-20 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                Останні новини
              </h2>
              <p className="text-lg text-gray-500">
                Будьте в курсі всіх подій нашого університету
              </p>
            </div>

            <Link
              to="/news"
              className="hidden sm:inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 transition-colors duration-300 group"
            >
              Усі новини
              <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-3xl overflow-hidden animate-pulse border border-gray-100"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded-full mb-3 w-1/4"></div>
                    <div className="h-6 bg-gray-300 rounded-full mb-4 w-3/4"></div>
                    <div className="h-4 bg-gray-300 rounded-full mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded-full w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Swiper
              modules={[Autoplay]}
              spaceBetween={24}
              slidesPerView={1}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 24 },
                1024: { slidesPerView: 3, spaceBetween: 32 },
              }}
              loop
              grabCursor={true}
              speed={800}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              className="pb-8 pt-4 !overflow-visible"
            >
              {news.slice(0, 6).map((article, index) => (
                <SwiperSlide key={article.id}>
                  <div
                    className="cursor-pointer h-full transition-transform duration-300 hover:-translate-y-2"
                    style={{ animationDelay: `${index * 150}ms` }}
                    onClick={() => navigate(`/news/${article.id}`)}
                  >
                    <NewsCard news={article} />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}

          {/* Mobile link */}
          <div className="text-center mt-8 sm:hidden">
            <Link
              to="/news"
              className="inline-flex w-full items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-blue-600 bg-blue-50 active:bg-blue-100 transition-colors"
            >
              Всі новини
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;