export const FIELD_LIMITS = {
  personName: 100,
  position: 100,
  adminUsername: 100,
  password: 100,
  room: 100,
  schedule: 100,
  structureName: 150,
  email: 150,
  title: 200,
  address: 200,
  url: 255,
} as const;

/** Строга валідація email: вимагає коректний домен (напр. @gmail.com, @lnu.edu.ua) */
export const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const EMAIL_INPUT_PATTERN = '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}';
export const EMAIL_HINT = 'Введіть коректний email у форматі name@domain.com';

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim());

export const DUPLICATE_NAME_MESSAGE = "Ця назва вже використовується. Оберіть іншу.";

export function isDuplicateStructureName(
  name: string | undefined,
  items: { id: number; name: string }[],
  editingId?: number | null,
): boolean {
  const normalized = name?.trim().toLowerCase();
  if (!normalized) return false;

  return items.some((item) => {
    if ((item.name || "").trim().toLowerCase() !== normalized) return false;
    if (editingId == null) return true;
    return Number(item.id) !== Number(editingId);
  });
}
