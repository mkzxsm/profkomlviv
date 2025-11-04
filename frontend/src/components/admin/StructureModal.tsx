import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { Faculty, FacultyFormData } from '../../types/faculty';
import { Department, DepartmentFormData } from '../../types/department';
import { TeamMember, PROFBURO_HEAD_TYPE, VIDDIL_HEAD_TYPE } from '../../types/team';
import { ModalInput, ModalSelect, ModalCheckbox, ModalButton, ModalLabel } from './ui/ModalStyles';
import FacultyCard from '../FacultyCard';
import DepartmentCard from '../DepartmentCard';

type StructureItem = Faculty | Department;
type StructureFormData = Partial<FacultyFormData & DepartmentFormData>;

interface StructureModalProps {
  type: 'faculty' | 'department';
  formData: StructureFormData;
  setFormData: React.Dispatch<React.SetStateAction<StructureFormData>>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  editingItem: StructureItem | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const StructureModal: React.FC<StructureModalProps> = ({
  type,
  formData,
  setFormData,
  selectedFile,
  setSelectedFile,
  editingItem,
  onSubmit,
  onClose
}) => {
  const [availableHeads, setAvailableHeads] = useState<TeamMember[]>([]);
  const [loadingHeads, setLoadingHeads] = useState(true);

  const isFaculty = type === 'faculty';
  const headType = isFaculty ? PROFBURO_HEAD_TYPE : VIDDIL_HEAD_TYPE;

  useEffect(() => {
    const fetchAvailableHeads = async () => {
      try {
        setLoadingHeads(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/team`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        const allMembers: TeamMember[] = response.data;
        
        const freeHeads = allMembers.filter(member => 
          member.type === headType && 
          !member.isChoosed
        );

        if (editingItem?.headId) {
          const currentHead = allMembers.find(h => h.id === editingItem.headId);
          if (currentHead && !freeHeads.some(h => h.id === currentHead.id)) {
            freeHeads.push(currentHead);
          }
        }
        setAvailableHeads(freeHeads);
      } catch (error) {
        console.error('Помилка завантаження голів:', error);
        setAvailableHeads([]);
      } finally {
        setLoadingHeads(false);
      }
    };

    fetchAvailableHeads();
  }, [editingItem, headType]);

  const [previewLocalImageUrl, setPreviewLocalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (selectedFile) {
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewLocalImageUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
    setPreviewLocalImageUrl(null);
  }, [selectedFile]);

  const previewHead = useMemo(() => {
    return availableHeads.find(h => h.id === formData.headId) || null;
  }, [formData.headId, availableHeads]);

  const currentDbImageUrl = useMemo(() => {
    if (!editingItem) return null;
    return isFaculty 
      ? (editingItem as Faculty).imageUrl 
      : (editingItem as Department).logoUrl;
  }, [editingItem, isFaculty]);

  const previewImageUrl = previewLocalImageUrl ?? (currentDbImageUrl ? `${import.meta.env.VITE_API_URL}${currentDbImageUrl}` : undefined);
  
  const fileInputHelperText = selectedFile 
    ? selectedFile.name 
    : (currentDbImageUrl ? "Поточне зображення збережено" : "Файл не вибрано");

  const previewFaculty: Faculty = {
    id: editingItem?.id || 0,
    name: formData.name || 'Назва профбюро',
    headId: formData.headId || null,
    head: previewHead || undefined,
    address: (formData as FacultyFormData).address || 'вул. Університетська, 1',
    room: (formData as FacultyFormData).room || '',
    schedule: (formData as FacultyFormData).schedule || '',
    summary: (formData as FacultyFormData).summary || 'Опис...',
    telegram_Link: (formData as FacultyFormData).telegram_Link || '',
    instagram_Link: (formData as FacultyFormData).instagram_Link || '',
    isActive: formData.isActive || true,
    imageUrl: previewImageUrl,
    isCollege: (formData as FacultyFormData).isCollege || false,
  };

  const previewDepartment: Department = {
    id: editingItem?.id || 0,
    name: formData.name || 'Назва відділу',
    headId: formData.headId || null,
    head: previewHead || undefined,
    description: (formData as DepartmentFormData).description || 'Опис...',
    logoUrl: previewImageUrl,
    isActive: formData.isActive || true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <ModalLabel required htmlFor="name">
            Назва {isFaculty ? 'факультету/коледжу' : 'відділу'}
          </ModalLabel>
          <ModalInput
            id="name"
            type="text"
            required
            value={formData.name || ''}
            onChange={(e) => {
              const lettersOnly = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ ЇїІіЄєҐґ\s-']/g, '');
              setFormData({ ...formData, name: lettersOnly })
            }}
            placeholder={isFaculty ? "Факультет електроніки" : "Відділ дизайну"}
          />
        </div>

        <div>
          <ModalLabel required htmlFor="headId">
            Голова {isFaculty ? 'профбюро' : 'відділу'}
          </ModalLabel>
          {loadingHeads ? (
            <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-500">
              Завантаження...
            </div>
          ) : availableHeads.length === 0 && !editingItem?.headId ? (
            <div className="w-full border border-red-300 rounded-lg px-3 py-2 bg-red-50 text-red-600">
              Немає вільних голів
            </div>
          ) : (
            <ModalSelect
              id="headId"
              required
              value={formData.headId || ''}
              onChange={(e) => setFormData({ 
                ...formData, 
                headId: e.target.value ? Number(e.target.value) : null 
              })}
            >
              <option value="">Оберіть голову</option>
              {availableHeads.map(head => (
                <option key={head.id} value={head.id}>
                  {head.name}
                </option>
              ))}
            </ModalSelect>
          )}
          {previewHead && previewHead.email && (
            <p className="mt-1 text-xs text-gray-900">Email: {previewHead.email}</p>
          )}
        </div>
      </div>

      {isFaculty ? (
        <>
          <div>
            <ModalLabel>Лого профбюро</ModalLabel>
            <ModalInput type="file" accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            />
            <p className="mt-1 text-xs text-gray-500">{fileInputHelperText}</p>
          </div>
          
          <div>
            <ModalLabel htmlFor="summary" required>Опис діяльності</ModalLabel>
            <textarea
              id="summary" rows={3} required
              value={(formData as FacultyFormData).summary || ''}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Короткий опис діяльності профбюро"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ModalLabel htmlFor="address" required>Адреса</ModalLabel>
              <ModalInput id="address" type="text" required
                value={(formData as FacultyFormData).address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="вул. Університетська, 1"
              />
            </div>
            <div>
              <ModalLabel htmlFor="room">Додаткова адреса (аудиторія)</ModalLabel>
              <ModalInput id="room" type="text"
                value={(formData as FacultyFormData).room || ''}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="2 поверх, аудиторія 125"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ModalLabel htmlFor="telegram_link">Телеграм</ModalLabel>
              <ModalInput id="telegram_link" type="url"
                value={(formData as FacultyFormData).telegram_Link || ''}
                onChange={(e) => setFormData({ ...formData, telegram_Link: e.target.value })}
                placeholder="https://t.me/..."
              />
            </div>
            <div>
              <ModalLabel htmlFor="instagram_link">Інстаграм</ModalLabel>
              <ModalInput id="instagram_link" type="url"
                value={(formData as FacultyFormData).instagram_Link || ''}
                onChange={(e) => setFormData({ ...formData, instagram_Link: e.target.value })}
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ModalLabel htmlFor="schedule" required>Години роботи</ModalLabel>
              <ModalInput id="schedule" type="text" required
                value={(formData as FacultyFormData).schedule || ''}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder="Пн-Пт: 9:00-17:00"
              />
            </div>
            
            <div className="flex items-center justify-center space-x-8 md:pt-6">
              <div className="flex items-center">
                <ModalCheckbox id="isActive_faculty"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive_faculty" className="ml-2 text-md font-medium text-gray-700">Активне</label>
              </div>
              <div className="flex items-center">
                <ModalCheckbox id="isCollege_faculty"
                  checked={(formData as FacultyFormData).isCollege}
                  onChange={(e) => setFormData({ ...formData, isCollege: e.target.checked })}
                />
                <label htmlFor="isCollege_faculty" className="ml-2 text-md font-medium text-gray-700">Коледж</label>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ModalLabel>Лого відділу</ModalLabel>
              <ModalInput type="file" accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
              <p className="mt-1 text-xs text-gray-500">{fileInputHelperText}</p>
            </div>
            <div className="flex items-center md:pt-8">
              <ModalCheckbox id="isActive_dept"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
              <label htmlFor="isActive_dept" className="ml-2 text-md font-medium text-gray-700">Активний</label>
            </div>
          </div>

          <div>
            <ModalLabel htmlFor="description">Опис діяльності</ModalLabel>
            <textarea
              id="description" rows={3}
              value={(formData as DepartmentFormData).description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Короткий опис діяльності відділу"
            />
          </div>
        </>
      )}

      <div>
        <div className="w-full">
          {isFaculty ? (
            <FacultyCard 
              union={previewFaculty} 
              index={0} 
            />
          ) : (
            <DepartmentCard 
              department={previewDepartment} 
              index={0} 
            />
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 border-t pt-6">
        <ModalButton type="button" onClick={onClose} variant="secondary">
          Скасувати
        </ModalButton>
        <ModalButton
          type="submit"
          variant="primary"
          disabled={loadingHeads || (availableHeads.length === 0 && !editingItem?.headId)}
        >
          {editingItem ? 'Зберегти зміни' : (isFaculty ? 'Додати профбюро' : 'Додати відділ')}
        </ModalButton>
      </div>
    </form>
  );
};

export default StructureModal;