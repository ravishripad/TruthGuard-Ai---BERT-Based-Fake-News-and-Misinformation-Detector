import { Link } from 'react-router-dom';
import { Shield, Search, CheckCircle, ArrowRight, Sparkles, Eye, BarChart3, Lock, Newspaper, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { variants, duration, ease, stagger } from '../motion/config';
import { useRevealOnScroll } from '../motion/reveal';
import { useParallax, useCountUp } from '../motion/scroll';
import { useReducedMotion } from '../motion/useReducedMotion';
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
      <p ref={ref} className="text-5xl md:text-8xl font-black text-white tracking-tightest">0</p>
      <p className="text-pro-sub mt-4 text-xs font-bold uppercase tracking-widest">{label}</p>
    </div>
  );
};

const Home = () => {
  const stepsSectionRef = useRef(null);
  const lineRef = useRef(null);
  const stepEls = useRef([]);
  const prefersReduced = useReducedMotion();

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

      stepEls.current.forEach((el, i) => {
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
    <div className="relative min-h-screen bg-black text-pro-text selection:bg-pro-blue">
      <ThreeBackground />

      {/* ── Header ──────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 pro-glass">
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          
          {/* Dashboard-Consistent Logo */}
          <Link to="/" className="flex items-center gap-4 group">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-pro-blue/20 blur-xl rounded-xl group-hover:bg-pro-blue/40 transition-all" />
              <div className="relative w-12 h-12 bg-pro-surface border border-pro-border rounded-xl flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pro-blue/10 to-transparent" />
                <Shield className="w-6 h-6 text-pro-blue group-hover:text-white transition-colors" />
                <motion.div 
                  animate={{ y: [0, 48, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute top-0 left-0 w-full h-[1px] bg-pro-blue/50 shadow-[0_0_8px_#0071e3]"
                />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none italic">
                Truth<span className="text-pro-blue">Lens</span>
              </h1>
              <p className="text-[9px] text-pro-sub font-bold tracking-[0.2em] uppercase mt-1">
                Neural Network v4.0
              </p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-12">
            {['Protocol', 'Intelligence', 'Impact'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-[11px] font-black uppercase tracking-[0.2em] text-pro-sub hover:text-white transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-8">
            <Link to="/login" className="text-[11px] font-black uppercase tracking-[0.2em] text-pro-sub hover:text-white transition-colors">Sign In</Link>
            <Link to="/register" className="btn-pro !px-8 !py-3 !text-[10px] uppercase tracking-widest">
              Access
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* ── Hero ────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col justify-center px-8">
          <div className="max-w-6xl mx-auto w-full">
            <Reveal>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-12 border border-white/10 bg-white/5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-pro-blue animate-pulse shadow-[0_0_10px_#0071e3]" />
                Neural Intelligence Unit v4.0
              </div>
            </Reveal>

            <motion.h1
              className="text-8xl md:text-[12rem] font-black leading-[0.8] tracking-tightest mb-16 text-white"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              DEFEND<br />
              <span className="text-transparent stroke-text">THE.</span><br />
              <span className="text-pro-blue">TRUTH.</span>
            </motion.h1>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-16">
              <motion.p
                className="max-w-xl text-xl md:text-2xl text-pro-sub font-medium leading-relaxed text-balance"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                In an era of digital noise, TruthLens provides the ultimate neural defense. 
                Surgical misinformation detection at scale.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
              >
                <Link to="/register" className="group flex items-center gap-6 bg-white text-black pl-10 pr-2 py-2 rounded-full font-black uppercase tracking-[0.2em] text-[11px] hover:bg-pro-blue hover:text-white transition-all shadow-2xl shadow-white/5">
                  Start Analysis
                  <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-6 h-6" />
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── Story Section ──────────────────────────────── */}
        <section id="protocol" ref={stepsSectionRef} className="py-64 px-8 bg-[#050505]">
          <div className="max-w-6xl mx-auto relative">
            <div ref={lineRef} className="absolute left-0 top-0 w-[1px] h-full bg-white/10 origin-top hidden md:block" />
            
            <div className="space-y-80">
              {[
                { title: 'Extraction', phase: '01', desc: 'Tactical data ingestion across all digital formats. Normalized for deep scanning.' },
                { title: 'Dissection', phase: '02', desc: 'BERT-powered linguistic mapping scans 50+ misinformation markers in milliseconds.' },
                { title: 'Verdict',    phase: '03', desc: 'Comprehensive truth-score delivery. Mathematically-backed probability rankings.' }
              ].map((step, i) => (
                <div key={i} ref={el => (stepEls.current[i] = el)} className="md:pl-32 relative">
                  <div className="absolute left-[-4px] top-4 w-2 h-2 rounded-full bg-pro-blue hidden md:block" />
                  <div className="step-text">
                    <span className="text-pro-blue font-black text-xs uppercase tracking-[0.4em] block mb-8">Phase {step.phase}</span>
                    <h2 className="text-6xl md:text-[10rem] font-black tracking-tightest mb-12 uppercase italic text-white leading-none">{step.title}</h2>
                    <p className="text-2xl md:text-3xl text-pro-sub max-w-3xl leading-snug font-medium text-balance">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────── */}
        <section id="intelligence" className="py-64 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-32 items-start">
              <div>
                <Reveal>
                  <h2 className="text-6xl md:text-9xl font-black tracking-tightest mb-20 text-white leading-[0.85]">
                    NEURAL<br />SUPERIORITY.
                  </h2>
                  <div className="grid grid-cols-1 gap-16">
                    {features.map((f, i) => (
                      <div key={i} className="flex gap-10 group">
                        <div className="w-20 h-20 shrink-0 rounded-3xl bg-pro-surface flex items-center justify-center border border-pro-border transition-all group-hover:border-pro-blue group-hover:shadow-2xl group-hover:shadow-pro-blue/10">
                          <f.icon className="w-8 h-8 text-pro-blue" />
                        </div>
                        <div>
                          <h4 className="text-xl font-black mb-4 uppercase tracking-tighter text-white">{f.title}</h4>
                          <p className="text-pro-sub text-lg leading-relaxed font-medium">{f.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Reveal>
              </div>
              <div className="sticky top-40">
                <div className="aspect-square rounded-[4rem] bg-pro-surface border border-pro-border shadow-2xl flex items-center justify-center p-20 relative overflow-hidden">
                   <div className="w-full h-full rounded-[3rem] bg-black border border-white/5 p-16 flex flex-col justify-between relative z-10">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-pro-sub uppercase tracking-[0.4em]">SYSTEM_SCAN_v4</span>
                        <div className="flex gap-3">
                           {[...Array(3)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-pro-blue/30" />)}
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-[10rem] font-black text-white tracking-tightest leading-none">98<span className="text-pro-blue">.</span>4</span>
                        <p className="text-xs font-black text-pro-sub uppercase tracking-[0.5em] mt-8">Precision Index</p>
                      </div>
                      <div className="space-y-4">
                         <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full bg-pro-blue" initial={{ width: 0 }} whileInView={{ width: '90%' }} transition={{ duration: 2 }} /></div>
                         <div className="h-1 w-2/3 bg-white/5 rounded-full overflow-hidden"><motion.div className="h-full bg-tech-violet" initial={{ width: 0 }} whileInView={{ width: '60%' }} transition={{ duration: 2 }} /></div>
                      </div>
                   </div>
                   <div className="absolute inset-0 bg-radial-gradient(circle, rgba(0,113,227,0.1) 0%, transparent 70%)" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats ─────────────────────────────────────── */}
        <section id="impact" className="py-64 px-8 bg-[#050505] border-y border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-24 md:gap-40">
              <StatCounter value={95} suffix="%" label="Verification Accuracy" />
              <StatCounter value={50} suffix="K+" label="Tactical Analyses" />
              <StatCounter value={30} prefix="<" suffix="s" label="Response Latency" />
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────── */}
        <section className="py-80 px-8 text-center">
          <Reveal>
            <h2 className="text-8xl md:text-[14rem] font-black tracking-tightest mb-24 leading-[0.75] text-white">
              JOIN THE<br /><span className="text-pro-blue italic">FRONT.</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-10 justify-center items-center">
              <Link to="/register" className="btn-pro !px-20 !py-8 !text-base !rounded-full shadow-2xl hover:scale-105 transition-transform">
                Request Access
              </Link>
              <Link to="/login" className="text-white font-black uppercase tracking-[0.3em] text-xs border-b-4 border-white hover:border-pro-blue hover:text-pro-blue transition-all pb-3">
                Log In
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 py-24 px-8 border-t border-white/10 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="flex items-center gap-4 group">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 bg-pro-blue/20 blur-xl rounded-xl group-hover:bg-pro-blue/40 transition-all" />
              <div className="relative w-12 h-12 bg-pro-surface border border-pro-border rounded-xl flex items-center justify-center overflow-hidden">
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
              <h1 className="text-xl font-black text-white tracking-tighter uppercase leading-none italic">
                Truth<span className="text-pro-blue">Lens</span>
              </h1>
              <p className="text-[9px] text-pro-sub font-bold tracking-[0.2em] uppercase mt-1">
                Neural Network v4.0
              </p>
            </div>
          </div>
          <p className="text-pro-sub text-xs font-black uppercase tracking-[0.4em]">
            &copy; {new Date().getFullYear()} TruthLens Command Unit.
          </p>
          <div className="flex gap-16">
             {['API', 'TERMS', 'GIT'].map(link => (
               <a key={link} href="#" className="text-[10px] font-black uppercase tracking-[0.4em] text-pro-sub hover:text-white transition-colors">{link}</a>
             ))}
          </div>
        </div>
      </footer>

      <style>{`
        .stroke-text {
          -webkit-text-stroke: 2px rgba(255,255,255,0.1);
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default Home;
