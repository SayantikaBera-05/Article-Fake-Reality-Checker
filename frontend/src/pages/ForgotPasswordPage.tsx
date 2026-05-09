import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Loader2, AlertCircle, CheckCircle2, Mail } from 'lucide-react';
import { authAPI } from '../services/api';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await authAPI.forgotPassword(email);
      setIsSuccess(true);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as Record<string, unknown>).response === 'object'
      ) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Something went wrong. Please try again.');
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-100 flex items-center justify-center p-6 relative overflow-hidden transition-colors">
      {/* Background styling */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/3 w-[500px] h-[500px] bg-orange-900/15 rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-50 mix-blend-overlay pointer-events-none"></div>
      </div>

      <Link to="/login" className="absolute top-8 left-8 text-gray-600 hover:text-slate-900 dark:hover:text-gray-900 transition flex items-center gap-2 text-sm font-medium z-20">
        <ArrowLeft size={16} />
        Back to Login
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-white/80 /80 backdrop-blur-xl border border-slate-200 dark:border-gray-200/50 rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 transition-colors"
      >
        {!isSuccess ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-orange-200 dark:border-orange-800/50">
                <Mail size={28} className="text-orange-500" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-900 mb-2 transition-colors">
                Forgot Password?
              </h1>
              <p className="text-gray-500 dark:text-gray-600 text-sm leading-relaxed">
                No worries. Enter the email address associated with your account and we'll send you a reset link.
              </p>
            </div>

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
                <label htmlFor="forgot-email" className="text-sm font-medium text-slate-700 dark:text-gray-700 transition-colors">
                  Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                  autoComplete="email"
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-white/50 border border-slate-200 dark:border-gray-200 rounded-xl px-4 py-3 text-slate-900 dark:text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-orange-500 dark:focus:border-orange-500 transition-all disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-gray-900 rounded-xl py-3 font-bold hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 dark:text-gray-600 text-sm mt-8">
              Remember your password?{' '}
              <Link to="/login" className="text-slate-900 dark:text-gray-900 font-semibold hover:text-orange-500 transition-colors">
                Sign in
              </Link>
            </p>
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-4"
          >
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200 dark:border-green-800/50">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-900 mb-3 transition-colors">
              Check Your Email
            </h2>
            <p className="text-gray-500 dark:text-gray-600 text-sm leading-relaxed mb-8">
              If an account with <span className="font-semibold text-slate-700 dark:text-gray-800">{email}</span> exists, 
              we've sent a password reset link. The link will expire in 1 hour.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="block w-full bg-slate-100 dark:bg-gray-100 text-slate-900 dark:text-gray-900 font-bold py-3 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition text-center border border-slate-200 dark:border-gray-300"
              >
                Back to Login
              </Link>
              <button
                onClick={() => { setIsSuccess(false); setEmail(''); }}
                className="text-sm text-gray-500 hover:text-slate-700 dark:hover:text-gray-700 transition"
              >
                Didn't receive it? Try again
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
