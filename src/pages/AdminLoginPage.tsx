import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const {
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
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authReady && adminChecked && user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [authReady, adminChecked, user, isAdmin, navigate]);

  const handleEmailLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    clearAuthError();

    if (!email.trim() || !password) {
      setError('Enter both administrator email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Authentication failed.';
      setError(
        msg.includes('auth/invalid-credential')
          ? 'Invalid email or password, or account not provisioned in Firebase Auth.'
          : msg
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    clearAuthError();
    setSubmitting(true);
    try {
      await signInWithGoogle();
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Google sign-in failed.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetrySession = async () => {
    setError('');
    setSubmitting(true);
    try {
      await retryVerification();
    } finally {
      setSubmitting(false);
    }
  };

  const displayedError = error || authError;

  return (
    <div className="min-h-screen bg-[#080D12] text-[#F4F7F6] flex flex-col justify-between p-6">
      <div className="max-w-md w-full mx-auto pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-[#91A39E] hover:text-[#00D6A3] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Portfolio</span>
        </Link>
      </div>

      <motion.main
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="max-w-md w-full mx-auto my-8 bg-[#111C22] border border-[#26343A] rounded-2xl p-8 space-y-6"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#00D6A3]">
            <Lock className="w-3.5 h-3.5" />
            <span>HAFFAF Admin Access</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#F4F7F6]">
            Administrator Sign In
          </h1>
          <p className="text-sm text-[#91A39E] leading-relaxed">
            Sign in with your authorized administrator credentials to manage
            projects, skills, services, site copy, and visitor messages.
          </p>
        </div>

        <form onSubmit={handleEmailLogin} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <label
              htmlFor="admin-email"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              Email Address
            </label>
            <input
              id="admin-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tehminatanveer91@gmail.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] placeholder:text-[#91A39E]/60 focus:outline-none focus:border-[#00D6A3]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="admin-password"
              className="block text-xs font-medium text-[#F4F7F6]"
            >
              Password
            </label>
            <input
              id="admin-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg bg-[#080D12] border border-[#26343A] text-[#F4F7F6] placeholder:text-[#91A39E]/60 focus:outline-none focus:border-[#00D6A3]"
            />
          </div>

          {displayedError && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/40 text-xs text-rose-200 leading-relaxed space-y-2.5"
            >
              <p>{displayedError}</p>
              {user && !isAdmin && (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleRetrySession}
                    disabled={submitting}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-rose-400/40 text-rose-100 hover:bg-rose-500/20 disabled:opacity-60 transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Retry Verification</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    disabled={submitting}
                    className="inline-flex items-center px-2.5 py-1 rounded border border-[#26343A] text-[#91A39E] hover:text-[#F4F7F6] disabled:opacity-60 transition-colors"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-[#00D6A3] text-[#080D12] hover:bg-[#B5F5E5] disabled:opacity-60 transition-colors"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In with Email</span>
            )}
          </button>
        </form>

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-[#26343A]" />
          <span className="mx-3 text-xs text-[#91A39E]">or</span>
          <div className="flex-grow border-t border-[#26343A]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border border-[#26343A] bg-[#080D12] text-[#F4F7F6] hover:border-[#00D6A3]/60 disabled:opacity-60 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-[#00D6A3]" />
          <span>Sign In with Google (Authorized Admin)</span>
        </button>

        <div className="pt-4 border-t border-[#26343A] text-xs text-[#91A39E] space-y-1.5 leading-relaxed">
          <p className="font-medium text-[#F4F7F6]">
            Administrator Security Policy
          </p>
          <p>
            Public account registration is disabled. Email/Password credentials
            must be enabled and provisioned directly inside Firebase Console
            Authentication, or sign in with your verified administrator Google
            account.
          </p>
        </div>
      </motion.main>

      <div className="max-w-md w-full mx-auto text-center text-xs text-[#91A39E] pb-4">
        HAFFAF | Protected Administration Gateway
      </div>
    </div>
  );
}
