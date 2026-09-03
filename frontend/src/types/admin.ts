export interface AdminUser {
  id: number;
  username: string;
  role: string;
}

export interface AdminCreateFormData {
  username: string;
  password: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
