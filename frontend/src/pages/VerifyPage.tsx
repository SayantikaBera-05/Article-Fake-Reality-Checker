import { useState, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Link as LinkIcon,
  Image as ImageIcon,
  ArrowLeft,
  UploadCloud,
  Loader2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fraudAPI, type FraudResult } from '../services/api';

type VerifyTab = 'text' | 'url' | 'image';

export function VerifyPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isGuest, guestSessionId, isLoading: authLoading } = useAuth();

  // ─── Input State ─────────────────────────────────
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<VerifyTab>('text');

  // ─── Analysis State ──────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FraudResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Guest mode — no redirect, just show a banner below

  // ─── Submit Text Verification ────────────────────
  const handleTextSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) {
      setError('Please enter text to verify.');
      return;
    }
    await runAnalysis({
      transactionAmount: 1, // minimum required field
      description: textInput.trim(),
      transactionType: 'text_verification',
    });
  };

  // ─── Submit URL Verification ─────────────────────
  const handleUrlSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      setError('Please enter a URL to verify.');
      return;
    }
    // Basic URL validation
    try {
      new URL(urlInput.trim());
    } catch {
      setError('Please enter a valid URL (e.g., https://example.com/article).');
      return;
    }
    await runAnalysis({
      transactionAmount: 1,
      description: `URL verification request: ${urlInput.trim()}`,
      transactionType: 'url_verification',
      merchantName: new URL(urlInput.trim()).hostname,
    });
  };

  // ─── Core Analysis Function ──────────────────────
  const runAnalysis = async (payload: Record<string, unknown>) => {
    setError(null);
    setResult(null);
    setIsAnalyzing(true);

    try {
      const response = await fraudAPI.check({
        ...payload,
        ...(guestSessionId && !isAuthenticated ? { guestSessionId } : {}),
      } as never);
      // The backend stores the full report; we extract the result portion
      setResult(response.data.data.result);
    } catch (err: unknown) {
      if (
        typeof err === 'object' &&
        err !== null &&
        'response' in err
      ) {
        const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
        const status = axiosErr.response?.status;
        const message = axiosErr.response?.data?.message;

        if (status === 401) {
          setError('Your session has expired. Please sign in again.');
          setTimeout(() => navigate('/login', { replace: true }), 2000);
        } else if (status === 503) {
          setError('The detection engine is currently unavailable. Please try again in a few minutes.');
        } else if (status === 502) {
          setError('Failed to communicate with the detection engine. The server may be starting up.');
        } else {
          setError(message || 'Analysis failed. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ─── Get confidence color ────────────────────────
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'Critical': return { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      case 'High': return { text: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
      case 'Medium': return { text: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
      default: return { text: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    }
  };

  // ─── Get risk score color ────────────────────────
  const getRiskScoreColor = (score: number) => {
    if (score >= 85) return 'from-red-600 to-red-400';
    if (score >= 60) return 'from-orange-600 to-orange-400';
    if (score >= 35) return 'from-yellow-600 to-yellow-400';
    return 'from-green-600 to-green-400';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] flex items-center justify-center transition-colors">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1C] flex flex-col p-6 relative overflow-hidden font-sans transition-colors">
      {/* Background styling */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-50 mix-blend-overlay"></div>
      </div>

      <header className="relative z-20 max-w-7xl mx-auto w-full mb-12">
        <Link to="/" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-2 mb-8 w-fit font-medium">
          <ArrowLeft size={18} />
          Back to Home
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Verification Center</h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
          Select a verification method below. Our multimodal engine powered by Gemini will analyze the content and detect any fabrications or misleading claims.
        </p>
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 inline-flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl px-4 py-2.5"
          >
            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
            <span className="text-amber-700 dark:text-amber-300 text-sm">
              You're in guest mode.{' '}
              <Link to="/register" className="font-semibold underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100 transition">Create an account</Link>
              {' '}to save your verification history.
            </span>
          </motion.div>
        )}
      </header>

      <main className="relative z-20 max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Panel 1: Text Verifier */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`bg-white dark:bg-surface/80 backdrop-blur-xl border rounded-3xl p-8 flex flex-col shadow-xl transition-colors group ${
              activeTab === 'text'
                ? 'border-primary/50 dark:border-primary/30 ring-1 ring-primary/20'
                : 'border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/40 rounded-2xl flex items-center justify-center mb-6 border border-blue-200 dark:border-blue-800/50 group-hover:bg-primary/20 transition-colors">
              <FileText size={28} className="text-blue-600 dark:text-blue-400 group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Text Verifier</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 flex-1">
              Analyze claims, news snippets, or social media statements for factual accuracy.
            </p>
            
            <form onSubmit={handleTextSubmit}>
              <textarea 
                id="verify-text-input"
                placeholder="Paste the claim or text here..."
                value={textInput}
                onChange={(e) => { setTextInput(e.target.value); setActiveTab('text'); }}
                onFocus={() => setActiveTab('text')}
                disabled={isAnalyzing}
                className="w-full h-32 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-600 resize-none mb-6 text-sm disabled:opacity-50"
              ></textarea>
              
              <button
                type="submit"
                disabled={isAnalyzing || !textInput.trim()}
                className="w-full bg-slate-800 dark:bg-slate-800 text-white hover:bg-primary hover:text-black rounded-xl py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing && activeTab === 'text' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Submit Text'
                )}
              </button>
            </form>
          </motion.div>

          {/* Panel 2: URL/Link Verifier */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`bg-white dark:bg-surface/80 backdrop-blur-xl border rounded-3xl p-8 flex flex-col shadow-xl transition-colors group ${
              activeTab === 'url'
                ? 'border-primary/50 dark:border-primary/30 ring-1 ring-primary/20'
                : 'border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mb-6 border border-purple-200 dark:border-purple-800/50 group-hover:bg-primary/20 transition-colors">
              <LinkIcon size={28} className="text-purple-600 dark:text-purple-400 group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">URL Verifier</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 flex-1">
              Verify the content of entire webpages and articles by pasting the link.
            </p>
            
            <form onSubmit={handleUrlSubmit}>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon size={16} className="text-slate-400" />
                </div>
                <input 
                  id="verify-url-input"
                  type="url" 
                  placeholder="https://example.com/article"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setActiveTab('url'); }}
                  onFocus={() => setActiveTab('url')}
                  disabled={isAnalyzing}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-600 text-sm disabled:opacity-50"
                />
              </div>
              
              <button
                type="submit"
                disabled={isAnalyzing || !urlInput.trim()}
                className="w-full bg-slate-800 dark:bg-slate-800 text-white hover:bg-primary hover:text-black rounded-xl py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] mt-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAnalyzing && activeTab === 'url' ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Link'
                )}
              </button>
            </form>
          </motion.div>

          {/* Panel 3: Image Verifier */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`bg-white dark:bg-surface/80 backdrop-blur-xl border rounded-3xl p-8 flex flex-col shadow-xl transition-colors group relative overflow-hidden ${
              activeTab === 'image'
                ? 'border-primary/50 dark:border-primary/30 ring-1 ring-primary/20'
                : 'border-slate-200 dark:border-slate-700/50 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {/* Subtle highlight */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mb-6 border border-green-200 dark:border-green-800/50 group-hover:bg-primary/20 transition-colors">
              <ImageIcon size={28} className="text-green-600 dark:text-green-400 group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Image Verifier</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-8 flex-1">
              Detect manipulated visuals, AI generation, and synthetic fabrications.
            </p>
            
            <div
              onClick={() => setActiveTab('image')}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary/50 dark:hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center mb-6 bg-slate-50 dark:bg-slate-900/30 transition-colors cursor-pointer group/drop"
            >
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover/drop:bg-primary/20 transition-colors">
                <UploadCloud size={20} className="text-slate-500 dark:text-slate-400 group-hover/drop:text-primary" />
              </div>
              <p className="text-slate-700 dark:text-slate-300 font-medium text-sm mb-1">Click or drag image to upload</p>
              <p className="text-slate-500 text-xs">PNG, JPG or WEBP (max. 10MB)</p>
            </div>
            
            <button
              type="button"
              disabled
              className="w-full bg-primary/50 text-black/50 rounded-xl py-3 font-bold transition-all duration-300 mt-auto cursor-not-allowed flex items-center justify-center gap-2"
            >
              Coming Soon
            </button>
          </motion.div>

        </div>

        {/* ─── Error Banner ──────────────────────────── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-2xl px-6 py-4 flex items-start gap-4"
            >
              <AlertCircle size={22} className="text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-400 hover:text-red-500 transition">
                <X size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Analysis Results ──────────────────────── */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="mt-10"
            >
              <div className="bg-white dark:bg-[#0F1423] rounded-[2rem] p-8 lg:p-10 border border-slate-200 dark:border-slate-800/50 shadow-2xl transition-colors">
                
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                    {result.isFraud ? (
                      <ShieldAlert size={28} className="text-red-500" />
                    ) : (
                      <ShieldCheck size={28} className="text-green-500" />
                    )}
                    Analysis Results
                  </h2>
                  <button
                    onClick={() => setResult(null)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Risk Score */}
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <h4 className="text-slate-500 dark:text-slate-400 font-medium mb-4 uppercase tracking-wide text-xs">Risk Score</h4>
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50" cy="50" r="40"
                          fill="transparent"
                          stroke="currentColor"
                          className="text-slate-200 dark:text-slate-800"
                          strokeWidth="8"
                        />
                        <motion.circle
                          cx="50" cy="50" r="40"
                          fill="transparent"
                          stroke="url(#riskGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          initial={{ strokeDasharray: "251.2", strokeDashoffset: "251.2" }}
                          animate={{ strokeDashoffset: 251.2 * (1 - result.riskScore / 100) }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                          <linearGradient id="riskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={result.riskScore >= 60 ? '#ef4444' : '#22c55e'} />
                            <stop offset="100%" stopColor={result.riskScore >= 60 ? '#f97316' : '#10b981'} />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`font-mono text-3xl font-bold bg-gradient-to-r ${getRiskScoreColor(result.riskScore)} bg-clip-text text-transparent`}>
                          {result.riskScore}
                        </span>
                        <span className="text-slate-500 text-xs">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Verdict */}
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                    <h4 className="text-slate-500 dark:text-slate-400 font-medium mb-4 uppercase tracking-wide text-xs">Verdict</h4>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${result.isFraud ? 'bg-red-500/10' : 'bg-green-500/10'}`}>
                      {result.isFraud ? (
                        <AlertTriangle size={32} className="text-red-500" />
                      ) : (
                        <CheckCircle2 size={32} className="text-green-500" />
                      )}
                    </div>
                    <div className={`text-2xl font-bold mb-2 ${result.isFraud ? 'text-red-500' : 'text-green-500'}`}>
                      {result.isFraud ? 'Suspicious' : 'Appears Legitimate'}
                    </div>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      (() => { const c = getConfidenceColor(result.confidenceLevel); return `${c.text} ${c.bg} ${c.border}`; })()
                    }`}>
                      {result.confidenceLevel} Confidence
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col">
                    <h4 className="text-slate-500 dark:text-slate-400 font-medium mb-4 uppercase tracking-wide text-xs">Indicators Found</h4>
                    {result.flags.length > 0 ? (
                      <div className="space-y-2 flex-1 overflow-y-auto max-h-48 custom-scrollbar">
                        {result.flags.map((flag, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * i }}
                            className="flex items-start gap-2 text-sm"
                          >
                            <AlertCircle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-700 dark:text-slate-300">{flag}</span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-500 text-sm text-center">No specific indicators detected</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analysis Summary */}
                <div className="mt-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 transition-colors">
                  <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Analysis Summary</h4>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{result.analysisSummary}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
