import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  BOOTSTRAPPED_ADMIN_UID,
  classifyFirestoreAuthError,
  evaluateAdminAccess,
  isBootstrappedAdminIdentity,
  resolveAdminVerification,
} from './adminAuth';

test('isBootstrappedAdminIdentity authorizes only exact verified UID and email', () => {
  assert.equal(
    isBootstrappedAdminIdentity({
      uid: BOOTSTRAPPED_ADMIN_UID,
      email: BOOTSTRAPPED_ADMIN_EMAIL,
      emailVerified: true,
    }),
    true
  );

  assert.equal(
    isBootstrappedAdminIdentity({
      uid: BOOTSTRAPPED_ADMIN_UID,
      email: 'TehminaTanveer91@gmail.com',
      emailVerified: true,
    }),
    true
  );

  assert.equal(
    isBootstrappedAdminIdentity({
      uid: BOOTSTRAPPED_ADMIN_UID,
      email: BOOTSTRAPPED_ADMIN_EMAIL,
      emailVerified: false,
    }),
    false
  );

  assert.equal(
    isBootstrappedAdminIdentity({
      uid: 'different-uid-123',
      email: BOOTSTRAPPED_ADMIN_EMAIL,
      emailVerified: true,
    }),
    false
  );

  assert.equal(
    isBootstrappedAdminIdentity({
      uid: BOOTSTRAPPED_ADMIN_UID,
      email: 'attacker@example.com',
      emailVerified: true,
    }),
    false
  );
});

test('evaluateAdminAccess requires verified email and either /admins/{uid} doc or bootstrapped UID+email', () => {
  assert.equal(
    evaluateAdminAccess({
      uid: 'other-admin-uid',
      email: 'co-admin@example.com',
      emailVerified: true,
      hasAdminDoc: true,
    }),
    true
  );

  assert.equal(
    evaluateAdminAccess({
      uid: 'other-admin-uid',
      email: 'co-admin@example.com',
      emailVerified: false,
      hasAdminDoc: true,
    }),
    false
  );

  assert.equal(
    evaluateAdminAccess({
      uid: 'random-user-uid',
      email: 'visitor@example.com',
      emailVerified: true,
      hasAdminDoc: false,
    }),
    false
  );

  assert.equal(
    evaluateAdminAccess({
      uid: BOOTSTRAPPED_ADMIN_UID,
      email: BOOTSTRAPPED_ADMIN_EMAIL,
      emailVerified: true,
      hasAdminDoc: false,
    }),
    true
  );
});

test('resolveAdminVerification handles authorized, unauthorized, unverified, permission-denied, network failure, and timeout', async () => {
  // 1. Authorized admin with /admins/{uid} doc
  const okDoc = await resolveAdminVerification({
    uid: BOOTSTRAPPED_ADMIN_UID,
    email: BOOTSTRAPPED_ADMIN_EMAIL,
    emailVerified: true,
    checkAdminDoc: async () => true,
  });
  assert.equal(okDoc.authorized, true);
  assert.equal(okDoc.source, 'admin_doc');

  // 2. Authorized bootstrapped admin without /admins/{uid} doc triggers bootstrap without hanging
  let bootstrappedUid = '';
  const okBootstrap = await resolveAdminVerification({
    uid: BOOTSTRAPPED_ADMIN_UID,
    email: BOOTSTRAPPED_ADMIN_EMAIL,
    emailVerified: true,
    checkAdminDoc: async () => false,
    bootstrapAdminDoc: async (uid) => {
      bootstrappedUid = uid;
    },
  });
  assert.equal(okBootstrap.authorized, true);
  assert.equal(okBootstrap.source, 'bootstrapped_identity');
  assert.equal(bootstrappedUid, BOOTSTRAPPED_ADMIN_UID);

  // 3. Unauthorized verified user
  const unauthorized = await resolveAdminVerification({
    uid: 'random-uid-999',
    email: 'stranger@example.com',
    emailVerified: true,
    checkAdminDoc: async () => false,
  });
  assert.equal(unauthorized.authorized, false);
  assert.equal(unauthorized.reason, 'unauthorized');

  // 4. Unverified email (even matching UID and email)
  const unverified = await resolveAdminVerification({
    uid: BOOTSTRAPPED_ADMIN_UID,
    email: BOOTSTRAPPED_ADMIN_EMAIL,
    emailVerified: false,
    checkAdminDoc: async () => true,
  });
  assert.equal(unverified.authorized, false);
  assert.equal(unverified.reason, 'email_unverified');

  // 5. Firestore permission-denied error preserves exact Firebase code and message
  const denied = await resolveAdminVerification({
    uid: BOOTSTRAPPED_ADMIN_UID,
    email: BOOTSTRAPPED_ADMIN_EMAIL,
    emailVerified: true,
    projectId: 'haffaf-portfolio',
    databaseId: 'default',
    checkAdminDoc: async () => {
      const err = new Error('Missing or insufficient permissions.') as Error & {
        code: string;
      };
      err.code = 'permission-denied';
      throw err;
    },
  });
  assert.equal(denied.authorized, false);
  assert.equal(denied.reason, 'permission_denied');
  assert.equal(denied.diagnostics?.firebaseCode, 'permission-denied');
  assert.ok(denied.errorMessage?.includes('Missing or insufficient permissions.'));
  assert.ok(denied.errorMessage?.includes('database: default'));

  // 6. Temporary network failure preserves exact Firebase code and message
  const networkFail = await resolveAdminVerification({
    uid: BOOTSTRAPPED_ADMIN_UID,
    email: BOOTSTRAPPED_ADMIN_EMAIL,
    emailVerified: true,
    checkAdminDoc: async () => {
      const err = new Error('Failed to get document because the client is offline.') as Error & {
        code: string;
      };
      err.code = 'unavailable';
      throw err;
    },
  });
  assert.equal(networkFail.authorized, false);
  assert.equal(networkFail.reason, 'network_error');
  assert.equal(networkFail.diagnostics?.firebaseCode, 'unavailable');
  assert.ok(networkFail.errorMessage?.includes('client is offline'));

  // 7. Hanging Firestore call surfaces underlying diagnostic if available, or exact timeout error
  const timedOut = await resolveAdminVerification({
    uid: BOOTSTRAPPED_ADMIN_UID,
    email: BOOTSTRAPPED_ADMIN_EMAIL,
    emailVerified: true,
    projectId: 'haffaf-portfolio',
    databaseId: '(default)',
    timeoutMs: 25,
    getUnderlyingError: () => ({
      code: 'not-found',
      message: "Database '(default)' not found.",
    }),
    checkAdminDoc: () => new Promise<boolean>(() => {}),
  });
  assert.equal(timedOut.authorized, false);
  assert.equal(timedOut.reason, 'database_not_found');
  assert.equal(timedOut.diagnostics?.firebaseCode, 'not-found');
  assert.ok(timedOut.errorMessage?.includes("Database '(default)' not found."));
});

test('classifyFirestoreAuthError detects missing database errors distinctly', () => {
  const classified = classifyFirestoreAuthError(
    new Error("Database '(default)' not found. Please check your project configuration.")
  );
  assert.equal(classified.reason, 'database_not_found');
  assert.ok(classified.errorMessage.includes("Database '(default)' not found."));
});
