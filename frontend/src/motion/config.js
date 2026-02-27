/* ───────────────────────────────────────────────────────────
   Motion Design Tokens — Minimal Gradient Theme
   Shared timing, easing & transition presets for GSAP + Framer
   ─────────────────────────────────────────────────────────── */

// ── Durations (seconds) ──
export const duration = {
  fast:   0.25,
  base:   0.5,
  slow:   0.8,
  slower: 1.2,
};

// ── Easing — smooth cinematic curves ──
export const ease = {
  // Framer Motion / CSS cubic-beziers
  default: [0.25, 0.1, 0.25, 1.0],
  out:     [0.16, 1, 0.3, 1],          // strong deceleration
  inOut:   [0.76, 0, 0.24, 1],         // symmetric
  smooth:  [0.45, 0, 0.15, 1],         // gentle
  spring:  { type: 'spring', stiffness: 80, damping: 20, mass: 0.8 },

  // GSAP string tokens
  gsapOut:    'power3.out',
  gsapInOut:  'power2.inOut',
  gsapSmooth: 'power4.out',
  gsapExpo:   'expo.out',
};

// ── Stagger presets ──
export const stagger = {
  fast: 0.06,
  base: 0.1,
  slow: 0.15,
};

// ── Viewport / IntersectionObserver thresholds ──
export const viewport = {
  once: true,
  amount: 0.2,
  margin: '-80px',
};

// ── Framer Motion transition presets ──
export const transition = {
  fade: {
    duration: duration.base,
    ease: ease.out,
  },
  slide: {
    duration: duration.slow,
    ease: ease.out,
  },
  page: {
    duration: duration.base,
    ease: ease.inOut,
  },
  spring: {
    ...ease.spring,
  },
};

// ── Framer Motion variant presets ──
export const variants = {
  fadeUp: {
    hidden:  { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: transition.slide },
  },
  fadeIn: {
    hidden:  { opacity: 0 },
    visible: { opacity: 1, transition: transition.fade },
  },
  scaleIn: {
    hidden:  { opacity: 0, scale: 0.92 },
    visible: { opacity: 1, scale: 1, transition: transition.slide },
  },
  staggerContainer: {
    hidden:  {},
    visible: {
      transition: { staggerChildren: stagger.base, delayChildren: 0.1 },
    },
  },
  slideRight: {
    hidden:  { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0, transition: transition.slide },
  },
  slideLeft: {
    hidden:  { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: transition.slide },
  },
  glowIn: {
    hidden:  { opacity: 0, y: 20, filter: 'blur(10px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: duration.slow, ease: ease.out } },
  },
  // Card-specific — scale + fade with slight y
  card: {
    hidden:  { opacity: 0, y: 30, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: duration.slow, ease: ease.out } },
  },
  // Container for stagger with custom timing
  staggerSlow: {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger.slow, delayChildren: 0.15 },
    },
  },
};

// ── Route transition variants ──
export const pageTransition = {
  initial:  { opacity: 0, y: 28, filter: 'blur(10px)', scale: 0.98 },
  animate:  {
    opacity: 1, y: 0, filter: 'blur(0px)', scale: 1,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
  exit:     {
    opacity: 0, y: -16, filter: 'blur(8px)', scale: 0.99,
    transition: { duration: 0.35, ease: [0.76, 0, 0.24, 1] },
  },
};
