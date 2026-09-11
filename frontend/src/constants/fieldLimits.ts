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
