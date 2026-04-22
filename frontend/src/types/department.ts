import { TeamMember } from './team';

export interface DepartmentFormData {
  name: string;
  headId: number | null;
  description: string;
  logoUrl?: string;
  isActive: boolean;
}

export interface Department {
  id: number;
  name: string;
  headId: number | null;
  head?: TeamMember;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}