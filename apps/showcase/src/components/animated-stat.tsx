'use client';

import { useReveal } from '@/hooks/use-reveal';
import { useCountUp } from '@/hooks/use-count-up';

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  label: string;
  description: string;
  delay?: number;
}

export function AnimatedStat({ value, suffix = '', label, description, delay = 0 }: AnimatedStatProps) {
  const { ref, inView, style } = useReveal({ delay });

  const display = useCountUp({ end: value, start: inView });

  return (
    <div
      ref={ref}
      data-visible={inView}
      style={style}
      className="group flex flex-col items-center gap-1 text-center transition-all duration-500"
    >
      <span className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground transition-colors duration-300 group-hover:text-highlight tabular-nums">
        {display}
        {suffix}
      </span>
      <span className="text-sm font-semibold text-foreground">{label}</span>
      <span className="text-xs text-muted-foreground max-w-[200px] leading-snug">{description}</span>
    </div>
  );
}