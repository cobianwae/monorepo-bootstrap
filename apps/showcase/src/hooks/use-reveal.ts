'use client';

import * as React from 'react';

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

/**
 * Observes an element and returns a boolean that flips to `true` once it
 * enters the viewport. Used to drive scroll-triggered entrance animations.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>({
  threshold = 0.15,
  rootMargin = '0px 0px -40px 0px',
  delay = 0,
}: UseRevealOptions = {}) {
  const ref = React.useRef<T | null>(null);
  const [inView, setInView] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const style = delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  return { ref, inView, style };
}