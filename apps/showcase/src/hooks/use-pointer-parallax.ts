'use client';

import * as React from 'react';

/**
 * Pointer-driven parallax for layered compositions.
 *
 * Attach the returned ref to a container. Any descendant carrying a
 * `data-depth={px}` attribute is translated by up to ±depth px based on the
 * pointer position, smoothed with a lerp for a butter-soft feel.
 *
 * Accessibility: does nothing when the user prefers reduced motion, and the
 * layers settle back to rest when the pointer leaves the container.
 */
export function usePointerParallax<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = React.useRef<T | null>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const layers = Array.from(container.querySelectorAll<HTMLElement>('[data-depth]'));
    if (layers.length === 0) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame: number | null = null;

    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;

      for (const layer of layers) {
        const depth = Number(layer.dataset.depth ?? 0);
        layer.style.transform = `translate3d(${(current.x * depth).toFixed(2)}px, ${(current.y * depth).toFixed(2)}px, 0)`;
      }

      const settled =
        Math.abs(target.x - current.x) < 0.005 && Math.abs(target.y - current.y) < 0.005;
      frame = settled ? null : requestAnimationFrame(tick);
    };

    const start = () => {
      if (frame === null) frame = requestAnimationFrame(tick);
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      target.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      target.y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
      start();
    };

    const onPointerLeave = () => {
      target.x = 0;
      target.y = 0;
      start();
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerleave', onPointerLeave);

    return () => {
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  return containerRef;
}
