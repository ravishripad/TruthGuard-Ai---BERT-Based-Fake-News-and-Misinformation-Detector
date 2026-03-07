import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { predictionAPI, authAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { duration, ease, variants } from '../motion/config';
import { 
  Shield, 
  LogOut, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Loader2, 
  History,
  TrendingUp,
  User,
  Sparkles,
  Clock,
  Target,
  ExternalLink,
  Newspaper,
  Image,
  Upload,
  FileText,
  X,
  Info,
  ChevronDown,
  Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

/* ── Skeleton block ─────────────────────────────────────── */
const Skeleton = ({ className = '' }) => (
  <div className={`skeleton ${className}`} />
);

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [title, setTitle] = useState('');
  const [articleText, setArticleText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);          // null = loading
  const [showHistory, setShowHistory] = useState(false);
  const [analysisTime, setAnalysisTime] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  
  // Image upload states
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'image'
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [extractedText, setExtractedText] = useState(null);
  const fileInputRef = useRef(null);

  // UX: scroll-to-results ref
  const resultsRef = useRef(null);
  // UX: title input ref for focus management
  const titleInputRef = useRef(null);
  // UX: collapsible sections state (desktop expanded, mobile collapsed)
  const [expandedSections, setExpandedSections] = useState({
    reasoning: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
    sources: typeof window !== 'undefined' ? window.innerWidth >= 768 : true,
  });
  // UX: history-prefill flash feedback
  const [justPrefilled, setJustPrefilled] = useState(false);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, []);

  // UX: auto-dismiss errors after 6s
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // UX: scroll to results when they arrive
  useEffect(() => {
    if (result && resultsRef.current) {
      const timer = setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [result]);

  // UX: Ctrl+Enter / Cmd+Enter to analyze
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (inputMode === 'text' && title.length >= 5 && !loading) {
          handleAnalyze();
        } else if (inputMode === 'image' && selectedImage && !loading) {
          handleImageAnalyze();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputMode, title, loading, selectedImage]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await authAPI.getHistory(10);
      setHistory(response.data.predictions || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await authAPI.getStats();
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load stats:', err);
      setStats({ total_checks: 0, real_count: 0, fake_count: 0 });
    }
  };

  const handleAnalyze = async () => {
    if (!title.trim() || title.length < 5) {
      setError('Please enter a title (at least 5 characters)');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);
    const startTime = Date.now();

    try {
      const response = await predictionAPI.predict(title, articleText || null);
      setResult(response.data);
      setAnalysisTime(((Date.now() - startTime) / 1000).toFixed(1));
      loadHistory();
      loadStats();
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }
      setSelectedImage(file);
      setError('');
      setExtractedText(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageAnalyze = async () => {
    if (!selectedImage) {
      setError('Please select an image first');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);
    const startTime = Date.now();

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result.split(',')[1];
        
        try {
          const response = await predictionAPI.imagePredict(base64Data, selectedImage.type);
          setResult(response.data);
          if (response.data.image_extraction) {
            setExtractedText({
              title: response.data.image_extraction.title,
              text: response.data.image_extraction.text
            });
          }
          setAnalysisTime(((Date.now() - startTime) / 1000).toFixed(1));
          loadHistory();
          loadStats();
        } catch (err) {
          setError(err.response?.data?.detail || 'Image analysis failed. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(selectedImage);
    } catch (err) {
      setError('Failed to read image file');
      setLoading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setExtractedText(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  /* Safe prefill from history */
  const handleHistoryPrefill = (item) => {
    setTitle(item.text || '');
    setArticleText('');
    setInputMode('text');
    setResult(null);
    setError('');
    setJustPrefilled(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setJustPrefilled(false);
    }, 150);
  };

  /* UX: switch input mode and clear stale state */
  const handleModeSwitch = (mode) => {
    setInputMode(mode);
    setResult(null);
    setError('');
  };

  /* UX: title validation helper */
  const isTitleValid = title.length >= 5;

  const sampleTexts = [
    { title: "The President announced new climate policies", text: "The new policies will reduce carbon emissions by 50% by 2030, according to official statements." },
    { title: "Scientists discover hot water cures all viral infections", text: "A viral social media post claims drinking hot water instantly cures all viruses." },
    { title: "NASA confirms asteroid will pass by Earth", text: "NASA officials confirmed that the asteroid will pass safely by Earth next month at a distance of 2 million miles." }
  ];

  const COLORS = ['#f87171', '#34d399'];

  const chartData = result ? [
    { name: 'Fake', value: result.probabilities.fake * 100 },
    { name: 'Real', value: result.probabilities.real * 100 }
  ] : [];

  /* ── Framer presets ──────────────────────────────────── */
  const cardMotion = {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: duration.slow, ease: ease.out },
  };

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-x-hidden">
      {/* ── Animated SVG Background ─────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        viewBox="0 0 800 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id="db-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="db-scan" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="transparent" />
            <stop offset="30%"  stopColor="rgba(99,102,241,0.9)" />
            <stop offset="70%"  stopColor="rgba(139,92,246,0.9)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* Large orbit ring 1 — extends well beyond center */}
        <circle cx="400" cy="450" r="320" fill="none" stroke="rgba(99,102,241,0.35)" strokeWidth="1.5" strokeDasharray="8 12">
          <animateTransform attributeName="transform" type="rotate" from="0 400 450" to="360 400 450" dur="18s" repeatCount="indefinite" />
        </circle>
        {/* Node on ring 1 */}
        <circle cx="720" cy="450" r="5" fill="rgba(99,102,241,1)" filter="url(#db-glow)">
          <animateTransform attributeName="transform" type="rotate" from="0 400 450" to="360 400 450" dur="18s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Large orbit ring 2 — counter-clockwise */}
        <circle cx="400" cy="450" r="390" fill="none" stroke="rgba(139,92,246,0.25)" strokeWidth="1" strokeDasharray="5 18">
          <animateTransform attributeName="transform" type="rotate" from="0 400 450" to="-360 400 450" dur="30s" repeatCount="indefinite" />
        </circle>
        {/* Node on ring 2 */}
        <circle cx="790" cy="450" r="4" fill="rgba(139,92,246,1)" filter="url(#db-glow)">
          <animateTransform attributeName="transform" type="rotate" from="-70 400 450" to="290 400 450" dur="30s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
        </circle>

        {/* Center pulsing node */}
        <circle cx="400" cy="450" r="6" fill="rgba(99,102,241,0.9)" filter="url(#db-glow)">
          <animate attributeName="r" values="5;10;5" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite" />
        </circle>

        {/* Corner nodes — top-left */}
        <circle cx="60" cy="70" r="5" fill="rgba(99,102,241,0.9)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" begin="0s" repeatCount="indefinite" />
          <animate attributeName="r" values="4;7;4" dur="3s" begin="0s" repeatCount="indefinite" />
        </circle>
        <circle cx="130" cy="120" r="3" fill="rgba(139,92,246,0.8)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4s" begin="0.5s" repeatCount="indefinite" />
        </circle>

        {/* Corner nodes — top-right */}
        <circle cx="740" cy="60" r="5" fill="rgba(139,92,246,0.9)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3.5s" begin="1s" repeatCount="indefinite" />
          <animate attributeName="r" values="4;7;4" dur="3.5s" begin="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="680" cy="110" r="3" fill="rgba(59,130,246,0.8)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4.5s" begin="0.8s" repeatCount="indefinite" />
        </circle>

        {/* Corner nodes — bottom-left */}
        <circle cx="55" cy="830" r="5" fill="rgba(16,185,129,0.9)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="4s" begin="2s" repeatCount="indefinite" />
          <animate attributeName="r" values="4;7;4" dur="4s" begin="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="120" cy="780" r="3" fill="rgba(99,102,241,0.8)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.3;0.85;0.3" dur="5s" begin="1.2s" repeatCount="indefinite" />
        </circle>

        {/* Corner nodes — bottom-right */}
        <circle cx="745" cy="840" r="5" fill="rgba(139,92,246,0.9)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="3.8s" begin="1.5s" repeatCount="indefinite" />
          <animate attributeName="r" values="4;7;4" dur="3.8s" begin="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="680" cy="790" r="3" fill="rgba(59,130,246,0.8)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.3;0.9;0.3" dur="4.2s" begin="0.6s" repeatCount="indefinite" />
        </circle>

        {/* Mid-edge nodes */}
        <circle cx="30" cy="450" r="4" fill="rgba(99,102,241,0.8)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.35;0.9;0.35" dur="5s" begin="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="770" cy="200" r="4" fill="rgba(139,92,246,0.8)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.35;0.9;0.35" dur="4.5s" begin="0.4s" repeatCount="indefinite" />
        </circle>
        <circle cx="770" cy="700" r="4" fill="rgba(99,102,241,0.8)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.35;0.9;0.35" dur="3.8s" begin="1.8s" repeatCount="indefinite" />
        </circle>
        <circle cx="400" cy="30" r="4" fill="rgba(16,185,129,0.8)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.3;0.85;0.3" dur="5.5s" begin="0.9s" repeatCount="indefinite" />
        </circle>
        <circle cx="400" cy="870" r="4" fill="rgba(99,102,241,0.8)" filter="url(#db-glow)">
          <animate attributeName="opacity" values="0.3;0.85;0.3" dur="4.8s" begin="2.2s" repeatCount="indefinite" />
        </circle>

        {/* Connection lines from center to corners */}
        <line x1="400" y1="450" x2="60" y2="70" stroke="rgba(99,102,241,0.3)" strokeWidth="1">
          <animate attributeName="opacity" values="0.15;0.4;0.15" dur="5s" repeatCount="indefinite" />
        </line>
        <line x1="400" y1="450" x2="740" y2="60" stroke="rgba(139,92,246,0.3)" strokeWidth="1">
          <animate attributeName="opacity" values="0.1;0.35;0.1" dur="6s" begin="1s" repeatCount="indefinite" />
        </line>
        <line x1="400" y1="450" x2="55" y2="830" stroke="rgba(16,185,129,0.25)" strokeWidth="1">
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="7s" begin="2s" repeatCount="indefinite" />
        </line>
        <line x1="400" y1="450" x2="745" y2="840" stroke="rgba(99,102,241,0.25)" strokeWidth="1">
          <animate attributeName="opacity" values="0.1;0.3;0.1" dur="5.5s" begin="0.5s" repeatCount="indefinite" />
        </line>

        {/* Scanning line — sweeps top to bottom */}
        <rect x="0" y="-4" width="800" height="3" fill="url(#db-scan)">
          <animate attributeName="y" values="-10;910" dur="6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.03;0.97;1" dur="6s" repeatCount="indefinite" />
        </rect>
      </svg>

      {/* ── Header ──────────────────────────────── */}
      <header className="sticky top-0 z-40 glass border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-500 to-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:shadow-accent/30 transition-shadow duration-300">
                <Shield className="w-[18px] h-[18px] text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-bold text-white tracking-tight leading-tight">TruthLens</h1>
                <p className="text-[11px] text-dark-400 leading-tight">AI Fact Checker</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                aria-label="Toggle prediction history"
                aria-pressed={showHistory}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  showHistory 
                    ? 'bg-accent/15 text-accent border border-accent/20' 
                    : 'text-dark-400 hover:bg-dark-800/60 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </button>
              
              <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] rounded-xl border border-white/[0.06]">
                <div className="w-7 h-7 bg-gradient-to-br from-cyber-500 to-accent rounded-lg flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-dark-200 hidden sm:inline">{user?.username}</span>
              </div>
              
              <button
                onClick={logout}
                aria-label="Logout from account"
                className="flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Main Content ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Card */}
            <motion.div {...cardMotion} className="glass-card-dim p-6 sm:p-7">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/15 rounded-xl flex items-center justify-center">
                  <Search className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Analyze News</h2>
                  <p className="text-sm text-dark-400">Enter text or upload an image</p>
                </div>
              </div>

              {/* Input Mode Tabs */}
              <div className="flex gap-1 mb-6 p-1 bg-dark-900/50 rounded-xl border border-white/[0.06]" role="tablist">
                <button
                  onClick={() => handleModeSwitch('text')}
                  role="tab"
                  aria-selected={inputMode === 'text'}
                  aria-label="Switch to text input mode"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    inputMode === 'text'
                      ? 'bg-white/[0.08] text-white shadow-sm border border-accent/20' 
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Text Input
                </button>
                <button
                  onClick={() => handleModeSwitch('image')}
                  role="tab"
                  aria-selected={inputMode === 'image'}
                  aria-label="Switch to image upload mode"
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all ${
                    inputMode === 'image'
                      ? 'bg-white/[0.08] text-white shadow-sm border border-accent/20' 
                      : 'text-dark-400 hover:text-dark-200'
                  }`}
                >
                  <Image className="w-4 h-4" />
                  Image Upload
                </button>
              </div>

              {inputMode === 'text' ? (
                <>
                  {/* Sample Texts */}
                  <div className="mb-4">
                    <p className="text-xs text-dark-400 font-medium mb-2">Try a sample:</p>
                    <div className="flex flex-wrap gap-2">
                      {sampleTexts.map((sample, i) => (
                        <button
                          key={i}
                          onClick={() => { setTitle(sample.title); setArticleText(sample.text); }}
                          className="text-xs px-3 py-1.5 bg-white/[0.04] hover:bg-white/[0.08] rounded-lg text-dark-400 hover:text-accent transition-colors font-medium border border-white/[0.06]"
                        >
                          Sample {i + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-dark-300 mb-2">
                      News Title / Headline *
                      {title.length > 0 && (
                        <span className={`ml-2 text-xs font-normal ${
                          isTitleValid ? 'text-success' : 'text-dark-500'
                        }`}>
          
                        </span>
                      )}
                    </label>
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter the news headline…"
                      aria-required="true"
                      aria-invalid={title.length > 0 && !isTitleValid}
                      className={`input-dark w-full transition-all ${
                        justPrefilled ? 'ring-2 ring-accent/30 border-accent/40' : ''
                      }`}
                    />
                  </div>

                  {/* Article Text Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-dark-300 mb-2">Article Text <span className="text-dark-500 font-normal">(Optional – improves accuracy)</span></label>
                    <textarea
                      value={articleText}
                      onChange={(e) => setArticleText(e.target.value)}
                      placeholder="Paste the full article content for better analysis…"
                      className="input-dark w-full h-32 resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-dark-500">
                      Title: {title.length} chars &middot; Text: {articleText.length} chars
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-dark-600 hidden sm:inline" aria-hidden="true">
                        Ctrl+Enter
                      </span>
                      <motion.button
                        onClick={handleAnalyze}
                        disabled={loading || !isTitleValid}
                        aria-label="Analyze news article"
                        className="btn-primary rounded-full !px-6 !py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        whileTap={{ scale: 0.97 }}
                        animate={justPrefilled ? { scale: [1, 1.05, 1] } : {}}
                        transition={justPrefilled ? { repeat: 2, duration: 0.3 } : {}}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing…
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Analyze
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </>
              ) : (
                /* Image Upload Section */
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  {!imagePreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      role="button"
                      tabIndex={0}
                      aria-label="Upload an image for analysis"
                      onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/[0.08] rounded-2xl p-8 text-center cursor-pointer hover:border-accent/30 hover:bg-accent/5 transition-all duration-300 group"
                    >
                      <Upload className="w-10 h-10 mx-auto text-dark-500 group-hover:text-accent mb-4 transition-colors" />
                      <p className="text-dark-300 mb-1 font-medium text-sm">Click to upload or drag and drop</p>
                      <p className="text-xs text-dark-500">PNG, JPG, WEBP up to 10 MB</p>
                      <p className="text-xs text-dark-600 mt-2">Works great with social media screenshots!</p>
                    </div>
                  ) : (
                    <motion.div
                      className="relative"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: duration.base }}
                    >
                      <img
                        src={imagePreview}
                        alt="Selected news"
                        className="w-full max-h-64 object-contain rounded-2xl border border-dark-700/50"
                      />
                      <button
                        onClick={removeImage}
                        aria-label="Remove selected image"
                        className="absolute top-2 right-2 p-2 bg-danger/90 hover:bg-danger rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </motion.div>
                  )}

                  {extractedText && (
                    <motion.div
                      className="bg-dark-900/50 rounded-xl p-4 border border-white/[0.06]"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h4 className="text-xs font-semibold text-accent mb-2 uppercase tracking-wider">Extracted Content</h4>
                      <p className="text-white font-medium text-sm mb-1">{extractedText.title}</p>
                      {extractedText.text && (
                        <p className="text-dark-400 text-xs line-clamp-3">{extractedText.text}</p>
                      )}
                    </motion.div>
                  )}

                  <motion.button
                    onClick={handleImageAnalyze}
                    disabled={loading || !selectedImage}
                    className="btn-primary w-full rounded-full !px-6 !py-3 text-sm disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                    whileTap={{ scale: 0.97 }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extracting & Analyzing…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Extract & Analyze
                      </>
                    )}
                  </motion.button>
                </div>
              )}

              {/* Error Toast — fixed position, auto-dismisses */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    role="alert"
                    aria-live="assertive"
                    className="fixed top-20 right-5 z-50 max-w-sm bg-dark-900/95 backdrop-blur-xl border border-danger/40 text-danger rounded-2xl p-4 flex items-start gap-3 shadow-lg shadow-danger/10"
                    initial={{ opacity: 0, x: 40, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 40, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span className="flex-1 text-sm">{error}</span>
                    <button
                      onClick={() => setError('')}
                      aria-label="Dismiss error"
                      className="text-danger/60 hover:text-danger transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Results Card ───────────────────────────────── */}
            <AnimatePresence mode="wait">
              {loading && !result && (
                <motion.div
                  key="loading"
                  className="glass-card-dim p-8 flex flex-col items-center gap-4"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                >
                  <div className="w-10 h-10 rounded-full border-[3px] border-dark-700 border-t-accent animate-spin" />
                  <p className="text-sm text-dark-400 font-medium">Analyzing article…</p>
                </motion.div>
              )}

              {/* Empty state — shown before first analysis */}
              {!result && !loading && (
                <motion.div
                  className="glass-card-dim p-8 sm:p-10 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
                    <Zap className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">Ready to Detect</h3>
                  <p className="text-sm text-dark-400 max-w-md mx-auto leading-relaxed">
                    Paste a news headline above and click <span className="text-dark-200 font-medium">Analyze</span> to check if it's real or fake. You can also upload a screenshot.
                  </p>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result"
                  ref={resultsRef}
                  tabIndex={-1}
                  className="glass-card-dim p-6 sm:p-7 focus:outline-none"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: duration.slow, ease: ease.out }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Analysis Result</h2>
                    {analysisTime && (
                      <div className="flex items-center gap-1.5 text-xs text-dark-300 font-medium bg-white/[0.06] px-3 py-1.5 rounded-full border border-white/[0.06]">
                        <Clock className="w-3.5 h-3.5" />
                        {analysisTime}s
                      </div>
                    )}
                  </div>

                  {/* Verdict */}
                  <motion.div
                    className={`p-6 rounded-2xl mb-6 border ${
                      result.is_fake 
                        ? 'bg-danger/10 border-danger/30' 
                        : 'bg-success/10 border-success/30'
                    }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: duration.base, delay: 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      {result.is_fake ? (
                        <div className="p-3 bg-danger/15 rounded-2xl">
                          <AlertTriangle className="w-8 h-8 text-danger" />
                        </div>
                      ) : (
                        <div className="p-3 bg-success/15 rounded-2xl">
                          <CheckCircle className="w-8 h-8 text-success" />
                        </div>
                      )}
                      <div>
                        <h3 className={`text-2xl font-bold ${
                          result.is_fake ? 'text-danger' : 'text-success'
                        }`}>
                          {result.prediction.toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Target className="w-4 h-4 text-dark-400" />
                          <span className="text-sm text-dark-300">
                            Confidence: <span className="text-white font-semibold">{(result.confidence * 100).toFixed(1)}%</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Reasoning — collapsible on mobile */}
                  {result.reasoning && (
                    <motion.div
                      className="rounded-2xl mb-6 bg-dark-900/50 border border-white/[0.06] overflow-hidden"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: duration.base, delay: 0.2 }}
                    >
                      <button
                        onClick={() => setExpandedSections(p => ({ ...p, reasoning: !p.reasoning }))}
                        aria-expanded={expandedSections.reasoning}
                        className="w-full flex items-center justify-between p-5 text-left"
                      >
                        <h4 className="font-medium text-white flex items-center gap-2 text-sm">
                          <Info className="w-4 h-4 text-accent" />
                          Why this classification?
                        </h4>
                        <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform duration-200 ${
                          expandedSections.reasoning ? 'rotate-180' : ''
                        }`} />
                      </button>
                      <AnimatePresence initial={false}>
                        {expandedSections.reasoning && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <p className="text-sm text-dark-300 leading-relaxed px-5 pb-5">{result.reasoning}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                  {/* Chart */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={70}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `${value.toFixed(1)}%`}
                            contentStyle={{ 
                              background: '#1e293b', 
                              border: '1px solid rgba(129,140,248,0.2)',
                              borderRadius: '0.75rem',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              color: '#e2e8f0',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col justify-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 bg-danger rounded-sm" />
                        <span className="text-sm text-dark-400">Fake:</span>
                        <span className="text-sm text-white font-semibold">{(result.probabilities.fake * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-3.5 h-3.5 bg-success rounded-sm" />
                        <span className="text-sm text-dark-400">Real:</span>
                        <span className="text-sm text-white font-semibold">{(result.probabilities.real * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* News Validation & Sources */}
                  {result.news_validation && (
                    <div className="mt-6 space-y-4">
                      <div className="p-4 bg-dark-900/50 rounded-xl border border-white/[0.06]">
                        <h4 className="font-medium text-white mb-2 flex items-center gap-2 text-sm">
                          <Newspaper className="w-4 h-4 text-accent" />
                          Source Validation
                        </h4>
                        <p className="text-sm text-dark-400">
                          Status: <span className="text-accent font-medium">{result.news_validation.verification_status || 'N/A'}</span>
                        </p>
                        {result.news_insight && (
                          <p className="text-xs text-dark-500 mt-2">{result.news_insight}</p>
                        )}
                        {result.news_validation.total_results > 0 && (
                          <p className="text-xs text-accent mt-2 font-medium">
                            Found {result.news_validation.total_results} related articles
                          </p>
                        )}
                      </div>

                      {result.news_validation.articles && result.news_validation.articles.length > 0 && (
                        <div className="bg-dark-900/50 rounded-xl border border-white/[0.06] overflow-hidden">
                          <button
                            onClick={() => setExpandedSections(p => ({ ...p, sources: !p.sources }))}
                            aria-expanded={expandedSections.sources}
                            className="w-full flex items-center justify-between p-4 text-left"
                          >
                            <h4 className="font-medium text-white flex items-center gap-2 text-sm">
                              <ExternalLink className="w-4 h-4 text-accent" />
                              Related Sources
                              <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">
                                {result.news_validation.articles.length}
                              </span>
                            </h4>
                            <ChevronDown className={`w-4 h-4 text-dark-400 transition-transform duration-200 ${
                              expandedSections.sources ? 'rotate-180' : ''
                            }`} />
                          </button>
                          <AnimatePresence initial={false}>
                            {expandedSections.sources && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="px-4 pb-4"
                              >
                                <div className="space-y-2.5">
                                  {result.news_validation.articles.map((article, index) => (
                                    <a
                                      key={index}
                                      href={article.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      aria-label={`Read article: ${article.title} — opens in new tab`}
                                      className="block p-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl border border-white/[0.06] hover:border-accent/20 transition-all duration-200 group"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                          <h5 className="text-sm font-medium text-dark-200 group-hover:text-accent transition-colors line-clamp-2">
                                            {article.title}
                                          </h5>
                                          <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[11px] px-2 py-0.5 bg-accent/10 text-accent rounded-full font-medium">
                                              {article.source}
                                            </span>
                                            {article.published_at && (
                                              <span className="text-[11px] text-dark-500">
                                                {new Date(article.published_at).toLocaleDateString()}
                                              </span>
                                            )}
                                          </div>
                                          {article.description && (
                                            <p className="text-xs text-dark-500 mt-2 line-clamp-2">
                                              {article.description}
                                            </p>
                                          )}
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-dark-500 group-hover:text-accent flex-shrink-0 mt-0.5" aria-hidden="true" />
                                      </div>
                                    </a>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Extraction Info */}
                  {result.image_extraction && (
                    <div className="mt-6 p-4 bg-dark-900/50 rounded-xl border border-white/[0.06]">
                      <h4 className="font-medium text-white mb-3 flex items-center gap-2 text-sm">
                        <Image className="w-4 h-4 text-accent" />
                        Extracted from Image
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-[11px] text-dark-500 uppercase font-semibold tracking-wider">Title:</span>
                          <p className="text-sm text-white mt-0.5">{result.image_extraction.title}</p>
                        </div>
                        {result.image_extraction.text && (
                          <div>
                            <span className="text-[11px] text-dark-500 uppercase font-semibold tracking-wider">Content:</span>
                            <p className="text-sm text-dark-400 mt-0.5 line-clamp-3">{result.image_extraction.text}</p>
                          </div>
                        )}
                        {result.image_extraction.source && (
                          <p className="text-xs text-accent mt-2 font-medium">Source: {result.image_extraction.source}</p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Sidebar ────────────────────────────────────── */}
          <div className="space-y-6">
            {/* Stats Card */}
            <motion.div
              className="glass-card-dim p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.slow, ease: ease.out, delay: 0.1 }}
            >
              <h3 className="text-base font-semibold text-white mb-4">Your Stats</h3>

              {!stats ? (
                /* Skeleton loader */
                <div className="space-y-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-dark-900/40 rounded-xl">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-4 w-10" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-dark-900/40 rounded-xl">
                    <div className="p-2 bg-accent/15 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-dark-400 font-medium">Total Checks</p>
                      <p className="font-semibold text-white">{stats.total_checks}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-dark-900/40 rounded-xl">
                    <div className="p-2 bg-success/15 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-xs text-dark-400 font-medium">Verified Real</p>
                      <p className="font-semibold text-white">{stats.real_count}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-dark-900/40 rounded-xl">
                    <div className="p-2 bg-danger/15 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-danger" />
                    </div>
                    <div>
                      <p className="text-xs text-dark-400 font-medium">Detected Fake</p>
                      <p className="font-semibold text-white">{stats.fake_count}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* History Card */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  className="glass-card-dim p-6"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: duration.base }}
                >
                  <h3 className="text-base font-semibold text-white mb-4">Recent History</h3>

                  {historyLoading ? (
                    <div className="space-y-3">
                      {[1,2,3].map(i => (
                        <div key={i} className="p-3 bg-dark-900/40 rounded-xl space-y-2">
                          <Skeleton className="h-3.5 w-full" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      ))}
                    </div>
                  ) : history.length > 0 ? (
                    <div className="space-y-2.5 max-h-80 overflow-y-auto">
                      {history.slice(0, 10).map((item, i) => (
                        <div 
                          key={i}
                          onClick={() => handleHistoryPrefill(item)}
                          className={`p-3 rounded-xl cursor-pointer transition-colors border ${
                            item.is_fake
                              ? 'bg-danger/10 border-danger/20 hover:bg-danger/20'
                              : 'bg-success/10 border-success/20 hover:bg-success/20'
                          }`}
                        >
                          <p className="text-sm text-dark-200 truncate">{item.text}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              item.is_fake 
                                ? 'bg-danger/15 text-danger border border-danger/30' 
                                : 'bg-success/15 text-success border border-success/30'
                            }`}>
                              {item.prediction}
                            </span>
                            <span className="text-xs text-dark-400 font-medium">
                              {(item.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-dark-500 text-center py-4">No history yet</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tips Card */}
            <motion.div
              className="glass-card-dim p-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: duration.slow, ease: ease.out, delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-warning" />
                <h3 className="text-base font-semibold text-white">Pro Tips</h3>
              </div>
              <ul className="text-sm space-y-2.5 text-dark-400">
                <li className="flex items-start gap-2">
                  <span className="text-accent mt-0.5">•</span>
                  Check the source credibility
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-success mt-0.5">•</span>
                  Look for supporting evidence
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-neon-purple mt-0.5">•</span>
                  Verify with multiple sources
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-warning mt-0.5">•</span>
                  Be wary of sensational headlines
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
