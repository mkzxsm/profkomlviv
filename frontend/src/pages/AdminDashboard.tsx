import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Eye, Users, Newspaper, Building, Layers, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios, { AxiosError } from 'axios';

import NewsManager from '../components/admin/NewsManager';
import { News } from '../types/news';

import TeamManager from '../components/admin/TeamManager';
import { TeamMember } from '../types/team';

import StructureManager from '../components/admin/StructureManager';
import { Faculty } from '../types/faculty';
import { Department } from '../types/department';

import DocumentManager from '../components/admin/DocumentManager';
import { Document } from '../types/documents';

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

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Адмін панель</h1>
                            <p className="text-sm text-gray-600">Ласкаво просимо, {user.email}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                            >
                                <Eye className="h-5 w-5" />
                                <span>Переглянути сайт</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Вийти</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8 ">
                    <div className="bg-white rounded-lg shadow p-6 border flex-1 flex flex-col justify-center transform transition-transform duration-500 ease-in-out hover:-translate-y-2 hover:shadow-lg">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-lg"><Newspaper className="h-6 w-6 text-blue-600" /></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Всього новин</p>
                                <p className="text-2xl font-semibold text-gray-900">{news.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border flex-1 flex flex-col justify-center transform transition-transform duration-500 ease-in-out hover:-translate-y-2 hover:shadow-lg">
                        <div className="flex items-center">
                            <div className="bg-green-100 p-3 rounded-lg"><Users className="h-6 w-6 text-green-600" /></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Членів команди</p>
                                <p className="text-2xl font-semibold text-gray-900">{teamMembers.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border flex-1 flex flex-col justify-center transform transition-transform duration-500 ease-in-out hover:-translate-y-2 hover:shadow-lg">
                        <div className="flex items-center">
                            <div className="bg-purple-100 p-3 rounded-lg"><Building className="h-6 w-6 text-purple-600" /></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Профбюро</p>
                                <p className="text-2xl font-semibold text-gray-900">{facultyUnions.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border flex-1 flex flex-col justify-center transform transition-transform duration-500 ease-in-out hover:-translate-y-2 hover:shadow-lg">
                        <div className="flex items-center">
                            <div className="bg-orange-100 p-3 rounded-lg"><Layers className="h-6 w-6 text-orange-600" /></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Всього відділів</p>
                                <p className="text-2xl font-semibold text-gray-900">{departments.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6 border flex-1 flex flex-col justify-center transform transition-transform duration-500 ease-in-out hover:-translate-y-2 hover:shadow-lg">
                        <div className="flex items-center">
                            <div className="bg-indigo-100 p-3 rounded-lg"><FileText className="h-6 w-6 text-indigo-600" /></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Документів</p>
                                <p className="text-2xl font-semibold text-gray-900">{documents.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow border">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex flex-wrap">
                            <button onClick={() => setActiveTab('news')} className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'news' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                <Newspaper className="h-5 w-5 inline mr-2" /> Управління новинами
                            </button>
                            <button onClick={() => setActiveTab('team')} className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'team' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                <Users className="h-5 w-5 inline mr-2" /> Управління командою
                            </button>
                            <button onClick={() => setActiveTab('structure')} className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'structure' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                <Layers className="h-5 w-5 inline mr-2" /> Управління структурою
                            </button>
                            <button onClick={() => setActiveTab('documents')} className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'documents' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                                <FileText className="h-5 w-5 inline mr-2" /> Управління документами
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'news' && <NewsManager data={news} loading={loading} fetchData={fetchAllData} />}
                        {activeTab === 'team' && <TeamManager data={teamMembers} loading={loading} fetchData={fetchAllData} />}
                        {activeTab === 'structure' && (
                            <StructureManager
                                facultyData={facultyUnions}
                                departmentData={departments}
                                teamData={teamMembers}
                                loading={loading}
                                fetchData={fetchAllData}
                            />
                        )}
                        {activeTab === 'documents' && <DocumentManager data={documents} loading={loading} fetchData={fetchAllData} />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;