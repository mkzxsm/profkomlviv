import { TeamMember} from './team';

export interface FacultyFormData {
  name: string;
  headId: number | null;
  address: string;
  room: string;
  schedule: string;
  summary: string;
<<<<<<< HEAD
  instagram_Link: string;
  telegram_Link: string;
  isActive: boolean;
  isCollege: boolean;
  imageUrl: string;
}

export interface Faculty {
=======
  instagram_link: string;
  telegram_link: string;
  isActive: boolean;
}

export interface FacultyUnion {
>>>>>>> upstream/main
  id: number;
  name: string;
  headId: number | null;
  head?: TeamMember;
  imageUrl?: string;
  address?: string;
  room?: string;
  schedule?: string;
  summary?: string;
<<<<<<< HEAD
  instagram_Link?: string;
  telegram_Link?: string;
  isActive: boolean;
  isCollege: boolean;
=======
  instagram_link?: string;
  telegram_link?: string;
  isActive: boolean;
>>>>>>> upstream/main
}