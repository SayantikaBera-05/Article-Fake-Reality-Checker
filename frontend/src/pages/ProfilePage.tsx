import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon, Mail, Shield, Calendar, Edit3, Save,
  Loader2, AlertCircle, CheckCircle2, Lock, Trash2, X, BarChart3, LogOut, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI, type ProfileData } from '../services/api';

export function ProfilePage() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [isChangingPw, setIsChangingPw] = useState(false);

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Feedback
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadProfile();
  }, [isAuthenticated]); // eslint-disable-line

  const loadProfile = async () => {
    try {
      const res = await userAPI.getProfile();
      setProfile(res.data.data);
      setEditName(res.data.data.user.name);
      setEditBio(res.data.data.user.bio || '');
    } catch { setError('Failed to load profile.'); }
    finally { setIsLoading(false); }
  };

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null); setIsSaving(true);
    try {
      const res = await userAPI.updateProfile({ name: editName, bio: editBio });
      setProfile(p => p ? { ...p, user: res.data.data.user } : p);
      setIsEditing(false);
      setSuccess('Profile updated successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax?.response?.data?.message || 'Failed to update profile.');
    } finally { setIsSaving(false); }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault(); setError(null); setSuccess(null);
    if (newPw.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsChangingPw(true);
    try {
      await userAPI.changePassword(currentPw, newPw);
      setSuccess('Password changed. Previous sessions invalidated.');
      setShowPasswordForm(false); setCurrentPw(''); setNewPw('');
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } };
      setError(ax?.response?.data?.message || 'Failed to change password.');
    } finally { setIsChangingPw(false); }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userAPI.deleteAccount();
      await logout();
      navigate('/');
    } catch { setError('Failed to delete account.'); setIsDeleting(false); }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-100 flex items-center justify-center">
      <Loader2 size={36} className="animate-spin text-orange-500" />
    </div>
  );

  const u = profile?.user || user;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-100 transition-colors">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-orange-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-orange-900/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-8 sm:py-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <Link to="/dashboard" className="text-gray-600 hover:text-slate-900 dark:hover:text-gray-900 transition flex items-center gap-2 mb-4 text-sm font-medium w-fit">
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-gray-900 mb-1">Profile Settings</h1>
              <p className="text-gray-500 dark:text-gray-600 text-sm">Manage your account information and security settings.</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-slate-100 dark:bg-gray-100 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition flex items-center gap-2 border border-slate-200 dark:border-gray-300 hover:border-red-200 dark:hover:border-red-800/50"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </motion.div>

        {/* Feedback */}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl px-4 py-3 flex items-center gap-3">
            <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
            <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
          </motion.div>
        )}
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl px-4 py-3 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={16} /></button>
          </motion.div>
        )}

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white/80 /80 backdrop-blur-xl border border-slate-200 dark:border-gray-200/50 rounded-2xl p-5 sm:p-6 md:p-8 mb-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start justify-between mb-6 gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-gray-900 text-2xl font-bold shadow-lg">
                {u?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-gray-900">{u?.name}</h2>
                <p className="text-gray-500 dark:text-gray-600 text-sm flex items-center gap-1.5 flex-wrap break-all">
                  <Mail size={14} /> {u?.email}
                  {u?.isEmailVerified && <span className="text-green-500 ml-1 flex items-center gap-0.5 text-xs"><CheckCircle2 size={12} /> Verified</span>}
                </p>
              </div>
            </div>
            {!isEditing && (
              <button onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-slate-100 dark:bg-gray-100 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2 border border-slate-200 dark:border-gray-300">
                <Edit3 size={14} /> Edit
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-gray-700 mb-1 block">Name</label>
                <input value={editName} onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/50 border border-slate-200 dark:border-gray-200 rounded-xl px-4 py-3 text-slate-900 dark:text-gray-900 focus:outline-none focus:border-orange-500 transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-gray-700 mb-1 block">Bio</label>
                <textarea value={editBio} onChange={e => setEditBio(e.target.value)} rows={3} maxLength={500}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-slate-50 dark:bg-white/50 border border-slate-200 dark:border-gray-200 rounded-xl px-4 py-3 text-slate-900 dark:text-gray-900 focus:outline-none focus:border-orange-500 transition-all resize-none" />
                <p className="text-xs text-gray-600 mt-1">{editBio.length}/500</p>
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={isSaving}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-gray-900 rounded-xl font-bold text-sm hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2 disabled:opacity-50">
                  {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                </button>
                <button type="button" onClick={() => { setIsEditing(false); setEditName(profile?.user.name || ''); setEditBio(profile?.user.bio || ''); }}
                  className="px-6 py-2.5 bg-slate-100 dark:bg-gray-100 text-slate-700 dark:text-gray-700 rounded-xl font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-gray-300">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <UserIcon size={16} className="text-gray-600" />
                <span className="text-gray-500 dark:text-gray-600 w-20">Bio</span>
                <span className="text-slate-700 dark:text-gray-800">{u?.bio || 'No bio yet.'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Shield size={16} className="text-gray-600" />
                <span className="text-gray-500 dark:text-gray-600 w-20">Role</span>
                <span className="capitalize text-slate-700 dark:text-gray-800">{u?.role}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar size={16} className="text-gray-600" />
                <span className="text-gray-500 dark:text-gray-600 w-20">Joined</span>
                <span className="text-slate-700 dark:text-gray-800">{u?.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Stats Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white/80 /80 backdrop-blur-xl border border-slate-200 dark:border-gray-200/50 rounded-2xl p-6 mb-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 dark:text-gray-900 mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-orange-500" /> Activity</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-white/50 rounded-xl p-4 text-center border border-slate-200 dark:border-gray-200">
              <p className="text-2xl font-bold text-slate-900 dark:text-gray-900">{profile?.stats.totalVerifications || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Total Verifications</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/50 rounded-xl p-4 text-center border border-slate-200 dark:border-gray-200">
              <p className="text-2xl font-bold text-green-500">{u?.isEmailVerified ? 'Yes' : 'No'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Email Verified</p>
            </div>
            <div className="bg-slate-50 dark:bg-white/50 rounded-xl p-4 text-center border border-slate-200 dark:border-gray-200">
              <p className="text-2xl font-bold text-orange-500 capitalize">{u?.role}</p>
              <p className="text-xs text-gray-500 dark:text-gray-600 mt-1">Account Type</p>
            </div>
          </div>
        </motion.div>

        {/* Security Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white/80 /80 backdrop-blur-xl border border-slate-200 dark:border-gray-200/50 rounded-2xl p-6 mb-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-900 dark:text-gray-900 mb-4 flex items-center gap-2"><Lock size={18} className="text-violet-500" /> Security</h3>
          {!showPasswordForm ? (
            <button onClick={() => setShowPasswordForm(true)}
              className="px-5 py-2.5 bg-slate-100 dark:bg-gray-100 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-gray-300">
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-gray-700 mb-1 block">Current Password</label>
                <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} autoComplete="current-password"
                  className="w-full bg-slate-50 dark:bg-white/50 border border-slate-200 dark:border-gray-200 rounded-xl px-4 py-3 text-slate-900 dark:text-gray-900 focus:outline-none focus:border-violet-500 transition-all" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-gray-700 mb-1 block">New Password</label>
                <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password"
                  className="w-full bg-slate-50 dark:bg-white/50 border border-slate-200 dark:border-gray-200 rounded-xl px-4 py-3 text-slate-900 dark:text-gray-900 focus:outline-none focus:border-violet-500 transition-all" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={isChangingPw}
                  className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-amber-600 text-gray-900 rounded-xl font-bold text-sm hover:from-violet-700 hover:to-purple-700 transition-all flex items-center gap-2 disabled:opacity-50">
                  {isChangingPw ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Update
                </button>
                <button type="button" onClick={() => { setShowPasswordForm(false); setCurrentPw(''); setNewPw(''); }}
                  className="px-6 py-2.5 bg-slate-100 dark:bg-gray-100 text-slate-700 dark:text-gray-700 rounded-xl font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-gray-300">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white/80 /80 backdrop-blur-xl border border-red-200 dark:border-red-900/50 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2"><Trash2 size={18} /> Danger Zone</h3>
          <p className="text-gray-500 dark:text-gray-600 text-sm mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
          <button onClick={() => setShowDeleteModal(true)}
            className="px-5 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition">
            Delete Account
          </button>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white  rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-gray-200">
              <h3 className="text-xl font-bold text-slate-900 dark:text-gray-900 mb-3">Delete Account?</h3>
              <p className="text-gray-500 dark:text-gray-600 text-sm mb-6">This will permanently delete your account, all verification history, and reports. This action cannot be reversed.</p>
              <div className="flex gap-3">
                <button onClick={handleDeleteAccount} disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-gray-900 rounded-xl font-bold text-sm hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50">
                  {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Delete
                </button>
                <button onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-gray-100 text-slate-700 dark:text-gray-700 rounded-xl font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-gray-300">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
