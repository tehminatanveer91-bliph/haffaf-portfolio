import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  firebaseConfig,
  firestoreDatabaseId,
  getLastFirestoreDiagnostic,
  handleFirestoreError,
  storage,
} from '../lib/firebase';
import {
  resolveAdminVerification,
  type AdminVerificationResult,
} from '../lib/adminAuth';
import {
  DEFAULT_PROJECTS,
  DEFAULT_SERVICES,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_SKILLS,
} from '../data/defaults';
import {
  OperationType,
  type ContactMessage,
  type Project,
  type ServiceItem,
  type SiteSettings,
  type Skill,
} from '../types/portfolio';
import {
  validateContactInput,
  validateProjectInput,
  validateServiceInput,
  validateSiteSettingsInput,
  validateSkillInput,
} from '../utils/validation';

function generateSafeId(prefix: string): string {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${randomPart}`;
}

export async function verifyAdminAuthorization(
  uid: string,
  email: string | null,
  emailVerified: boolean
): Promise<AdminVerificationResult> {
  return resolveAdminVerification({
    uid,
    email,
    emailVerified,
    projectId: firebaseConfig.projectId,
    databaseId: firestoreDatabaseId,
    getUnderlyingError: getLastFirestoreDiagnostic,
    checkAdminDoc: async (targetUid: string) => {
      const adminSnap = await getDocFromServer(doc(db, 'admins', targetUid));
      return adminSnap.exists();
    },
    bootstrapAdminDoc: async (targetUid: string, adminEmail: string) => {
      await setDoc(doc(db, 'admins', targetUid), {
        email: adminEmail,
        createdAt: serverTimestamp(),
      });
    },
  });
}

export function subscribePublicPortfolio(callbacks: {
  onSettings: (settings: SiteSettings | null) => void;
  onProjects: (projects: Project[]) => void;
  onSkills: (skills: Skill[]) => void;
  onServices: (services: ServiceItem[]) => void;
  onError?: (err: Error) => void;
}): Unsubscribe {
  const unsubs: Unsubscribe[] = [];

  unsubs.push(
    onSnapshot(
      doc(db, 'siteSettings', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as SiteSettings;
          const normalized = data.contactEmail?.endsWith('@haffaf.dev')
            ? { ...data, contactEmail: BOOTSTRAPPED_ADMIN_EMAIL }
            : data;
          callbacks.onSettings(normalized);
        } else {
          callbacks.onSettings(null);
        }
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'siteSettings/main');
        } catch (wrapped) {
          callbacks.onError?.(wrapped as Error);
        }
      }
    )
  );

  const projectsQuery = query(
    collection(db, 'projects'),
    where('published', '==', true)
  );
  unsubs.push(
    onSnapshot(
      projectsQuery,
      (snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Project, 'id'>) }))
          .sort((a, b) => a.order - b.order);
        callbacks.onProjects(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'projects');
        } catch (wrapped) {
          callbacks.onError?.(wrapped as Error);
        }
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'skills'),
      (snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Skill, 'id'>) }))
          .sort((a, b) => a.order - b.order);
        callbacks.onSkills(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'skills');
        } catch (wrapped) {
          callbacks.onError?.(wrapped as Error);
        }
      }
    )
  );

  const servicesQuery = query(
    collection(db, 'services'),
    where('active', '==', true)
  );
  unsubs.push(
    onSnapshot(
      servicesQuery,
      (snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceItem, 'id'>) }))
          .sort((a, b) => a.order - b.order);
        callbacks.onServices(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'services');
        } catch (wrapped) {
          callbacks.onError?.(wrapped as Error);
        }
      }
    )
  );

  return () => {
    unsubs.forEach((u) => u());
  };
}

export function subscribeAdminDashboard(callbacks: {
  onSettings: (settings: SiteSettings | null) => void;
  onProjects: (projects: Project[]) => void;
  onSkills: (skills: Skill[]) => void;
  onServices: (services: ServiceItem[]) => void;
  onMessages: (messages: ContactMessage[]) => void;
  onError?: (err: Error) => void;
}): Unsubscribe {
  const unsubs: Unsubscribe[] = [];

  unsubs.push(
    onSnapshot(
      doc(db, 'siteSettings', 'main'),
      (snap) => {
        if (!snap.exists()) {
          callbacks.onSettings(null);
          return;
        }
        const data = snap.data() as SiteSettings;
        if (data.contactEmail?.endsWith('@haffaf.dev')) {
          void updateDoc(doc(db, 'siteSettings', 'main'), {
            contactEmail: BOOTSTRAPPED_ADMIN_EMAIL,
            updatedAt: serverTimestamp(),
          });
          callbacks.onSettings({
            ...data,
            contactEmail: BOOTSTRAPPED_ADMIN_EMAIL,
          });
          return;
        }
        callbacks.onSettings(data);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.GET, 'siteSettings/main');
        } catch (wrapped) {
          callbacks.onError?.(wrapped as Error);
        }
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'projects'),
      (snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Project, 'id'>) }))
          .sort((a, b) => a.order - b.order);
        callbacks.onProjects(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'projects');
        } catch (wrapped) {
          callbacks.onError?.(wrapped as Error);
        }
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'skills'),
      (snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<Skill, 'id'>) }))
          .sort((a, b) => a.order - b.order);
        callbacks.onSkills(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'skills');
        } catch (wrapped) {
          callbacks.onError?.(wrapped as Error);
        }
      }
    )
  );

  unsubs.push(
    onSnapshot(
      collection(db, 'services'),
      (snap) => {
        const items = snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as Omit<ServiceItem, 'id'>) }))
          .sort((a, b) => a.order - b.order);
        callbacks.onServices(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'services');
        } catch (wrapped) {
          callbacks.onError?.(wrapped as Error);
        }
      }
    )
  );

  const messagesQuery = query(
    collection(db, 'messages'),
    orderBy('createdAt', 'desc')
  );
  unsubs.push(
    onSnapshot(
      messagesQuery,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ContactMessage, 'id'>),
        }));
        callbacks.onMessages(items);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'messages');
        } catch (wrapped) {
          callbacks.onError?.(wrapped as Error);
        }
      }
    )
  );

  return () => {
    unsubs.forEach((u) => u());
  };
}

export async function submitContactMessage(input: {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot?: string;
  lastSubmittedAt?: number | null;
}): Promise<string> {
  const validation = validateContactInput(input);
  if (!validation.valid) {
    const firstMsg = Object.values(validation.errors)[0] || 'Invalid form input.';
    throw new Error(firstMsg);
  }

  const id = generateSafeId('msg');
  const path = `messages/${id}`;
  try {
    await setDoc(doc(db, 'messages', id), {
      name: input.name.trim(),
      email: input.email.trim(),
      subject: input.subject.trim(),
      message: input.message.trim(),
      read: false,
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function markMessageRead(
  id: string,
  read: boolean
): Promise<void> {
  const path = `messages/${id}`;
  try {
    await updateDoc(doc(db, 'messages', id), { read });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  const path = `messages/${id}`;
  try {
    await deleteDoc(doc(db, 'messages', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveProject(
  projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const cleanPayload: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
    title: projectData.title.trim(),
    description: projectData.description.trim(),
    category: projectData.category,
    technologies: projectData.technologies
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 12),
    thumbnailUrl: projectData.thumbnailUrl.trim(),
    liveUrl: projectData.liveUrl.trim(),
    githubUrl: projectData.githubUrl.trim(),
    published: Boolean(projectData.published),
    featured: Boolean(projectData.featured),
    order: Number(projectData.order) || 1,
  };

  const validation = validateProjectInput(cleanPayload);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors)[0] || 'Invalid project data.');
  }

  const id = existingId || generateSafeId('proj');
  const path = `projects/${id}`;
  try {
    if (existingId) {
      await updateDoc(doc(db, 'projects', existingId), {
        ...cleanPayload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'projects', id), {
        ...cleanPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(
      error,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

export async function deleteProject(id: string): Promise<void> {
  const path = `projects/${id}`;
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSkill(
  skillData: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const cleanPayload: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'> = {
    name: skillData.name.trim(),
    category: skillData.category,
    proficiency: Math.max(1, Math.min(100, Math.round(skillData.proficiency))),
    order: Number(skillData.order) || 1,
  };

  const validation = validateSkillInput(cleanPayload);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors)[0] || 'Invalid skill data.');
  }

  const id = existingId || generateSafeId('skill');
  const path = `skills/${id}`;
  try {
    if (existingId) {
      await updateDoc(doc(db, 'skills', existingId), {
        ...cleanPayload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'skills', id), {
        ...cleanPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(
      error,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

export async function deleteSkill(id: string): Promise<void> {
  const path = `skills/${id}`;
  try {
    await deleteDoc(doc(db, 'skills', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveService(
  serviceData: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'>,
  existingId?: string
): Promise<string> {
  const cleanPayload: Omit<ServiceItem, 'id' | 'createdAt' | 'updatedAt'> = {
    title: serviceData.title.trim(),
    description: serviceData.description.trim(),
    deliverables: serviceData.deliverables
      .map((d) => d.trim())
      .filter(Boolean)
      .slice(0, 8),
    order: Number(serviceData.order) || 1,
    active: Boolean(serviceData.active),
  };

  const validation = validateServiceInput(cleanPayload);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors)[0] || 'Invalid service data.');
  }

  const id = existingId || generateSafeId('svc');
  const path = `services/${id}`;
  try {
    if (existingId) {
      await updateDoc(doc(db, 'services', existingId), {
        ...cleanPayload,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'services', id), {
        ...cleanPayload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    return id;
  } catch (error) {
    handleFirestoreError(
      error,
      existingId ? OperationType.UPDATE : OperationType.CREATE,
      path
    );
  }
}

export async function deleteService(id: string): Promise<void> {
  const path = `services/${id}`;
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveSiteSettings(
  settings: Omit<SiteSettings, 'updatedAt'>
): Promise<void> {
  const cleanPayload: Omit<SiteSettings, 'updatedAt'> = {
    brandName: settings.brandName.trim(),
    heroHeading: settings.heroHeading.trim(),
    heroIntro: settings.heroIntro.trim(),
    availabilityText: settings.availabilityText.trim(),
    availableForWork: Boolean(settings.availableForWork),
    aboutTitle: settings.aboutTitle.trim(),
    aboutLead: settings.aboutLead.trim(),
    aboutBody: settings.aboutBody.trim(),
    yearsExperience: settings.yearsExperience.trim(),
    projectsDelivered: settings.projectsDelivered.trim(),
    location: settings.location.trim(),
    contactEmail: settings.contactEmail.trim(),
    githubUrl: settings.githubUrl.trim(),
    linkedinUrl: settings.linkedinUrl.trim(),
    twitterUrl: settings.twitterUrl.trim(),
  };

  const validation = validateSiteSettingsInput(cleanPayload);
  if (!validation.valid) {
    throw new Error(Object.values(validation.errors)[0] || 'Invalid site settings.');
  }

  const path = 'siteSettings/main';
  try {
    await setDoc(doc(db, 'siteSettings', 'main'), {
      ...cleanPayload,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function uploadProjectThumbnail(file: File): Promise<string> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Only JPG, PNG, WebP, or AVIF images are supported.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image size must be 5 MB or smaller.');
  }

  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageRef = ref(storage, `projects/${Date.now()}_${cleanName}`);
  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}

export async function seedStarterPortfolioContent(): Promise<void> {
  const batch = writeBatch(db);

  batch.set(doc(db, 'siteSettings', 'main'), {
    ...DEFAULT_SITE_SETTINGS,
    updatedAt: serverTimestamp(),
  });

  for (const project of DEFAULT_PROJECTS) {
    const { id, ...rest } = project;
    batch.set(doc(db, 'projects', id), {
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  for (const skill of DEFAULT_SKILLS) {
    const { id, ...rest } = skill;
    batch.set(doc(db, 'skills', id), {
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  for (const service of DEFAULT_SERVICES) {
    const { id, ...rest } = service;
    batch.set(doc(db, 'services', id), {
      ...rest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch-seed');
  }
}
