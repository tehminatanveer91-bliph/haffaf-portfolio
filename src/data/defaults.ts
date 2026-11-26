import type {
  Project,
  ServiceItem,
  SiteSettings,
  Skill,
} from '../types/portfolio';

export const HERO_VISUAL_URL =
  '/src/assets/images/hero_developer_workspace_1795686525879.jpg';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  brandName: 'HAFFAF',
  heroHeading: 'Building Digital Experiences That Matter.',
  heroIntro:
    "I'm Haffaf, a web developer focused on building modern, responsive and functional digital experiences.",
  availabilityText: 'Available for select client projects',
  availableForWork: true,
  aboutTitle: 'Engineering clarity from architecture to interface.',
  aboutLead:
    'I partner with founders, product teams, and ambitious businesses to ship resilient web applications with clean system boundaries and zero visual clutter.',
  aboutBody:
    'Over the last five years, my work has centered on bridging thoughtful interface design with dependable cloud architecture. From high-throughput Next.js and React applications to real-time Firebase backends and custom administration consoles, every deliverable is built for maintainability, speed, and measurable business clarity.',
  yearsExperience: '5+ Years',
  projectsDelivered: '28+ Shipped',
  location: 'Remote · Worldwide',
  contactEmail: 'tehminatanveer91@gmail.com',
  githubUrl: 'https://github.com/haffaf',
  linkedinUrl: 'https://linkedin.com/in/haffaf',
  twitterUrl: 'https://x.com/haffafdev',
};

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'ledgerflow-analytics',
    title: 'LedgerFlow Treasury Suite',
    description:
      'Multi-tenant financial reporting platform with real-time cashflow forecasting, role-based team approvals, and sub-second tabular ledger queries built on TypeScript and Cloud Firestore.',
    category: 'Full-Stack',
    technologies: ['Next.js', 'TypeScript', 'Firebase', 'Tailwind CSS'],
    thumbnailUrl:
      '/src/assets/images/project_fintech_ledger_1795686527155.jpg',
    liveUrl: 'https://ledgerflow-demo.vercel.app',
    githubUrl: 'https://github.com/haffaf/ledgerflow-suite',
    published: true,
    featured: true,
    order: 1,
  },
  {
    id: 'aether-cloud-plane',
    title: 'Aether Deployment Control Plane',
    description:
      'Infrastructure visibility console for distributed API services featuring live health telemetry, deployment rollbacks, and fine-grained environment secret management.',
    category: 'Cloud & APIs',
    technologies: ['React', 'Node.js', 'Firestore', 'Docker'],
    thumbnailUrl:
      '/src/assets/images/project_cloud_deploy_1795686526901.jpg',
    liveUrl: 'https://aether-plane.vercel.app',
    githubUrl: 'https://github.com/haffaf/aether-control-plane',
    published: true,
    featured: true,
    order: 2,
  },
  {
    id: 'atelier-headless-commerce',
    title: 'Atelier Headless Commerce',
    description:
      'High-conversion editorial storefront engineered with optimistic cart state, instant inventory synchronization, and streamlined checkout workflows optimized for Core Web Vitals.',
    category: 'Frontend',
    technologies: ['TypeScript', 'Tailwind CSS', 'Framer Motion', 'Stripe'],
    thumbnailUrl:
      '/src/assets/images/project_commerce_engine_1795686526499.jpg',
    liveUrl: 'https://atelier-storefront.vercel.app',
    githubUrl: 'https://github.com/haffaf/atelier-commerce',
    published: true,
    featured: false,
    order: 3,
  },
  {
    id: 'studio-orion-workspace',
    title: 'Orion Collaborative Workspace',
    description:
      'Real-time engineering sprint hub uniting structured code reviews, document milestones, and Firebase-backed role permissions inside a single keyboard-first interface.',
    category: 'UI Architecture',
    technologies: ['React', 'Firebase Auth', 'Cloud Storage', 'Vite'],
    thumbnailUrl:
      '/src/assets/images/project_workspace_hub_1795686527422.jpg',
    liveUrl: 'https://orion-hub.vercel.app',
    githubUrl: 'https://github.com/haffaf/orion-workspace',
    published: true,
    featured: false,
    order: 4,
  },
];

export const DEFAULT_SKILLS: Skill[] = [
  { id: 'skill-nextjs', name: 'Next.js & React', category: 'Frontend Development', proficiency: 96, order: 1 },
  { id: 'skill-ts', name: 'TypeScript', category: 'Frontend Development', proficiency: 95, order: 2 },
  { id: 'skill-tailwind', name: 'Tailwind CSS', category: 'Frontend Development', proficiency: 94, order: 3 },
  { id: 'skill-motion', name: 'Framer Motion', category: 'Frontend Development', proficiency: 88, order: 4 },

  { id: 'skill-node', name: 'Node.js & Express', category: 'Backend Development', proficiency: 90, order: 1 },
  { id: 'skill-rest', name: 'REST & API Design', category: 'Backend Development', proficiency: 92, order: 2 },
  { id: 'skill-auth', name: 'Auth & Security Rules', category: 'Backend Development', proficiency: 91, order: 3 },
  { id: 'skill-validation', name: 'Schema Validation', category: 'Backend Development', proficiency: 89, order: 4 },

  { id: 'skill-firestore', name: 'Cloud Firestore', category: 'Database & Cloud', proficiency: 94, order: 1 },
  { id: 'skill-fb-auth', name: 'Firebase Auth & Storage', category: 'Database & Cloud', proficiency: 93, order: 2 },
  { id: 'skill-postgres', name: 'PostgreSQL', category: 'Database & Cloud', proficiency: 84, order: 3 },
  { id: 'skill-vercel', name: 'Vercel Edge & Hosting', category: 'Database & Cloud', proficiency: 92, order: 4 },

  { id: 'skill-git', name: 'Git & GitHub Actions', category: 'Development Tools', proficiency: 93, order: 1 },
  { id: 'skill-testing', name: 'Playwright & Unit Testing', category: 'Development Tools', proficiency: 87, order: 2 },
  { id: 'skill-figma', name: 'Figma Systems Handoff', category: 'Development Tools', proficiency: 86, order: 3 },
  { id: 'skill-vite', name: 'Vite & Build Tooling', category: 'Development Tools', proficiency: 91, order: 4 },
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'service-business-web',
    title: 'Business Website Development',
    description:
      'Fast, accessible corporate websites engineered to convert visitors with crisp visual hierarchy, clean SEO metadata, and dependable uptime.',
    deliverables: ['Responsive Architecture', 'Core Web Vitals Tuning', 'CMS-Ready Content'],
    order: 1,
    active: true,
  },
  {
    id: 'service-portfolio-dev',
    title: 'Portfolio Development',
    description:
      'Bespoke personal and studio showcases designed with intentional typography, subtle motion choreography, and dynamic project management.',
    deliverables: ['Custom Visual System', 'Interactive Case Studies', 'Admin Content Sync'],
    order: 2,
    active: true,
  },
  {
    id: 'service-landing-page',
    title: 'Landing Page Development',
    description:
      'High-clarity product launch and lead-generation pages crafted with conversion-focused messaging, validated forms, and responsive layouts.',
    deliverables: ['Conversion Layout', 'Form & Spam Protection', 'Analytics Readiness'],
    order: 3,
    active: true,
  },
  {
    id: 'service-admin-dashboard',
    title: 'Admin Dashboard Development',
    description:
      'Protected operational consoles with role-based access control, tabular metrics, CRUD workflows, and clean real-time state updates.',
    deliverables: ['Protected Auth Routes', 'CRUD Data Tables', 'Audit-Safe Validation'],
    order: 4,
    active: true,
  },
  {
    id: 'service-firebase-integration',
    title: 'Firebase Integration',
    description:
      'End-to-end Cloud Firestore data modeling, Firebase Authentication, Storage media pipelines, and hardened security rule authoring.',
    deliverables: ['Firestore Schema Design', 'Hardened Security Rules', 'Storage Media Pipeline'],
    order: 5,
    active: true,
  },
];
