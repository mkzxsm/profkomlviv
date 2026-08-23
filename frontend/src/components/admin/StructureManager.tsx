import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Layers, X, Search } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import StructureTable from './StructureTable';
import StructureModal from './StructureModal';
import Pagination from './Pagination';
import CustomDropdown from './CustomDropdown';
import { Faculty, FacultyFormData } from '../../types/faculty';
import { Department, DepartmentFormData } from '../../types/department';
import { TeamMember } from '../../types/team';

const FACULTY_TYPE = 0;
const DEPARTMENT_TYPE = 1;
const ITEMS_PER_PAGE = 10;

type StructureItem = Faculty | Department;
type StructureFormData = Partial<FacultyFormData & DepartmentFormData>;

interface StructureManagerProps {
  facultyData: Faculty[];
  departmentData: Department[];
  teamData: TeamMember[];
  loading: boolean;
  fetchData: () => Promise<void>;
}

const StructureManager: React.FC<StructureManagerProps> = ({
  facultyData,
  departmentData,
  teamData,
  loading,
  fetchData
}) => {
    const [selectedType, setSelectedType] = useState(FACULTY_TYPE);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<StructureItem | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');

    // Скидаємо сторінку і пошук при перемиканні між профбюро/відділами
    useEffect(() => {
        setCurrentPage(1);
        setSearchTerm('');
    }, [selectedType]);

    // Скидаємо сторінку при зміні пошукового запиту
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const getInitialFacultyFormData = (): FacultyFormData => ({
        name: '', headId: null, address: '', room: '',
        schedule: 'Пн-Пт: 10:00-16:00', summary: '', telegram_Link: '',
        instagram_Link: '', isActive: true, imageUrl: '', isCollege: false,
    });

    const getInitialDepartmentFormData = (): DepartmentFormData => ({
        name: '', headId: null, description: '', logoUrl: '', isActive: true,
    });

    const [formData, setFormData] = useState<StructureFormData>(getInitialFacultyFormData());
    const [modalType, setModalType] = useState<'faculty' | 'department'>('faculty');

    const enrichedFacultyData = useMemo(() => {
        return facultyData.map(faculty => ({
            ...faculty,
            head: teamData.find(m => m.id === faculty.headId) || undefined
        })).sort((a, b) => a.name.localeCompare(b.name));
    }, [facultyData, teamData]);

    const enrichedDepartmentData = useMemo(() => {
        return departmentData.map(dept => ({
            ...dept,
            head: teamData.find(m => m.id === dept.headId) || undefined
        })).sort((a, b) => a.name.localeCompare(b.name));
    }, [departmentData, teamData]);

    const handleOpenAddModal = useCallback(() => {
        const isFaculty = selectedType === FACULTY_TYPE;
        const initialData = isFaculty
            ? getInitialFacultyFormData()
            : getInitialDepartmentFormData();
        
        setEditingItem(null);
        setModalType(isFaculty ? 'faculty' : 'department');
        setFormData(initialData);
        setSelectedFile(null);
        setIsModalOpen(true);
    }, [selectedType]);

    const handleEdit = useCallback((item: StructureItem) => {
        setEditingItem(item);
        if (selectedType === FACULTY_TYPE) {
            const faculty = item as Faculty;
            setModalType('faculty');
            setFormData({
                name: faculty.name, headId: faculty.headId,
                address: faculty.address || '', room: faculty.room || '',
                schedule: faculty.schedule || 'Пн-Пт: 10:00-16:00', summary: faculty.summary || '',
                telegram_Link: faculty.telegram_Link || '',
                instagram_Link: faculty.instagram_Link || '',
                isActive: faculty.isActive, imageUrl: faculty.imageUrl || '',
                isCollege: faculty.isCollege || false,
            });
        } else {
            const dept = item as Department;
            setModalType('department');
            setFormData({
                name: dept.name, headId: dept.headId,
                description: dept.description || '', logoUrl: dept.logoUrl || '',
                isActive: dept.isActive,
            });
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    }, [selectedType]);

    const handleModalTypeChange = useCallback((newType: 'faculty' | 'department') => {
        if (editingItem) return;
        setModalType(newType);
        setFormData(prev => {
            const shared = {
                name: prev.name || '',
                isActive: prev.isActive ?? true,
            };
            if (newType === 'faculty') {
                return {
                    ...getInitialFacultyFormData(),
                    ...shared,
                };
            }
            return {
                ...getInitialDepartmentFormData(),
                ...shared,
                description: prev.summary || prev.description || '',
            };
        });
        setSelectedFile(null);
    }, [editingItem]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingItem(null);
        setSelectedFile(null);
        setFormData(selectedType === FACULTY_TYPE ? getInitialFacultyFormData() : getInitialDepartmentFormData());
        setModalType(selectedType === FACULTY_TYPE ? 'faculty' : 'department');
    }, [selectedType]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        const isFaculty = modalType === 'faculty';
        const endpoint = isFaculty ? 'faculties' : 'departments';
        const dataToSend = new FormData();

        if (isFaculty) {
            const fd = formData as FacultyFormData;
            if (!fd.headId) {
                alert('Будь ласка, оберіть голову');
                return;
            }
            dataToSend.append('Name', fd.name);
            dataToSend.append('HeadId', fd.headId.toString());
            dataToSend.append('Address', fd.address || '');
            dataToSend.append('Room', fd.room || '');
            dataToSend.append('Schedule', fd.schedule || '');
            dataToSend.append('Summary', fd.summary || '');
            dataToSend.append('IsActive', fd.isActive ? 'true' : 'false');
            dataToSend.append('IsCollege', fd.isCollege ? 'true' : 'false');
            
            dataToSend.append('Telegram_Link', fd.telegram_Link || '');
            dataToSend.append('Instagram_Link', fd.instagram_Link || '');

            if (selectedFile) {
                dataToSend.append('Image', selectedFile);
            } else if (editingItem) {
                dataToSend.append('ImageUrl', (editingItem as Faculty).imageUrl || '');
            }

        } else {
            const dd = formData as DepartmentFormData;
            if (!dd.headId) {
                alert('Будь ласка, оберіть голову');
                return;
            }
            dataToSend.append('Name', dd.name);
            dataToSend.append('HeadId', dd.headId.toString());
            dataToSend.append('Description', dd.description || '');
            dataToSend.append('IsActive', dd.isActive ? 'true' : 'false');
            
            if (selectedFile) {
                dataToSend.append('Logo', selectedFile);
            } else if (editingItem) {
                dataToSend.append('LogoUrl', (editingItem as Department).logoUrl || '');
            }
        }

        const headers = {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        };

        const url = editingItem
            ? `${import.meta.env.VITE_API_URL}/api/${endpoint}/${editingItem.id}`
            : `${import.meta.env.VITE_API_URL}/api/${endpoint}`;
        const method = editingItem ? 'PUT' : 'POST';

        try {
            await axios({ method, url, data: dataToSend, headers });
            if (!editingItem) {
                setSelectedType(isFaculty ? FACULTY_TYPE : DEPARTMENT_TYPE);
            }
            await fetchData();
            handleCloseModal();
        } catch (error) {
            const axiosError = error as AxiosError<any>;
            console.error(`Помилка збереження ${endpoint}:`, axiosError.response?.data || axiosError.message);
            alert(axiosError.response?.data?.message || 'Помилка збереження');
        }
    }, [formData, selectedFile, editingItem, modalType, fetchData, handleCloseModal]);

    const handleDelete = useCallback(async (id: number) => {
        const isFaculty = selectedType === FACULTY_TYPE;
        const endpoint = isFaculty ? 'faculties' : 'departments';
        const item = (isFaculty ? facultyData : departmentData).find(f => f.id === id);
        const head = teamData.find(m => m.id === item?.headId);
        
        const confirmMessage = head
            ? `Видалити "${item?.name}"?\nГолова ${head.name} стане вільним.`
            : `Видалити "${item?.name}"?`;

        if (window.confirm(confirmMessage)) {
            try {
                await axios.delete(`${import.meta.env.VITE_API_URL}/api/${endpoint}/${id}`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                await fetchData();
            } catch (error) {
                console.error(`Помилка видалення ${endpoint}:`, error);
                alert(`Не вдалося видалити.`);
            }
        }
    }, [selectedType, facultyData, departmentData, teamData, fetchData]);

    const isFacultyView = selectedType === FACULTY_TYPE;
    const currentData = isFacultyView ? enrichedFacultyData : enrichedDepartmentData;
    const title = isFacultyView ? "Управління профбюро" : "Управління відділами";
    const buttonText = isFacultyView ? "Додати профбюро" : "Додати відділ";

    const filteredData = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        if (!q) return currentData;
        return currentData.filter(item => {
            const extra = isFacultyView ? (item as Faculty).summary : (item as Department).description;
            return (
                item.name.toLowerCase().includes(q) ||
                (extra && extra.toLowerCase().includes(q)) ||
                (item.head && item.head.name.toLowerCase().includes(q))
            );
        });
    }, [currentData, searchTerm, isFacultyView]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredData, currentPage]);
    
    return (
        <>
            <div className="mb-6 flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder={isFacultyView ? "Пошук профбюро за назвою..." : "Пошук відділу за назвою..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 h-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                    />
                </div>

                <CustomDropdown
                    value={selectedType}
                    onChange={(v) => setSelectedType(Number(v))}
                    className="sm:w-[280px]"
                    options={[
                        { value: FACULTY_TYPE, label: 'Профбюро Студентів' },
                        { value: DEPARTMENT_TYPE, label: 'Відділи Профкому Студентів' },
                    ]}
                />
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                    <Layers className="h-5 w-5" />
                    <span>{buttonText}</span>
                </button>
            </div>

            <StructureTable
                type={isFacultyView ? 'faculty' : 'department'}
                data={paginatedData}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingItem 
                                    ? (modalType === 'faculty' ? 'Редагувати профбюро' : 'Редагувати відділ')
                                    : (modalType === 'faculty' ? 'Додати профбюро' : 'Додати відділ')
                                }
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700" title="Закрити">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <StructureModal
                            type={modalType}
                            formData={formData}
                            setFormData={setFormData}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            editingItem={editingItem}
                            onTypeChange={handleModalTypeChange}
                            onSubmit={handleSubmit}
                            onClose={handleCloseModal}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default StructureManager;