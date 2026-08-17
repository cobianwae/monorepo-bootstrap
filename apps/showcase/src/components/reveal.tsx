'use client';

import type * as React from 'react';
import { cn } from '@ds/ui';
import { useReveal } from '@/hooks/use-reveal';

interface RevealProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Delay in ms before the transition fires once in view. */
  delay?: number;
  /** Optional easing class override. Defaults to the spring-like exit ease. */
  variant?: 'fade-up' | 'fade' | 'zoom';
}

const VARIANTS = {
  'fade-up': 'translate-y-5 opacity-0 data-[visible=true]:translate-y-0 data-[visible=true]:opacity-100',
  fade: 'opacity-0 data-[visible=true]:opacity-100',
  zoom: 'scale-95 opacity-0 data-[visible=true]:scale-100 data-[visible=true]:opacity-100',
} as const;

export function Reveal({
  delay = 0,
  variant = 'fade-up',
  className,
  children,
  ...props
}: RevealProps) {
  const { ref, inView, style } = useReveal({ delay });

  return (
    <div
      ref={ref}
      data-visible={inView}
      style={style}
      className={cn(
        'transition-all duration-500 will-change-transform motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:opacity-100',
        VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}