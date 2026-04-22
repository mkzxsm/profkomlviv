import React, { useState, useCallback, useMemo } from 'react';
import { Layers, X } from 'lucide-react';
import axios, { AxiosError } from 'axios';
import StructureTable from './StructureTable';
import StructureModal from './StructureModal';
import { Faculty, FacultyFormData } from '../../types/faculty';
import { Department, DepartmentFormData } from '../../types/department';
import { TeamMember } from '../../types/team';

const FACULTY_TYPE = 0;
const DEPARTMENT_TYPE = 1;

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

    const getInitialFacultyFormData = (): FacultyFormData => ({
        name: '', headId: null, address: '', room: '',
        schedule: 'Пн-Пт: 10:00-16:00', summary: '', telegram_Link: '',
        instagram_Link: '', isActive: true, imageUrl: '', isCollege: false,
    });

    const getInitialDepartmentFormData = (): DepartmentFormData => ({
        name: '', headId: null, description: '', logoUrl: '', isActive: true,
    });

    const [formData, setFormData] = useState<StructureFormData>(getInitialFacultyFormData());

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
        const initialData = selectedType === FACULTY_TYPE
            ? getInitialFacultyFormData()
            : getInitialDepartmentFormData();
        
        setEditingItem(null);
        setFormData(initialData);
        setSelectedFile(null);
        setIsModalOpen(true);
    }, [selectedType]);

    const handleEdit = useCallback((item: StructureItem) => {
        setEditingItem(item);
        if (selectedType === FACULTY_TYPE) {
            const faculty = item as Faculty;
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
            setFormData({
                name: dept.name, headId: dept.headId,
                description: dept.description || '', logoUrl: dept.logoUrl || '',
                isActive: dept.isActive,
            });
        }
        setSelectedFile(null);
        setIsModalOpen(true);
    }, [selectedType]);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingItem(null);
        setSelectedFile(null);
        setFormData(selectedType === FACULTY_TYPE ? getInitialFacultyFormData() : getInitialDepartmentFormData());
    }, [selectedType]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        const isFaculty = selectedType === FACULTY_TYPE;
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
            dataToSend.append('IsActive', fd.isActive.toString());
            dataToSend.append('IsCollege', (fd.isCollege || false).toString());
            
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
            dataToSend.append('IsActive', dd.isActive.toString());
            
            if (selectedFile) {
                dataToSend.append('Logo', selectedFile);
            } else if (editingItem) {
                dataToSend.append('LogoUrl', (editingItem as Department).logoUrl || '');
            }
        }

        const headers = {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
        };

        const url = editingItem
            ? `${import.meta.env.VITE_API_URL}/api/${endpoint}/${editingItem.id}`
            : `${import.meta.env.VITE_API_URL}/api/${endpoint}`;
        const method = editingItem ? 'PUT' : 'POST';

        try {
            await axios({ method, url, data: dataToSend, headers });
            await fetchData();
            handleCloseModal();
        } catch (error) {
            const axiosError = error as AxiosError<any>;
            console.error(`Помилка збереження ${endpoint}:`, axiosError.response?.data || axiosError.message);
            alert(axiosError.response?.data?.message || 'Помилка збереження');
        }
    }, [formData, selectedFile, editingItem, selectedType, fetchData, handleCloseModal]);

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
    
    return (
        <>
            <div className="flex items-center mb-6">
                <h2 className="text-lg font-medium text-gray-900">{title}</h2>
  
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(Number(e.target.value))}
                    className="border border-gray-300 rounded-lg px-3 py-2 ml-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                    <option value={FACULTY_TYPE}>Профбюро Студентів</option>
                    <option value={DEPARTMENT_TYPE}>Відділи Профкому Студентів</option>
                </select>

                <button
                    type="button"
                    onClick={handleOpenAddModal}
                    className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 ml-auto"
                >
                    <Layers className="h-5 w-5" />
                    <span>{buttonText}</span>
                </button>
            </div>

            <StructureTable
                type={isFacultyView ? 'faculty' : 'department'}
                data={currentData}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingItem 
                                    ? (isFacultyView ? 'Редагувати профбюро' : 'Редагувати відділ')
                                    : (isFacultyView ? 'Додати профбюро' : 'Додати відділ')
                                }
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700" title="Закрити">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <StructureModal
                            type={isFacultyView ? 'faculty' : 'department'}
                            formData={formData}
                            setFormData={setFormData}
                            selectedFile={selectedFile}
                            setSelectedFile={setSelectedFile}
                            editingItem={editingItem}
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