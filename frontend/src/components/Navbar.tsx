import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-6xl bg-white/80 dark:bg-surface/80 backdrop-blur-md rounded-full px-8 py-3 flex items-center justify-between border border-slate-200 dark:border-slate-700/50 shadow-lg text-xs md:text-sm transition-colors">
      
      {/* Left Side (Logo) */}
      <div className="flex-1 hidden md:flex items-center">
         <Link to="/" className="text-slate-900 dark:text-white font-bold text-xl tracking-tight transition-colors">Verifi*</Link>
      </div>

      {/* Center Links */}
      <div className="flex space-x-6 lg:space-x-8 items-center justify-center whitespace-nowrap overflow-x-auto no-scrollbar">
        {["How it Works", "History", "Dashboard"].map(item => (
          <Link 
            to={item === "How it Works" ? "/how-it-works" : item === "History" ? "/history" : item === "Dashboard" ? "/dashboard" : "/"} 
            key={item} 
            className="relative overflow-hidden water-drop-hover px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition font-medium"
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex-1 flex items-center justify-end space-x-4 sm:space-x-6">
        {isAuthenticated && user ? (
          <>
            {/* User Avatar / Name — links to Profile */}
            <Link
              to="/profile"
              className="hidden sm:flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition font-medium"
              title="View Profile"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <UserIcon size={14} className="text-primary" />
                </div>
              )}
              <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition font-medium"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>

            {/* CTA */}
            <Link to="/verify" className="relative overflow-hidden water-drop-hover text-black bg-primary px-5 py-2.5 rounded-full hover:bg-cyan-300 transition font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] whitespace-nowrap">
              Verify Now
            </Link>
          </>
        ) : (
          <>
            {isGuest && (
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-800/50">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                Guest Mode
              </span>
            )}
            <Link to="/login" className="relative overflow-hidden water-drop-hover px-4 py-2 rounded-full text-slate-600 hover:text-slate-900 dark:text-slate-50 dark:hover:text-white transition font-semibold hidden sm:block">Sign In</Link>
            <Link to="/verify" className="relative overflow-hidden water-drop-hover text-black bg-primary px-5 py-2.5 rounded-full hover:bg-cyan-300 transition font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] whitespace-nowrap">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
