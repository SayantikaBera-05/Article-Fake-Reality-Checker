import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, History, Bookmark, Settings, ShieldCheck, AlertTriangle, Brain, Zap, Home, LogOut, ArrowRight, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fraudAPI } from '../services/api';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [stats, setStats] = useState([
    { title: "Total Claims Verified", value: "—", change: "", icon: <ShieldCheck size={24} className="text-primary" />, color: "text-green-400" },
    { title: "Misinformation Detected", value: "—", change: "", icon: <AlertTriangle size={24} className="text-orange-500" />, color: "text-orange-500" },
    { title: "Average Confidence Score", value: "—", change: "", icon: <Brain size={24} className="text-purple-400" />, color: "text-green-400" },
    { title: "Fraud Rate", value: "—", change: "", icon: <Zap size={24} className="text-amber-500" />, color: "text-gray-600" },
  ]);

  const [recentActivity, setRecentActivity] = useState<{claim: string; date: string; veracity: string; color: string; bg: string}[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, reportsRes] = await Promise.all([
        fraudAPI.getStats(),
        fraudAPI.getReports(1, 4),
      ]);

      const s = statsRes.data.data;
      setStats([
        { title: "Total Claims Verified", value: String(s.totalReports), change: "", icon: <ShieldCheck size={24} className="text-primary" />, color: "text-green-400" },
        { title: "Misinformation Detected", value: String(s.fraudulent), change: "", icon: <AlertTriangle size={24} className="text-orange-500" />, color: "text-orange-500" },
        { title: "Average Risk Score", value: `${s.averageRiskScore}%`, change: "", icon: <Brain size={24} className="text-purple-400" />, color: "text-green-400" },
        { title: "Fraud Rate", value: `${s.fraudRate}%`, change: "", icon: <Zap size={24} className="text-amber-500" />, color: "text-gray-600" },
      ]);

      const reports = reportsRes.data.data.reports;
      setRecentActivity(reports.map((r) => {
        const claim = r.inputData?.description || JSON.stringify(r.inputData).slice(0, 60);
        const date = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const isFraud = r.result?.isFraud;
        const score = r.result?.riskScore || 0;
        let veracity = 'Legitimate';
        let color = 'text-green-500';
        let bg = 'bg-green-500/10';
        if (isFraud && score >= 80) { veracity = 'False'; color = 'text-red-500'; bg = 'bg-red-500/10'; }
        else if (isFraud) { veracity = 'Suspicious'; color = 'text-orange-500'; bg = 'bg-orange-500/10'; }
        return { claim, date, veracity, color, bg };
      }));
    } catch {
      // Stats may fail if no reports exist yet — that's OK
    } finally {
      // Done loading
    }
  };

  const navLinks = [
    { name: "Overview", icon: <LayoutDashboard size={20} />, active: true, to: "/dashboard" },
    { name: "Verification History", icon: <History size={20} />, active: false, to: "/history" },
    { name: "Saved Evidence", icon: <Bookmark size={20} />, active: false, to: "/saved-evidence" },
    { name: "Settings", icon: <Settings size={20} />, active: false, to: "/settings" },
  ];

  const chartData = [
    {day: 'Day 1', val: 30},
    {day: 'Day 2', val: 50},
    {day: 'Day 3', val: 20},
    {day: 'Day 4', val: 80},
    {day: 'Day 5', val: 60},
    {day: 'Day 6', val: 90},
    {day: 'Day 7', val: 40}
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
          <button
            onClick={async () => { await logout(); navigate('/', { replace: true }); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-gray-100/80 rounded-xl text-sm font-medium text-slate-600 dark:text-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition border border-slate-200 dark:border-gray-300 hover:border-red-200 dark:hover:border-red-800/50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 relative">
        {/* Background Noise */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.3] mix-blend-overlay pointer-events-none z-0"></div>

        <div className="max-w-6xl mx-auto relative z-10 pt-4">
          <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-gray-900 mb-2">Dashboard Overview</h1>
              <p className="text-gray-500 dark:text-gray-600 text-sm">Welcome back{user ? `, ${user.name.split(' ')[0]}` : ''}. Here's a summary of your activity.</p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-100 rounded-xl text-sm font-medium text-slate-700 dark:text-gray-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition border border-slate-200 dark:border-gray-300 shadow-sm w-fit"
            >
              <Home size={16} />
              Back to Main Page
            </Link>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.title}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-white dark:bg-surface border border-slate-200 dark:border-gray-200 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-300 dark:hover:border-gray-300 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/50 rounded-xl border border-gray-200">
                    {stat.icon}
                  </div>
                </div>
                <h3 className="text-gray-600 text-xs font-semibold uppercase tracking-wider mb-1">{stat.title}</h3>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className={`text-xs font-medium ${stat.color}`}>{stat.change}</div>
                
                {/* Glow effect on hover */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            {/* Main Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-surface border border-slate-200 dark:border-gray-200 rounded-3xl p-8 shadow-xl transition-colors">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-gray-900">Verification Activity</h3>
                <select className="bg-slate-100 dark:bg-white border border-slate-200 dark:border-gray-300 text-slate-600 dark:text-gray-700 text-xs rounded-lg px-3 py-1 outline-none">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              
              {/* Custom CSS Bar Chart */}
              <div className="h-48 flex items-end justify-between gap-1 sm:gap-2 md:gap-4 pt-4">
                {chartData.map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <div className="w-6 sm:w-8 relative flex-1 flex items-end rounded-t-sm overflow-hidden group">
                      <div className="w-6 sm:w-8 bg-slate-100 dark:bg-gray-100/50 absolute inset-0 rounded-t-sm"></div>
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${item.val}%` }}
                        transition={{ duration: 1, delay: 0.5 + i * 0.1, type: "spring" }}
                        className="w-6 sm:w-8 bg-gradient-to-t from-orange-900 to-[#00F0FF] relative z-10 rounded-t-sm shadow-[0_0_15px_rgba(0,240,255,0.2)] group-hover:from-blue-800 group-hover:to-cyan-300 transition-all"
                      ></motion.div>
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{item.day}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Veracity Breakdown */}
            <div className="bg-surface border border-gray-200 rounded-3xl p-8 shadow-xl flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 mb-8">Results Distribution</h3>
              <div className="flex-1 flex flex-col justify-center space-y-6">
                {[
                  { label: "True", value: "35%", color: "bg-green-500", glow: "shadow-[0_0_10px_rgba(34,197,94,0.4)]" },
                  { label: "Misleading", value: "45%", color: "bg-amber-500", glow: "shadow-[0_0_10px_rgba(245,158,11,0.4)]" },
                  { label: "Fake", value: "20%", color: "bg-red-500", glow: "shadow-[0_0_10px_rgba(239,68,68,0.4)]" },
                ].map((item, i) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700 font-medium">{item.label}</span>
                      <span className="font-mono text-gray-600">{item.value}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: item.value }}
                        transition={{ duration: 1, delay: 0.8 + i * 0.2 }}
                        className={`h-full rounded-full ${item.color} ${item.glow}`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Widget */}
          <div className="bg-surface border border-gray-200 rounded-3xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Recent Fact-Checks</h3>
              <Link to="/history" className="text-sm text-primary hover:text-cyan-300 font-semibold transition">View All</Link>
            </div>
            <div className="divide-y divide-slate-800/50">
              {recentActivity.map((item, i) => (
                <div key={i} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-100/20 transition cursor-pointer group">
                  <div className="flex-1">
                    <p className="text-gray-800 font-medium mb-1 truncate max-w-lg group-hover:text-primary transition">"{item.claim}"</p>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <History size={12} />
                      {item.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className={`px-3 py-1 rounded-full border border-gray-300/50 ${item.bg} ${item.color} text-[10px] font-bold uppercase tracking-wider`}>
                      {item.veracity}
                    </div>
                    <Link to="#" className="text-gray-600 hover:text-primary transition p-2 bg-white rounded-lg border border-gray-200">
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
