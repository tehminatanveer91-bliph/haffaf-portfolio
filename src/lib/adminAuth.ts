export const BOOTSTRAPPED_ADMIN_UID = 'bWbIgXzS2zSBG57l9b0BgOi9DRD3';
export const BOOTSTRAPPED_ADMIN_EMAIL = 'tehminatanveer91@gmail.com';
export const ADMIN_VERIFY_TIMEOUT_MS = 5000;

export interface AdminIdentityInput {
  uid?: string | null;
  email?: string | null;
  emailVerified?: boolean | null;
}

export type AdminDenialReason =
  | 'unauthenticated'
  | 'email_unverified'
  | 'unauthorized'
  | 'permission_denied'
  | 'database_not_found'
  | 'network_error'
  | 'timeout'
  | 'session_expired';

export interface AdminVerificationDiagnostics {
  projectId?: string;
  databaseId?: string;
  firebaseCode?: string;
  firebaseMessage?: string;
  uid?: string | null;
  email?: string | null;
  emailVerified?: boolean | null;
}

export interface AdminVerificationResult {
  authorized: boolean;
  hasAdminDoc: boolean;
  source: 'admin_doc' | 'bootstrapped_identity' | 'none';
  reason?: AdminDenialReason;
  errorMessage?: string;
  diagnostics?: AdminVerificationDiagnostics;
}

export function isBootstrappedAdminIdentity(
  identity: AdminIdentityInput
): boolean {
  if (identity.emailVerified !== true) return false;
  if (!identity.uid || identity.uid !== BOOTSTRAPPED_ADMIN_UID) return false;
  if (!identity.email) return false;
  return (
    identity.email.trim().toLowerCase() ===
    BOOTSTRAPPED_ADMIN_EMAIL.toLowerCase()
  );
}

export function evaluateAdminAccess(
  identity: AdminIdentityInput & { hasAdminDoc: boolean }
): boolean {
  if (identity.emailVerified !== true) return false;
  if (!identity.uid) return false;
  if (identity.hasAdminDoc) return true;
  return isBootstrappedAdminIdentity(identity);
}

export function classifyFirestoreAuthError(
  error: unknown,
  context?: {
    projectId?: string;
    databaseId?: string;
    fallbackUnderlyingError?: { code?: string; message?: string } | null;
  }
): {
  reason: Extract<
    AdminDenialReason,
    'permission_denied' | 'database_not_found' | 'network_error' | 'timeout'
  >;
  firebaseCode: string;
  firebaseMessage: string;
  errorMessage: string;
} {
  const rawCode =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code ?? '').trim()
      : '';
  const rawMessage =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Unknown verification error.';

  const isTimeout =
    rawCode.toLowerCase().includes('timeout') ||
    rawMessage.toLowerCase().includes('timed out');

  // If the SDK promise hung and timed out while a concrete underlying Firestore error was recorded, surface the underlying error.
  const effectiveCode =
    isTimeout && context?.fallbackUnderlyingError?.code
      ? context.fallbackUnderlyingError.code
      : rawCode || 'unknown';
  const effectiveMessage =
    isTimeout && context?.fallbackUnderlyingError?.message
      ? context.fallbackUnderlyingError.message
      : rawMessage;

  const lowerCode = effectiveCode.toLowerCase();
  const lowerMsg = effectiveMessage.toLowerCase();

  const targetSuffix =
    context?.projectId || context?.databaseId
      ? ` [project: ${context?.projectId ?? 'unknown'}, database: ${context?.databaseId ?? '(default)'}]`
      : '';

  let reason: Extract<
    AdminDenialReason,
    'permission_denied' | 'database_not_found' | 'network_error' | 'timeout'
  > = 'network_error';

  if (
    lowerCode.includes('not-found') ||
    (lowerMsg.includes('database') && lowerMsg.includes('not found'))
  ) {
    reason = 'database_not_found';
  } else if (
    lowerCode.includes('permission-denied') ||
    lowerMsg.includes('missing or insufficient permissions')
  ) {
    reason = 'permission_denied';
  } else if (
    lowerCode.includes('timeout') ||
    lowerMsg.includes('timed out')
  ) {
    reason = 'timeout';
  }

  return {
    reason,
    firebaseCode: effectiveCode,
    firebaseMessage: effectiveMessage,
    errorMessage: `Firestore verification failed (${effectiveCode}): ${effectiveMessage}${targetSuffix}`,
  };
}

export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Operation timed out.'
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(timeoutMessage) as Error & { code?: string };
      err.code = 'timeout';
      reject(err);
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

export async function resolveAdminVerification(params: {
  uid?: string | null;
  email?: string | null;
  emailVerified?: boolean | null;
  projectId?: string;
  databaseId?: string;
  getUnderlyingError?: () => { code?: string; message?: string } | null;
  checkAdminDoc: (uid: string) => Promise<boolean>;
  bootstrapAdminDoc?: (uid: string, email: string) => Promise<void>;
  timeoutMs?: number;
}): Promise<AdminVerificationResult> {
  const {
    uid,
    email,
    emailVerified,
    projectId,
    databaseId,
    getUnderlyingError,
    checkAdminDoc,
    bootstrapAdminDoc,
  } = params;
  const timeoutMs = params.timeoutMs ?? ADMIN_VERIFY_TIMEOUT_MS;

  const baseDiagnostics: AdminVerificationDiagnostics = {
    projectId,
    databaseId: databaseId ?? '(default)',
    uid: uid ?? null,
    email: email ?? null,
    emailVerified: emailVerified ?? null,
  };

  if (!uid) {
    return {
      authorized: false,
      hasAdminDoc: false,
      source: 'none',
      reason: 'unauthenticated',
      errorMessage: 'Sign in with an authorized administrator account.',
      diagnostics: baseDiagnostics,
    };
  }

  if (emailVerified !== true) {
    return {
      authorized: false,
      hasAdminDoc: false,
      source: 'none',
      reason: 'email_unverified',
      errorMessage:
        'Your administrator email is not verified yet. Verify your email address and sign in again.',
      diagnostics: baseDiagnostics,
    };
  }

  let hasAdminDoc = false;
  try {
    hasAdminDoc = await withTimeout(
      checkAdminDoc(uid),
      timeoutMs,
      `Firestore read at admins/${uid} did not respond within ${timeoutMs}ms.`
    );
  } catch (error) {
    const classified = classifyFirestoreAuthError(error, {
      projectId,
      databaseId: databaseId ?? '(default)',
      fallbackUnderlyingError: getUnderlyingError?.() ?? null,
    });
    return {
      authorized: false,
      hasAdminDoc: false,
      source: 'none',
      reason: classified.reason,
      errorMessage: classified.errorMessage,
      diagnostics: {
        ...baseDiagnostics,
        firebaseCode: classified.firebaseCode,
        firebaseMessage: classified.firebaseMessage,
      },
    };
  }

  if (hasAdminDoc) {
    return {
      authorized: true,
      hasAdminDoc: true,
      source: 'admin_doc',
      diagnostics: baseDiagnostics,
    };
  }

  if (isBootstrappedAdminIdentity({ uid, email, emailVerified })) {
    if (bootstrapAdminDoc) {
      try {
        await withTimeout(
          bootstrapAdminDoc(uid, BOOTSTRAPPED_ADMIN_EMAIL),
          timeoutMs,
          `Firestore bootstrap write at admins/${uid} timed out.`
        );
      } catch {
        // Non-fatal: bootstrapped UID + verified email remains authorized and dashboard listeners will surface any write issue.
      }
    }
    return {
      authorized: true,
      hasAdminDoc: false,
      source: 'bootstrapped_identity',
      diagnostics: baseDiagnostics,
    };
  }

  return {
    authorized: false,
    hasAdminDoc: false,
    source: 'none',
    reason: 'unauthorized',
    errorMessage:
      'Access denied. This account is not registered as an authorized administrator.',
    diagnostics: baseDiagnostics,
  };
}
