import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle, 
  Target, 
  Clock, 
  Info, 
  ChevronDown, 
  Newspaper, 
  ExternalLink,
  ShieldAlert,
  Fingerprint,
  Activity,
  Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const ResultPanel = ({ result, analysisTime }) => {
  const [expandedSections, setExpandedSections] = useState({
    reasoning: true,
    sources: true,
  });

  if (!result || !result.probabilities) return null;

  const isFake = result.is_fake;
  
  // Midnight Pro Vibrant Colors
  const RED = '#ff375f';
  const GREEN = '#30d158';
  const BLUE = '#0071e3';
  const GRAY = '#86868b';

  const chartData = [
    { name: 'Fake', value: result.probabilities.fake * 100 },
    { name: 'Real', value: result.probabilities.real * 100 }
  ];

  const statusColor = isFake ? 'text-[#ff375f]' : 'text-[#30d158]';
  const statusBg = isFake ? 'bg-[#ff375f]/5' : 'bg-[#30d158]/5';
  const statusBorder = isFake ? 'border-[#ff375f]/20' : 'border-[#30d158]/20';
  const StatusIcon = isFake ? ShieldAlert : CheckCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Pro Verdict Card */}
      <div className={`pro-card p-8`}>
        <div className="flex flex-col md:flex-row items-center gap-10">
          
          {/* Large Verdict Indicator */}
          <div className="relative">
             <div className={`w-36 h-36 rounded-full border-2 border-pro-border flex items-center justify-center relative`}>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-0 rounded-full border-t-2 border-b-2 border-pro-blue opacity-30`}
                />
                <StatusIcon className={`w-16 h-16 ${statusColor}`} />
             </div>
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-black border border-pro-border rounded-full shadow-lg">
                <span className="text-[11px] font-bold text-pro-sub uppercase tracking-wider mr-2">CONFIDENCE:</span>
                <span className={`text-sm font-black ${statusColor}`}>
                  {(result.confidence * 100).toFixed(1)}%
                </span>
             </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
               <Fingerprint className="w-4 h-4 text-pro-sub" />
               <p className="text-[10px] font-bold text-pro-sub uppercase tracking-[0.2em]">Neural Verification Protocol</p>
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-apple-text tracking-tighter mb-4 uppercase">
              Verdict: <span className={statusColor}>{result.prediction.toUpperCase()}</span>
            </h2>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-pro-bg rounded-full border border-pro-border">
                <Clock className="w-4 h-4 text-pro-blue" />
                <span className="text-xs font-bold text-white">Scan Time: {analysisTime}s</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-pro-bg rounded-full border border-pro-border">
                <Activity className="w-4 h-4 text-tech-lime" />
                <span className="text-xs font-bold text-white">Deep Analysis Complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Clean Distribution Chart */}
        <div className="pro-card p-8">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-5 h-5 text-pro-blue" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Probability Metrics</h3>
          </div>
          
          <div className="h-56 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={10}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={RED} />
                  <Cell fill={GREEN} />
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-bold text-pro-sub uppercase tracking-widest leading-none">Scored</span>
              <span className="text-3xl font-black text-white tracking-tighter">
                {(result.probabilities[result.is_fake ? 'fake' : 'real'] * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div className="p-5 bg-pro-bg rounded-2xl border border-pro-border">
              <p className="text-[10px] font-bold text-pro-sub uppercase tracking-wider mb-2">Fake Alignment</p>
              <div className="h-1.5 w-full bg-pro-surface rounded-full overflow-hidden">
                 <div className="h-full bg-[#ff375f]" style={{ width: `${result.probabilities.fake * 100}%` }} />
              </div>
              <p className="text-xl font-black text-white tracking-tighter mt-2">{(result.probabilities.fake * 100).toFixed(1)}%</p>
            </div>
            <div className="p-5 bg-pro-bg rounded-2xl border border-pro-border">
              <p className="text-[10px] font-bold text-pro-sub uppercase tracking-wider mb-2">Real Alignment</p>
              <div className="h-1.5 w-full bg-pro-surface rounded-full overflow-hidden">
                 <div className="h-full bg-[#30d158]" style={{ width: `${result.probabilities.real * 100}%` }} />
              </div>
              <p className="text-xl font-black text-white tracking-tighter mt-2">{(result.probabilities.real * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* Pro Reasoning Section */}
        <div className="pro-card p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-5 h-5 text-pro-blue" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">AI Reasoning</h3>
          </div>
          
          <div className="flex-1 text-[15px] text-pro-text leading-relaxed bg-pro-bg rounded-2xl p-6 border border-pro-border overflow-y-auto max-h-64 scrollbar-hide">
            {result.reasoning || "Neural core completed analysis. High-confidence classification based on linguistic structural mapping."}
          </div>

          <div className="mt-6 flex items-center gap-3 text-[11px] font-bold text-pro-sub uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 text-tech-violet" />
            BERT-Powered Verification Unit
          </div>
        </div>
      </div>

      {/* Sources Card */}
      {result.news_validation && (
        <div className="pro-card overflow-hidden">
          <button
            onClick={() => setExpandedSections(p => ({ ...p, sources: !p.sources }))}
            className="w-full flex items-center justify-between p-8 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-pro-bg rounded-2xl flex items-center justify-center border border-pro-border">
                <Newspaper className="w-6 h-6 text-pro-blue" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">Cross-Reference Validation</h3>
                <p className="text-[10px] font-bold text-pro-sub uppercase tracking-widest mt-1">
                  Status: <span className="text-pro-blue">{result.news_validation.verification_status}</span>
                </p>
              </div>
            </div>
            <ChevronDown className={`w-6 h-6 text-pro-sub transition-transform ${expandedSections.sources ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {expandedSections.sources && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-8 pb-8"
              >
                <div className="space-y-4">
                  {result.news_validation.articles && result.news_validation.articles.length > 0 ? (
                    result.news_validation.articles.map((article, i) => (
                      <motion.a
                        key={i}
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex items-center gap-5 p-5 rounded-2xl bg-pro-bg border border-pro-border hover:border-pro-blue hover:bg-pro-surface transition-all shadow-sm"
                      >
                        <div className="w-10 h-10 rounded-xl bg-pro-surface border border-pro-border flex items-center justify-center text-pro-sub group-hover:text-pro-blue transition-all shrink-0">
                           <ExternalLink className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                           <h4 className="text-[15px] font-bold text-white group-hover:text-pro-blue transition-colors truncate">
                             {article.title}
                           </h4>
                           <div className="flex items-center gap-3 mt-1.5">
                             <span className="text-[10px] font-black text-pro-blue uppercase tracking-widest">
                               {article.source}
                             </span>
                             <span className="w-1 h-1 rounded-full bg-pro-sub" />
                             <span className="text-[10px] font-bold text-pro-sub">
                               {article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Verified Log'}
                             </span>
                           </div>
                        </div>
                      </motion.a>
                    ))
                  ) : (
                    <div className="text-center py-10 p-6 rounded-3xl bg-pro-bg border border-dashed border-pro-border">
                       <p className="text-xs font-bold text-pro-sub uppercase tracking-widest">No conflicting external reports found</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default ResultPanel;
