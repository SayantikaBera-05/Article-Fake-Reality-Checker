import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import { LayoutDashboard, History, Bookmark, Settings, Zap, Menu, X, User, PaintBucket } from 'lucide-react';

export function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);

  const navLinks = [
    { name: "Overview", icon: <LayoutDashboard size={20} />, active: false, to: "/dashboard" },
    { name: "Verification History", icon: <History size={20} />, active: false, to: "/history" },
    { name: "Saved Evidence", icon: <Bookmark size={20} />, active: false, to: "/saved-evidence" },
    { name: "Settings", icon: <Settings size={20} />, active: true, to: "/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-100 flex font-sans overflow-hidden transition-colors">
      
      <button 
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 bg-primary text-black p-4 rounded-full shadow-[0_0_20px_rgba(0,240,255,0.3)]"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white/80 dark:bg-surface/50 backdrop-blur-md border-r border-slate-200 dark:border-gray-200/50 flex flex-col transition-transform duration-300 z-40 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-8">
          <Link to="/" className="text-slate-900 dark:text-gray-900 font-bold text-2xl tracking-tight transition-colors">Verifi*</Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${link.active ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'text-gray-600 hover:bg-gray-100/50 hover:text-gray-800 border-l-2 border-transparent'}`}
            >
              {link.icon}
              <span className="font-medium text-sm">{link.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mb-4">
          <div className="bg-white/80 rounded-2xl p-4 border border-gray-200 text-center">
            <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto mb-3">
              <Zap size={20} />
            </div>
            <p className="text-xs text-gray-600 mb-2">Upgrade to Pro for unlimited API credits.</p>
            <button className="w-full text-xs font-bold bg-primary text-black py-2 rounded-lg hover:bg-orange-400 transition shadow-[0_0_10px_rgba(0,240,255,0.2)]">Upgrade Now</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-10 relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.3] mix-blend-overlay pointer-events-none z-0"></div>

        <div className="max-w-4xl mx-auto relative z-10 pt-4">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-900 mb-2 transition-colors">Account Settings</h1>
            <p className="text-gray-500 dark:text-gray-600 text-sm">Manage your profile, preferences, and account security.</p>
          </header>

          <div className="bg-white/80 dark:bg-surface/80 backdrop-blur-xl border border-slate-200 dark:border-gray-200 rounded-3xl p-8 shadow-2xl transition-colors">
            
            {/* Profile Section */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <User className="text-primary" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
              </div>
              <div className="space-y-6 max-w-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
                  <input type="text" defaultValue="Marcus Doe" className="w-full bg-white/50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Email Address</label>
                  <input type="email" defaultValue="marcus@example.com" className="w-full bg-white/50 border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition" />
                </div>
              </div>
            </section>

            <hr className="border-gray-200/50 mb-12" />

            {/* Preferences Section */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <PaintBucket className="text-primary" size={24} />
                <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
              </div>
              
              <div className="space-y-6 max-w-2xl">
                <div className="flex items-center justify-between p-4 bg-white/30 rounded-xl border border-gray-200/50">
                  <div>
                    <h3 className="text-gray-900 font-medium mb-1">Dark Mode</h3>
                    <p className="text-sm text-gray-600">Use the dark theme across the platform.</p>
                  </div>
                  <button 
                    onClick={toggleTheme}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <motion.div 
                      className="w-6 h-6 bg-white rounded-full shadow-md"
                      animate={{ x: theme === 'dark' ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/30 rounded-xl border border-gray-200/50">
                  <div>
                    <h3 className="text-gray-900 font-medium mb-1">Email Notifications</h3>
                    <p className="text-sm text-gray-600">Receive alerts for completed batch verifications.</p>
                  </div>
                  <button 
                    onClick={() => setEmailNotifs(!emailNotifs)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${emailNotifs ? 'bg-primary' : 'bg-slate-700'}`}
                  >
                    <motion.div 
                      className="w-6 h-6 bg-white rounded-full shadow-md"
                      animate={{ x: emailNotifs ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              </div>
            </section>

            <div className="flex justify-end pt-6 border-t border-gray-200/50">
              <button className="bg-primary text-black font-bold px-8 py-3 rounded-xl hover:bg-orange-400 transition shadow-[0_0_20px_rgba(0,240,255,0.2)]">
                Save Changes
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
