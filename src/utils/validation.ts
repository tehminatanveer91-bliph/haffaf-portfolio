import type {
  ContactMessage,
  Project,
  ProjectCategory,
  ServiceItem,
  SiteSettings,
  Skill,
  SkillCategory,
} from '../types/portfolio';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PROJECT_CATEGORIES: ProjectCategory[] = [
  'Full-Stack',
  'Frontend',
  'Cloud & APIs',
  'UI Architecture',
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  'Frontend Development',
  'Backend Development',
  'Database & Cloud',
  'Development Tools',
];

export const LIMITS = {
  TITLE_MIN: 2,
  TITLE_MAX: 120,
  DESC_MIN: 10,
  DESC_MAX: 1500,
  TECH_MAX_COUNT: 12,
  TECH_ITEM_MAX: 40,
  URL_MAX: 500,
  THUMB_URL_MAX: 1000,
  SKILL_NAME_MIN: 1,
  SKILL_NAME_MAX: 60,
  SERVICE_TITLE_MIN: 2,
  SERVICE_TITLE_MAX: 100,
  SERVICE_DESC_MIN: 10,
  SERVICE_DESC_MAX: 600,
  DELIVERABLES_MAX: 8,
  DELIVERABLE_ITEM_MAX: 80,
  MSG_NAME_MIN: 2,
  MSG_NAME_MAX: 100,
  MSG_EMAIL_MIN: 5,
  MSG_EMAIL_MAX: 150,
  MSG_SUBJECT_MIN: 3,
  MSG_SUBJECT_MAX: 160,
  MSG_BODY_MIN: 10,
  MSG_BODY_MAX: 3000,
  SPAM_COOLDOWN_MS: 30_000,
} as const;

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function isSafeHttpUrl(url: string, allowLocalAsset = false): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  if (allowLocalAsset && trimmed.startsWith('/src/assets/images/')) {
    return true;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

export function sanitizeExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return isSafeHttpUrl(trimmed, true) ? trimmed : '';
}

export function validateContactInput(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string;
  lastSubmittedAt?: number | null;
  now?: number;
}): ValidationResult {
  const errors: Record<string, string> = {};
  const name = input.name.trim();
  const email = input.email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (input.honeypot && input.honeypot.trim().length > 0) {
    errors.form = 'Submission rejected by spam filter.';
    return { valid: false, errors };
  }

  const now = input.now ?? Date.now();
  if (
    typeof input.lastSubmittedAt === 'number' &&
    now - input.lastSubmittedAt < LIMITS.SPAM_COOLDOWN_MS
  ) {
    const waitSec = Math.ceil(
      (LIMITS.SPAM_COOLDOWN_MS - (now - input.lastSubmittedAt)) / 1000
    );
    errors.form = `Please wait ${waitSec}s before sending another message.`;
    return { valid: false, errors };
  }

  if (name.length < LIMITS.MSG_NAME_MIN || name.length > LIMITS.MSG_NAME_MAX) {
    errors.name = `Name must be between ${LIMITS.MSG_NAME_MIN} and ${LIMITS.MSG_NAME_MAX} characters.`;
  }

  if (
    email.length < LIMITS.MSG_EMAIL_MIN ||
    email.length > LIMITS.MSG_EMAIL_MAX ||
    !EMAIL_REGEX.test(email)
  ) {
    errors.email = 'Please enter a valid email address.';
  }

  if (
    subject.length < LIMITS.MSG_SUBJECT_MIN ||
    subject.length > LIMITS.MSG_SUBJECT_MAX
  ) {
    errors.subject = `Subject must be between ${LIMITS.MSG_SUBJECT_MIN} and ${LIMITS.MSG_SUBJECT_MAX} characters.`;
  }

  if (
    message.length < LIMITS.MSG_BODY_MIN ||
    message.length > LIMITS.MSG_BODY_MAX
  ) {
    errors.message = `Message must be between ${LIMITS.MSG_BODY_MIN} and ${LIMITS.MSG_BODY_MAX} characters.`;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateProjectInput(
  input: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): ValidationResult {
  const errors: Record<string, string> = {};
  const title = input.title.trim();
  const description = input.description.trim();

  if (title.length < LIMITS.TITLE_MIN || title.length > LIMITS.TITLE_MAX) {
    errors.title = `Title must be ${LIMITS.TITLE_MIN}–${LIMITS.TITLE_MAX} characters.`;
  }

  if (
    description.length < LIMITS.DESC_MIN ||
    description.length > LIMITS.DESC_MAX
  ) {
    errors.description = `Description must be ${LIMITS.DESC_MIN}–${LIMITS.DESC_MAX} characters.`;
  }

  if (!PROJECT_CATEGORIES.includes(input.category)) {
    errors.category = 'Select a valid project category.';
  }

  const cleanTech = input.technologies
    .map((t) => t.trim())
    .filter((t) => t.length > 0 && t.length <= LIMITS.TECH_ITEM_MAX);

  if (cleanTech.length < 1 || cleanTech.length > LIMITS.TECH_MAX_COUNT) {
    errors.technologies = `Provide 1 to ${LIMITS.TECH_MAX_COUNT} valid technology tags.`;
  }

  if (
    input.thumbnailUrl.trim().length > LIMITS.THUMB_URL_MAX ||
    !isSafeHttpUrl(input.thumbnailUrl, true)
  ) {
    errors.thumbnailUrl = 'Thumbnail URL must be a valid HTTP(S) URL or local asset.';
  }

  if (
    input.liveUrl.trim().length > LIMITS.URL_MAX ||
    !isSafeHttpUrl(input.liveUrl, false)
  ) {
    errors.liveUrl = 'Live Demo URL must start with http:// or https://.';
  }

  if (
    input.githubUrl.trim().length > LIMITS.URL_MAX ||
    !isSafeHttpUrl(input.githubUrl, false)
  ) {
    errors.githubUrl = 'GitHub URL must start with http:// or https://.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateSkillInput(
  input: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>
): ValidationResult {
  const errors: Record<string, string> = {};
  const name = input.name.trim();

  if (
    name.length < LIMITS.SKILL_NAME_MIN ||
    name.length > LIMITS.SKILL_NAME_MAX
  ) {
    errors.name = `Skill name must be ${LIMITS.SKILL_NAME_MIN}–${LIMITS.SKILL_NAME_MAX} characters.`;
  }

  if (!SKILL_CATEGORIES.includes(input.category)) {
    errors.category = 'Select a valid skill category.';
  }

  if (
    typeof input.proficiency !== 'number' ||
    Number.isNaN(input.proficiency) ||
    input.proficiency < 1 ||
    input.proficiency > 100
  ) {
    errors.proficiency = 'Proficiency must be a number between 1 and 100.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateServiceInput(
  input: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>
): ValidationResult {
  const errors: Record<string, string> = {};
  const title = input.title.trim();
  const description = input.description.trim();

  if (
    title.length < LIMITS.SERVICE_TITLE_MIN ||
    title.length > LIMITS.SERVICE_TITLE_MAX
  ) {
    errors.title = `Service title must be ${LIMITS.SERVICE_TITLE_MIN}–${LIMITS.SERVICE_TITLE_MAX} characters.`;
  }

  if (
    description.length < LIMITS.SERVICE_DESC_MIN ||
    description.length > LIMITS.SERVICE_DESC_MAX
  ) {
    errors.description = `Description must be ${LIMITS.SERVICE_DESC_MIN}–${LIMITS.SERVICE_DESC_MAX} characters.`;
  }

  const deliverables = input.deliverables
    .map((d) => d.trim())
    .filter((d) => d.length > 0 && d.length <= LIMITS.DELIVERABLE_ITEM_MAX);

  if (deliverables.length < 1 || deliverables.length > LIMITS.DELIVERABLES_MAX) {
    errors.deliverables = `Provide 1 to ${LIMITS.DELIVERABLES_MAX} deliverables.`;
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateSiteSettingsInput(
  input: Omit<SiteSettings, 'updatedAt'>
): ValidationResult {
  const errors: Record<string, string> = {};

  if (input.brandName.trim().length < 1 || input.brandName.trim().length > 50) {
    errors.brandName = 'Brand name must be 1–50 characters.';
  }
  if (input.heroHeading.trim().length < 5 || input.heroHeading.trim().length > 160) {
    errors.heroHeading = 'Hero heading must be 5–160 characters.';
  }
  if (input.heroIntro.trim().length < 10 || input.heroIntro.trim().length > 500) {
    errors.heroIntro = 'Hero intro must be 10–500 characters.';
  }
  if (input.aboutTitle.trim().length < 3 || input.aboutTitle.trim().length > 120) {
    errors.aboutTitle = 'About title must be 3–120 characters.';
  }
  if (input.aboutLead.trim().length < 10 || input.aboutLead.trim().length > 400) {
    errors.aboutLead = 'About lead must be 10–400 characters.';
  }
  if (input.aboutBody.trim().length < 20 || input.aboutBody.trim().length > 2500) {
    errors.aboutBody = 'About body must be 20–2500 characters.';
  }
  if (!EMAIL_REGEX.test(input.contactEmail.trim())) {
    errors.contactEmail = 'Contact email must be a valid email address.';
  }
  if (!isSafeHttpUrl(input.githubUrl, false)) {
    errors.githubUrl = 'GitHub URL must be a valid HTTP(S) URL.';
  }
  if (!isSafeHttpUrl(input.linkedinUrl, false)) {
    errors.linkedinUrl = 'LinkedIn URL must be a valid HTTP(S) URL.';
  }
  if (!isSafeHttpUrl(input.twitterUrl, false)) {
    errors.twitterUrl = 'X / Twitter URL must be a valid HTTP(S) URL.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

export function filterProjectsByCategory(
  projects: Project[],
  category: 'All' | ProjectCategory
): Project[] {
  const sorted = [...projects].sort((a, b) => a.order - b.order);
  if (category === 'All') return sorted;
  return sorted.filter((project) => project.category === category);
}

export function groupSkillsByCategory(
  skills: Skill[]
): Record<SkillCategory, Skill[]> {
  const grouped: Record<SkillCategory, Skill[]> = {
    'Frontend Development': [],
    'Backend Development': [],
    'Database & Cloud': [],
    'Development Tools': [],
  };

  const sorted = [...skills].sort((a, b) => a.order - b.order);
  for (const skill of sorted) {
    if (grouped[skill.category]) {
      grouped[skill.category].push(skill);
    }
  }
  return grouped;
}

export interface DashboardMetrics {
  totalProjects: number;
  publishedProjects: number;
  totalSkills: number;
  totalMessages: number;
  unreadMessages: number;
}

export function computeDashboardMetrics(params: {
  projects: Project[];
  skills: Skill[];
  messages: ContactMessage[];
}): DashboardMetrics {
  return {
    totalProjects: params.projects.length,
    publishedProjects: params.projects.filter((p) => p.published).length,
    totalSkills: params.skills.length,
    totalMessages: params.messages.length,
    unreadMessages: params.messages.filter((m) => !m.read).length,
  };
}
