import React, { useEffect, useMemo, useState } from 'react';
import { TeamMember, TeamFormData, MEMBER_TYPE_OPTIONS, APARAT_TYPE, PROFBURO_HEAD_TYPE, VIDDIL_HEAD_TYPE } from '../../types/team';

import {
  ModalLabel,
  ModalInput,
  ModalSelect,
  ModalCheckbox,
  ModalButton,
  CharCounter
} from './ui/ModalStyles';
import { FIELD_LIMITS, EMAIL_INPUT_PATTERN, EMAIL_HINT, isValidEmail } from '../../constants/fieldLimits'; 
import TeamMemberCard from '../TeamMemberCard';

interface TeamModalProps {
 formData: TeamFormData;
 setFormData: React.Dispatch<React.SetStateAction<TeamFormData>>;
 selectedFile: File | null;
 setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
 editingItem: TeamMember | null;
 onSubmit: (e: React.FormEvent, options?: { swapOrder?: boolean }) => void;
 onClose: () => void;
 // ЗМІНА 1: Додаємо allData, щоб модалка знала про існуючі порядки
 allData: TeamMember[]; 
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
 onClose,
 allData // <--- дістаємо з пропсів
}) => {

useEffect(() => {
  if (formData.type === PROFBURO_HEAD_TYPE) {
    setFormData(prev => ({ ...prev, position: 'Голова Профбюро Студентів' }));
  } else if (formData.type === VIDDIL_HEAD_TYPE) {
    setFormData(prev => ({ ...prev, position: 'Голова Відділу' }));
  } else if (formData.type === APARAT_TYPE) {
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
 const [emailError, setEmailError] = useState<string | null>(null);

 const occupyingMember = useMemo(() => {
   if (typeof formData.orderInd !== 'number' || Number.isNaN(formData.orderInd)) {
     return null;
   }

   return (
     allData.find(
       (member) =>
         member.type === formData.type &&
         member.orderInd === formData.orderInd &&
         member.id !== editingItem?.id,
     ) ?? null
   );
 }, [formData.orderInd, formData.type, allData, editingItem]);

 const canSwapOrder = Boolean(
   editingItem && occupyingMember && editingItem.type === formData.type,
 );
 const orderError = occupyingMember && !canSwapOrder
   ? `Порядок ${formData.orderInd} вже зайнятий членом команди «${occupyingMember.name}».`
   : null;

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
   e.target.value = ''; 
   return;
  }

  setFileError(null);
  setSelectedFile(file);
 };

 // ЗМІНА 4: Створюємо локальний обробник відправки, який блокує збереження, якщо є orderError
 const handleLocalSubmit = (e: React.FormEvent) => {
   e.preventDefault();
   const email = (formData.email || '').trim();
   if (email && !isValidEmail(email)) {
     setEmailError(EMAIL_HINT);
     return;
   }
   setEmailError(null);
   if (orderError) {
     return;
   }
   if (canSwapOrder && occupyingMember && editingItem) {
     const confirmed = window.confirm(
       `Порядок ${formData.orderInd} вже зайнятий членом «${occupyingMember.name}».\n\nПоміняти місцями? У «${occupyingMember.name}» стане порядок ${editingItem.orderInd}, а в цього члена — ${formData.orderInd}.`,
     );
     if (!confirmed) return;
     onSubmit(e, { swapOrder: true });
     return;
   }
   onSubmit(e);
 };

 const showPositionInput = formData.type === APARAT_TYPE;
 const showTemporaryCheckbox = formData.type === PROFBURO_HEAD_TYPE || formData.type === VIDDIL_HEAD_TYPE;

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
   {/* Використовуємо handleLocalSubmit замість onSubmit */}
   <form onSubmit={handleLocalSubmit} className="px-6 pb-6 pt-6 space-y-6">
    <div>
     <ModalLabel required htmlFor="name">
      Ім'я та прізвище
     </ModalLabel>
     <ModalInput
      id="name"
      type="text"
      required
      maxLength={FIELD_LIMITS.personName}
      value={formData.name}
      onChange={(e) => {
       const lettersOnly = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ ЇїІіЄєҐґ\s-']/g, '');
       setFormData({ ...formData, name: lettersOnly });
      }}
      placeholder="Іван Франко"
     />
     <CharCounter current={formData.name.length} max={FIELD_LIMITS.personName} />
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
      {MEMBER_TYPE_OPTIONS.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
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
       maxLength={FIELD_LIMITS.position}
       value={formData.position}
       onChange={(e) => setFormData({ ...formData, position: e.target.value })}
       placeholder="Голова Профкому Студентів"
      />
      <CharCounter current={formData.position.length} max={FIELD_LIMITS.position} />
     </div>
    ) : (
     <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p className="text-md text-blue-800 break-words">
       <span className="font-semibold">Посада:</span> {previewPosition}
      </p>
     </div>
    )}

    <div>
     <ModalLabel htmlFor="email">Email</ModalLabel>
     <ModalInput
      id="email"
      type="email"
      maxLength={FIELD_LIMITS.email}
      pattern={EMAIL_INPUT_PATTERN}
      title={EMAIL_HINT}
      value={formData.email || ''}
      onChange={(e) => {
       setFormData({ ...formData, email: e.target.value });
       const next = e.target.value.trim();
       setEmailError(next && !isValidEmail(next) ? EMAIL_HINT : null);
      }}
      placeholder="ivanfranko@lnu.edu.ua"
     />
     {emailError ? (
      <p className="mt-1 text-xs font-medium text-red-600">{emailError}</p>
     ) : (
      <CharCounter current={(formData.email || '').length} max={FIELD_LIMITS.email} />
     )}
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
            // Якщо в стані порожній рядок, показуємо порожній інпут
            value={formData.orderInd === '' as any ? '' : formData.orderInd}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                // Тимчасово записуємо порожній рядок, щоб дозволити повне стирання поля
                setFormData({ ...formData, orderInd: '' as unknown as number });
              } else {
                const raw = parseInt(val, 10);
                if (!isNaN(raw)) {
                  const clamped = Math.min(Math.max(raw, 0), 9999);
                  setFormData({ ...formData, orderInd: clamped });
                }
              }
            }}
            placeholder="0"
          />
     {/* ЗМІНА 5: Відображаємо помилку червоним кольором, якщо номер зайнято */}
     {orderError ? (
       <p className="mt-1 text-xs font-medium text-red-600">{orderError}</p>
     ) : canSwapOrder && occupyingMember ? (
       <p className="mt-1 text-xs font-medium text-amber-700">
         Порядок {formData.orderInd} уже в «{occupyingMember.name}». При збереженні можна підтвердити обмін місцями.
       </p>
     ) : (
       <p className="mt-1 text-xs text-gray-500">Задає позицію в таблиці</p>
     )}
    </div>

    <div className="pt-6 pb-8"> 
     <ModalLabel>Попередній перегляд</ModalLabel>
     <div className="w-full max-w-sm mx-auto mt-2"> 
      <TeamMemberCard member={previewMember} />
     </div>
    </div>

    <div className="flex justify-end space-x-4 border-t pt-6 bg-white relative z-10">
     <ModalButton type="button" onClick={onClose} variant="secondary">
      Скасувати
     </ModalButton>
     {/* ЗМІНА 6: Робимо кнопку напівпрозорою, якщо є помилка, щоб візуально підкреслити блокування */}
     <ModalButton 
       type="submit" 
       variant="primary" 
       className={orderError ? 'opacity-50 cursor-not-allowed' : ''}
     >
      {editingItem ? 'Зберегти зміни' : 'Додати члена команди'}
     </ModalButton>
    </div>
   </form>
  </div>
 );
};

export default TeamModal;