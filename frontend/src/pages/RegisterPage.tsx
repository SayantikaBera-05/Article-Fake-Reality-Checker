import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();

  // ─── Form State ──────────────────────────────────
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Redirect if already authenticated ───────────
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // ─── Form Submission ─────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      // AuthContext stores the token and user — redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as Record<string, unknown>).response === 'object'
      ) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Registration failed. Please try again.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Google OAuth Redirect ───────────────────────
  const handleGoogleSignUp = () => {
    window.location.href = `${API_BASE}/auth/google`;
  };

  // Don't render while auth is hydrating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 relative">
      {/* Global grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.5] mix-blend-overlay pointer-events-none z-0"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-surface/80 backdrop-blur-md border border-gray-300/50 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <h1 className="text-gray-900 text-3xl font-bold mb-2 text-center">Create an Account</h1>
        <p className="text-gray-600 text-sm text-center mb-8">Join Verifi to start fact-checking realities.</p>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-900/20 border border-red-800/50 rounded-xl px-4 py-3 flex items-start gap-3"
          >
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-red-300 text-sm">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              id="register-name"
              type="text" 
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              autoComplete="name"
              className="w-full bg-gray-100/50 border border-gray-300/50 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all disabled:opacity-50"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              id="register-email"
              type="email" 
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
              className="w-full bg-gray-100/50 border border-gray-300/50 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all disabled:opacity-50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              id="register-password"
              type="password" 
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="new-password"
              className="w-full bg-gray-100/50 border border-gray-300/50 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all disabled:opacity-50"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              id="register-confirm-password"
              type="password" 
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="new-password"
              className="w-full bg-gray-100/50 border border-gray-300/50 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF] transition-all disabled:opacity-50"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#00F0FF] text-black font-semibold rounded-full py-3 mt-6 hover:bg-orange-400 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.2)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="flex items-center gap-4 mt-6 mb-6">
          <div className="h-px bg-gray-100 flex-1"></div>
          <span className="text-gray-500 text-xs uppercase tracking-wider font-medium">Or continue with</span>
          <div className="h-px bg-gray-100 flex-1"></div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isSubmitting}
          className="w-full bg-white/5 backdrop-blur-sm border border-white/10 text-gray-900 rounded-full py-3 flex items-center justify-center gap-2 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="mt-8 text-center text-gray-600 text-sm">
          Already have an account? <Link to="/login" className="text-[#00F0FF] hover:underline font-medium">Sign In</Link>
        </div>
      </motion.div>
    </div>
  );
}
