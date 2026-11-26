import {
  getApp,
  getApps,
  initializeApp,
  type FirebaseApp,
} from 'firebase/app';
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  type Analytics,
} from 'firebase/analytics';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import {
  doc,
  getDocFromServer,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import firebaseAppletConfig from '../../firebase-applet-config.json';
import { OperationType, type FirestoreErrorInfo } from '../types/portfolio';
import { resolveFirebaseSetup } from './firebaseConfig';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  BOOTSTRAPPED_ADMIN_UID,
} from './adminAuth';

export { BOOTSTRAPPED_ADMIN_EMAIL, BOOTSTRAPPED_ADMIN_UID };

const resolvedSetup = resolveFirebaseSetup(
  import.meta.env,
  firebaseAppletConfig
);

export const firebaseConfig = resolvedSetup.config;
export const firebaseConfigSource = resolvedSetup.source;
export const firestoreDatabaseId =
  resolvedSetup.firestoreDatabaseId ?? '(default)';

// Singleton initialization prevents duplicate-app errors during re-renders or HMR
export const app: FirebaseApp =
  getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db: Firestore = resolvedSetup.firestoreDatabaseId
  ? getFirestore(app, resolvedSetup.firestoreDatabaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);
export const storage: FirebaseStorage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

let analyticsInstance: Analytics | null = null;
let lastFirestoreDiagnostic: { code?: string; message?: string } | null = null;

export function getLastFirestoreDiagnostic(): {
  code?: string;
  message?: string;
} | null {
  return lastFirestoreDiagnostic;
}

// Guard Analytics strictly to supported browser runtimes (never SSR)
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined' || !firebaseConfig.measurementId) {
    return null;
  }
  if (analyticsInstance) {
    return analyticsInstance;
  }
  const supported = await isAnalyticsSupported();
  if (!supported) {
    return null;
  }
  analyticsInstance = getAnalytics(app);
  return analyticsInstance;
}

async function testConnection(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    lastFirestoreDiagnostic = null;
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String((error as { code?: unknown }).code ?? '')
        : undefined;
    const message = error instanceof Error ? error.message : String(error);
    if (code && code !== 'permission-denied') {
      lastFirestoreDiagnostic = { code, message };
    }
    if (message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.', {
        projectId: firebaseConfig.projectId,
        databaseId: firestoreDatabaseId,
        code,
        message,
      });
    }
  }
}

void testConnection();

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
