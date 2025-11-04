export interface Document {
  id: number;
  title: string;
  description?: string;
  filePath: string;
  fileSize: number;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentFormData {
  title: string;
  description?: string;
}