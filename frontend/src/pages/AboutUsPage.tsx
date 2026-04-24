import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ArrowRight, Search, ChevronDown, Star } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import TeamMemberCard from "../components/TeamMemberCard";
import { TeamMember, PROFBURO_HEAD_TYPE, VIDDIL_HEAD_TYPE, APARAT_TYPE } from "../types/team";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

const TeamPage: React.FC = () => {
  const navigate = useNavigate();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedType, setSelectedType] = useState<number>(APARAT_TYPE);
  const swiperRef = useRef<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const teamSlides = useMemo(
    () => [
      { image: "/about_us/about-us-1.JPG" },
      { image: "/about_us/about-us-2.JPG" },
      { image: "/about_us/about-us-3.JPG" },
      { image: "/about_us/about-us-4.jpg" },
      { image: "/about_us/about-us-5.jpg" },
      { image: "/about_us/about-us-6.jpg" }
    ],
    []
  );

  const teamRoles = [
  { id: APARAT_TYPE, label: 'Члени Президії' },
  { id: PROFBURO_HEAD_TYPE, label: 'Голови Профбюро Студентів' },
  { id: VIDDIL_HEAD_TYPE, label: 'Голови Відділів' }
];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const membersResponse = await axios.get<TeamMember[]>(`${import.meta.env.VITE_API_URL}/api/team`);
        console.log('Team Members:', membersResponse.data);
        
        // Сортуємо по orderInd
        const activeMembers = membersResponse.data
          .sort((a, b) => a.orderInd - b.orderInd);
        
        setTeamMembers(activeMembers);
      } catch (error) {
        console.error("Помилка при отриманні даних:", error);
        if (axios.isAxiosError(error)) {
          console.error("Деталі помилки:", error.response?.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Фільтруємо членів команди по типу та пошуку
  const displayMembers = useMemo(() => {
    return teamMembers
      .filter(member => member.type === selectedType)
      .filter(member =>
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  }, [teamMembers, selectedType, searchTerm]);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % teamSlides.length);
    }, 5000);
  }, [teamSlides.length]);

  const stopAutoPlay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % teamSlides.length);
    startAutoPlay();
  };

  const goPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + teamSlides.length) % teamSlides.length);
    startAutoPlay();
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  return (
    <div className="min-h-screen bg-gray-50">
{/* Header Section */}
      <section className="relative bg-[#10183a] pt-20 pb-32 text-white overflow-hidden w-full">
        {/* Фонововідблиски (адаптивні) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[5%] -left-[10%] w-[50%] h-[80%] rounded-full bg-[#1e3a8a]/40 blur-[120px]" />
          <div className="absolute top-[25%] -right-[5%] w-[45%] h-[75%] rounded-full bg-[#ca8a04]/20 blur-[130px]" />
          <div className="absolute -bottom-[25%] -left-[10%] w-[50%] h-[80%] rounded-full bg-[#ca8a04]/15 blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center flex flex-col items-center">
            {/* Декоративна іконка */}
            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/10">
              <Star className="w-8 h-8 text-[#facc15]" /> 
            </div>
            
            <h1 className="mb-6 text-4xl font-extrabold md:text-5xl lg:text-6xl tracking-tight">
              Наша команда
            </h1>
            <p className="mx-auto max-w-3xl text-lg md:text-xl text-slate-300 leading-relaxed">
              Познайомтеся зі студентами, які об'єдналися, щоб робити життя університетської спільноти яскравішим, справедливішим і насиченим новими можливостями.
            </p>
          </div>
        </div>
      </section>

      {/* Search Section (Накладається на Header) */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-4 sm:p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            
            <div className="relative w-full md:w-64">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full h-[46px] bg-white border border-gray-300 rounded-lg px-4 text-[#1E2A5A] font-medium transition-all duration-300 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                <span className="truncate pr-2 text-sm md:text-base">
                  {teamRoles.find(role => role.id === selectedType)?.label}
                </span>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {isDropdownOpen && (
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              )}

              <div
                className={`absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-20 transition-all duration-200 origin-top ${
                  isDropdownOpen 
                    ? 'opacity-100 scale-y-100 translate-y-0' 
                    : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="py-1">
                  {teamRoles.map((role) => (
                    <button
                      key={role.id}
                      onClick={() => {
                        setSelectedType(role.id);
                        setSearchTerm("");
                        setIsDropdownOpen(false);
                        if (swiperRef.current) swiperRef.current.slideTo(0, 0);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 ${
                        selectedType === role.id
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {role.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Пошук членів команди"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-[46px] rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
              />
            </div>

            <div className="text-sm text-gray-600 whitespace-nowrap hidden sm:block">
              Знайдено: <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md ml-1">{displayMembers.length}</span>
            </div>

          </div>
        </div>
      </section>

      {/* Team Swiper Section */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[450px] animate-pulse rounded-lg bg-white shadow-md"
                />
              ))}
            </div>
          ) : displayMembers.length === 0 ? (
            <div className="py-12 text-center">
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                {searchTerm 
                  ? `Нікого не знайдено за запитом "${searchTerm}"`
                  : `У цій категорії ще немає записів`
                }
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? `Ми не змогли знайти нікого у цій категорії. Спробуйте змінити критерії пошуку.`
                  : "Дані про учасників будуть додані найближчим часом."}
              </p>
            </div>
          ) : (
            <>
              <Swiper
                modules={[Autoplay, Pagination]}
                spaceBetween={20}
                slidesPerView={3}
                loop={displayMembers.length > 3}
                speed={800}
                autoplay={{ delay: 5000, disableOnInteraction: false }}
                onSwiper={(swiper) => (swiperRef.current = swiper)}
                pagination={{ clickable: true }}
                className="team-swiper relative pb-12 pt-4"
                breakpoints={{
                  0: { slidesPerView: 1 },
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                wrapperClass="items-stretch overflow-visible"
              >
                {displayMembers.map((member) => (
                  <SwiperSlide key={member.id}>
                    <TeamMemberCard member={member} />
                  </SwiperSlide>
                ))}
              </Swiper>
            </>
          )}
        </div>
      </section>

      {/* Team Carousel Section */}
      <section className="relative overflow-hidden" style={{ height: "calc(100vh - 64px)" }}>
        {teamSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 via-blue-800/60 to-blue-700/50" />
          </div>
        ))}
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">
            Хочете приєднатися до нашої команди?
          </h2>
          <p className="mb-8 max-w-3xl text-lg text-blue-100 md:text-xl">
            Ми завжди шукаємо активних студентів, готових працювати для покращення
            студентського життя
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              className="flex transform items-center justify-center rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 px-8 py-3 font-bold text-[#1E2A5A] shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_20px_rgba(234,179,8,0.23)] hover:from-yellow-300 hover:to-yellow-400 ring-2 ring-transparent focus:ring-yellow-400"
              onClick={() => window.open("https://forms.office.com/e/enQBJqB4SN")}
            >
              Подати заяву <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button
              className="transform rounded-lg border-2 border-white px-8 py-3 font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:scale-105 hover:bg-white hover:text-blue-800"
              onClick={() => {
                navigate("/contacts");
              }}
            >
              Зв'язатися з нами
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 transform space-x-3">
          {teamSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 w-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "scale-125 bg-white"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
        <button
          onClick={goPrevSlide}
          className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 transform rounded-full p-2 text-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white sm:flex"
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={goNextSlide}
          className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 transform rounded-full p-2 text-white/70 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 hover:text-white sm:flex"
        >
          <svg
            className="h-8 w-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </section>
    </div>
  );
};

export default TeamPage;