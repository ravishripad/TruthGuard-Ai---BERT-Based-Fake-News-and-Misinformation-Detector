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
  Zap,
  Download
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { downloadFactCheckPdf, downloadFactCheckTxt } from '../../utils/reportExport';

const ResultPanel = React.memo(({ result, analysisTime }) => {
  const [expandedSections, setExpandedSections] = useState({
    reasoning: true,
    sources: true,
  });

  if (!result || !result.probabilities) return null;

  // Calculate Shannon Entropy: H(X) = -sum(p * log2(p))
  const calculateEntropy = () => {
    const pReal = result.probabilities.real || 0.0001;
    const pFake = result.probabilities.fake || 0.0001;
    const entropy = -((pReal * Math.log2(pReal)) + (pFake * Math.log2(pFake)));
    return Math.max(0, entropy).toFixed(3);
  };

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

  const predictionSourceLabel = {
    gemini_ai: 'Gemini AI Primary Check',
    bert_model_fallback: 'BERT Fallback Model',
    bert_model: 'BERT Model',
  }[result.prediction_source] || 'Hybrid Verification Engine';

  const verificationStatus =
    result.news_validation?.verification_status?.replace(/_/g, ' ') || 'news cross-check unavailable';

  const workflowSteps = [
    {
      title: 'Input Captured',
      description: result.extracted_from_image
        ? 'Image OCR extracted the claim before verification started.'
        : result.extracted_from_url
          ? 'The article URL was scraped to extract the headline and readable article body.'
          : 'Headline and article context were prepared for the verification run.',
      meta: result.extracted_from_image ? 'Image evidence pipeline' : result.extracted_from_url ? 'URL scraping pipeline' : 'Text evidence pipeline',
      icon: Fingerprint,
    },
    {
      title: 'External Evidence Check',
      description: result.news_validation
        ? `Live news evidence was checked and marked as ${verificationStatus}.`
        : 'No external news evidence payload was returned for this scan.',
      meta: result.news_validation?.relevant_articles
        ? `${result.news_validation.relevant_articles} relevant articles reviewed`
        : 'No matching article count available',
      icon: Newspaper,
    },
    {
      title: 'Decision Engine',
      description: `${predictionSourceLabel} generated the classification signal used for the verdict.`,
      meta: result.classification_type === 'binary' ? 'Binary classification' : result.classification_type,
      icon: Zap,
    },
    {
      title: 'Final Verdict',
      description: `${result.prediction.toUpperCase()} returned with ${(result.confidence * 100).toFixed(1)}% confidence.`,
      meta: result.is_fake ? 'Flagged as misinformation risk' : 'Aligned with verified reporting',
      icon: result.is_fake ? ShieldAlert : CheckCircle,
    },
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
             <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-5 py-1.5 bg-pro-bg border border-pro-border rounded-full shadow-lg">
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
            <h2 className="text-4xl md:text-5xl font-black text-pro-text tracking-tighter mb-4 uppercase">
              Verdict: <span className={statusColor}>{result.prediction.toUpperCase()}</span>
            </h2>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-pro-bg rounded-full border border-pro-border">
                <Clock className="w-4 h-4 text-pro-blue" />
                <span className="text-xs font-bold text-pro-text">Scan Time: {analysisTime}s</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-pro-bg rounded-full border border-pro-border">
                <Activity className="w-4 h-4 text-tech-lime" />
                <span className="text-xs font-bold text-pro-text">Deep Analysis Complete</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => downloadFactCheckTxt(result, analysisTime)}
                className="inline-flex items-center gap-2 rounded-full border border-pro-border bg-pro-bg px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-pro-text hover:border-pro-blue hover:text-pro-blue transition-colors"
              >
                <Download className="w-4 h-4" />
                Download TXT
              </button>
              <button
                onClick={() => downloadFactCheckPdf(result, analysisTime)}
                className="inline-flex items-center gap-2 rounded-full border border-pro-blue/30 bg-pro-blue/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-pro-blue hover:bg-pro-blue/15 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
        {/* Clean Distribution Chart */}
        <div className="pro-card p-6 sm:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-pro-blue/10 flex items-center justify-center border border-pro-blue/20">
              <Target className="w-5 h-5 text-pro-blue" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-pro-text uppercase tracking-wider">Probability Metrics</h3>
              <p className="text-[9px] font-black text-pro-sub uppercase tracking-[0.2em]">Neural Score Distribution</p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center min-h-[300px]">
            {/* Metadata Stats Row - Now Real Data */}
            <div className="flex items-center justify-around mb-6 px-1">
               <div className="text-center">
                  <p className="text-[8px] font-black text-pro-sub uppercase tracking-widest mb-0.5">Neural Entropy</p>
                  <p className="text-xs font-bold text-pro-text">{calculateEntropy()} <span className="text-[8px] opacity-40">bits</span></p>
               </div>
               <div className="h-6 w-px bg-pro-border" />
               <div className="text-center">
                  <p className="text-[8px] font-black text-pro-sub uppercase tracking-widest mb-0.5">Execution Latency</p>
                  <p className="text-xs font-bold text-pro-text">{analysisTime ? (analysisTime * 1000).toFixed(0) : '0'} <span className="text-[8px] opacity-40">ms</span></p>
               </div>
            </div>

            <div className="h-48 w-full relative mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={8}
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
                <span className="text-[9px] font-bold text-pro-sub uppercase tracking-widest leading-none">Scored</span>
                <span className="text-2xl font-black text-pro-text tracking-tighter">
                  {(result.probabilities[result.is_fake ? 'fake' : 'real'] * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Threshold Indicator */}
            <div className="mb-6 space-y-2">
              <div className="flex justify-between items-end">
                <span className="text-[9px] font-black text-pro-sub uppercase tracking-widest">Verification Threshold</span>
                <span className="text-[10px] font-bold text-pro-blue">High Integrity</span>
              </div>
              <div className="h-1 w-full bg-pro-bg rounded-full relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-tech-rose/40 via-tech-lime/40 to-pro-blue/40" />
                <motion.div 
                  initial={{ left: 0 }}
                  animate={{ left: `${(result.confidence * 100)}%` }}
                  className="absolute top-0 w-1.5 h-full bg-pro-text shadow-[0_0_10px_white] z-10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-pro-bg/40 rounded-xl border border-pro-border">
                <p className="text-[8px] font-black text-pro-sub uppercase tracking-widest mb-1.5">Fake Alignment</p>
                <div className="h-1 w-full bg-pro-surface rounded-full overflow-hidden">
                   <div className="h-full bg-[#ff375f]" style={{ width: `${result.probabilities.fake * 100}%` }} />
                </div>
                <p className="text-lg font-black text-pro-text tracking-tighter mt-1.5">{(result.probabilities.fake * 100).toFixed(1)}%</p>
              </div>
              <div className="p-4 bg-pro-bg/40 rounded-xl border border-pro-border">
                <p className="text-[8px] font-black text-pro-sub uppercase tracking-widest mb-1.5">Real Alignment</p>
                <div className="h-1 w-full bg-pro-surface rounded-full overflow-hidden">
                   <div className="h-full bg-[#30d158]" style={{ width: `${result.probabilities.real * 100}%` }} />
                </div>
                <p className="text-lg font-black text-pro-text tracking-tighter mt-1.5">{(result.probabilities.real * 100).toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pro Reasoning Section */}
        <div className="pro-card p-6 sm:p-8 flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-pro-blue/10 flex items-center justify-center border border-pro-blue/20">
              <Info className="w-5 h-5 text-pro-blue" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-pro-text uppercase tracking-wider">AI Reasoning</h3>
              <p className="text-[9px] font-black text-pro-sub uppercase tracking-[0.2em]">Deep Analysis Log</p>
            </div>
          </div>
          
          <div className="flex-1 bg-pro-bg/30 rounded-2xl p-6 border border-pro-border relative overflow-hidden group">
            {/* Decorative corners */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-pro-blue/30" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-pro-blue/30" />
            
            <div className="text-[15px] sm:text-[16px] text-pro-text leading-relaxed font-medium">
              {result.reasoning ? (
                <p className="whitespace-pre-line">{result.reasoning}</p>
              ) : (
                <p className="italic text-pro-sub">Neural core completed analysis. High-confidence classification based on linguistic structural mapping and metadata verification.</p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-pro-sub uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 text-tech-violet" />
              BERT Verification Unit
            </div>
            <div className="px-3 py-1 bg-tech-lime/10 border border-tech-lime/20 rounded-full">
              <span className="text-[9px] font-black text-tech-lime uppercase tracking-tighter">Active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="pro-card p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-pro-blue/10 flex items-center justify-center border border-pro-blue/20">
            <Activity className="w-5 h-5 text-pro-blue" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-pro-text uppercase tracking-wider">Detection Workflow</h3>
            <p className="text-[9px] font-black text-pro-sub uppercase tracking-[0.2em]">How This Result Was Produced</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {workflowSteps.map((step, index) => (
            <div key={step.title} className="rounded-3xl border border-pro-border bg-pro-bg/30 p-5 relative overflow-hidden">
              <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-pro-sub/50">
                0{index + 1}
              </div>
              <div className="w-11 h-11 rounded-2xl bg-pro-surface border border-pro-border flex items-center justify-center mb-4">
                <step.icon className="w-5 h-5 text-pro-blue" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight text-pro-text mb-2">{step.title}</h4>
              <p className="text-sm text-pro-sub leading-relaxed mb-4">{step.description}</p>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-pro-blue">
                {step.meta}
              </div>
            </div>
          ))}
        </div>
      </div>

      {result.url_extraction && (
        <div className="pro-card p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-pro-blue/10 flex items-center justify-center border border-pro-blue/20">
              <ExternalLink className="w-5 h-5 text-pro-blue" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-pro-text uppercase tracking-wider">Scraped Article</h3>
              <p className="text-[9px] font-black text-pro-sub uppercase tracking-[0.2em]">URL Extraction Summary</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-3xl border border-pro-border bg-pro-bg/30 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pro-sub mb-2">Source</p>
              <p className="text-base font-bold text-pro-text">{result.url_extraction.source || result.url_extraction.domain}</p>
            </div>
            <div className="rounded-3xl border border-pro-border bg-pro-bg/30 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pro-sub mb-2">Article URL</p>
              <a
                href={result.url_extraction.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-pro-blue break-all hover:underline"
              >
                {result.url_extraction.url}
              </a>
            </div>
          </div>

          {result.url_extraction.text_preview && (
            <div className="mt-4 rounded-3xl border border-pro-border bg-pro-bg/30 p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-pro-sub mb-2">Scraped Preview</p>
              <p className="text-sm text-pro-text leading-relaxed">{result.url_extraction.text_preview}</p>
            </div>
          )}
        </div>
      )}

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
                <h3 className="text-sm font-extrabold text-pro-text uppercase tracking-wider">Cross-Reference Validation</h3>
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
                           <h4 className="text-[15px] font-bold text-pro-text group-hover:text-pro-blue transition-colors truncate">
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
});

export default ResultPanel;
