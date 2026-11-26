export type ProjectCategory =
  | 'Full-Stack'
  | 'Frontend'
  | 'Cloud & APIs'
  | 'UI Architecture';

export type SkillCategory =
  | 'Frontend Development'
  | 'Backend Development'
  | 'Database & Cloud'
  | 'Development Tools';

export interface Project {
  id: string;
  title: string;
  description: string;
  category: ProjectCategory;
  technologies: string[];
  thumbnailUrl: string;
  liveUrl: string;
  githubUrl: string;
  published: boolean;
  featured: boolean;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: number;
  order: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  deliverables: string[];
  order: number;
  active: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt?: unknown;
}

export interface SiteSettings {
  brandName: string;
  heroHeading: string;
  heroIntro: string;
  availabilityText: string;
  availableForWork: boolean;
  aboutTitle: string;
  aboutLead: string;
  aboutBody: string;
  yearsExperience: string;
  projectsDelivered: string;
  location: string;
  contactEmail: string;
  githubUrl: string;
  linkedinUrl: string;
  twitterUrl: string;
  updatedAt?: unknown;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'viewer';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}
