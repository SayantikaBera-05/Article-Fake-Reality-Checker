import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokenAndHydrate } = useAuth();
  const resetToken = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!resetToken) setError('No reset token found. Please request a new password reset link.');
  }, [resetToken]);

  const getStrength = (p: string) => {
    let s = 0;
    if (p.length >= 6) s++; if (p.length >= 10) s++; if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
    if (s <= 1) return { label: 'Weak', color: 'bg-red-500', w: '20%' };
    if (s <= 2) return { label: 'Fair', color: 'bg-orange-500', w: '40%' };
    if (s <= 3) return { label: 'Good', color: 'bg-yellow-500', w: '60%' };
    if (s <= 4) return { label: 'Strong', color: 'bg-green-500', w: '80%' };
    return { label: 'Excellent', color: 'bg-emerald-500', w: '100%' };
  };
  const strength = getStrength(password);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); setError(null);
    if (!resetToken) { setError('No reset token.'); return; }
    if (password.length < 6) { setError('Min 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setIsSubmitting(true);
    try {
      const res = await authAPI.resetPassword(resetToken, password);
      await setTokenAndHydrate(res.data.data.token);
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard', { replace: true }), 2500);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax?.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-100 flex items-center justify-center p-6 relative overflow-hidden transition-colors">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-orange-900/15 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-50 mix-blend-overlay pointer-events-none" />
      </div>
      <Link to="/login" className="absolute top-8 left-8 text-gray-600 hover:text-slate-900 dark:hover:text-gray-900 transition flex items-center gap-2 text-sm font-medium z-20">
        <ArrowLeft size={16} /> Back to Login
      </Link>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 /80 backdrop-blur-xl border border-slate-200 dark:border-gray-200/50 rounded-3xl shadow-2xl p-8 md:p-10 relative z-10 transition-colors">
        {!isSuccess ? (<>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-violet-200 dark:border-violet-800/50">
              <Lock size={28} className="text-violet-500" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-900 mb-2">Set New Password</h1>
            <p className="text-gray-500 dark:text-gray-600 text-sm">Choose a strong password. All sessions will be invalidated.</p>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="reset-pw" className="text-sm font-medium text-slate-700 dark:text-gray-700">New Password</label>
              <div className="relative">
                <input id="reset-pw" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting || !resetToken} autoComplete="new-password"
                  className="w-full bg-slate-50 dark:bg-white/50 border border-slate-200 dark:border-gray-200 rounded-xl px-4 py-3 pr-12 text-slate-900 dark:text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-violet-500 transition-all disabled:opacity-50" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-slate-600 dark:hover:text-gray-700">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password && (
                <div className="space-y-1">
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${strength.color} transition-all duration-500`} style={{ width: strength.w }} />
                  </div>
                  <p className="text-xs font-medium text-gray-500">{strength.label}</p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="reset-confirm" className="text-sm font-medium text-slate-700 dark:text-gray-700">Confirm Password</label>
              <input id="reset-confirm" type="password" placeholder="••••••••" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)} disabled={isSubmitting || !resetToken} autoComplete="new-password"
                className="w-full bg-slate-50 dark:bg-white/50 border border-slate-200 dark:border-gray-200 rounded-xl px-4 py-3 text-slate-900 dark:text-gray-900 placeholder:text-gray-600 focus:outline-none focus:border-violet-500 transition-all disabled:opacity-50" />
              {confirmPassword && password !== confirmPassword && <p className="text-xs text-red-500">Passwords do not match</p>}
              {confirmPassword && password === confirmPassword && confirmPassword.length >= 6 && (
                <p className="text-xs text-green-500 flex items-center gap-1"><CheckCircle2 size={12} /> Passwords match</p>
              )}
            </div>

            <button type="submit" disabled={isSubmitting || !resetToken || password.length < 6 || password !== confirmPassword}
              className="w-full bg-gradient-to-r from-violet-600 to-amber-600 text-gray-900 rounded-xl py-3 font-bold hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Resetting...</> : <><ShieldCheck size={18} /> Reset Password</>}
            </button>
          </form>
          <p className="text-center text-gray-500 dark:text-gray-600 text-sm mt-8">
            Need a new link? <Link to="/forgot-password" className="text-slate-900 dark:text-gray-900 font-semibold hover:text-violet-500 transition-colors">Request again</Link>
          </p>
        </>) : (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200 dark:border-green-800/50">
              <CheckCircle2 size={36} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-900 mb-3">Password Reset!</h2>
            <p className="text-gray-500 dark:text-gray-600 text-sm mb-4">All previous sessions invalidated. Redirecting...</p>
            <Loader2 size={20} className="text-primary animate-spin mx-auto" />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
