<<<<<<< HEAD
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
      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
     />
    </div>

    <div>
     <ModalLabel htmlFor="orderInd">
      Порядок відображення
     </ModalLabel>
     <ModalInput
      id="orderInd"
      type="number"
      min={0}
      value={formData.orderInd}
      onChange={(e) => setFormData({ ...formData, orderInd: parseInt(e.target.value) || 0 })}
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
=======
import React, { useEffect } from 'react';
import { TeamMember, TeamFormData } from '../../types/team';

interface TeamModalProps {
  formData: TeamFormData;
  setFormData: React.Dispatch<React.SetStateAction<TeamFormData>>;
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  editingItem: TeamMember | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const TeamModal: React.FC<TeamModalProps> = ({
  formData,
  setFormData,
  setSelectedFile,
  editingItem,
  onSubmit,
  onClose
}) => {
  // Автоматично встановлюємо посаду для Голови Профбюро та Відділу
  useEffect(() => {
    if (formData.type === 1) {
      // Профбюро
      setFormData(prev => ({ ...prev, position: 'Голова Профбюро' }));
    } else if (formData.type === 2) {
      // Відділ
      setFormData(prev => ({ ...prev, position: 'Голова Відділу' }));
    }
    // Для Апарату (type === 0) нічого не робимо - користувач вводить сам
  }, [formData.type]);

  const showPositionInput = formData.type === 0; // Показуємо тільки для Апарату

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-6">
      {/* Ім'я */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ім'я та прізвище *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => {
            const lettersOnly = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ ЇїІіЄєҐґ\s]/g, '');
            setFormData({ ...formData, name: lettersOnly });
          }}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Іван Франко"
        />
      </div>

      {/* Тип члена команди */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Тип члена команди *
        </label>
        <select
          required
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value={0}>Член Апарату Профкому</option>
          <option value={1}>Голова Профбюро</option>
          <option value={2}>Голова Відділу</option>
        </select>
      </div>

      {/* Посада - показуємо тільки для Апарату */}
      {showPositionInput ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Посада *
          </label>
          <input
            type="text"
            required
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
            placeholder="Голова профкому"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Посада:</span> {formData.position}
          </p>
          <p className="text-xs text-blue-600 mt-1">
            Посада встановлюється автоматично для обраного типу
          </p>
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="ivanfranko@lnu.edu.ua"
        />
      </div>

      {/* Фото */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Фото
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
        />
        {editingItem && editingItem.imageUrl && (
          <p className="mt-2 text-sm text-gray-500">
            Поточне: <a href={editingItem.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">переглянути</a>
          </p>
        )}
      </div>

      {/* Порядок відображення та Активність */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Порядок відображення
          </label>
          <input
            type="number"
            min={0}
            value={formData.orderInd}
            onChange={(e) => setFormData({ ...formData, orderInd: parseInt(e.target.value) || 0 })}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
          <p className="mt-1 text-xs text-gray-500">
            Індекс для сортування в межах типу
          </p>
        </div>

        <div className="flex items-center pt-6">
          <input
            type="checkbox"
            id="isActive_member"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <label htmlFor="isActive_member" className="ml-2 text-sm font-medium text-gray-700">
            Активний член команди
          </label>
        </div>
      </div>

      {/* Кнопки */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        >
          Скасувати
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
        >
          {editingItem ? 'Зберегти зміни' : 'Додати члена команди'}
        </button>
      </div>
    </form>
  );
>>>>>>> upstream/main
};

export default TeamModal;