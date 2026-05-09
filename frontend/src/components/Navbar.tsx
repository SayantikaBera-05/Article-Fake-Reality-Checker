import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ isDarkBg = false }: { isDarkBg?: boolean }) {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  
  const textColor = isDarkBg ? 'text-white' : 'text-slate-900';
  const mutedTextColor = isDarkBg ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-slate-900';

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <nav className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-6xl liquid-glass rounded-full px-6 py-2.5 flex items-center justify-between shadow-lg text-xs md:text-sm transition-colors whitespace-nowrap">
      
      {/* Left Side (Logo) */}
      <div className="flex-1 hidden md:flex items-center relative z-10">
         <Link to="/" className={`${textColor} font-bold text-xl tracking-tight transition-colors`}>Verifi*</Link>
      </div>

      {/* Center Links */}
      <div className="flex space-x-1 md:space-x-2 lg:space-x-6 items-center justify-center relative z-10">
        {["How it Works", "History", "Dashboard", "Docs"].map(item => (
          <Link 
            to={item === "How it Works" ? "/how-it-works" : item === "History" ? "/history" : item === "Dashboard" ? "/dashboard" : item === "Docs" ? "/docs" : "/"} 
            key={item} 
            className={`relative overflow-hidden water-drop-hover px-3 py-1.5 rounded-full ${mutedTextColor} transition font-medium`}
          >
            {item}
          </Link>
        ))}
      </div>

      {/* Right Actions */}
      <div className="flex-1 flex items-center justify-end space-x-3 sm:space-x-4 relative z-10">
        {isAuthenticated && user ? (
          <>
            {/* User Avatar / Name — links to Profile */}
            <Link
              to="/profile"
              className={`hidden sm:flex items-center gap-2 ${mutedTextColor} transition font-medium`}
              title="View Profile"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full border border-slate-200 dark:border-gray-300" />
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
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full ${isDarkBg ? 'text-slate-300 hover:text-red-400' : 'text-gray-500 hover:text-red-500'} transition font-medium`}
              title="Sign out"
            >
              <LogOut size={16} />
            </button>

            {/* CTA */}
            <Link to="/verify" className="relative overflow-hidden water-drop-hover text-black bg-primary px-5 py-2 rounded-full hover:bg-cyan-300 transition font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center">
              Verify Now
            </Link>
          </>
        ) : (
          <>
            {isGuest && (
              <span className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${isDarkBg ? 'bg-amber-500/20 text-amber-200 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200'} text-xs font-semibold border`}>
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                Guest Mode
              </span>
            )}
            <Link to="/login" className={`relative overflow-hidden water-drop-hover px-3 py-2 rounded-full ${textColor} transition font-semibold hidden sm:flex items-center justify-center`}>Sign In</Link>
            <Link to="/verify" className="relative overflow-hidden water-drop-hover text-black bg-primary px-5 py-2 rounded-full hover:bg-cyan-300 transition font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
