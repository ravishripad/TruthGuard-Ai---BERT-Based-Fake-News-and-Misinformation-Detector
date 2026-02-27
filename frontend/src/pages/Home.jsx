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

gsap.registerPlugin(ScrollTrigger);

/* ─── Reveal wrapper (plays forward on scroll-down, reverses on scroll-up) ── */
const Reveal = ({ children, className = '', delay = 0 }) => {
  const { ref, isVisible } = useRevealOnScroll({ threshold: 0.12, once: false });
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      variants={{
        hidden: {
          opacity: 0, y: 40, filter: 'blur(8px)',
          transition: { duration: duration.slow, ease: ease.out },
        },
        visible: {
          opacity: 1, y: 0, filter: 'blur(0px)',
          transition: { duration: duration.slower, ease: ease.out, delay },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* ─── Stat counter ────────────────────────────────────── */
const StatCounter = ({ value, suffix = '', prefix = '', label }) => {
  const ref = useRef(null);
  useCountUp(ref, { endValue: value, suffix, prefix });
  return (
    <div className="text-center">
      <p ref={ref} className="text-4xl md:text-5xl font-extrabold text-gradient-glow tracking-tight">0</p>
      <p className="text-dark-400 mt-2 text-sm font-medium">{label}</p>
    </div>
  );
};

/* ─── Step visual cards ───────────────────────────────── */
const StepVisual1 = () => (
  <div className="relative w-full aspect-square max-w-[260px] mx-auto group">
    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-accent/20 via-transparent to-neon-blue/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="relative glass-card p-5 h-full flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
          <Newspaper className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1"><div className="h-2.5 rounded-full bg-white/[0.06] w-full" /></div>
      </div>
      <div className="space-y-2 flex-1">
        {[100, 83, 66, 100, 75].map((w, i) => (
          <div key={i} className="h-2 rounded-full bg-white/[0.04]" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
        <div className="h-7 flex-1 rounded-lg bg-accent/10 flex items-center justify-center">
          <span className="text-[10px] font-semibold text-accent">Paste Article</span>
        </div>
        <div className="h-7 flex-1 rounded-lg bg-white/[0.04] flex items-center justify-center">
          <span className="text-[10px] font-medium text-dark-500">Upload Image</span>
        </div>
      </div>
    </div>
  </div>
);

const StepVisual2 = () => (
  <div className="relative w-full aspect-square max-w-[260px] mx-auto group">
    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-neon-purple/20 via-transparent to-accent/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="relative glass-card p-5 h-full flex flex-col items-center justify-center gap-4">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-purple/15 to-accent/10 flex items-center justify-center">
        <Zap className="w-7 h-7 text-neon-purple" />
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-neon-purple animate-pulse" />
        <span className="text-xs font-semibold text-neon-purple">Analyzing patterns…</span>
      </div>
      <div className="w-full bg-dark-900/50 rounded-xl p-3 space-y-2.5">
        {[
          { label: 'Linguistic', w: '80%', color: 'bg-neon-purple' },
          { label: 'Sources',    w: '60%', color: 'bg-neon-cyan' },
          { label: 'Credibility',w: '90%', color: 'bg-accent' },
        ].map((bar) => (
          <div key={bar.label} className="flex justify-between items-center">
            <span className="text-[10px] text-dark-500">{bar.label}</span>
            <div className="w-24 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
              <div className={`bar-fill h-full rounded-full ${bar.color}`} style={{ width: bar.w }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StepVisual3 = () => (
  <div className="relative w-full aspect-square max-w-[260px] mx-auto group">
    <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-success/20 via-transparent to-neon-green/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
    <div className="relative glass-card p-5 h-full flex flex-col items-center justify-center gap-3">
      <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-success" />
      </div>
      <span className="text-lg font-bold text-success">Verified Real</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-dark-500">Confidence:</span>
        <span className="text-xs font-bold text-white">97.3%</span>
      </div>
      <div className="w-full flex gap-2 mt-1">
        <div className="flex-1 bg-success/8 rounded-lg p-2 text-center border border-success/15">
          <p className="text-[10px] text-dark-500">Real</p>
          <p className="text-sm font-bold text-success">97.3%</p>
        </div>
        <div className="flex-1 bg-danger/8 rounded-lg p-2 text-center border border-danger/15">
          <p className="text-[10px] text-dark-500">Fake</p>
          <p className="text-sm font-bold text-danger">2.7%</p>
        </div>
      </div>
    </div>
  </div>
);

const Home = () => {
  const heroBlobRef  = useRef(null);
  const heroBlobRef2 = useRef(null);
  useParallax(heroBlobRef,  { speed: 40 });
  useParallax(heroBlobRef2, { speed: -25 });

  /* ── Scroll storytelling refs ─────────────────────── */
  const stepsSectionRef = useRef(null);
  const timelineRef = useRef(null);
  const lineRef = useRef(null);
  const stepEls = useRef([]);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const section = stepsSectionRef.current;
    const line    = lineRef.current;
    if (!section || !line || prefersReduced) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth < 768;

      /* Progress line fills as user scrolls through the whole section */
      gsap.fromTo(line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top 60%',
            end: 'bottom 40%',
            scrub: 0.5,
          },
        }
      );

      /* Each step animates in individually as it enters the viewport */
      stepEls.current.forEach((el, i) => {
        if (!el) return;
        const isEven = i % 2 === 0;

        const dot    = el.querySelector('.step-dot');
        const text   = el.querySelector('.step-text');
        const visual = el.querySelector('.step-visual');

        if (dot) {
          gsap.fromTo(dot,
            { scale: 0, opacity: 0 },
            {
              scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(2)',
              scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
            }
          );
        }

        if (text) {
          const xFrom = isMobile ? -30 : (isEven ? -50 : 50);
          gsap.fromTo(text,
            { x: xFrom, opacity: 0, filter: 'blur(6px)' },
            {
              x: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, delay: 0.1, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 78%', toggleActions: 'play none none reverse' },
            }
          );
        }

        if (visual) {
          gsap.fromTo(visual,
            {
              x: isMobile ? 0 : (isEven ? 50 : -50),
              y: isMobile ? 25 : 0,
              opacity: 0, scale: 0.93, filter: 'blur(6px)',
            },
            {
              x: 0, y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.9, delay: 0.2, ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 78%', toggleActions: 'play none none reverse' },
            }
          );
        }

        if (i === 1) {
          el.querySelectorAll('.step-visual .bar-fill').forEach((bar, bi) => {
            gsap.fromTo(bar,
              { scaleX: 0 },
              {
                scaleX: 1, duration: 0.8, delay: 0.35 + bi * 0.15, ease: 'power2.out', transformOrigin: 'left center',
                scrollTrigger: { trigger: el, start: 'top 72%', toggleActions: 'play none none reverse' },
              }
            );
          });
        }
      });
    });

    return () => ctx.revert();
  }, [prefersReduced]);

  const steps = [
    { step: '01', color: 'accent', title: 'Paste Any Article', desc: 'Simply paste a headline or full article you want to verify. Our system accepts text input or screenshot uploads from any source.', visual: <StepVisual1 /> },
    { step: '02', color: 'neon-purple', title: 'AI Analyzes Patterns', desc: 'Our fine-tuned BERT models examine linguistic patterns, cross-reference sources, and compute a confidence score — all in seconds.', visual: <StepVisual2 /> },
    { step: '03', color: 'success', title: 'Get Instant Results', desc: 'Receive a clear verdict with a confidence score, probability breakdown, and links to corroborating sources.', visual: <StepVisual3 /> },
  ];

  const features = [
    { icon: Search,    title: 'Text Analysis',    desc: 'Paste any headline or article for instant AI verification.', gradient: 'from-accent/20 to-cyber-500/10' },
    { icon: Eye,       title: 'Image OCR',         desc: 'Upload screenshots — we extract and analyze the text automatically.', gradient: 'from-neon-purple/20 to-accent/10' },
    { icon: BarChart3, title: 'Confidence Scores', desc: 'Probability breakdowns so you understand exactly how certain the AI is.', gradient: 'from-neon-green/20 to-neon-cyan/10' },
    { icon: Lock,      title: 'Source Validation', desc: 'Cross-reference results with live news databases for corroboration.', gradient: 'from-neon-cyan/20 to-neon-blue/10' },
  ];

  return (
    <div className="min-h-screen bg-dark-950 overflow-x-hidden">
      {/* ── Global Animated SVG Background ───────────────── */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none select-none"
        viewBox="0 0 1200 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{ zIndex: 0, opacity: 1 }}
      >
        <defs>
          <filter id="hm-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Floating star-field nodes — brighter & larger */}
        {[
          [80,   90,  3.5, "rgba(99,102,241,0.7)",  "3.8s", "0s"],
          [220,  200, 2.5, "rgba(139,92,246,0.65)", "5.2s", "1s"],
          [450,  60,  4,   "rgba(16,185,129,0.6)",  "4.5s", "0.5s"],
          [730,  130, 3,   "rgba(99,102,241,0.65)", "6s",   "2s"],
          [1000, 80,  3,   "rgba(59,130,246,0.6)",  "5s",   "1.5s"],
          [1140, 220, 4,   "rgba(139,92,246,0.65)", "4.2s", "0.7s"],
          [50,   400, 3,   "rgba(99,102,241,0.6)",  "7s",   "3s"],
          [160,  560, 2.5, "rgba(16,185,129,0.55)", "5.8s", "1.2s"],
          [970,  380, 3,   "rgba(139,92,246,0.6)",  "4.8s", "0.3s"],
          [1160, 510, 2.5, "rgba(99,102,241,0.55)", "6.5s", "2.5s"],
          [80,   730, 4,   "rgba(59,130,246,0.58)", "5.5s", "0.9s"],
          [340,  820, 3,   "rgba(99,102,241,0.58)", "4s",   "1.7s"],
          [650,  840, 2.5, "rgba(139,92,246,0.55)", "6.2s", "0.4s"],
          [900,  790, 3,   "rgba(16,185,129,0.58)", "5.1s", "2.2s"],
          [1120, 820, 4,   "rgba(99,102,241,0.6)",  "4.6s", "1.1s"],
          [550,  300, 2.5, "rgba(139,92,246,0.55)", "7.5s", "3.5s"],
          [800,  560, 3,   "rgba(99,102,241,0.58)", "5.3s", "1.9s"],
          [350,  450, 3,   "rgba(16,185,129,0.52)", "6.8s", "2.8s"],
          [600,  650, 3.5, "rgba(59,130,246,0.6)",  "4.3s", "1.3s"],
          [1050, 600, 3,   "rgba(139,92,246,0.55)", "5.7s", "2.1s"],
          [200,  750, 3,   "rgba(99,102,241,0.55)", "4.9s", "0.6s"],
        ].map(([cx, cy, r, fill, dur, begin], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill={fill} filter="url(#hm-glow)">
            <animate attributeName="opacity" values="0.15;0.85;0.15" dur={dur} begin={begin} repeatCount="indefinite" />
          </circle>
        ))}

        {/* Diagonal accent lines */}
        <line x1="0" y1="300" x2="400" y2="0" stroke="rgba(99,102,241,0.12)" strokeWidth="1">
          <animate attributeName="opacity" values="0.05;0.18;0.05" dur="9s" repeatCount="indefinite" />
        </line>
        <line x1="800" y1="0" x2="1200" y2="450" stroke="rgba(139,92,246,0.12)" strokeWidth="1">
          <animate attributeName="opacity" values="0.05;0.15;0.05" dur="11s" begin="2s" repeatCount="indefinite" />
        </line>
        <line x1="0" y1="700" x2="600" y2="900" stroke="rgba(16,185,129,0.1)" strokeWidth="1">
          <animate attributeName="opacity" values="0.04;0.14;0.04" dur="13s" begin="4s" repeatCount="indefinite" />
        </line>
        <line x1="600" y1="900" x2="1200" y2="600" stroke="rgba(59,130,246,0.1)" strokeWidth="1">
          <animate attributeName="opacity" values="0.04;0.13;0.04" dur="10s" begin="1s" repeatCount="indefinite" />
        </line>
        <line x1="0" y1="500" x2="1200" y2="400" stroke="rgba(99,102,241,0.07)" strokeWidth="1">
          <animate attributeName="opacity" values="0.03;0.1;0.03" dur="14s" begin="3s" repeatCount="indefinite" />
        </line>
      </svg>
      {/* ── Header ──────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyber-500 to-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:shadow-accent/30 transition-shadow duration-300">
              <Shield className="w-[18px] h-[18px] text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">TruthLens</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-dark-400 hover:text-white transition-colors duration-200">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary rounded-full !px-5 !py-2.5">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative pt-36 pb-28 md:pt-48 md:pb-36 px-5 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 grid-pattern opacity-40" aria-hidden="true" />
        <div className="absolute inset-0 mesh-gradient" aria-hidden="true" />

        {/* Gradient orbs */}
        <div
          ref={heroBlobRef}
          className="pointer-events-none absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-accent/15 to-neon-blue/8 blur-[100px]"
          aria-hidden="true"
        />
        <div
          ref={heroBlobRef2}
          className="pointer-events-none absolute -bottom-32 -left-40 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-neon-purple/12 to-neon-pink/6 blur-[100px]"
          aria-hidden="true"
        />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: duration.slow, ease: ease.out, delay: 0.2 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8 border border-white/[0.08] bg-white/[0.03] text-dark-300 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              AI-Powered Misinformation Detection
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.05]"
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: duration.slower, ease: ease.out, delay: 0.35 }}
          >
            Detect Fake News
            <br className="hidden sm:block" />
            <span className="text-gradient-accent">with AI Precision</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="mt-7 text-lg md:text-xl text-dark-400 max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: duration.slow, ease: ease.out, delay: 0.55 }}
          >
            TruthLens uses advanced BERT AI models to analyze news articles and detect
            misinformation with high accuracy. Verify before you share.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: duration.slow, ease: ease.out, delay: 0.75 }}
          >
            <Link to="/register" className="btn-primary rounded-full !px-8 !py-4 inline-flex items-center justify-center gap-2 text-base">
              Start Checking News
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-ghost rounded-full !px-8 !py-4 inline-flex items-center justify-center gap-2 text-base">
              Sign In
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="divider-glow" />

      {/* ── How It Works ─────────────────────────────────── */}
      <section ref={stepsSectionRef} className="relative py-24 md:py-36 px-5">
        {/* Section background */}
        <div className="absolute inset-0 grid-pattern opacity-20" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-60 -left-60 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-neon-purple/10 to-accent/6 blur-[130px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-60 -right-60 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-accent/8 to-neon-blue/5 blur-[120px]" aria-hidden="true" />
        <div className="max-w-6xl mx-auto relative">
          <Reveal>
            <div className="text-center mb-16 md:mb-24">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-white/[0.08] bg-white/[0.03] text-dark-400">
                How it works
              </span>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                Three steps to the truth
              </h2>
              <p className="text-dark-400 mt-4 max-w-lg mx-auto text-base md:text-lg">
                Follow the journey from raw news to verified truth.
              </p>
            </div>
          </Reveal>

          {/* Timeline container */}
          <div ref={timelineRef} className="relative">
            {/* Vertical track */}
            <div
              className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-[2px] md:-translate-x-[1px] bg-white/[0.06]"
              aria-hidden="true"
            >
              <div
                ref={lineRef}
                className="absolute inset-x-0 top-0 h-full origin-top bg-gradient-to-b from-accent via-neon-purple to-success"
                style={{ scaleY: 0 }}
              />
            </div>

            <div className="space-y-32 md:space-y-48">
              {steps.map((s, i) => {
                const isEven   = i % 2 === 0;
                const dotColor = ['bg-accent shadow-accent/40', 'bg-neon-purple shadow-neon-purple/40', 'bg-success shadow-success/40'][i];
                const ringColor= ['border-accent/50', 'border-neon-purple/50', 'border-success/50'][i];

                return (
                  <div
                    key={i}
                    ref={el => (stepEls.current[i] = el)}
                    className="relative"
                  >
                    {/* Dot */}
                    <div className={`step-dot absolute left-[12px] md:left-1/2 md:-translate-x-1/2 top-3 md:top-1/2 md:-translate-y-1/2 z-10 w-[22px] h-[22px] rounded-full bg-dark-950 border-2 ${ringColor} flex items-center justify-center`}>
                      <div className={`w-2.5 h-2.5 rounded-full ${dotColor} shadow-lg`} />
                    </div>

                    {/* Content row */}
                    <div className={`flex flex-col md:flex-row ${!isEven ? 'md:flex-row-reverse' : ''} items-center gap-8 md:gap-20 pl-14 md:pl-0`}>
                      <div className="step-text flex-1 max-w-lg">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-5 border border-white/[0.08] bg-white/[0.03] text-dark-400">
                          Step {s.step}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 tracking-tight">{s.title}</h3>
                        <p className="text-dark-400 text-base md:text-lg leading-relaxed">{s.desc}</p>
                      </div>
                      <div className="step-visual flex-1 w-full max-w-xs md:max-w-sm">
                        {s.visual}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="divider-gradient max-w-4xl mx-auto" />

      {/* ── Features ──────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 px-5">
        {/* Section background */}
        <div className="absolute inset-0 mesh-gradient opacity-70" aria-hidden="true" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-gradient-to-r from-accent/8 via-neon-purple/6 to-neon-cyan/5 blur-[110px]" aria-hidden="true" />
        <div className="max-w-6xl mx-auto relative">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center tracking-tight mb-4">
              Everything you need to verify truth
            </h2>
            <p className="text-dark-400 text-center max-w-xl mx-auto text-lg mb-16">
              A suite of intelligent tools designed for accuracy, speed, and transparency.
            </p>
          </Reveal>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={{
              hidden:  { transition: { staggerChildren: 0.08, staggerDirection: -1 } },
              visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.1 }}
          >
            {features.map(({ icon: Icon, title, desc, gradient }) => (
              <motion.div
                key={title}
                variants={{
                  hidden:  { opacity: 0, y: 30, scale: 0.96, transition: { duration: duration.base, ease: ease.out } },
                  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.slow, ease: ease.out } },
                }}
                whileHover={{ y: -6, transition: { duration: 0.3, ease: ease.out } }}
                className="glass-card-hover p-6 cursor-default group"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-5 h-5 text-white/80" />
                </div>
                <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="divider-glow" />

      {/* ── Metrics ──────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 px-5">
        {/* Section background */}
        <div className="absolute inset-0 grid-pattern opacity-15" aria-hidden="true" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-gradient-to-b from-neon-cyan/8 via-accent/5 to-transparent blur-[100px]" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-0 right-0 w-[400px] h-[300px] rounded-full bg-gradient-to-tl from-neon-green/6 to-transparent blur-[80px]" aria-hidden="true" />
        <div className="max-w-4xl mx-auto relative">
          <Reveal>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white text-center tracking-tight mb-16">
              Trusted by thousands
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="grid grid-cols-3 gap-6 md:gap-12">
              <StatCounter value={95} suffix="%" label="Accuracy Rate" />
              <StatCounter value={50} suffix="K+" label="Articles Analyzed" />
              <StatCounter value={30} prefix="<" suffix="s" label="Analysis Time" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Divider ────────────────────────────────────── */}
      <div className="divider-gradient max-w-4xl mx-auto" />

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 md:py-32 px-5 relative">
        <div className="absolute inset-0 mesh-gradient opacity-80" />
        <div className="absolute inset-0 grid-pattern opacity-15" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] rounded-full bg-gradient-to-r from-neon-purple/12 via-accent/10 to-neon-blue/8 blur-[120px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -top-20 left-0 w-[400px] h-[300px] rounded-full bg-gradient-to-br from-accent/8 to-transparent blur-[90px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-10 right-0 w-[350px] h-[250px] rounded-full bg-gradient-to-tl from-neon-purple/8 to-transparent blur-[80px]" aria-hidden="true" />
        <Reveal>
          <div className="relative max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
              Start verifying the news you read today
            </h2>
            <p className="text-dark-400 text-lg mb-10 max-w-xl mx-auto">
              Join TruthLens for free and gain the power to distinguish fact from fiction instantly.
            </p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={{
                hidden:  { opacity: 0, y: 20, transition: { duration: duration.base, ease: ease.out } },
                visible: { opacity: 1, y: 0,  transition: { duration: duration.slow, ease: ease.out, delay: 0.2 } },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: false }}
            >
              <Link to="/register" className="btn-primary rounded-full !px-8 !py-4 inline-flex items-center justify-center gap-2 text-base">
                Sign Up Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/login" className="btn-ghost rounded-full !px-8 !py-4 inline-flex items-center justify-center gap-2 text-base">
                Sign In
              </Link>
            </motion.div>
          </div>
        </Reveal>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="divider-gradient" />
      <footer className="relative py-10 px-5">
        <div className="absolute inset-0 mesh-gradient opacity-40" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-dark-950/80 to-transparent" aria-hidden="true" />
        <div className="relative max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyber-500 to-accent flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-semibold text-dark-400">TruthLens</span>
          </div>
          <p className="text-sm text-dark-600">&copy; {new Date().getFullYear()} TruthLens. AI-Powered Fake News Detection.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
