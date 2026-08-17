'use client';

import { ART_DIRECTIONS, COLOR_TOKENS, auditThemeTokenPairs } from '@ds/tokens';
import { AnimatedStat } from '@/components/animated-stat';

const audit = auditThemeTokenPairs();
const passRate = Math.round(
  (audit.filter((pair) => pair.compliance.passAA).length / audit.length) * 100
);

const STATS = [
  {
    value: audit.length,
    suffix: '',
    label: 'Pairs Audited',
    description: 'Every tone, light & dark',
  },
  {
    value: passRate,
    suffix: '%',
    label: 'WCAG AA Pass',
    description: 'Computed from live tokens',
  },
  {
    value: ART_DIRECTIONS.length,
    suffix: '',
    label: 'Art Directions',
    description: 'Atelier · Aurora · Blueprint',
  },
  {
    value: COLOR_TOKENS.length * 2,
    suffix: '',
    label: 'Token Values',
    description: 'OKLCH, dual mode parity',
  },
] as const;

/**
 * Stats band with zero vanity numbers — every figure is derived at render
 * time from @ds/tokens, so it can never drift from the truth.
 */
export function LiveStats() {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/50 shadow-sm md:grid-cols-4">
      {STATS.map((stat, i) => (
        <div key={stat.label} className="flex items-center justify-center bg-card p-8">
          <AnimatedStat
            value={stat.value}
            suffix={stat.suffix}
            label={stat.label}
            description={stat.description}
            delay={i * 100}
          />
        </div>
      ))}
    </div>
  );
}
