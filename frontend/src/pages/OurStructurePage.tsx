import React, { useEffect, useState, useMemo } from "react";
import { Search, Users, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ChevronDown } from "lucide-react";
import axios from 'axios';
import FacultyCard from "../components/FacultyCard";
import DepartmentCard from "../components/DepartmentCard";
import { Faculty } from '../types/faculty';
import { Department } from '../types/department';
import { TeamMember } from "../types/team";

const FACULTY_TYPE = 0;
const DEPARTMENT_TYPE = 1;

const StructurePage: React.FC = () => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedType, setSelectedType] = useState<number>(FACULTY_TYPE);
  const itemsPerPage = 5;
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const structureTypes = [
    { id: FACULTY_TYPE, label: 'Профбюро Студентів' },
    { id: DEPARTMENT_TYPE, label: 'Відділи Профкому' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [facultyRes, departmentRes, teamRes] = await Promise.all([
          axios.get<Faculty[]>(`${import.meta.env.VITE_API_URL}/api/faculties`, {
            params: { isActive: true, orderBy: 'orderInd', order: 'asc' },
          }),
          axios.get<Department[]>(`${import.meta.env.VITE_API_URL}/api/departments`, {
            params: { isActive: true },
          }),
          axios.get<TeamMember[]>(`${import.meta.env.VITE_API_URL}/api/team`)
        ]);

        const teamMembers = teamRes.data;

        const enrichedDepartments = departmentRes.data.map(dept => ({
          ...dept,
          head: teamMembers.find(m => m.id === dept.headId) || undefined
        }));

        setFaculties(facultyRes.data || []);
        setDepartments(enrichedDepartments || []);
      } catch (err) {
        console.error("Помилка при отриманні даних:", err);
        if (axios.isAxiosError(err)) {
          console.error('Деталі помилки:', err.response?.data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const typeNames: { [key: number]: string } = {
    [FACULTY_TYPE]: "Профбюро факультетів",
    [DEPARTMENT_TYPE]: "Відділи",
  };

  const filteredData = useMemo(() => {
    const q = searchTerm.toLowerCase();

    if (selectedType === FACULTY_TYPE) {
      return faculties.filter((union) =>
        union.name.toLowerCase().includes(q) ||
        union.head?.name.toLowerCase().includes(q) ||
        (union.summary && union.summary.toLowerCase().includes(q))
      );
    } else {
      return departments.filter((dept) =>
        dept.name.toLowerCase().includes(q) ||
        dept.head?.name.toLowerCase().includes(q) ||
        (dept.description && dept.description.toLowerCase().includes(q))
      );
    }
  }, [searchTerm, selectedType, faculties, departments]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getCountWord = (count: number): string => {
    const words = {
      faculty: ['профбюро', 'профбюро', 'профбюро'],
      department: ['відділ', 'відділи', 'відділів']
    };
    
    const currentWords = selectedType === FACULTY_TYPE ? words.faculty : words.department;
    
    const n = Math.abs(count) % 100;
    const n1 = n % 10;
    
    if (n > 10 && n < 20) {
      return currentWords[2];
    }
    if (n1 > 1 && n1 < 5) {
      return currentWords[1];
    }
    if (n1 === 1) {
      return currentWords[0];
    }
    return currentWords[2];
  };

  const renderPaginationButtons = () => {
    if (totalPages <= 1) return null;
    const maxVisibleButtons = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    const leftButtons = (
      <div key="left" className="flex gap-1">
        {totalPages > 5 && (
          <button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex justify-center items-center rounded-lg border border-gray-300 text-gray-700 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>
        )}
        {totalPages > 1 && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex justify-center items-center rounded-lg border border-gray-300 text-gray-700 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>
    );

    const centerButtons = (
      <div key="center" className="flex gap-1">
        {Array.from({ length: endPage - startPage + 1 }, (_, idx) => {
          const page = startPage + idx;
          return (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-8 h-8 flex justify-center items-center rounded-lg border font-medium transition-colors duration-200 ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
              }`}
            >
              {page}
            </button>
          );
        })}
      </div>
    );

    const rightButtons = (
      <div key="right" className="flex gap-1">
        {totalPages > 1 && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex justify-center items-center rounded-lg border border-gray-300 text-gray-700 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {totalPages > 5 && (
          <button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex justify-center items-center rounded-lg border border-gray-300 text-gray-700 hover:text-gray-700 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        )}
      </div>
    );

    return (
      <div className="flex justify-center items-center gap-2 mt-8">
        {leftButtons}
        {centerButtons}
        {rightButtons}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
{/* Header Section */}
      <section className="relative bg-[#10183a] text-white pt-20 pb-32 overflow-hidden w-full">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <div className="absolute -top-[10%] right-[10%] w-[35%] h-[70%] rounded-full bg-[#ca8a04]/20 blur-[130px]" />
          <div className="absolute -bottom-[20%] -left-[5%] w-[40%] h-[80%] rounded-full bg-[#ca8a04]/15 blur-[140px]" />
          <div className="absolute -bottom-[30%] right-[20%] w-[50%] h-[90%] rounded-full bg-[#ca8a04]/20 blur-[120px]" />
          <div className="absolute top-[20%] -left-[10%] w-[50%] h-[80%] rounded-full bg-[#1e3a8a]/30 blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Декоративна іконка в стилі Glassmorphism */}
          <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl mb-6 backdrop-blur-sm border border-white/10">
            <Users className="w-8 h-8 text-[#facc15]" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Наша Структура
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Ознайомтеся з профспілковими організаціями факультетів та відділами, 
            які формують нашу спільноту.
          </p>
        </div>
      </section>
      
      {/* Search & Filter Section (Накладається на Header) */}
      <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
        <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-4 sm:p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4 items-center w-full">
            
            {/* 1. Кастомний Дропдаун */}
            <div className="relative w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between w-full md:w-72 h-[46px] bg-white border border-gray-300 rounded-lg px-4 text-[#1E2A5A] font-medium transition-all duration-300 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
              >
                <span className="truncate pr-2 text-sm md:text-base">
                  {structureTypes.find(type => type.id === selectedType)?.label}
                </span>
                <ChevronDown 
                  className={`w-4 h-4 text-gray-400 transition-transform duration-300 shrink-0 ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`} 
                />
              </button>

              {/* Шар для закриття по кліку будь-де */}
              {isDropdownOpen && (
                <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
              )}

              {/* Меню вибору */}
              <div
                className={`absolute top-full left-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden z-20 transition-all duration-200 origin-top ${
                  isDropdownOpen 
                    ? 'opacity-100 scale-y-100 translate-y-0' 
                    : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="py-1">
                  {structureTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setSelectedType(type.id);
                        setSearchTerm("");
                        setCurrentPage(1);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors duration-150 flex items-center ${
                        selectedType === type.id
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#1E2A5A]'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Пошук */}
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder={
                  selectedType === FACULTY_TYPE
                    ? "Пошук по факультету або голові..."
                    : "Пошук по відділу або голові..."
                }
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 h-[46px] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none shadow-sm"
              />
            </div>
            
            {/* 3. Лічильник */}
            <div className="text-sm text-gray-600 flex items-center gap-1 md:ml-auto">
              <span>Знайдено:</span>
              <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-0.5 rounded-md ml-1">{filteredData.length}</span>
              <span>{getCountWord(filteredData.length)}</span>
            </div>

          </div>
        </div>
      </section>

      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
                >
                  <div className="flex items-center h-36">
                    <div className="w-3 h-full bg-gray-300 flex-shrink-0" />
                    <div className="w-36 h-36 bg-gray-300 flex-shrink-0" />
                    <div className="flex-1 p-6">
                      <div className="h-6 bg-gray-300 rounded mb-2 w-3/4" />
                      <div className="h-4 bg-gray-300 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentData.length === 0 ? (
            <div className="text-center py-16">
              <Users className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                {searchTerm 
                  ? `Нічого не знайдено у категорії "${typeNames[selectedType]}"`
                  : `У категорії "${typeNames[selectedType]}" ще немає записів`
                }
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm
                  ? "Спробуйте змінити критерії пошуку або перевірте правильність написання"
                  : `Інформація про ${selectedType === FACULTY_TYPE ? 'профбюро' : 'відділи'} буде додана найближчим часом`}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4 will-change:transform">
                {currentData.map((item, idx) => (
                  selectedType === FACULTY_TYPE
                    ? <FacultyCard key={item.id} union={item as Faculty} index={idx} />
                    : <DepartmentCard key={item.id} department={item as Department} index={idx} />
                ))}
              </div>
              {renderPaginationButtons()}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default StructurePage;