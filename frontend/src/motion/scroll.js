import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from './useReducedMotion';
import { ease, duration } from './config';

// Register plugin once
gsap.registerPlugin(ScrollTrigger);

/* ─── Parallax ────────────────────────────────────────── */

/**
 * Applies a subtle parallax translation to target element on scroll.
 *
 * @param {React.RefObject} targetRef – element to move
 * @param {Object}  [opts]
 * @param {number}  [opts.speed=50] – px travel
 * @param {string}  [opts.direction='y'] – 'y' | 'x'
 */
export function useParallax(targetRef, { speed = 50, direction = 'y' } = {}) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const el = targetRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { [direction]: -speed / 2 },
        {
          [direction]: speed / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    });

    return () => ctx.revert();
  }, [targetRef, speed, direction, prefersReduced]);
}

/* ─── Pinned Section ──────────────────────────────────── */

/**
 * Pins `sectionRef` and scrubs through a timeline while pinned.
 *
 * @param {React.RefObject} sectionRef
 * @param {Object}   [opts]
 * @param {Function} [opts.buildTimeline] – receives (tl, container) → caller pushes tweens
 * @param {string}   [opts.start='top top']
 * @param {string}   [opts.end='+=200%']
 * @param {boolean}  [opts.disableOnMobile=true]
 */
export function usePinnedSection(
  sectionRef,
  {
    buildTimeline,
    start = 'top top',
    end = '+=200%',
    disableOnMobile = true,
  } = {},
) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    if (disableOnMobile && window.innerWidth < 768) return;
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          pin: true,
          start,
          end,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      if (typeof buildTimeline === 'function') {
        buildTimeline(tl, el);
      }
    });

    return () => ctx.revert();
  }, [sectionRef, buildTimeline, start, end, disableOnMobile, prefersReduced]);
}

/* ─── Count-Up ────────────────────────────────────────── */

/**
 * Tweens a number from 0 → `endValue` when the target enters the viewport.
 *
 * @param {React.RefObject} targetRef
 * @param {Object}  opts
 * @param {number}  opts.endValue
 * @param {string}  [opts.suffix='']
 * @param {string}  [opts.prefix='']
 * @param {number}  [opts.duration=1.5]
 * @param {boolean} [opts.snap=true]
 */
export function useCountUp(
  targetRef,
  { endValue, suffix = '', prefix = '', duration: dur = 1.5, snap = true } = {},
) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const el = targetRef.current;
    if (!el) return;

    // Immediate display if reduced motion
    if (prefersReduced) {
      el.textContent = `${prefix}${snap ? Math.round(endValue) : endValue}${suffix}`;
      return;
    }

    const obj = { val: 0 };

    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: endValue,
        duration: dur,
        ease: ease.gsapOut,
        snap: snap ? { val: 1 } : {},
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
        onUpdate() {
          el.textContent = `${prefix}${snap ? Math.round(obj.val) : obj.val.toFixed(1)}${suffix}`;
        },
      });
    });

    return () => ctx.revert();
  }, [targetRef, endValue, suffix, prefix, dur, snap, prefersReduced]);
}

/* ─── Fade-in on scroll (GSAP version for non-Framer sections) ── */

export function useGsapReveal(targetRef, { y = 40, duration: dur = duration.slow, stagger: stag = 0 } = {}) {
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced) return;
    const el = targetRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const children = stag ? el.children : [el];
      gsap.from(children, {
        y,
        opacity: 0,
        duration: dur,
        stagger: stag,
        ease: ease.gsapSmooth,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });
    });

    return () => ctx.revert();
  }, [targetRef, y, dur, stag, prefersReduced]);
}
