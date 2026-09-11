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

/** local@domain.tld — дозволяє lnu.edu.ua, gmail.com, yahoo.com тощо */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_INPUT_PATTERN = '[^\\s@]+@[^\\s@]+\\.[^\\s@]+';
export const EMAIL_HINT = 'Формат: name@domain.com';

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
