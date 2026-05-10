import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutDashboard, History, Bookmark, Settings, Zap, Menu, X, ExternalLink, Trash2 } from 'lucide-react';

export function SavedEvidencePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Overview", icon: <LayoutDashboard size={20} />, active: false, to: "/dashboard" },
    { name: "Verification History", icon: <History size={20} />, active: false, to: "/history" },
    { name: "Saved Evidence", icon: <Bookmark size={20} />, active: true, to: "/saved-evidence" },
    { name: "Settings", icon: <Settings size={20} />, active: false, to: "/settings" },
  ];

  const savedItems = [
    { id: 1, title: "NASA Mars Rover Discovery", snippet: "The latest findings from the Perseverance rover confirm...", date: "Oct 12, 2023", stance: "Supports", url: "#" },
    { id: 2, title: "Economic Report 2023", snippet: "Inflation rates have stabilized across major global markets...", date: "Sep 28, 2023", stance: "Refutes", url: "#" },
    { id: 3, title: "Climate Change Study", snippet: "Ocean temperatures have risen by 1.5 degrees on average...", date: "Sep 15, 2023", stance: "Supports", url: "#" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-100 flex font-sans overflow-hidden transition-colors">
      
      {/* Mobile Menu Button */}
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

        <div className="max-w-6xl mx-auto relative z-10 pt-4">
          <header className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-gray-900 mb-2 transition-colors">Saved Evidence</h1>
            <p className="text-gray-500 dark:text-gray-600 text-sm">Your personal library of verified claims and sources.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItems.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-surface border border-slate-200 dark:border-gray-200 rounded-2xl p-6 shadow-xl relative group hover:border-slate-300 dark:hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/50 rounded-xl border border-gray-200 text-primary">
                    <Bookmark size={20} />
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wide ${item.stance === 'Supports' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    {item.stance}
                  </div>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-gray-900 mb-2 line-clamp-2 transition-colors">{item.title}</h3>
                <p className="text-gray-500 dark:text-gray-600 text-sm line-clamp-3 mb-4">{item.snippet}</p>
                
                <div className="flex justify-between items-center text-xs text-gray-600 dark:text-gray-500 mt-auto pt-4 border-t border-slate-200 dark:border-gray-200/50">
                  <span>{item.date}</span>
                  <div className="flex gap-3">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition">
                      <ExternalLink size={16} />
                    </a>
                    <button className="hover:text-red-400 transition">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
