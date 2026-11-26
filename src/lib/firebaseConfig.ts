export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export interface FirebaseEnvInput {
  VITE_FIREBASE_API_KEY?: string;
  VITE_FIREBASE_AUTH_DOMAIN?: string;
  VITE_FIREBASE_PROJECT_ID?: string;
  VITE_FIREBASE_STORAGE_BUCKET?: string;
  VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  VITE_FIREBASE_APP_ID?: string;
  VITE_FIREBASE_MEASUREMENT_ID?: string;
  VITE_FIREBASE_DATABASE_ID?: string;
}

export interface AppletFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

export interface ResolvedFirebaseSetup {
  config: FirebaseClientConfig;
  firestoreDatabaseId?: string;
  source: 'env' | 'applet-config';
}

export function resolveFirebaseSetup(
  env: FirebaseEnvInput,
  appletConfig: AppletFirebaseConfig
): ResolvedFirebaseSetup {
  const hasEnvProject = Boolean(
    env.VITE_FIREBASE_API_KEY?.trim() && env.VITE_FIREBASE_PROJECT_ID?.trim()
  );

  if (hasEnvProject) {
    return {
      source: 'env',
      config: {
        apiKey: env.VITE_FIREBASE_API_KEY!.trim(),
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN?.trim() || '',
        projectId: env.VITE_FIREBASE_PROJECT_ID!.trim(),
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET?.trim() || '',
        messagingSenderId:
          env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim() || '',
        appId: env.VITE_FIREBASE_APP_ID?.trim() || '',
        ...(env.VITE_FIREBASE_MEASUREMENT_ID?.trim()
          ? { measurementId: env.VITE_FIREBASE_MEASUREMENT_ID.trim() }
          : {}),
      },
      firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID?.trim() || undefined,
    };
  }

  return {
    source: 'applet-config',
    config: {
      apiKey: appletConfig.apiKey,
      authDomain: appletConfig.authDomain,
      projectId: appletConfig.projectId,
      storageBucket: appletConfig.storageBucket,
      messagingSenderId: appletConfig.messagingSenderId,
      appId: appletConfig.appId,
      ...(appletConfig.measurementId
        ? { measurementId: appletConfig.measurementId }
        : {}),
    },
    firestoreDatabaseId: appletConfig.firestoreDatabaseId || undefined,
  };
}
