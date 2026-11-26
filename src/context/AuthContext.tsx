import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import {
  ADMIN_VERIFY_TIMEOUT_MS,
  isBootstrappedAdminIdentity,
  withTimeout,
  type AdminVerificationResult,
} from '../lib/adminAuth';
import { verifyAdminAuthorization } from '../services/portfolioService';

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  adminChecked: boolean;
  authError: string;
  clearAuthError: () => void;
  retryVerification: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function isExpiredSessionError(error: unknown): boolean {
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code ?? '').toLowerCase()
      : '';
  return (
    code === 'auth/user-token-expired' ||
    code === 'auth/user-disabled' ||
    code === 'auth/user-not-found' ||
    code === 'auth/invalid-user-token'
  );
}

async function refreshUserSession(targetUser: User): Promise<{
  user: User;
  expired: boolean;
}> {
  const wasVerified = targetUser.emailVerified;
  try {
    await withTimeout(
      targetUser.reload(),
      ADMIN_VERIFY_TIMEOUT_MS,
      'Auth profile refresh timed out.'
    );
    const current = auth.currentUser ?? targetUser;
    if (!wasVerified && current.emailVerified) {
      await withTimeout(
        current.getIdToken(true),
        ADMIN_VERIFY_TIMEOUT_MS,
        'Auth token refresh timed out.'
      );
    }
    return { user: current, expired: false };
  } catch (error) {
    if (isExpiredSessionError(error)) {
      return { user: targetUser, expired: true };
    }
    // Transient network or timeout errors should fall through to Firestore verification rather than locking the UI.
    return { user: auth.currentUser ?? targetUser, expired: false };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminChecked, setAdminChecked] = useState(false);
  const [authError, setAuthError] = useState('');

  const mountedRef = useRef(true);
  const verificationRunRef = useRef(0);
  const signingInRef = useRef(false);

  const clearAuthError = useCallback(() => {
    setAuthError('');
  }, []);

  const verifySessionForUser = useCallback(async (nextUser: User | null) => {
    const runId = ++verificationRunRef.current;

    if (!nextUser) {
      if (mountedRef.current && verificationRunRef.current === runId) {
        setUser(null);
        setIsAdmin(false);
        setAuthError('');
        setAdminChecked(true);
        setAuthReady(true);
      }
      return;
    }

    if (mountedRef.current && verificationRunRef.current === runId) {
      setUser(nextUser);
      setAdminChecked(false);
      setAuthError('');
    }

    try {
      const refreshed = await refreshUserSession(nextUser);
      if (!mountedRef.current || verificationRunRef.current !== runId) return;

      if (refreshed.expired) {
        try {
          await signOut(auth);
        } catch {
          // Ignore signOut cleanup errors on an already-expired session.
        }
        if (mountedRef.current && verificationRunRef.current === runId) {
          setUser(null);
          setIsAdmin(false);
          setAuthError(
            'Your administrator session has expired. Please sign in again.'
          );
        }
        return;
      }

      const activeUser = refreshed.user;
      const result: AdminVerificationResult = await verifyAdminAuthorization(
        activeUser.uid,
        activeUser.email,
        activeUser.emailVerified
      );

      if (!mountedRef.current || verificationRunRef.current !== runId) return;

      if (!result.authorized) {
        console.error('Admin verification failed:', result.diagnostics);
      }

      setUser(activeUser);
      setIsAdmin(result.authorized);
      setAuthError(
        result.authorized
          ? ''
          : result.errorMessage ||
              'Access denied. This account is not registered as an authorized administrator.'
      );
    } catch (error) {
      if (!mountedRef.current || verificationRunRef.current !== runId) return;
      setIsAdmin(false);
      setAuthError(
        error instanceof Error
          ? error.message
          : 'Failed to verify administrator session.'
      );
    } finally {
      if (mountedRef.current && verificationRunRef.current === runId) {
        setAdminChecked(true);
        setAuthReady(true);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      (nextUser) => {
        if (signingInRef.current) {
          return;
        }
        void verifySessionForUser(nextUser);
      },
      (error) => {
        if (!mountedRef.current) return;
        setUser(null);
        setIsAdmin(false);
        setAuthError(
          error instanceof Error
            ? error.message
            : 'Firebase authentication failed to initialize.'
        );
        setAdminChecked(true);
        setAuthReady(true);
      }
    );

    return () => {
      mountedRef.current = false;
      unsubscribe();
    };
  }, [verifySessionForUser]);

  const retryVerification = useCallback(async () => {
    await verifySessionForUser(auth.currentUser);
  }, [verifySessionForUser]);

  const finalizeInteractiveSignIn = useCallback(
    async (
      credentialUser: User,
      options: { sendVerificationIfBootstrappedUnverified: boolean }
    ) => {
      const runId = ++verificationRunRef.current;

      const refreshed = await refreshUserSession(credentialUser);
      if (refreshed.expired) {
        await signOut(auth);
        throw new Error(
          'Your administrator session expired. Please sign in again.'
        );
      }

      const activeUser = refreshed.user;
      const result = await verifyAdminAuthorization(
        activeUser.uid,
        activeUser.email,
        activeUser.emailVerified
      );

      if (!result.authorized) {
        let verificationSent = false;
        if (
          options.sendVerificationIfBootstrappedUnverified &&
          result.reason === 'email_unverified' &&
          isBootstrappedAdminIdentity({
            uid: activeUser.uid,
            email: activeUser.email,
            emailVerified: true,
          })
        ) {
          try {
            await sendEmailVerification(activeUser);
            verificationSent = true;
          } catch {
            verificationSent = false;
          }
        }

        if (
          result.reason === 'unauthorized' ||
          result.reason === 'email_unverified'
        ) {
          await signOut(auth);
          if (mountedRef.current && verificationRunRef.current === runId) {
            setUser(null);
            setIsAdmin(false);
            setAdminChecked(true);
            setAuthReady(true);
          }
          if (result.reason === 'email_unverified') {
            throw new Error(
              verificationSent
                ? 'Your administrator email is not verified yet. A verification link was sent to your inbox — verify it and sign in again (or use Google Sign-In).'
                : 'Your administrator email is not verified yet. Check your inbox for the verification link or sign in with Google.'
            );
          }
          throw new Error(
            result.errorMessage ||
              'Access denied. This account is not registered as an authorized administrator.'
          );
        }

        // Firestore error (permission-denied, database_not_found, network_error, timeout)
        if (mountedRef.current && verificationRunRef.current === runId) {
          setUser(activeUser);
          setIsAdmin(false);
          setAuthError(result.errorMessage || 'Administrator verification failed.');
          setAdminChecked(true);
          setAuthReady(true);
        }
        throw new Error(
          result.errorMessage || 'Administrator verification failed.'
        );
      }

      if (mountedRef.current && verificationRunRef.current === runId) {
        setUser(activeUser);
        setIsAdmin(true);
        setAuthError('');
        setAdminChecked(true);
        setAuthReady(true);
      }
    },
    []
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      signingInRef.current = true;
      setAuthError('');
      try {
        const credential = await signInWithEmailAndPassword(
          auth,
          email.trim(),
          password
        );
        await finalizeInteractiveSignIn(credential.user, {
          sendVerificationIfBootstrappedUnverified: true,
        });
      } finally {
        signingInRef.current = false;
      }
    },
    [finalizeInteractiveSignIn]
  );

  const signInWithGoogle = useCallback(async () => {
    signingInRef.current = true;
    setAuthError('');
    try {
      const credential = await signInWithPopup(auth, googleProvider);
      await finalizeInteractiveSignIn(credential.user, {
        sendVerificationIfBootstrappedUnverified: false,
      });
    } finally {
      signingInRef.current = false;
    }
  }, [finalizeInteractiveSignIn]);

  const logout = useCallback(async () => {
    ++verificationRunRef.current;
    try {
      await signOut(auth);
    } finally {
      if (mountedRef.current) {
        setUser(null);
        setIsAdmin(false);
        setAuthError('');
        setAdminChecked(true);
        setAuthReady(true);
      }
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authReady,
        isAdmin,
        adminChecked,
        authError,
        clearAuthError,
        retryVerification,
        signInWithEmail,
        signInWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
