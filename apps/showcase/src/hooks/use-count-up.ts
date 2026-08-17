'use client';

import * as React from 'react';

interface UseCountUpOptions {
  /** Target number to animate to. */
  end: number;
  /** Animation duration in ms. */
  duration?: number;
  /** Format function applied to the animated value. */
  format?: (value: number) => string;
  /** When to start. Pass the result of useReveal().inView to trigger. */
  start?: boolean;
}

/**
 * Animates a number from 0 to `end` using an ease-out curve.
 * Pairs naturally with `useReveal` so the counter runs on scroll into view.
 */
export function useCountUp({ end, duration = 1400, format, start = true }: UseCountUpOptions) {
  const [value, setValue] = React.useState(0);
  const frame = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!start) return;

    if (typeof window === 'undefined' || !('requestAnimationFrame' in window)) {
      setValue(end);
      return;
    }

    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      // easeOutExpo for a confident, decelerating climb
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(end * eased);
      if (progress < 1) {
        frame.current = requestAnimationFrame(tick);
      }
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [end, duration, start]);

  return format ? format(value) : Math.round(value).toLocaleString();
}