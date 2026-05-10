import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();

  // ─── Form State ──────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Redirect if already authenticated ───────────
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // ─── Show session expired / OAuth error messages ─
  useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      setError('Your session has expired. Please sign in again.');
    }
    if (searchParams.get('error') === 'google_auth_failed') {
      setError('Google sign-in failed. Please try again.');
    }
    if (searchParams.get('error') === 'oauth_failed') {
      setError('OAuth sign-in failed. No token received.');
    }
  }, [searchParams]);

  // ─── Form Submission ─────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      // AuthContext stores the token and user — redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      // Extract error message from Axios response or fall back to generic
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as Record<string, unknown>).response === 'object'
      ) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Login failed. Please check your credentials.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Google OAuth Redirect ───────────────────────
  const handleGoogleSignIn = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  // Don't render while auth is hydrating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-100 flex items-center justify-center transition-colors">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-100 flex items-center justify-center p-6 relative overflow-hidden transition-colors">
      {/* Background styling */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-orange-900/20 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-50 mix-blend-overlay pointer-events-none"></div>
      </div>

      <Link to="/" className="absolute top-8 left-8 text-gray-600 hover:text-slate-900 dark:hover:text-gray-900 transition flex items-center gap-2 text-sm font-medium z-20">
        <ArrowLeft size={16} />
        Back to Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col md:flex-row w-full max-w-5xl bg-white/80 /80 backdrop-blur-xl border border-slate-200 dark:border-gray-200/50 rounded-3xl shadow-2xl overflow-hidden relative z-10 transition-colors"
      >
        {/* Left Panel */}
        <div className="hidden md:flex md:w-5/12 bg-slate-100 dark:bg-white/50 p-12 flex-col justify-between border-r border-slate-200 dark:border-gray-200/50 relative overflow-hidden transition-colors">
          <div className="relative z-10">
            <Link to="/" className="text-slate-900 dark:text-gray-900 font-bold text-3xl tracking-tight mb-8 block transition-colors">Verifi*</Link>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-gray-900 mb-4 transition-colors">Welcome.</h2>
            <p className="text-gray-500 dark:text-gray-600 leading-relaxed">Sign in to access your saved evidence, API keys, and verification history.</p>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-900 mb-8 md:hidden transition-colors">Sign In</h2>
          
          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="login-email" className="text-sm font-medium text-slate-700 dark:text-gray-700 transition-colors">Email Address</label>
              <input 
                id="login-email"
                type="email" 
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                autoComplete="email"
                className="w-full bg-slate-50 dark:bg-white/50 border border-slate-200 dark:border-gray-200 rounded-xl px-4 py-3 text-slate-900 dark:text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-primary transition-all disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label htmlFor="login-password" className="text-sm font-medium text-slate-700 dark:text-gray-700 transition-colors">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:text-cyan-300 transition">Forgot password?</Link>
              </div>
              <input 
                id="login-password"
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                autoComplete="current-password"
                className="w-full bg-slate-50 dark:bg-white/50 border border-slate-200 dark:border-gray-200 rounded-xl px-4 py-3 text-slate-900 dark:text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-primary transition-all disabled:opacity-50"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-black rounded-xl py-3 font-bold hover:bg-orange-400 transition-all shadow-[0_0_15px_rgba(0,240,255,0.2)] hover:shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white  px-4 text-gray-500 transition-colors">Or continue with</span>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="mt-6 w-full bg-slate-100 dark:bg-white text-slate-900 dark:text-gray-900 font-bold py-3.5 rounded-xl hover:bg-slate-200 dark:hover:bg-gray-100 transition flex items-center justify-center gap-3 border border-slate-200 dark:border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-gray-500 dark:text-gray-600 text-sm mt-8">
            Don't have an account? <Link to="/register" className="text-slate-900 dark:text-gray-900 font-semibold hover:text-primary transition-colors">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
