import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function TopNavBar() {
  const location = useLocation();
  const path = location.pathname;

  const [isDark, setIsDark] = useState(true); // Default to dark mode

  useEffect(() => {
    // Initial check
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const isActive = (route) => path === route;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex justify-center bg-surface/60 backdrop-blur-2xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] transition-colors duration-300">
      <div className="w-full max-w-max_width flex justify-between items-center px-8 h-16">
        <Link to="/" className="text-2xl font-bold tracking-tighter text-primary-fixed-dim drop-shadow-[0_0_8px_rgba(0,219,231,0.5)]">
          TruthLens
        </Link>
        <div className="hidden md:flex gap-6 font-h3 tracking-tight text-sm font-medium">
          <Link to="/" className={`${isActive('/') ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim pb-1' : 'text-on-surface-variant hover:text-on-surface'} hover:bg-black/5 dark:hover:bg-white/5 hover:backdrop-blur-lg transition-all duration-300 active:scale-95 px-2 py-1 rounded`}>Home</Link>
          <Link to="/verify" className={`${isActive('/verify') ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim pb-1' : 'text-on-surface-variant hover:text-on-surface'} hover:bg-black/5 dark:hover:bg-white/5 hover:backdrop-blur-lg transition-all duration-300 active:scale-95 px-2 py-1 rounded`}>Verify</Link>
          <Link to="/dashboard" className={`${isActive('/dashboard') ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim pb-1' : 'text-on-surface-variant hover:text-on-surface'} hover:bg-black/5 dark:hover:bg-white/5 hover:backdrop-blur-lg transition-all duration-300 active:scale-95 px-2 py-1 rounded`}>Dashboard</Link>
          <Link to="/about" className={`${isActive('/about') ? 'text-primary-fixed-dim border-b-2 border-primary-fixed-dim pb-1' : 'text-on-surface-variant hover:text-on-surface'} hover:bg-black/5 dark:hover:bg-white/5 hover:backdrop-blur-lg transition-all duration-300 active:scale-95 px-2 py-1 rounded`}>About</Link>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="text-on-surface-variant hover:text-on-surface transition-colors p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5">
            <span className="material-symbols-outlined">{isDark ? 'light_mode' : 'dark_mode'}</span>
          </button>
          <Link to="/signin" className="hidden md:block font-h3 text-sm text-primary-fixed-dim px-4 py-2 hover:bg-white/5 transition-colors duration-300 rounded">Login</Link>
          <Link to="/signin" className="font-h3 text-sm bg-primary-fixed-dim text-background px-4 py-2 rounded font-medium hover:brightness-110 shadow-[0_0_15px_rgba(0,219,231,0.3)] transition-all duration-300">Sign Up</Link>
        </div>
      </div>
    </nav>
  );
}
