import { Link } from 'react-router-dom';
import { Shield, Search, ArrowRight, Eye, BarChart3, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useRevealOnScroll } from '../motion/reveal';
import { useCountUp } from '../motion/scroll';
import { useReducedMotion } from '../motion/useReducedMotion';
import { useTheme } from '../context/ThemeContext';
import ThreeBackground from '../components/ThreeBackground';

gsap.registerPlugin(ScrollTrigger);

const Reveal = ({ children, className = '', delay = 0 }) => {
  const { ref, isVisible } = useRevealOnScroll({ threshold: 0.12, once: false });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
        visible: {
          opacity: 1, y: 0, filter: 'blur(0px)',
          transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const StatCounter = ({ value, suffix = '', prefix = '', label }) => {
  const ref = useRef(null);
  useCountUp(ref, { endValue: value, suffix, prefix });
  return (
    <div className="text-center">
      <p ref={ref} className="text-5xl md:text-8xl font-black text-pro-text tracking-tightest">0</p>
      <p className="text-pro-sub mt-4 text-xs font-bold uppercase tracking-widest">{label}</p>
    </div>
  );
};

const Home = () => {
  const stepsSectionRef = useRef(null);
  const lineRef = useRef(null);
  const stepEls = useRef([]);
  const prefersReduced = useReducedMotion();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const section = stepsSectionRef.current;
    const line    = lineRef.current;
    if (!section || !line || prefersReduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top 60%', end: 'bottom 40%', scrub: 0.5 },
        }
      );

      stepEls.current.forEach((el) => {
        if (!el) return;
        const text = el.querySelector('.step-text');
        if (text) {
          gsap.fromTo(text,
            { opacity: 0, y: 50 },
            {
              opacity: 1, y: 0, duration: 1.2, ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 75%', toggleActions: 'play none none reverse' },
            }
          );
        }
      });
    });
    return () => ctx.revert();
  }, [prefersReduced]);

  const features = [
    { icon: Search,    title: 'Linguistic Mapping',    desc: 'Advanced BERT models scan syntactic structures for fraud patterns.' },
    { icon: Eye,       title: 'Visual Extraction',     desc: 'Deep OCR extracts text from multi-source tactical imagery.' },
    { icon: BarChart3, title: 'Neural Metrics',        desc: 'Real-time probability distribution across established datasets.' },
    { icon: Lock,      title: 'Verified Logs',         desc: 'Cross-referenced against a global 1M+ article truth-index.' },
  ];

  return (
    <div className="relative min-h-screen text-pro-text selection:bg-pro-blue">
      <ThreeBackground />

      {/* ── Header ──────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 pro-glass">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6 flex items-center justify-between">
          
          <Link to="/" className="flex items-center gap-2 md:gap-4 group shrink-0">
            <div className="relative w-8 h-8 md:w-12 md:h-12">
              <div className="absolute inset-0 bg-pro-blue/20 blur-xl rounded-xl group-hover:bg-pro-blue/40 transition-all" />
              <div className={`relative w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center overflow-hidden border ${isDark ? 'bg-pro-surface border-pro-border' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-pro-blue/10 to-transparent" />
                <Shield className="w-4 h-4 md:w-6 md:h-6 text-pro-blue group-hover:text-pro-text transition-colors" />
                <motion.div 
                  animate={{ y: [0, 48, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-full h-[1px] bg-pro-blue/50 shadow-[0_0_8px_#0071e3]"
                />
              </div>
            </div>
            <div>
              <h1 className="text-sm md:text-xl font-black text-pro-text tracking-tighter uppercase leading-none italic">
                thruthGuard <span className="text-pro-blue">AI</span>
              </h1>
              <p className="text-[7px] md:text-[9px] text-pro-sub font-bold tracking-[0.2em] uppercase mt-0.5 md:mt-1">
                Neural Network v4.0
              </p>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-12">
            {['Workflow', 'Intelligence', 'Impact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black uppercase tracking-[0.2em] text-pro-sub hover:text-pro-text transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4 md:gap-8 shrink-0">
            <Link to="/login" className="hidden sm:block text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] text-pro-sub hover:text-pro-text transition-colors">Sign In</Link>
            <Link to="/register" className="btn-pro !px-4 md:!px-8 !py-2 md:!py-3 !text-[8px] md:!text-[10px] uppercase tracking-widest leading-none whitespace-nowrap">
              Access
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-24 md:pt-0">
        {/* ── Hero ────────────────────────────────────────── */}
        <section className="min-h-[90vh] md:min-h-screen flex flex-col justify-center px-4 md:px-8 pt-10 md:pt-0">
          <div className="max-w-6xl mx-auto w-full">
            <Reveal>
              <div className={`inline-flex items-center gap-2 md:gap-3 px-3 md:px-5 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] mb-8 md:mb-12 border backdrop-blur-md whitespace-nowrap overflow-hidden ${isDark ? 'border-white/10 bg-white/5' : 'border-indigo-200 bg-white/70 shadow-sm'}`}>
                <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-pro-blue animate-pulse shadow-[0_0_10px_#0071e3] shrink-0" />
                <span className="truncate">Neural Intelligence Unit v4.0</span>
              </div>
            </Reveal>

            <motion.h1
              className="text-6xl sm:text-7xl md:text-8xl lg:text-[12rem] font-black leading-[0.95] md:leading-[0.85] tracking-tightest mb-8 md:mb-16 text-pro-text break-words"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              DEFEND<br />
              <span className="stroke-text block md:inline-block mt-1 md:mt-0">THE.</span>
              <span className="text-pro-blue block md:inline-block mt-1 md:mt-0">TRUTH.</span>
            </motion.h1>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-16">
              <motion.p
                className="max-w-xl text-lg sm:text-xl md:text-2xl text-pro-sub font-medium leading-relaxed text-left md:text-balance"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                In an era of digital noise, TruthGuard AI provides the ultimate neural defense. 
                Surgical misinformation detection at scale.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="self-start md:self-auto"
              >
                <Link to="/register" className={`group flex items-center justify-between gap-4 md:gap-6 pl-6 md:pl-10 pr-2 py-2 rounded-full font-black uppercase tracking-[0.2em] text-[9px] md:text-[11px] transition-all w-full sm:w-auto ${isDark ? 'bg-white text-black hover:bg-pro-blue hover:text-white shadow-2xl shadow-white/5' : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-slate-900/20'}`}>
                  <span>Start Analysis</span>
                  <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${isDark ? 'bg-black text-white' : 'bg-white text-slate-900'}`}>
                    <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Story Section ──────────────────────────────── */}
        <section id="workflow" ref={stepsSectionRef} className={`py-24 md:py-64 px-4 md:px-8 ${isDark ? 'bg-pro-surface/40' : 'bg-indigo-50/50'}`}>
          <div className="max-w-6xl mx-auto relative">
            <div className="mb-16 md:mb-24 text-center md:text-left">
              <span className="text-pro-blue font-black text-[10px] md:text-xs uppercase tracking-[0.45em] block mb-4">Workflow</span>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tightest text-pro-text uppercase italic">See The Detection Workflow</h2>
            </div>
            <div ref={lineRef} className={`absolute left-0 top-0 w-[1px] h-full origin-top hidden md:block ${isDark ? 'bg-white/10' : 'bg-indigo-200'}`} />
            
            <div className="space-y-20 md:space-y-28">
              {[
                { title: 'Capture', phase: '01', desc: 'Tactical data ingestion across text, URLs, and images. Every claim is normalized before verification begins.' },
                { title: 'Cross-Check', phase: '02', desc: 'Live news evidence, AI reasoning, and fallback BERT analysis are combined to challenge misinformation signals.' },
                { title: 'Verdict',    phase: '03', desc: 'Comprehensive truth-score delivery with confidence, reasoning, and export-ready fact-check output.' }
              ].map((step, i, steps) => (
                <div key={i}>
                  <div ref={el => (stepEls.current[i] = el)} className="md:pl-32 relative">
                    <div className="absolute left-[-4px] top-4 w-2 h-2 rounded-full bg-pro-blue hidden md:block" />
                    <div className="step-text text-center md:text-left">
                      <span className="text-pro-blue font-black text-[10px] md:text-xs uppercase tracking-[0.4em] block mb-4 md:mb-8">Step {step.phase}</span>
                      <h2 className="text-4xl sm:text-6xl md:text-[10rem] font-black tracking-tightest mb-6 md:mb-12 uppercase italic text-pro-text leading-[0.9] md:leading-none break-words">{step.title}</h2>
                      <p className="text-lg sm:text-2xl md:text-3xl text-pro-sub max-w-3xl mx-auto md:mx-0 leading-snug font-medium md:text-balance px-4 md:px-0">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex justify-center md:justify-start md:pl-32 py-8 md:py-10">
                      <div className="flex flex-col items-center md:items-start">
                        <div className={`h-12 md:h-16 w-px ${isDark ? 'bg-gradient-to-b from-pro-blue/70 to-white/10' : 'bg-gradient-to-b from-pro-blue/70 to-indigo-200'}`} />
                        <div className="mt-2 flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-pro-blue shadow-[0_0_10px_rgba(0,113,227,0.8)]" />
                          <div className={`w-12 md:w-20 h-px ${isDark ? 'bg-gradient-to-r from-pro-blue/60 to-white/10' : 'bg-gradient-to-r from-pro-blue/60 to-indigo-200'}`} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────── */}
        <section id="intelligence" className="py-32 md:py-64 px-4 md:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 md:gap-32 items-start">
              <div>
                <Reveal>
                  <h2 className="text-4xl sm:text-6xl md:text-9xl font-black tracking-tightest mb-10 md:mb-20 text-pro-text leading-[0.9] md:leading-[0.85] text-center md:text-left break-words">
                    NEURAL<br />SUPERIORITY.
                  </h2>
                  <div className="grid grid-cols-1 gap-8 md:gap-16">
                    {features.map((f, i) => (
                      <div key={i} className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-10 group">
                        <div className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-2xl md:rounded-3xl flex items-center justify-center border transition-all group-hover:border-pro-blue group-hover:shadow-2xl group-hover:shadow-pro-blue/10 ${isDark ? 'bg-pro-surface border-pro-border' : 'bg-white border-gray-200 shadow-md'}`}>
                          <f.icon className="w-6 h-6 md:w-8 md:h-8 text-pro-blue" />
                        </div>
                        <div>
                          <h4 className="text-lg md:text-xl font-black mb-2 md:mb-4 uppercase tracking-tighter text-pro-text">{f.title}</h4>
                          <p className="text-pro-sub text-base md:text-lg leading-relaxed font-medium px-4 sm:px-0 max-w-sm mx-auto md:mx-0">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
              <div className="sticky top-24 md:top-40 mt-12 md:mt-0">
                <div className={`aspect-square w-full max-w-[300px] sm:max-w-sm md:max-w-none mx-auto rounded-[3rem] md:rounded-[4rem] border shadow-2xl flex items-center justify-center p-8 md:p-20 relative overflow-hidden ${isDark ? 'bg-pro-surface border-pro-border' : 'bg-white border-gray-200'}`}>
                   <div className={`w-full h-full rounded-[2rem] md:rounded-[3rem] border p-8 md:p-16 flex flex-col justify-between relative z-10 ${isDark ? 'bg-pro-bg border-white/5' : 'bg-gray-50 border-gray-200'}`}>
                      <div className="flex justify-between items-center gap-1 sm:gap-2">
                        <span className="text-[7px] sm:text-[8px] md:text-[10px] font-black text-pro-sub uppercase tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.4em] truncate">SYSTEM_SCAN_v4</span>
                        <div className="flex gap-1 md:gap-3 shrink-0">
                           {[...Array(3)].map((_, i) => <div key={i} className="w-1 h-1 sm:w-1.5 sm:h-1.5 md:w-2 md:h-2 rounded-full bg-pro-blue/30" />)}
                        </div>
                      </div>
                      <div className="text-center w-full">
                        <span className="text-[4.5rem] sm:text-[6rem] md:text-[10rem] font-black text-pro-text tracking-tightest leading-none block overflow-visible mt-2 sm:mt-0">98<span className="text-pro-blue">.</span>4</span>
                        <p className="text-[8px] sm:text-[10px] md:text-xs font-black text-pro-sub uppercase tracking-[0.2em] sm:tracking-[0.3em] md:tracking-[0.5em] mt-3 sm:mt-4 md:mt-8">Precision Index</p>
                      </div>
                      <div className="space-y-3 md:space-y-4">
                         <div className={`h-1 w-full rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}><motion.div className="h-full bg-pro-blue" initial={{ width: 0 }} whileInView={{ width: '90%' }} transition={{ duration: 2 }} /></div>
                         <div className={`h-1 w-2/3 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-gray-200'}`}><motion.div className="h-full bg-tech-violet" initial={{ width: 0 }} whileInView={{ width: '60%' }} transition={{ duration: 2 }} /></div>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────── */}
        <section id="impact" className={`py-32 md:py-64 px-4 md:px-8 border-y ${isDark ? 'bg-pro-surface/40 border-white/5' : 'bg-indigo-50/50 border-indigo-100'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-16 md:gap-24 lg:gap-40">
              <div className="sm:col-span-2 md:col-span-1 flex justify-center"><StatCounter value={95} suffix="%" label="Verification Accuracy" /></div>
              <div className="flex justify-center"><StatCounter value={50} suffix="K+" label="Tactical Analyses" /></div>
              <div className="flex justify-center"><StatCounter value={30} prefix="<" suffix="s" label="Response Latency" /></div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────── */}
        <section className={`py-24 md:py-40 px-4 md:px-8 text-center ${isDark ? '' : 'bg-gradient-to-b from-transparent to-indigo-50/50'}`}>
          <div className="max-w-2xl mx-auto relative z-10 w-full">
            <Reveal>
              <h2 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter sm:tracking-tightest mb-8 md:mb-12 leading-[1] md:leading-[0.85] text-pro-text">
                JOIN THE<br /><span className="text-pro-blue italic">FRONT.</span>
              </h2>
              <p className="text-pro-sub text-base md:text-lg mb-10 md:mb-14 max-w-md mx-auto font-medium">
                Be part of the movement to defend truth in the digital age. Get your access today.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 md:gap-8 justify-center items-center">
                <Link to="/register" className="btn-pro w-full sm:w-auto !px-10 md:!px-16 !py-5 md:!py-6 !text-xs md:!text-sm !rounded-full shadow-2xl hover:scale-105 transition-transform">
                  Request Access
                </Link>
                <Link to="/login" className={`font-black uppercase tracking-[0.3em] text-[10px] md:text-xs border-b-2 hover:border-pro-blue hover:text-pro-blue transition-all pb-2 mt-2 sm:mt-0 ${isDark ? 'text-pro-text border-white/30' : 'text-slate-700 border-slate-300'}`}>
                  Log In
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className={`relative z-10 py-16 md:py-24 px-8 border-t ${isDark ? 'border-white/10 bg-pro-bg' : 'border-gray-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 md:gap-16">
          <div className="flex items-center gap-4 group">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-pro-blue/20 blur-xl rounded-xl group-hover:bg-pro-blue/40 transition-all" />
              <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden border ${isDark ? 'bg-pro-surface border-pro-border' : 'bg-white border-gray-200 shadow-sm'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-pro-blue/10 to-transparent" />
                <Shield className="w-6 h-6 text-pro-blue" />
                <motion.div 
                  animate={{ y: [0, 48, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-full h-[1px] bg-pro-blue/50 shadow-[0_0_8px_#0071e3]"
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-pro-text tracking-tighter uppercase leading-none italic">
                ThruthGuard <span className="text-pro-blue">AI</span>
              </h1>
              <p className="text-[9px] text-pro-sub font-bold tracking-[0.2em] uppercase mt-1">
                Neural Network v4.0
              </p>
            </div>
          </div>
          <p className="text-pro-sub text-xs font-black uppercase tracking-[0.4em]">
            &copy; {new Date().getFullYear()} ThruthGuard AI Command Unit.
          </p>
          <div className="flex gap-16">
             {['API', 'TERMS', 'GIT'].map(link => (
               <a key={link} href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-pro-sub hover:text-pro-text transition-colors">{link}</a>
             ))}
          </div>
        </div>
      </footer>

      <style>{`
        .stroke-text {
          -webkit-text-stroke: 2px ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(79,70,229,0.25)'};
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default Home;
