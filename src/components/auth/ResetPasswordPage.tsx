import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCrm } from '../../context/CrmContext';
import { supabase, isSupabaseConfigured } from '../../services/supabase';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { AuthModal } from './AuthModal';
import { ToastContainer } from '../common/ToastContainer';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { updatePassword, openAuthModal, showToast } = useCrm();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasValidSession, setHasValidSession] = useState<boolean | null>(null);
  const [sessionErrorDetails, setSessionErrorDetails] = useState<string | null>(null);

  // Parse recovery link & check Supabase session on load
  useEffect(() => {
    // 1. Check for error parameters in URL hash or search (e.g. expired link)
    const hash = window.location.hash ? window.location.hash.substring(1) : '';
    const search = window.location.search ? window.location.search.substring(1) : '';
    const params = new URLSearchParams(hash || search);

    const errorParam = params.get('error') || params.get('error_code');
    const errorDescription = params.get('error_description');

    if (errorParam || errorDescription) {
      const decodedError = errorDescription
        ? decodeURIComponent(errorDescription.replace(/\+/g, ' '))
        : 'This password reset link has expired or is invalid.';
      setErrorMessage(decodedError);
      setSessionErrorDetails(decodedError);
      setHasValidSession(false);
      return;
    }

    if (!isSupabaseConfigured || !supabase) {
      // Local/offline test mode: allow testing reset form directly
      setHasValidSession(true);
      return;
    }

    // 2. If Supabase is configured, check for recovery session or listen to auth changes
    let isMounted = true;

    async function checkSession() {
      try {
        const { data: { session }, error } = await supabase!.auth.getSession();
        if (error) {
          if (isMounted) {
            setSessionErrorDetails(error.message);
            setHasValidSession(false);
          }
          return;
        }

        // Check if there's an active session or access token in URL
        const hasHashToken = hash.includes('access_token') || hash.includes('type=recovery');
        const hasSearchCode = params.has('code');

        if (session || hasHashToken || hasSearchCode) {
          if (isMounted) setHasValidSession(true);
        } else {
          // No recovery token detected
          if (isMounted) {
            setHasValidSession(false);
            setSessionErrorDetails(
              'No active password recovery session was found. Please request a new reset link.'
            );
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setHasValidSession(false);
          setSessionErrorDetails(err?.message || 'Failed to verify reset session.');
        }
      }
    }

    checkSession();

    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && isMounted)) {
        setHasValidSession(true);
        setErrorMessage(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please ensure both passwords match.');
      return;
    }

    setIsLoading(true);

    try {
      await updatePassword(password);
      setIsSuccess(true);
      showToast('Password updated successfully! You can now sign in.', 'success');
    } catch (err: any) {
      const msg = err?.message || 'Failed to update password. Your reset link may have expired.';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSignIn = () => {
    navigate('/');
    openAuthModal('signin');
  };

  const handleRequestNewLink = () => {
    navigate('/');
    openAuthModal('forgot-password');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col justify-between text-[#242424] font-sans">
      {/* Header bar */}
      <header className="w-full border-b border-stone-200/80 bg-white/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg shadow-xs group-hover:bg-orange-600 transition-colors">
              N
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-stone-900 leading-none">NextCRM</span>
              <span className="text-[11px] text-stone-400 font-medium">Password Recovery</span>
            </div>
          </Link>

          <Link
            to="/"
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-stone-200 relative animate-in fade-in zoom-in-95 duration-200">
          {/* Success State */}
          {isSuccess ? (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Password Reset Complete</h1>
                <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                  Your new password has been securely saved. You can now access your NextCRM workspace with your updated credentials.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleOpenSignIn}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Sign In to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : hasValidSession === false ? (
            /* Invalid or Expired Session State */
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 mx-auto flex items-center justify-center shadow-xs">
                <AlertCircle className="w-8 h-8" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Invalid or Expired Link</h1>
                <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                  {sessionErrorDetails ||
                    'The password reset link has expired or has already been used. Please request a new link to proceed.'}
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  onClick={handleRequestNewLink}
                  className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
                >
                  <span>Request New Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleOpenSignIn}
                  className="w-full py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Return to Sign In
                </button>
              </div>
            </div>
          ) : (
            /* Active Password Reset Form */
            <div>
              <div className="mb-6">
                <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-100 text-orange-600 flex items-center justify-center mb-4">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Set New Password</h1>
                <p className="text-sm text-stone-500 mt-1">
                  Choose a secure password for your NextCRM workspace account.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={password}
                      disabled={isLoading}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900 placeholder:text-stone-400 disabled:bg-stone-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                    <span>Must be at least 6 characters long</span>
                  </p>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      autoComplete="new-password"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      disabled={isLoading}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900 placeholder:text-stone-400 disabled:bg-stone-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Update Password</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6 pt-5 border-t border-stone-100 text-center">
                <button
                  type="button"
                  onClick={handleOpenSignIn}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
                >
                  Remember your password? Sign In
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-stone-200/60 bg-white/50 py-4 px-6 text-center text-xs text-stone-400">
        &copy; {new Date().getFullYear()} NextCRM. All rights reserved.
      </footer>

      {/* Modals & Toasts */}
      <AuthModal />
      <ToastContainer />
    </div>
  );
};
