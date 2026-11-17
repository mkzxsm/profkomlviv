import { TeamMember } from './team';

export interface DepartmentFormData {
  name: string;
  headId: number | null;
  description: string;
  logoUrl?: string;
  telegram_Link?: string;
  instagram_Link?: string;
  tiktok_Link?: string;
  isActive: boolean;
}

export interface Department {
  id: number;
  name: string;
  headId: number | null;
  head?: TeamMember;
  description?: string;
  logoUrl?: string;
  telegram_Link?: string;
  instagram_Link?: string;
  tiktok_Link?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}