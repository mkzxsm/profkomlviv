import React, { useEffect, useState } from 'react';
import { TeamMember, TeamFormData } from '../../types/team';

import {
  ModalLabel,
  ModalInput,
 ModalSelect,
 ModalCheckbox,
 ModalButton
} from './ui/ModalStyles'; 
import TeamMemberCard from '../TeamMemberCard';

interface TeamModalProps {
 formData: TeamFormData;
 setFormData: React.Dispatch<React.SetStateAction<TeamFormData>>;
 selectedFile: File | null;
 setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
 editingItem: TeamMember | null;
 onSubmit: (e: React.FormEvent) => void;
 onClose: () => void;
}

const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const TeamModal: React.FC<TeamModalProps> = ({
 formData,
 setFormData,
 selectedFile,
 setSelectedFile,
 editingItem,
 onSubmit,
 onClose
}) => {

useEffect(() => {
  if (formData.type === 1) {
    setFormData(prev => ({ ...prev, position: 'Голова Профбюро Студентів' }));
  } else if (formData.type === 2) {
    setFormData(prev => ({ ...prev, position: 'Голова Відділу' }));
  } else if (formData.type === 0) {
    setFormData(prev => {
      if (prev.position === 'Голова Профбюро Студентів' || prev.position === 'Голова Відділу') {
        return { ...prev, position: '', isTemporary: false };
      }
        return { ...prev, isTemporary: false }; 
    });
  }
}, [formData.type, setFormData]);

 const [previewImageUrl, setPreviewImageUrl] = useState<string | undefined>(undefined);
 const [fileError, setFileError] = useState<string | null>(null);

 useEffect(() => {
  if (selectedFile) {
   const objectUrl = URL.createObjectURL(selectedFile);
   setPreviewImageUrl(objectUrl);
   return () => URL.revokeObjectURL(objectUrl);
  } else if (editingItem?.imageUrl) {
   setPreviewImageUrl(editingItem.imageUrl);
  } else {
   setPreviewImageUrl(undefined);
  }
 }, [selectedFile, editingItem]);

 const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0] || null;

  if (file && file.size > MAX_FILE_SIZE_BYTES) {
   setFileError(
    `Файл завеликий (${(file.size / (1024 * 1024)).toFixed(1)} МБ). Максимальний розмір — ${MAX_FILE_SIZE_MB} МБ.`
   );
   setSelectedFile(null);
   e.target.value = ''; // дозволяємо вибрати той самий файл повторно після виправлення
   return;
  }

  setFileError(null);
  setSelectedFile(file);
 };

 const showPositionInput = formData.type === 0;
 const showTemporaryCheckbox = formData.type === 1 || formData.type === 2;

 let previewPosition = formData.position;
 if (formData.isTemporary && showTemporaryCheckbox) {
  previewPosition = formData.position.replace("Голова", "В.О. Голови");
 }

 const previewMember: TeamMember = {
  id: editingItem?.id || 0,
  name: formData.name || "Іван Франко",
  position: previewPosition || "Голова Профкому Студентів",
  imageUrl: previewImageUrl,
  type: formData.type,
  orderInd: formData.orderInd,
  email: formData.email,
    isTemporary: formData.isTemporary, 
    createdAt: new Date().toISOString(),
    isChoosed: false, 
 };

 return (
  <div>
   <form onSubmit={onSubmit} className="px-6 pb-6 pt-6 space-y-6">
    <div>
     <ModalLabel required htmlFor="name">
      Ім'я та прізвище
     </ModalLabel>
     <ModalInput
      id="name"
      type="text"
      required
      maxLength={100}
      value={formData.name}
      onChange={(e) => {
       const lettersOnly = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ ЇїІіЄєҐґ\s-']/g, '');
       setFormData({ ...formData, name: lettersOnly });
      }}
      placeholder="Іван Франко"
     />
    </div>

    <div>
     <ModalLabel required htmlFor="type">
      Тип члена команди
     </ModalLabel>
     <ModalSelect
      id="type"
      required
      value={formData.type}
      onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
     >
      <option value={0}>Член Президії</option>
      <option value={1}>Голова Профбюро Студентів</option>
      <option value={2}>Голова Відділу</option>
     </ModalSelect>
    </div>
    
    {showTemporaryCheckbox && (
     <div className="flex items-center">
      <ModalCheckbox
       id="isTemporary_member"
       checked={formData.isTemporary}
       onChange={(e) => setFormData({ ...formData, isTemporary: e.target.checked })}
      />
      <label htmlFor="isTemporary_member" className="ml-2 text-md font-medium text-gray-700">
       Виконуючий обов'язки?
      </label>
     </div>
    )}

    {showPositionInput ? (
     <div>
      <ModalLabel required htmlFor="position">
       Посада
      </ModalLabel>
      <ModalInput
       id="position"
       type="text"
       required
       maxLength={100}
       value={formData.position}
       onChange={(e) => setFormData({ ...formData, position: e.target.value })}
       placeholder="Голова Профкому Студентів"
      />
     </div>
    ) : (
     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-md text-blue-800">
       <span className="font-semibold">Посада:</span> {previewPosition}
      </p>
     </div>
    )}

    <div>
     <ModalLabel htmlFor="email">Email</ModalLabel>
     <ModalInput
      id="email"
      type="email"
      maxLength={150}
      value={formData.email || ''}
      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
      placeholder="ivanfranko@lnu.edu.ua"
     />
    </div>

    <div>
     <ModalLabel>
      {editingItem ? 'Змінити фото' : 'Фото'}
     </ModalLabel>
     <ModalInput
      type="file"
      accept="image/*"
      onChange={handleFileChange}
     />
     {fileError && <p className="mt-1 text-xs text-red-600">{fileError}</p>}
    </div>

    <div>
     <ModalLabel htmlFor="orderInd">
      Порядок відображення
     </ModalLabel>
     <ModalInput
      id="orderInd"
      type="number"
      min={0}
      max={9999}
      value={formData.orderInd}
      onChange={(e) => {
       const raw = parseInt(e.target.value) || 0;
       const clamped = Math.min(Math.max(raw, 0), 9999);
       setFormData({ ...formData, orderInd: clamped });
      }}
      placeholder="0"
     />
     <p className="mt-1 text-xs text-gray-500">
      Задає позицію в таблиці
     </p>
    </div>

   <div className="px-6 pt-6"> 
    <div className="w-full max-w-sm mx-auto"> 
     <TeamMemberCard member={previewMember} />
    </div>
   </div>

    <div className="flex justify-end space-x-4 border-t pt-6">
     <ModalButton type="button" onClick={onClose} variant="secondary">
      Скасувати
     </ModalButton>
     <ModalButton type="submit" variant="primary">
      {editingItem ? 'Зберегти зміни' : 'Додати члена команди'}
     </ModalButton>
    </div>
   </form>
  </div>
 );
};

export default TeamModal;