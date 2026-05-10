import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldCheck, AlertTriangle, FileText, Calendar, ArrowLeft, Loader2, Inbox } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fraudAPI, guestAPI, type FraudReport, type VerificationHistoryEntry } from '../services/api';

export function HistoryPage() {
  const { isAuthenticated, isGuest, guestSessionId } = useAuth();

  const [items, setItems] = useState<(FraudReport | VerificationHistoryEntry)[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [isAuthenticated, guestSessionId]); // eslint-disable-line

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (isAuthenticated) {
        const res = await fraudAPI.getReports(1, 20);
        setItems(res.data.data.reports);
      } else if (isGuest && guestSessionId) {
        const res = await guestAPI.getHistory(guestSessionId, 1, 20);
        setItems(res.data.data.history);
      }
    } catch {
      setError('Failed to load history.');
    } finally {
      setIsLoading(false);
    }
  };

  const getVeracity = (item: FraudReport | VerificationHistoryEntry) => {
    const result = 'result' in item ? item.result : null;
    if (!result) return { label: 'Unknown', color: 'text-gray-500', bg: 'bg-slate-500/10', icon: <ShieldCheck size={20} className="text-gray-500" />, confidence: 0 };

    if (result.isFraud) {
      if (result.riskScore >= 80) return { label: 'False', color: 'text-red-500', bg: 'bg-red-500/10', icon: <AlertTriangle size={20} className="text-red-500" />, confidence: result.riskScore };
      return { label: 'Misleading', color: 'text-orange-500', bg: 'bg-orange-500/10', icon: <AlertTriangle size={20} className="text-orange-500" />, confidence: result.riskScore };
    }
    return { label: 'Legitimate', color: 'text-green-500', bg: 'bg-green-500/10', icon: <ShieldCheck size={20} className="text-green-500" />, confidence: 100 - (result.riskScore || 0) };
  };

  const getClaim = (item: FraudReport | VerificationHistoryEntry): string => {
    if ('inputContent' in item) return item.inputContent;
    if ('inputData' in item) return item.inputData.description || JSON.stringify(item.inputData);
    return 'Unknown';
  };

  const getDate = (item: FraudReport | VerificationHistoryEntry): string => {
    return new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-100 flex font-sans overflow-hidden transition-colors">
      
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-50 mix-blend-overlay"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 w-full p-4 sm:p-6 lg:p-12">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <Link to="/dashboard" className="text-gray-600 hover:text-slate-900 dark:hover:text-gray-900 transition flex items-center gap-2 mb-4 text-sm font-medium">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-slate-400">
              Verification History
            </h1>
            <p className="text-gray-500 dark:text-gray-600 mt-2">View your past fact-checking analyses.</p>
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl px-6 py-4 text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        ) : items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 bg-slate-100 dark:bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Inbox size={36} className="text-gray-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-gray-900 mb-2">No verifications yet</h3>
            <p className="text-gray-500 dark:text-gray-600 text-sm mb-6 max-w-md">
              Once you verify articles, claims, or URLs, they'll appear here.
            </p>
            <Link
              to="/verify"
              className="px-6 py-3 bg-primary text-black rounded-xl font-bold hover:bg-orange-400 transition shadow-[0_0_15px_rgba(0,240,255,0.2)]"
            >
              Start Verifying
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.map((item, index) => {
              const veracity = getVeracity(item);
              const claim = getClaim(item);
              const date = getDate(item);
              const id = '_id' in item ? item._id : index;

              return (
                <motion.div 
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white dark:bg-surface/80 backdrop-blur-md border border-slate-200 dark:border-gray-200 rounded-3xl p-6 hover:border-slate-300 dark:hover:border-gray-300 transition-colors shadow-xl flex flex-col h-full group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`px-4 py-1.5 rounded-full flex items-center gap-2 ${veracity.bg} border border-slate-200 dark:border-gray-300/50`}>
                      {veracity.icon}
                      <span className={`text-xs font-bold uppercase tracking-wider ${veracity.color}`}>{veracity.label}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                      <Calendar size={14} />
                      <span>{date}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-lg text-slate-900 dark:text-gray-800 font-medium mb-8 flex-1 leading-relaxed group-hover:text-primary transition-colors line-clamp-3">
                    "{claim}"
                  </h3>
                  
                  <div className="flex justify-between items-end mt-auto pt-6 border-t border-slate-200 dark:border-gray-200 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold mb-1">Confidence</span>
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-200 dark:bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${veracity.confidence}%` }}></div>
                        </div>
                        <span className="font-mono text-slate-900 dark:text-gray-900 text-sm font-bold transition-colors">{veracity.confidence}%</span>
                      </div>
                    </div>
                    
                    <span className="text-primary text-sm font-semibold flex items-center gap-1">
                      View Report
                      <FileText size={16} />
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
