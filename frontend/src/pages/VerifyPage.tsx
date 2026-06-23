import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react';
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
  Trash2,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { type FraudResult, type FraudCheckPayload, type ImageAnalysisResult, type ImageStreamEvent, imageAPI } from '../services/api';
import { FraudDetection } from '../components';

type VerifyTab = 'text' | 'url' | 'image';

export function VerifyPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isGuest, guestSessionId, isLoading: authLoading } = useAuth();

  // ─── Input State ─────────────────────────────────
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<VerifyTab>('text');

  // ─── Image State ────────────────────────────────
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isImageAnalyzing, setIsImageAnalyzing] = useState(false);
  const [imageResult, setImageResult] = useState<ImageAnalysisResult | null>(null);
  const [imageStages, setImageStages] = useState<{ stage: string; text: string; status: 'waiting' | 'running' | 'done' }[]>([
    { stage: 'EXTRACTING_CONTENT', text: 'Content Extraction', status: 'waiting' },
    { stage: 'SEARCHING_EVIDENCE', text: 'Searching Evidence', status: 'waiting' },
    { stage: 'SCRAPING_SOURCES', text: 'Scraping Sources', status: 'waiting' },
    { stage: 'VERIFYING_REALITY', text: 'Reality Verification', status: 'waiting' },
  ]);

  // ─── Analysis State ──────────────────────────────
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FraudResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [streamPayload, setStreamPayload] = useState<FraudCheckPayload | null>(null);

  // ─── Auto-scroll ref ────────────────────────────
  const resultRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

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

  // ─── Image File Handling ──────────────────────────
  const handleImageSelect = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setError('Please upload a valid image (JPG, PNG, or WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be smaller than 10MB.');
      return;
    }
    setImageFile(file);
    setError(null);
    setImageResult(null);
    setActiveTab('image');
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageSelect(file);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageResult(null);
    if (imageFileInputRef.current) imageFileInputRef.current.value = '';
  };

  // ─── Submit Image Verification ────────────────────
  const handleImageSubmit = async () => {
    if (!imageFile) {
      setError('Please select an image to verify.');
      return;
    }

    setError(null);
    setImageResult(null);
    setIsImageAnalyzing(true);
    setImageStages([
      { stage: 'EXTRACTING_CONTENT', text: 'Content Extraction', status: 'waiting' },
      { stage: 'SEARCHING_EVIDENCE', text: 'Searching Evidence', status: 'waiting' },
      { stage: 'SCRAPING_SOURCES', text: 'Scraping Sources', status: 'waiting' },
      { stage: 'VERIFYING_REALITY', text: 'Reality Verification', status: 'waiting' },
    ]);

    try {
      await imageAPI.checkStream(imageFile, (event: ImageStreamEvent) => {
        if (event.type === 'stage') {
          setImageStages(prev =>
            prev.map(s => {
              if (s.stage === event.stage) return { ...s, text: event.text, status: 'running' };
              // Mark earlier stages as done
              const stageOrder = ['EXTRACTING_CONTENT', 'SEARCHING_EVIDENCE', 'SCRAPING_SOURCES', 'VERIFYING_REALITY'];
              const eventIdx = stageOrder.indexOf(event.stage);
              const sIdx = stageOrder.indexOf(s.stage);
              if (sIdx < eventIdx && s.status === 'running') return { ...s, status: 'done' };
              return s;
            })
          );
        } else if (event.type === 'completed') {
          setImageStages(prev => prev.map(s => ({ ...s, status: 'done' })));
          setImageResult(event.data);
          setIsImageAnalyzing(false);
        } else if (event.type === 'error') {
          setError(event.message);
          setIsImageAnalyzing(false);
        }
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Image analysis failed.';
      setError(msg);
      setIsImageAnalyzing(false);
    }
  };

  // ─── Core Analysis Function (SSE-based) ──────────
  const runAnalysis = async (payload: Record<string, unknown>) => {
    setError(null);
    setResult(null);
    setIsAnalyzing(true);

    // Build the FraudCheckPayload and start the SSE stream
    const fullPayload = {
      ...payload,
      ...(guestSessionId && !isAuthenticated ? { guestSessionId } : {}),
    } as FraudCheckPayload;

    setStreamPayload(fullPayload);
  };

  // ─── SSE Callbacks ───────────────────────────────
  const handleStreamCompleted = useCallback((fraudResult: FraudResult) => {
    setResult(fraudResult);
    setIsAnalyzing(false);
    setStreamPayload(null);
  }, []);

  const handleStreamError = useCallback((message: string) => {
    setError(message || 'Analysis failed. Please try again.');
    setIsAnalyzing(false);
    setStreamPayload(null);
  }, []);

  // ─── Auto-scroll when result or loading appears ──
  useEffect(() => {
    if (result || isAnalyzing || isImageAnalyzing || imageResult) {
      // Small delay to let the DOM render/animate
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    }
  }, [result, isAnalyzing, isImageAnalyzing, imageResult]);

  // ─── Get confidence color ────────────────────────
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'Critical': return { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      case 'High': return { text: 'text-orange-600', bg: 'bg-orange-500/10', border: 'border-orange-500/30' };
      case 'Medium': return { text: 'text-amber-600', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      default: return { text: 'text-green-600', bg: 'bg-green-500/10', border: 'border-green-500/30' };
    }
  };

  // ─── Get risk score color ────────────────────────
  const getRiskScoreColor = (score: number) => {
    if (score >= 85) return 'from-red-600 to-red-500';
    if (score >= 60) return 'from-orange-600 to-orange-500';
    if (score >= 35) return 'from-amber-600 to-amber-500';
    return 'from-green-600 to-green-500';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-100 flex items-center justify-center transition-colors">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-100 flex flex-col p-4 sm:p-6 relative overflow-hidden font-sans transition-colors">
      {/* Background styling */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-orange-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-50 mix-blend-overlay"></div>
      </div>

      <header className="relative z-20 max-w-7xl mx-auto w-full mb-8 sm:mb-12">
        <Link to="/" className="text-gray-500 dark:text-gray-600 hover:text-slate-900 dark:hover:text-gray-900 transition flex items-center gap-2 mb-8 w-fit font-medium">
          <ArrowLeft size={18} />
          Back to Home
        </Link>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-gray-900 mb-3 sm:mb-4">Verification Center</h1>
        <p className="text-slate-600 dark:text-gray-600 text-sm sm:text-lg max-w-2xl">
          Select a verification method below. Our agentic engine powered by OpenRouter AI will analyze the content and detect any fabrications or misleading claims.
        </p>
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 inline-flex items-center gap-3 bg-amber-100 border border-amber-300 rounded-xl px-4 py-2.5"
          >
            <span className="w-2 h-2 bg-amber-600 rounded-full animate-pulse" />
            <span className="text-amber-900 text-sm">
              You're in guest mode.{' '}
              <Link to="/register" className="font-semibold underline underline-offset-2 hover:text-amber-700 transition">Create an account</Link>
              {' '}to save your verification history.
            </span>
          </motion.div>
        )}
      </header>

      <main className="relative z-20 max-w-7xl mx-auto w-full flex-1 flex flex-col">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Panel 1: Text Verifier */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`bg-white dark:bg-surface/80 backdrop-blur-xl border rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col shadow-xl transition-colors group ${
              activeTab === 'text'
                ? 'border-primary/50 dark:border-primary/30 ring-1 ring-primary/20'
                : 'border-slate-200 dark:border-gray-300/50 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="w-14 h-14 bg-blue-100 dark:bg-orange-900/40 rounded-2xl flex items-center justify-center mb-6 border border-blue-200 dark:border-blue-800/50 group-hover:bg-primary/20 transition-colors">
              <FileText size={28} className="text-orange-600 dark:text-orange-400 group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-gray-900 mb-3">Text Verifier</h2>
            <p className="text-slate-600 dark:text-gray-600 text-sm mb-8 flex-1">
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
                className="w-full h-32 bg-slate-50 dark:bg-white/50 border border-slate-200 dark:border-gray-300 text-slate-900 dark:text-gray-900 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-600 resize-none mb-6 text-sm disabled:opacity-50"
              ></textarea>
              
              <button
                type="submit"
                disabled={isAnalyzing || !textInput.trim()}
                className="w-full bg-gray-100 dark:bg-gray-100 text-gray-900 hover:bg-primary hover:text-black rounded-xl py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                : 'border-slate-200 dark:border-gray-300/50 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/40 rounded-2xl flex items-center justify-center mb-6 border border-purple-200 dark:border-purple-800/50 group-hover:bg-primary/20 transition-colors">
              <LinkIcon size={28} className="text-amber-600 group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-gray-900 mb-3">URL Verifier</h2>
            <p className="text-slate-600 dark:text-gray-600 text-sm mb-8 flex-1">
              Verify the content of entire webpages and articles by pasting the link.
            </p>
            
            <form onSubmit={handleUrlSubmit}>
              <div className="relative mb-6">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon size={16} className="text-gray-600" />
                </div>
                <input 
                  id="verify-url-input"
                  type="url" 
                  placeholder="https://example.com/article"
                  value={urlInput}
                  onChange={(e) => { setUrlInput(e.target.value); setActiveTab('url'); }}
                  onFocus={() => setActiveTab('url')}
                  disabled={isAnalyzing}
                  className="w-full bg-slate-50 dark:bg-white/50 border border-slate-200 dark:border-gray-300 text-slate-900 dark:text-gray-900 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-300 placeholder-slate-400 dark:placeholder-slate-600 text-sm disabled:opacity-50"
                />
              </div>
              
              <button
                type="submit"
                disabled={isAnalyzing || !urlInput.trim()}
                className="w-full bg-gray-100 dark:bg-gray-100 text-gray-900 hover:bg-primary hover:text-black rounded-xl py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] mt-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                : 'border-slate-200 dark:border-gray-300/50 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
          >
            {/* Subtle highlight */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

            <div className="w-14 h-14 bg-green-100 dark:bg-green-900/40 rounded-2xl flex items-center justify-center mb-6 border border-green-200 dark:border-green-800/50 group-hover:bg-primary/20 transition-colors">
              <ImageIcon size={28} className="text-green-600 dark:text-green-400 group-hover:text-primary transition-colors" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-gray-900 mb-3">Image Verifier</h2>
            <p className="text-slate-600 dark:text-gray-600 text-sm mb-4 flex-1">
              Verify image authenticity through content extraction and forensic reality analysis.
            </p>
            
            {/* Upload Dropzone / Preview */}
            {!imageFile ? (
              <div
                onClick={() => { setActiveTab('image'); imageFileInputRef.current?.click(); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleImageDrop}
                className="border-2 border-dashed border-slate-300 dark:border-gray-300 hover:border-primary/50 dark:hover:border-primary/50 rounded-2xl p-6 flex flex-col items-center justify-center mb-4 bg-slate-50 dark:bg-white/30 transition-colors cursor-pointer group/drop"
              >
                <input
                  ref={imageFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageSelect(file);
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-gray-100 flex items-center justify-center mb-3 group-hover/drop:bg-primary/20 transition-colors">
                  <UploadCloud size={20} className="text-gray-500 dark:text-gray-600 group-hover/drop:text-primary" />
                </div>
                <p className="text-slate-700 dark:text-gray-700 font-medium text-sm mb-1">Click or drag image to upload</p>
                <p className="text-gray-500 text-xs">PNG, JPG or WEBP (max. 10MB)</p>
              </div>
            ) : (
              <div className="relative border border-slate-200 dark:border-gray-300/50 rounded-2xl p-3 mb-4 bg-slate-50 dark:bg-white/30">
                <button
                  type="button"
                  onClick={handleImageRemove}
                  disabled={isImageAnalyzing}
                  className="absolute top-2 right-2 z-10 w-7 h-7 bg-red-500/90 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-40"
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex items-center gap-3">
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border border-slate-200" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-gray-800 truncate">{imageFile.name}</p>
                    <p className="text-xs text-gray-500">{(imageFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
                </div>
              </div>
            )}


            {/* Submit Button */}
            <button
              type="button"
              onClick={handleImageSubmit}
              disabled={isImageAnalyzing || !imageFile}
              className="w-full bg-gray-100 dark:bg-gray-100 text-gray-900 hover:bg-primary hover:text-black rounded-xl py-3 font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(0,240,255,0.3)] mt-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isImageAnalyzing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze Image'
              )}
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

        {/* ─── SSE Stream Loading ──────────────────────── */}
        <AnimatePresence>
          {isAnalyzing && streamPayload && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="mt-10"
              ref={resultRef}
            >
              <FraudDetection
                payload={streamPayload}
                onCompleted={handleStreamCompleted}
                onError={handleStreamError}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Image Pipeline Stages ─────────────────── */}
        <AnimatePresence>
          {isImageAnalyzing && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="mt-10"
              ref={resultRef}
            >
              <div className="bg-white dark:bg-white rounded-2xl sm:rounded-[2rem] p-6 sm:p-8 border border-slate-200 dark:border-gray-200/50 shadow-2xl">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                  <Loader2 size={22} className="animate-spin text-primary" />
                  Image Analysis Pipeline
                </h3>
                <div className="space-y-4">
                  {imageStages.map((stage, i) => (
                    <motion.div
                      key={stage.stage}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-4"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        stage.status === 'done' ? 'bg-green-100 border border-green-300' :
                        stage.status === 'running' ? 'bg-primary/20 border border-primary/50 animate-pulse' :
                        'bg-gray-100 border border-gray-200'
                      }`}>
                        {stage.status === 'done' ? (
                          <CheckCircle2 size={16} className="text-green-600" />
                        ) : stage.status === 'running' ? (
                          <Loader2 size={16} className="text-primary animate-spin" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          stage.status === 'done' ? 'text-green-700' :
                          stage.status === 'running' ? 'text-slate-900' :
                          'text-gray-400'
                        }`}>
                          {stage.text}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Image Analysis Results ─────────────────── */}
        <AnimatePresence>
          {imageResult && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5 }}
              className="mt-10"
            >
              <div className="bg-white dark:bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 lg:p-10 border border-slate-200 dark:border-gray-200/50 shadow-2xl">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    {imageResult.isFraud ? (
                      <ShieldAlert size={28} className="text-red-500" />
                    ) : (
                      <ShieldCheck size={28} className="text-green-500" />
                    )}
                    Image Analysis Results
                  </h2>
                  <button
                    onClick={() => setImageResult(null)}
                    className="text-gray-600 hover:text-slate-600 transition p-2 rounded-xl hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  
                  {/* Verdict Badge */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <h4 className="text-gray-500 font-medium mb-4 uppercase tracking-wide text-xs">Verdict</h4>
                    <div className={`px-5 py-2.5 rounded-full font-bold text-lg ${
                      imageResult.verdict === 'VERIFIED_REAL' ? 'bg-green-100 text-green-700 border border-green-300' :
                      imageResult.verdict === 'MISLEADING' ? 'bg-orange-100 text-orange-700 border border-orange-300' :
                      'bg-gray-100 text-gray-700 border border-gray-300'
                    }`}>
                      {imageResult.verdict?.replace(/_/g, ' ')}
                    </div>
                    <p className="text-xs text-gray-500 mt-3">Confidence: {imageResult.confidenceLevel}</p>
                  </div>

                  {/* Risk Score */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <h4 className="text-gray-500 font-medium mb-4 uppercase tracking-wide text-xs">Risk Score</h4>
                    <div className={`text-5xl font-mono font-bold ${
                      imageResult.riskScore >= 70 ? 'text-red-500' :
                      imageResult.riskScore >= 40 ? 'text-orange-500' :
                      'text-green-500'
                    }`}>
                      {imageResult.riskScore}
                    </div>
                    <span className="text-gray-500 text-xs mt-1">/100</span>
                  </div>
                </div>

                {/* Flags */}
                {imageResult.flags && imageResult.flags.length > 0 && (
                  <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Detected Flags</h4>
                    <div className="space-y-2">
                      {imageResult.flags.map((flag, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="flex items-start gap-2 text-sm"
                        >
                          <AlertTriangle size={14} className="text-orange-500 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{flag}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Extracted Content */}
                {imageResult.extractedContent && (
                  <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Extracted Content ({imageResult.extractionMethod})
                    </h4>
                    <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{imageResult.extractedContent}</p>
                  </div>
                )}

                {/* Analysis Summary */}
                <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Analysis Summary</h4>
                  <p className="text-slate-800 leading-relaxed">{imageResult.analysisSummary}</p>
                </div>

                {/* Evidence Timeline */}
                {imageResult.evidenceTimeline && imageResult.evidenceTimeline.length > 0 && (
                  <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Evidence Timeline</h4>
                    <ul className="space-y-2">
                      {imageResult.evidenceTimeline.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.08 * i }}
                          className="flex items-start gap-2 text-sm text-slate-700"
                        >
                          <CheckCircle2 size={14} className="text-blue-500 mt-0.5 flex-shrink-0" />
                          <span dangerouslySetInnerHTML={{ __html: item.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-indigo-600 underline">$1</a>') }} />
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sources Consulted */}
                {imageResult.sources && imageResult.sources.length > 0 && (
                  <div className="mt-6 bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Sources Consulted</h4>
                    <div className="space-y-3">
                      {imageResult.sources.map((source, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i }}
                          className="bg-white rounded-xl p-4 border border-slate-200"
                        >
                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 font-medium text-sm hover:underline">
                            {source.title}
                          </a>
                          {source.snippet && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{source.snippet}</p>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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
              <div className="bg-white dark:bg-white rounded-2xl sm:rounded-[2rem] p-5 sm:p-8 lg:p-10 border border-slate-200 dark:border-gray-200/50 shadow-2xl transition-colors">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-3">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-900 flex items-center gap-3">
                    {result.isFraud ? (
                      <ShieldAlert size={28} className="text-red-500" />
                    ) : (
                      <ShieldCheck size={28} className="text-green-500" />
                    )}
                    Analysis Results
                  </h2>
                  <button
                    onClick={() => setResult(null)}
                    className="text-gray-600 hover:text-slate-600 dark:hover:text-gray-900 transition p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-100"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                  
                  {/* Risk Score */}
                  <div className="bg-slate-50 dark:bg-gray-100/30 rounded-2xl p-6 border border-slate-200 dark:border-gray-200 flex flex-col items-center justify-center text-center">
                    <h4 className="text-gray-500 dark:text-gray-600 font-medium mb-4 uppercase tracking-wide text-xs">Risk Score</h4>
                    <div className="relative w-32 h-32 mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50" cy="50" r="40"
                          fill="transparent"
                          stroke="currentColor"
                          className="text-gray-800 dark:text-slate-800"
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
                        <span className="text-gray-500 text-xs">/100</span>
                      </div>
                    </div>
                  </div>

                  {/* Verdict */}
                  <div className="bg-slate-50 dark:bg-gray-100/30 rounded-2xl p-6 border border-slate-200 dark:border-gray-200 flex flex-col items-center justify-center text-center">
                    <h4 className="text-gray-500 dark:text-gray-600 font-medium mb-4 uppercase tracking-wide text-xs">Verdict</h4>
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
                  <div className="bg-slate-50 dark:bg-gray-100/30 rounded-2xl p-6 border border-slate-200 dark:border-gray-200 flex flex-col">
                    <h4 className="text-gray-500 dark:text-gray-600 font-medium mb-4 uppercase tracking-wide text-xs">Indicators Found</h4>
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
                            <span className="text-slate-700 dark:text-gray-700">{flag}</span>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-gray-500 text-sm text-center">No specific indicators detected</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Analysis Summary */}
                <div className="mt-6 bg-slate-50 dark:bg-white/50 rounded-2xl p-6 border border-slate-200 dark:border-gray-200 transition-colors">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-600 uppercase tracking-wider mb-3">Analysis Summary</h4>
                  <p className="text-slate-800 dark:text-gray-800 leading-relaxed">{result.analysisSummary}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
