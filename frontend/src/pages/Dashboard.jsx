import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { predictionAPI, authAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  Loader2, 
  CheckCircle,
  Upload,
  X,
  Cpu,
  History as HistoryIcon,
  Shield,
  ChevronRight,
  Menu,
  FileText,
  Scan,
  Terminal
} from 'lucide-react';

// Components
import Sidebar from '../components/dashboard/Sidebar';
import StatCard from '../components/dashboard/StatCard';
import ResultPanel from '../components/dashboard/ResultPanel';
import ThreeBackground from '../components/ThreeBackground';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analysis');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  
  const [title, setTitle] = useState('');
  const [articleText, setArticleText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [analysisTime, setAnalysisTime] = useState(null);
  
  const [inputMode, setInputMode] = useState('text');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    loadStats();
    loadHistory();
    
    if (window.innerWidth < 1280) {
      setIsSidebarCollapsed(true);
    }

    const timer = setTimeout(() => setShowWelcome(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else if (window.innerWidth < 1280) {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (result && resultsRef.current) {
      const timer = setTimeout(() => {
        resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [result]);

  const handleModeSwitch = (mode) => {
    if (mode === inputMode) return;
    setInputMode(mode);
    setResult(null);
    setError('');
  };

  const loadStats = async () => {
    try {
      const response = await authAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setStats({ total_checks: 0, real_count: 0, fake_count: 0 });
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await authAPI.getHistory(20);
      setHistory(response.data.predictions || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!title.trim() || title.length < 5) {
      setError('Minimum 5 characters required.');
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
      loadStats();
      loadHistory();
    } catch (err) {
      setError('Analysis failed. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleImageAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setError('');
    const startTime = Date.now();
    try {
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]);
        reader.readAsDataURL(selectedImage);
      });
      const response = await predictionAPI.imagePredict(base64, selectedImage.type);
      setResult(response.data);
      setAnalysisTime(((Date.now() - startTime) / 1000).toFixed(1));
      loadStats();
      loadHistory();
    } catch (err) {
      setError('Visual analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryPrefill = (item) => {
    setTitle(item.text || '');
    setInputMode('text');
    setActiveTab('analysis');
    setResult(null);
    const mainContainer = document.querySelector('main');
    if (mainContainer) mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="h-screen min-h-[100dvh] bg-pro-bg text-pro-text flex font-sans overflow-hidden relative">
      <ThreeBackground />

      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        closeMobile={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-pro-bg/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.main 
        initial={false}
        animate={{ 
          paddingLeft: isSidebarCollapsed ? (window.innerWidth < 1024 ? 0 : 80) : (window.innerWidth < 1024 ? 0 : 260)
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="flex-1 h-screen lg:h-[100dvh] overflow-y-auto relative z-10 p-4 md:p-8 xl:p-12 w-full custom-scrollbar"
      >
        <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12 pb-24">
          
          {/* Header & Mobile Menu Trigger */}
          <header className="flex items-center justify-between pt-2 lg:pt-0">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-pro-surface border border-pro-border rounded-2xl active:scale-95 transition-transform">
              <Menu className="w-6 h-6 text-pro-blue" />
            </button>
            <div className="flex-1 lg:flex-none text-right lg:text-left">
              <h1 className="text-2xl sm:text-4xl xl:text-5xl font-black tracking-tightest text-pro-text italic">
                {activeTab === 'analysis' ? 'News Analyst' : 'Archive'}
              </h1>
              <p className="text-pro-sub text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-1 sm:mt-2">
                {activeTab === 'analysis' ? 'Neural Workspace' : 'Tactical Records'}
              </p>
            </div>
            
            {/* Context Badge */}
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-pro-surface border border-pro-border rounded-2xl">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-black text-pro-text uppercase tracking-widest">Neural Link Active</span>
            </div>
          </header>

          <AnimatePresence>
            {showWelcome && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-pro-blue/10 border border-pro-blue/20 p-4 sm:p-6 rounded-3xl flex items-center gap-4 sm:gap-5 relative overflow-hidden backdrop-blur-md"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pro-blue/20 flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-pro-blue" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm sm:text-lg font-black text-pro-text uppercase italic truncate">Access Authorized</h3>
                  <p className="text-pro-sub text-xs sm:text-sm font-medium truncate sm:whitespace-normal">Operative <span className="text-pro-blue font-bold">{user?.username}</span> verified.</p>
                </div>
                <button onClick={() => setShowWelcome(false)} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-pro-sub" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'analysis' ? (
              <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 lg:space-y-12">
                
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8">
                  <StatCard label="Total Scans" value={stats?.total_checks || 0} icon={Cpu} color="blue" delay={0.1} />
                  <StatCard label="Verified Real" value={stats?.real_count || 0} icon={CheckCircle} color="green" delay={0.2} />
                  <StatCard label="Fraud Flagged" value={stats?.fake_count || 0} icon={AlertTriangle} color="red" delay={0.3} />
                </div>

                <div className="max-w-4xl mx-auto w-full space-y-8 lg:space-y-12">
                  <motion.div className="pro-card p-6 md:p-10 xl:p-12 relative overflow-hidden">
                    {/* Input Mode Selector */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-3 md:gap-4 mb-4 sm:mb-6">
                      <button 
                        onClick={() => handleModeSwitch('text')}
                        className={`flex-1 p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all text-left flex items-center gap-3 md:gap-4 group active:scale-[0.98] ${inputMode === 'text' ? 'bg-pro-blue/10 border-pro-blue/40 shadow-lg' : 'bg-pro-surface border-pro-border hover:border-pro-sub/30'}`}
                      >
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-colors ${inputMode === 'text' ? 'bg-pro-blue text-white' : 'bg-pro-bg/40 text-pro-sub'}`}>
                          <FileText className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className={`font-black uppercase tracking-widest text-[9px] md:text-[10px] truncate ${inputMode === 'text' ? 'text-pro-blue' : 'text-pro-sub'}`}>Neural Text</h4>
                          <p className="text-[8px] md:text-[9px] font-bold text-pro-sub opacity-60 truncate">Headline Scan</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => handleModeSwitch('image')}
                        className={`flex-1 p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all text-left flex items-center gap-3 md:gap-4 group active:scale-[0.98] ${inputMode === 'image' ? 'bg-pro-blue/10 border-pro-blue/40 shadow-lg' : 'bg-pro-surface border-pro-border hover:border-pro-sub/30'}`}
                      >
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-colors ${inputMode === 'image' ? 'bg-pro-blue text-white' : 'bg-pro-bg/40 text-pro-sub'}`}>
                          <Scan className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className={`font-black uppercase tracking-widest text-[9px] md:text-[10px] truncate ${inputMode === 'image' ? 'text-pro-blue' : 'text-pro-sub'}`}>Visual Evidence</h4>
                          <p className="text-[8px] md:text-[9px] font-bold text-pro-sub opacity-60 truncate">OCR Extraction</p>
                        </div>
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {inputMode === 'text' ? (
                        <motion.div key="text-input" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-6 sm:space-y-8">
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-pro-sub uppercase tracking-[0.3em] ml-1">Protocol: Headline</label>
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && !loading && handleAnalyze()}
                              placeholder="Enter headline..."
                              className="input-pro !bg-pro-bg/40 border-pro-border text-sm sm:text-base font-medium shadow-inner !py-2.5 sm:!py-3.5"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[9px] font-black text-pro-sub uppercase tracking-[0.3em] ml-1">Neural Context</label>
                            <textarea
                              value={articleText}
                              onChange={(e) => setArticleText(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && e.ctrlKey && !loading && handleAnalyze()}
                              placeholder="Paste content for deep scan (Ctrl+Enter to execute)..."
                              className="input-pro h-24 sm:h-28 resize-none !bg-pro-bg/40 border-pro-border text-sm font-medium shadow-inner !py-2.5 sm:!py-3.5"
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="image-input" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                          {!imagePreview ? (
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-pro-border rounded-[1.5rem] sm:rounded-[2.5rem] p-8 sm:p-24 text-center cursor-pointer hover:bg-pro-blue/5 transition-all group"
                            >
                              <Upload className="w-10 sm:w-16 h-10 sm:h-16 mx-auto text-pro-sub group-hover:text-pro-blue mb-4 sm:mb-6" />
                              <p className="text-base sm:text-xl font-black text-pro-text mb-1 uppercase tracking-tightest italic">Load Evidence</p>
                              <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                            </div>
                          ) : (
                            <div className="relative rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden border border-pro-border bg-pro-bg/40 aspect-video flex items-center justify-center p-4 sm:p-8">
                              <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl shadow-2xl" />
                              <button onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="absolute top-4 sm:top-8 right-4 sm:right-8 p-2 sm:p-4 bg-red-500/20 text-red-500 border border-red-500/30 rounded-xl sm:rounded-2xl backdrop-blur-md active:scale-95 transition-transform">
                                <X className="w-5 h-5 sm:w-6 sm:h-6" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-pro-border/50">
                      <motion.button
                        whileTap={!loading && title.length >= 5 ? { scale: 0.98 } : {}}
                        onClick={inputMode === 'text' ? handleAnalyze : handleImageAnalyze}
                        disabled={loading || (inputMode === 'text' && title.length < 5) || (inputMode === 'image' && !selectedImage)}
                        className={`w-full py-4 sm:py-6 rounded-xl sm:rounded-[1.5rem] font-black text-xs sm:text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 sm:gap-4 ${
                          (loading || (inputMode === 'text' && title.length < 5) || (inputMode === 'image' && !selectedImage))
                            ? 'bg-pro-surface border border-pro-border text-pro-sub cursor-not-allowed opacity-40'
                            : 'bg-pro-blue text-white shadow-2xl shadow-pro-blue/30 hover:bg-pro-blue/90 cursor-pointer active:scale-[0.99]'
                        }`}
                      >
                        {loading ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Terminal className="w-5 h-5 sm:w-6 sm:h-6" />}
                        Execute Scan
                      </motion.button>
                    </div>
                  </motion.div>

                  <div ref={resultsRef} className="scroll-mt-10">
                    <ResultPanel result={result} analysisTime={analysisTime} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto w-full pb-12">
                <div className="pro-card p-6 sm:p-12">
                  <div className="flex items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pro-blue/10 rounded-2xl sm:rounded-3xl flex items-center justify-center border border-pro-blue/20"><HistoryIcon className="w-6 h-6 sm:w-8 sm:h-8 text-pro-blue" /></div>
                    <div>
                      <h3 className="text-xl sm:text-3xl font-black uppercase tracking-tightest text-pro-text italic">Neural Archive</h3>
                      <p className="text-pro-sub text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.3em]">Encrypted Tactical Logs</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {historyLoading ? [...Array(5)].map((_, i) => <div key={i} className="h-20 sm:h-28 bg-pro-surface rounded-2xl sm:rounded-[2rem] animate-pulse border border-pro-border" />)
                    : history.length > 0 ? history.map((item, i) => (
                      <div key={i} onClick={() => handleHistoryPrefill(item)} className="group p-5 sm:p-8 bg-pro-surface/40 backdrop-blur-md border border-pro-border/50 rounded-2xl sm:rounded-[2.5rem] hover:border-pro-blue/80 hover:bg-pro-blue/10 hover:shadow-[0_0_30px_rgba(0,113,227,0.15)] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-lg font-bold text-pro-text truncate mb-2 sm:mb-3">{item.text}</p>
                          <div className="flex items-center gap-3 sm:gap-4">
                             <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${item.is_fake ? 'text-red-500 border-red-500/20 bg-red-500/10' : 'text-green-500 border-green-500/20 bg-green-500/10'}`}>{item.prediction}</span>
                             <span className="text-[9px] sm:text-[11px] font-bold text-pro-sub uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-center">
                           <div className="text-right">
                              <p className="text-[8px] sm:text-[10px] font-black text-pro-sub uppercase tracking-widest">Score</p>
                              <p className="text-lg sm:text-xl font-black text-pro-text tracking-tight">{(item.confidence * 100).toFixed(0)}%</p>
                           </div>
                           <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pro-surface border border-pro-border flex items-center justify-center group-hover:bg-pro-blue transition-all group-hover:scale-110"><ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-pro-sub group-hover:text-pro-text" /></div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-20 sm:py-32 opacity-20">
                         <Shield className="w-16 sm:w-24 h-16 sm:h-24 mx-auto mb-6 sm:mb-8 text-pro-sub" />
                         <p className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-pro-sub">Archive Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.main>
    </div>
  );
};

export default Dashboard;
