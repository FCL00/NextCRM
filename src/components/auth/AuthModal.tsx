import React, { useState } from 'react';
import { useCrm } from '../../context/CrmContext';
import { AuthMode } from '../../types/crm';
import { X, Eye, EyeOff, Lock, Mail, User as UserIcon, ArrowRight, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authMode,
    setAuthMode,
    signIn,
    signUp,
    loginAsDemoUser,
    resetPasswordForEmail,
  } = useCrm();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      if (authMode === 'signin') {
        await signIn(email, password);
      } else if (authMode === 'signup') {
        await signUp(name, email, password);
      } else if (authMode === 'forgot-password') {
        const result = await resetPasswordForEmail(email);
        setSuccessMessage(result.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await loginAsDemoUser();
    } catch (err: any) {
      setError(err?.message || 'Failed to login with demo account.');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 md:p-8 shadow-2xl border border-stone-200 relative animate-in zoom-in-95 duration-150">
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 text-stone-400 hover:text-stone-600 p-1.5 rounded-lg transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-base shadow-xs">
              N
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900">NextCRM</span>
          </div>

          {authMode === 'forgot-password' ? (
            <>
              <h2 className="text-2xl font-bold text-stone-900">Reset your password</h2>
              <p className="text-sm text-stone-500 mt-1">
                Enter your account email address and we will send you a secure link to reset your password.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-stone-900">
                {authMode === 'signin' ? 'Welcome back' : 'Create your workspace'}
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                {authMode === 'signin'
                  ? 'Enter your credentials to access your sales pipeline.'
                  : 'Start organizing your contacts, deals, and activities today.'}
              </p>
            </>
          )}
        </div>

        {/* Mode Selector Tabs (only shown on signin/signup) */}
        {authMode !== 'forgot-password' ? (
          <div className="flex p-1 mb-6 bg-stone-100 rounded-lg">
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                authMode === 'signin' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                authMode === 'signup' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Create Account
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to sign in</span>
          </button>
        )}

        {/* Error notification */}
        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {error}
          </div>
        )}

        {/* Success notification */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password reset link sent</span>
            </div>
            <p className="text-emerald-700 leading-relaxed">{successMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Jordan Rivera"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900 placeholder:text-stone-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900 placeholder:text-stone-400"
              />
            </div>
          </div>

          {authMode !== 'forgot-password' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-stone-700">Password</label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => switchMode('forgot-password')}
                    className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 text-sm bg-white border border-stone-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-stone-900 placeholder:text-stone-400"
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
              {authMode === 'signup' && (
                <p className="text-[11px] text-stone-400 mt-1">Minimum 6 characters.</p>
              )}
            </div>
          )}

          {authMode === 'signin' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-stone-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
              />
              <label htmlFor="remember" className="text-xs text-stone-600 cursor-pointer select-none">
                Remember me on this browser
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:opacity-60 rounded-lg transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : authMode === 'forgot-password' ? (
              <>
                <span>Send Reset Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>{authMode === 'signin' ? 'Sign In to Workspace' : 'Get Started Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          {authMode === 'forgot-password' && (
            <button
              type="button"
              onClick={() => switchMode('signin')}
              className="w-full py-2 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
            >
              Remember your password? Sign in
            </button>
          )}
        </form>

        {/* Divider & Demo Login (only on signin/signup) */}
        {authMode !== 'forgot-password' && (
          <>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-stone-400 font-medium">Or try immediately</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors border border-stone-200 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Launch Instant Demo Workspace (Alex Morgan)</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
