import { TeamMember} from './team';

export interface FacultyFormData {
  name: string;
  headId: number | null;
  address: string;
  room: string;
  schedule: string;
  summary: string;
  instagram_Link: string;
  telegram_Link: string;
  isActive: boolean;
  isCollege: boolean;
  imageUrl: string;
}

export interface Faculty {
  id: number;
  name: string;
  headId: number | null;
  head?: TeamMember;
  imageUrl?: string;
  address?: string;
  room?: string;
  schedule?: string;
  summary?: string;
  instagram_Link?: string;
  telegram_Link?: string;
  isActive: boolean;
  isCollege: boolean;
}