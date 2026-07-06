import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut,
    Eye,
    Users,
    Newspaper,
    Building,
    Layers,
    FileText,
    Search,
    Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios, { AxiosError } from 'axios';

import NewsManager from '../components/admin/NewsManager';
import { News } from '../types/news';

import TeamManager from '../components/admin/TeamManager';
import { TeamMember, APARAT_TYPE, PROFBURO_HEAD_TYPE, VIDDIL_HEAD_TYPE } from '../types/team';

import StructureManager from '../components/admin/StructureManager';
import { Faculty } from '../types/faculty';
import { Department } from '../types/department';

import DocumentManager from '../components/admin/DocumentManager';
import { Document } from '../types/documents';

import Pagination from '../components/admin/Pagination';
import CustomDropdown from '../components/admin/CustomDropdown';

const ITEMS_PER_PAGE = 10;

const teamRoleOptions = [
    { id: APARAT_TYPE, label: 'Члени Президії' },
    { id: PROFBURO_HEAD_TYPE, label: 'Голови Профбюро Студентів' },
    { id: VIDDIL_HEAD_TYPE, label: 'Голови Відділів' },
];

const AdminDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'news' | 'team' | 'structure' | 'documents'>('news');

    const [news, setNews] = useState<News[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [facultyUnions, setFacultyUnions] = useState<Faculty[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    // Пагінація стосується лише вкладок news / team / documents.
    // Structure має власну, самодостатню пагінацію всередині StructureManager,
    // бо факультети та відділи — це дві різні за формою колекції.
    const [currentPage, setCurrentPage] = useState(1);

    // Фільтри для вкладки "Команда"
    const [teamSearchTerm, setTeamSearchTerm] = useState('');
    const [teamFilterType, setTeamFilterType] = useState<number>(APARAT_TYPE);

    // Пошук для вкладок "Новини" та "Документи"
    const [newsSearchTerm, setNewsSearchTerm] = useState('');
    const [documentsSearchTerm, setDocumentsSearchTerm] = useState('');

    // Скидання сторінки при зміні вкладки або будь-якого з фільтрів/пошуків
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, teamSearchTerm, teamFilterType, newsSearchTerm, documentsSearchTerm]);

    useEffect(() => {
        if (!user) {
            navigate('/admin/login');
        } else {
            fetchAllData();
        }
    }, [user, navigate]);

    const fetchDataFor = async <T,>(endpoint: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/${endpoint}`);
            setter(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error(`Error fetching ${endpoint}:`, axiosError.response?.data || axiosError.message);
            setter([]);
        }
    };

    const fetchAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                fetchDataFor<News>('news', setNews),
                fetchDataFor<TeamMember>('team', setTeamMembers),
                fetchDataFor<Faculty>('faculties', setFacultyUnions),
                fetchDataFor<Department>('departments', setDepartments),
                fetchDataFor<Document>('documents', setDocuments)
            ]);
        } catch (error) {
            console.error('Error fetching data:', (error as Error).message || error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    // --- Фільтрація + сортування команди (єдине джерело правди для вкладки "Команда") ---
    const filteredTeam = useMemo(() => {
        let result = teamMembers.filter(m => m.type === teamFilterType);

        const q = teamSearchTerm.trim().toLowerCase();
        if (q) {
            result = result.filter(m =>
                m.name.toLowerCase().includes(q) ||
                m.position.toLowerCase().includes(q) ||
                (m.email && m.email.toLowerCase().includes(q))
            );
        }

        return [...result].sort((a, b) => a.orderInd - b.orderInd);
    }, [teamMembers, teamSearchTerm, teamFilterType]);

    // --- Пошук по новинах (заголовок + текст, теги HTML зі змісту не заважають підрядковому пошуку) ---
    const filteredNews = useMemo(() => {
        const q = newsSearchTerm.trim().toLowerCase();
        if (!q) return news;
        return news.filter(n =>
            n.title.toLowerCase().includes(q) ||
            (n.content && n.content.toLowerCase().includes(q))
        );
    }, [news, newsSearchTerm]);

    // --- Пошук по документах (назва + опис) ---
    const filteredDocuments = useMemo(() => {
        const q = documentsSearchTerm.trim().toLowerCase();
        if (!q) return documents;
        return documents.filter(d =>
            d.title.toLowerCase().includes(q) ||
            (d.description && d.description.toLowerCase().includes(q))
        );
    }, [documents, documentsSearchTerm]);

    // --- Обчислення загальної кількості для активної (пагінованої) вкладки ---
    const getActiveTabTotalItems = () => {
        switch (activeTab) {
            case 'news': return filteredNews.length;
            case 'team': return filteredTeam.length;
            case 'documents': return filteredDocuments.length;
            default: return 0;
        }
    };

    const totalItems = getActiveTabTotalItems();
    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    const paginatedNews = filteredNews.slice(startIndex, endIndex);
    const paginatedTeam = filteredTeam.slice(startIndex, endIndex);
    const paginatedDocuments = filteredDocuments.slice(startIndex, endIndex);

    if (!user) return null;

    const tabs: { key: typeof activeTab; label: string; icon: React.ReactNode }[] = [
        { key: 'news', label: 'Управління новинами', icon: <Newspaper className="h-5 w-5 inline mr-2" /> },
        { key: 'team', label: 'Управління командою', icon: <Users className="h-5 w-5 inline mr-2" /> },
        { key: 'structure', label: 'Управління структурою', icon: <Layers className="h-5 w-5 inline mr-2" /> },
        { key: 'documents', label: 'Управління документами', icon: <FileText className="h-5 w-5 inline mr-2" /> },
    ];

    const statCards = [
        { label: 'Всього новин', value: news.length, icon: <Newspaper className="h-6 w-6 text-blue-600" />, bg: 'bg-blue-100' },
        { label: 'Членів команди', value: teamMembers.length, icon: <Users className="h-6 w-6 text-green-600" />, bg: 'bg-green-100' },
        { label: 'Профбюро', value: facultyUnions.length, icon: <Building className="h-6 w-6 text-purple-600" />, bg: 'bg-purple-100' },
        { label: 'Всього відділів', value: departments.length, icon: <Layers className="h-6 w-6 text-orange-600" />, bg: 'bg-orange-100' },
        { label: 'Документів', value: documents.length, icon: <FileText className="h-6 w-6 text-indigo-600" />, bg: 'bg-indigo-100' },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section — стилістика як на сторінці "Про нас" */}
            <section className="relative bg-[#10183a] pt-16 pb-28 text-white overflow-hidden w-full">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                    <div className="absolute top-[5%] -left-[10%] w-[50%] h-[80%] rounded-full bg-[#1e3a8a]/40 blur-[120px]" />
                    <div className="absolute top-[25%] -right-[5%] w-[45%] h-[75%] rounded-full bg-[#ca8a04]/20 blur-[130px]" />
                    <div className="absolute -bottom-[25%] -left-[10%] w-[50%] h-[80%] rounded-full bg-[#ca8a04]/15 blur-[140px]" />
                </div>

                <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10 shrink-0">
                                <Star className="w-7 h-7 text-[#facc15]" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold md:text-4xl tracking-tight">Адмін панель</h1>
                                <p className="text-slate-300 mt-1">Ласкаво просимо, {user.email}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center gap-2 rounded-lg border-2 border-white/30 px-4 py-2.5 text-white backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-[#10183a]"
                            >
                                <Eye className="h-5 w-5" />
                                <span>Переглянути сайт</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-2.5 font-semibold text-[#1E2A5A] shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] transition-all duration-300 hover:scale-105 hover:shadow-[0_6px_20px_rgba(234,179,8,0.23)] hover:from-yellow-300 hover:to-yellow-400"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Вийти</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Floating stats panel — накладається на hero, як пошук на TeamPage */}
            <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14">
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-4 sm:p-6 border border-gray-100">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {statCards.map((card) => (
                            <div
                                key={card.label}
                                className="flex items-center rounded-xl p-3 sm:p-4 transition-transform duration-300 hover:-translate-y-1"
                            >
                                <div className={`p-3 rounded-lg ${card.bg} shrink-0`}>{card.icon}</div>
                                <div className="ml-3 min-w-0">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">{card.label}</p>
                                    <p className="text-xl sm:text-2xl font-semibold text-gray-900">{card.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-lg shadow border">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex flex-wrap">
                            {tabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors duration-200 ${
                                        activeTab === tab.key
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    {tab.icon} {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">

                        {/* Пошук для новин */}
                        {activeTab === 'news' && (
                            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="text"
                                        placeholder="Пошук за заголовком або текстом новини..."
                                        value={newsSearchTerm}
                                        onChange={(e) => setNewsSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 h-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Фільтр для команди (лише на вкладці "Команда") */}
                        {activeTab === 'team' && (
                            <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="text"
                                        placeholder="Пошук по імені або посаді..."
                                        value={teamSearchTerm}
                                        onChange={(e) => setTeamSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 h-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                    />
                                </div>
                                <CustomDropdown
                                    value={teamFilterType}
                                    onChange={(v) => setTeamFilterType(Number(v))}
                                    className="sm:w-[280px]"
                                    options={teamRoleOptions.map(role => ({ value: role.id, label: role.label }))}
                                />
                            </div>
                        )}

                        {/* Пошук для документів */}
                        {activeTab === 'documents' && (
                            <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input
                                        type="text"
                                        placeholder="Пошук за назвою або описом документа..."
                                        value={documentsSearchTerm}
                                        onChange={(e) => setDocumentsSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 h-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'news' && (
                            <NewsManager data={paginatedNews} loading={loading} fetchData={fetchAllData} />
                        )}

                        {activeTab === 'team' && (
                            <TeamManager
                                data={paginatedTeam}
                                allData={teamMembers}
                                filterType={teamFilterType}
                                loading={loading}
                                fetchData={fetchAllData}
                            />
                        )}

                        {activeTab === 'structure' && (
                            <StructureManager
                                facultyData={facultyUnions}
                                departmentData={departments}
                                teamData={teamMembers}
                                loading={loading}
                                fetchData={fetchAllData}
                            />
                        )}

                        {activeTab === 'documents' && (
                            <DocumentManager data={paginatedDocuments} loading={loading} fetchData={fetchAllData} />
                        )}

                        {activeTab !== 'structure' && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;