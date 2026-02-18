// 1. Додаємо інтерфейс для картинки
export interface NewsImage {
  id: number;
  imagePath: string;
  newsId: number;
}

export interface NewsFormData {
  title: string;
  content: string;
  imageUrl: string; // Це поле можна залишити для сумісності
  isImportant: boolean;
}

export interface News {
  id: number;
  title: string;
  content: string;
  
  // 2. Додаємо масив картинок (optional, бо старі новини можуть його не мати)
  images?: NewsImage[];
  
  // Залишаємо imageUrl як запасний варіант (fallback), якщо раптом бекенд поверне старий формат
  imageUrl?: string;
  
  isImportant: boolean;
  publishedAt: string;
}