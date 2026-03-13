import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { predictionAPI, authAPI } from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  AlertTriangle, 
  Loader2, 
  CheckCircle,
  Sparkles,
  Image as ImageIcon,
  Upload,
  X,
  Cpu,
  Zap,
  History as HistoryIcon,
  Shield,
  ChevronRight,
  Menu,
  Layout,
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
    
    // Auto-hide welcome message after 6 seconds
    const timer = setTimeout(() => setShowWelcome(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to results when they appear
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
    <div className="h-screen bg-black text-white flex font-sans overflow-hidden relative">
      
      {/* Cinematic 3D Background */}
      <ThreeBackground />

      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        closeMobile={() => setIsSidebarOpen(false)}
      />

      {/* Overlay for mobile sidebar */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <main className={`flex-1 h-screen overflow-y-auto transition-all duration-500 ease-in-out relative z-10 
        ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'} 
        p-4 sm:p-8 lg:p-10 w-full custom-scrollbar`}
      >
        <div className="max-w-5xl mx-auto space-y-8 lg:space-y-12 pb-24">
          
          {/* Header & Welcome */}
          <header className="space-y-6 pt-4 lg:pt-0">
            <div className="flex items-center justify-between">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-3 bg-pro-surface border border-pro-border rounded-2xl">
                <Menu className="w-6 h-6 text-pro-blue" />
              </button>
              <div className="flex-1 lg:flex-none text-right lg:text-left">
                <h1 className="text-3xl sm:text-5xl font-black tracking-tightest text-white italic">Intelligence</h1>
                <p className="text-pro-sub text-xs sm:text-sm font-bold uppercase tracking-widest mt-2">Neural Workspace</p>
              </div>
              <div className="hidden lg:flex bg-pro-surface p-1 rounded-2xl border border-pro-border">
                <button onClick={() => setActiveTab('analysis')} className={`px-8 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === 'analysis' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-pro-sub hover:text-white'}`}>
                  <Scan className="w-4 h-4" /> Scan
                </button>
                <button onClick={() => setActiveTab('history')} className={`px-8 py-3 rounded-xl transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === 'history' ? 'bg-white text-black shadow-lg shadow-white/10' : 'text-pro-sub hover:text-white'}`}>
                  <HistoryIcon className="w-4 h-4" /> Archive
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showWelcome && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-pro-blue/10 border border-pro-blue/20 p-6 rounded-3xl flex items-center gap-5 relative overflow-hidden backdrop-blur-md"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-20"><Zap className="w-20 h-20 text-pro-blue" /></div>
                  <div className="w-12 h-12 rounded-full bg-pro-blue/20 flex items-center justify-center shrink-0">
                    <Shield className="w-6 h-6 text-pro-blue" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white uppercase italic">Access Authorized</h3>
                    <p className="text-pro-sub text-sm font-medium">Welcome back, operative <span className="text-pro-blue font-bold">{user?.username}</span>.</p>
                  </div>
                  <button onClick={() => setShowWelcome(false)} className="ml-auto p-2 hover:bg-white/5 rounded-xl transition-colors relative z-10">
                    <X className="w-5 h-5 text-pro-sub" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'analysis' ? (
              <motion.div key="analysis" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 lg:space-y-12">
                
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8">
                  <StatCard label="Total Scans" value={stats?.total_checks || 0} icon={Cpu} color="blue" delay={0.1} />
                  <StatCard label="Verified Real" value={stats?.real_count || 0} icon={CheckCircle} color="green" delay={0.2} />
                  <StatCard label="Fraud Flagged" value={stats?.fake_count || 0} icon={AlertTriangle} color="red" delay={0.3} />
                </div>

                <div className="space-y-8">
                  <motion.div className="pro-card p-6 sm:p-12 relative overflow-hidden shadow-2xl bg-black/40 backdrop-blur-xl">
                    <div className="flex flex-col md:flex-row items-stretch gap-6 mb-12">
                      <button 
                        onClick={() => handleModeSwitch('text')}
                        className={`flex-1 p-6 rounded-[2rem] border transition-all text-left flex items-center gap-5 group ${inputMode === 'text' ? 'bg-pro-blue/10 border-pro-blue/40 shadow-lg' : 'bg-pro-surface border-pro-border hover:border-pro-sub/30'}`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${inputMode === 'text' ? 'bg-pro-blue text-white' : 'bg-black/40 text-pro-sub'}`}>
                          <FileText className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className={`font-black uppercase tracking-widest text-xs ${inputMode === 'text' ? 'text-pro-blue' : 'text-pro-sub'}`}>Neural Text</h4>
                          <p className="text-[10px] font-bold text-pro-sub opacity-60">Headline Scan</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => handleModeSwitch('image')}
                        className={`flex-1 p-6 rounded-[2rem] border transition-all text-left flex items-center gap-5 group ${inputMode === 'image' ? 'bg-pro-blue/10 border-pro-blue/40 shadow-lg' : 'bg-pro-surface border-pro-border hover:border-pro-sub/30'}`}
                      >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${inputMode === 'image' ? 'bg-pro-blue text-white' : 'bg-black/40 text-pro-sub'}`}>
                          <Scan className="w-7 h-7" />
                        </div>
                        <div>
                          <h4 className={`font-black uppercase tracking-widest text-xs ${inputMode === 'image' ? 'text-pro-blue' : 'text-pro-sub'}`}>Visual Evidence</h4>
                          <p className="text-[10px] font-bold text-pro-sub opacity-60">OCR Extraction</p>
                        </div>
                      </button>
                    </div>

                    <AnimatePresence mode="wait">
                      {inputMode === 'text' ? (
                        <motion.div key="text-input" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-pro-sub uppercase tracking-[0.3em]">Protocol: Headline</label>
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              placeholder="Enter headline..."
                              className="input-pro !bg-black/40 border-pro-border text-lg font-medium shadow-inner"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-pro-sub uppercase tracking-[0.3em]">Neural Context</label>
                            <textarea
                              value={articleText}
                              onChange={(e) => setArticleText(e.target.value)}
                              placeholder="Paste content for deep scan..."
                              className="input-pro h-40 resize-none !bg-black/40 border-pro-border font-medium shadow-inner"
                            />
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div key="image-input" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                          {!imagePreview ? (
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              className="border-2 border-dashed border-pro-border rounded-[2.5rem] p-16 sm:p-24 text-center cursor-pointer hover:bg-pro-blue/5 transition-all group"
                            >
                              <Upload className="w-16 h-16 mx-auto text-pro-sub group-hover:text-pro-blue mb-6" />
                              <p className="text-xl font-black text-white mb-2 uppercase tracking-tightest italic">Load Visual Evidence</p>
                              <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                            </div>
                          ) : (
                            <div className="relative rounded-[2.5rem] overflow-hidden border border-pro-border bg-black/40 aspect-video flex items-center justify-center p-8">
                              <img src={imagePreview} alt="Preview" className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl" />
                              <button onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="absolute top-8 right-8 p-4 bg-red-500/20 text-red-500 border border-red-500/30 rounded-2xl backdrop-blur-md">
                                <X className="w-6 h-6" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="mt-12 pt-12 border-t border-pro-border/50">
                      <motion.button
                        whileTap={!loading && title.length >= 5 ? { scale: 0.98 } : {}}
                        onClick={inputMode === 'text' ? handleAnalyze : handleImageAnalyze}
                        disabled={loading || (inputMode === 'text' && title.length < 5) || (inputMode === 'image' && !selectedImage)}
                        className={`w-full py-6 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 ${
                          (loading || (inputMode === 'text' && title.length < 5) || (inputMode === 'image' && !selectedImage))
                            ? 'bg-pro-surface border border-pro-border text-pro-sub cursor-not-allowed opacity-40'
                            : 'bg-pro-blue text-white shadow-[0_20px_60px_rgba(0,113,227,0.3)] hover:bg-pro-blue/90 cursor-pointer hover:-translate-y-1'
                        }`}
                      >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Terminal className="w-6 h-6" />}
                        Execute Analysis
                      </motion.button>
                    </div>
                  </motion.div>

                  <div ref={resultsRef} className="scroll-mt-10">
                    <ResultPanel result={result} analysisTime={analysisTime} />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto w-full">
                <div className="pro-card p-8 sm:p-12 shadow-2xl bg-black/40 backdrop-blur-xl">
                  <div className="flex items-center gap-6 mb-12">
                    <div className="w-16 h-16 bg-pro-blue/10 rounded-3xl flex items-center justify-center"><HistoryIcon className="w-8 h-8 text-pro-blue" /></div>
                    <div>
                      <h3 className="text-3xl font-black uppercase tracking-tightest text-white italic">Neural Archive</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-6">
                    {historyLoading ? [...Array(5)].map((_, i) => <div key={i} className="h-28 bg-pro-surface rounded-[2rem] animate-pulse border border-pro-border" />)
                    : history.length > 0 ? history.map((item, i) => (
                      <div key={i} onClick={() => handleHistoryPrefill(item)} className="group p-8 bg-black/40 backdrop-blur-md border border-pro-border rounded-[2.5rem] hover:border-pro-blue/50 hover:bg-pro-blue/5 transition-all cursor-pointer shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex-1 min-w-0">
                          <p className="text-lg font-bold text-white truncate mb-3">{item.text}</p>
                          <div className="flex items-center gap-4">
                             <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border ${item.is_fake ? 'text-red-500 border-red-500/20 bg-red-500/10' : 'text-green-500 border-green-500/20 bg-green-500/10'}`}>{item.prediction}</span>
                             <span className="text-[11px] font-bold text-pro-sub uppercase tracking-widest">{new Date(item.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 self-end sm:self-center">
                           <div className="text-right hidden sm:block">
                              <p className="text-[10px] font-black text-pro-sub uppercase tracking-widest">Score</p>
                              <p className="text-xl font-black text-white tracking-tight">{(item.confidence * 100).toFixed(0)}%</p>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-pro-surface border border-pro-border flex items-center justify-center group-hover:bg-pro-blue transition-all group-hover:scale-110"><ChevronRight className="w-6 h-6 text-pro-sub group-hover:text-white" /></div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-32 opacity-20">
                         <Shield className="w-24 h-24 mx-auto mb-8 text-pro-sub" />
                         <p className="text-sm font-black uppercase tracking-[0.4em] text-pro-sub">Archive Empty</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
