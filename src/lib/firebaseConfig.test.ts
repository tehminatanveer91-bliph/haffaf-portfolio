import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveFirebaseSetup, type AppletFirebaseConfig } from './firebaseConfig';

const MOCK_APPLET_CONFIG: AppletFirebaseConfig = {
  apiKey: 'applet-api-key',
  authDomain: 'applet.firebaseapp.com',
  projectId: 'applet-proj',
  storageBucket: 'applet.firebasestorage.app',
  messagingSenderId: '123456',
  appId: '1:123456:web:abc',
  firestoreDatabaseId: 'ai-studio-db-id',
};

test('resolveFirebaseSetup uses VITE_FIREBASE_* env vars exclusively and does not inherit applet firestoreDatabaseId', () => {
  const resolved = resolveFirebaseSetup(
    {
      VITE_FIREBASE_API_KEY: 'custom-key',
      VITE_FIREBASE_AUTH_DOMAIN: 'custom.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'custom-project',
      VITE_FIREBASE_STORAGE_BUCKET: 'custom.firebasestorage.app',
      VITE_FIREBASE_MESSAGING_SENDER_ID: '999',
      VITE_FIREBASE_APP_ID: '1:999:web:xyz',
      VITE_FIREBASE_MEASUREMENT_ID: 'G-TEST123',
    },
    MOCK_APPLET_CONFIG
  );

  assert.equal(resolved.source, 'env');
  assert.equal(resolved.config.projectId, 'custom-project');
  assert.equal(resolved.config.measurementId, 'G-TEST123');
  assert.equal(resolved.firestoreDatabaseId, undefined);
});

test('resolveFirebaseSetup respects explicit VITE_FIREBASE_DATABASE_ID when provided', () => {
  const resolved = resolveFirebaseSetup(
    {
      VITE_FIREBASE_API_KEY: 'custom-key',
      VITE_FIREBASE_PROJECT_ID: 'custom-project',
      VITE_FIREBASE_DATABASE_ID: 'custom-named-db',
    },
    MOCK_APPLET_CONFIG
  );

  assert.equal(resolved.source, 'env');
  assert.equal(resolved.firestoreDatabaseId, 'custom-named-db');
});

test('resolveFirebaseSetup falls back to applet config when VITE_FIREBASE_* env vars are absent', () => {
  const resolved = resolveFirebaseSetup({}, MOCK_APPLET_CONFIG);

  assert.equal(resolved.source, 'applet-config');
  assert.equal(resolved.config.projectId, 'applet-proj');
  assert.equal(resolved.firestoreDatabaseId, 'ai-studio-db-id');
});
