import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Navbar({ isDarkBg = false }: { isDarkBg?: boolean }) {
  const { user, isAuthenticated, isGuest, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const textColor = isDarkBg ? 'text-white' : 'text-slate-900';
  const mutedTextColor = isDarkBg ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-slate-900';

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const closeMobile = () => setMobileOpen(false);

  const navItems = [
    { label: "How it Works", to: "/how-it-works" },
    { label: "History", to: "/history" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Docs", to: "/docs" },
  ];

  return (
    <>
      <nav className="absolute top-6 left-1/2 -translate-x-1/2 z-30 w-[95%] max-w-6xl liquid-glass rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-lg text-xs md:text-sm transition-colors whitespace-nowrap">
        
        {/* Logo — always visible */}
        <div className="flex items-center relative z-10">
           <Link to="/" className={`${textColor} font-bold text-lg sm:text-xl tracking-tight transition-colors`}>Verifi*</Link>
        </div>

        {/* Center Links — hidden on mobile */}
        <div className="hidden md:flex space-x-1 md:space-x-2 lg:space-x-6 items-center justify-center relative z-10">
          {navItems.map(item => (
            <Link 
              to={item.to} 
              key={item.label} 
              className={`relative overflow-hidden water-drop-hover px-3 py-1.5 rounded-full ${mutedTextColor} transition font-medium`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Actions — Desktop */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-3 sm:space-x-4 relative z-10">
          {isAuthenticated && user ? (
            <>
              <Link
                to="/profile"
                className={`flex items-center gap-2 ${mutedTextColor} transition font-medium`}
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

              <button
                onClick={handleLogout}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full ${isDarkBg ? 'text-slate-300 hover:text-red-400' : 'text-gray-500 hover:text-red-500'} transition font-medium`}
                title="Sign out"
              >
                <LogOut size={16} />
              </button>

              <Link to="/verify" className="relative overflow-hidden water-drop-hover text-black bg-primary px-4 sm:px-5 py-2 rounded-full hover:bg-cyan-300 transition font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center">
                Verify Now
              </Link>
            </>
          ) : (
            <>
              {isGuest && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${isDarkBg ? 'bg-amber-500/20 text-amber-200 border-amber-500/30' : 'bg-amber-100 text-amber-700 border-amber-200'} text-xs font-semibold border`}>
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                  Guest Mode
                </span>
              )}
              <Link to="/login" className={`relative overflow-hidden water-drop-hover px-3 py-2 rounded-full ${textColor} transition font-semibold flex items-center justify-center`}>Sign In</Link>
              <Link to="/verify" className="relative overflow-hidden water-drop-hover text-black bg-primary px-4 sm:px-5 py-2 rounded-full hover:bg-cyan-300 transition font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center justify-center">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile CTA + Hamburger */}
        <div className="flex md:hidden items-center gap-2 relative z-10">
          <Link to="/verify" className="text-black bg-primary px-4 py-2 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            Verify
          </Link>
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className={`${textColor} p-1.5 rounded-full transition`}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden" onClick={closeMobile}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          {/* Drawer */}
          <div 
            className="absolute top-0 right-0 w-72 max-w-[85vw] h-full bg-white/95 dark:bg-slate-50/95 backdrop-blur-xl shadow-2xl p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <Link to="/" onClick={closeMobile} className="text-slate-900 font-bold text-xl tracking-tight">Verifi*</Link>
              <button onClick={closeMobile} className="text-slate-500 hover:text-slate-900 p-1">
                <X size={22} />
              </button>
            </div>

            <div className="flex flex-col space-y-1 flex-1">
              {navItems.map(item => (
                <Link 
                  to={item.to} 
                  key={item.label}
                  onClick={closeMobile}
                  className="text-slate-700 hover:text-primary hover:bg-primary/5 px-4 py-3 rounded-xl transition font-medium text-sm"
                >
                  {item.label}
                </Link>
              ))}

              <hr className="border-slate-200 my-4" />

              {isAuthenticated && user ? (
                <>
                  <Link to="/profile" onClick={closeMobile} className="flex items-center gap-3 text-slate-700 hover:text-primary px-4 py-3 rounded-xl transition font-medium text-sm">
                    <UserIcon size={18} />
                    {user.name}
                  </Link>
                  <button
                    onClick={() => { handleLogout(); closeMobile(); }}
                    className="flex items-center gap-3 text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl transition font-medium text-sm text-left"
                  >
                    <LogOut size={18} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobile} className="text-slate-700 hover:text-primary px-4 py-3 rounded-xl transition font-medium text-sm">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={closeMobile} className="text-slate-700 hover:text-primary px-4 py-3 rounded-xl transition font-medium text-sm">
                    Create Account
                  </Link>
                </>
              )}
            </div>

            {isGuest && (
              <div className="mt-auto pt-4 border-t border-slate-200">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                  Guest Mode
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
