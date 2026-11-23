'use client';

import * as React from 'react';

interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
  delay?: number;
}

/**
 * A target taller than the viewport can never reach a fractional threshold:
 * its maximum intersection ratio is viewport height / target height. Without
 * this guard those targets would stay hidden forever, so we fall back to 0 and
 * reveal as soon as the top edge enters the root.
 */
function resolveThreshold(node: HTMLElement, threshold: number) {
  if (threshold <= 0) return threshold;
  return node.getBoundingClientRect().height > window.innerHeight ? 0 : threshold;
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
      { threshold: resolveThreshold(node, threshold), rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const style = delay > 0 ? { transitionDelay: `${delay}ms` } : undefined;

  return { ref, inView, style };
}