import { useRef, useState, useEffect, useCallback } from 'react';
import { useReducedMotion } from './useReducedMotion';

/**
 * IntersectionObserver-based reveal hook.
 *
 * @param {Object}  [options]
 * @param {boolean} [options.once=true]         – unobserve after first trigger
 * @param {number}  [options.threshold=0.25]    – visibility ratio to trigger
 * @param {string}  [options.rootMargin='-60px'] – root margin
 * @returns {{ ref: React.RefObject, isVisible: boolean }}
 */
export function useRevealOnScroll({
  once = true,
  threshold = 0.25,
  rootMargin = '-60px',
} = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    // Immediately visible when motion is reduced
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.unobserve(node);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin, prefersReduced]);

  return { ref, isVisible };
}

/**
 * Lightweight component wrapper that fades children up when scrolled into view.
 * Uses Framer Motion internally.
 */
export { useRevealOnScroll as default };
