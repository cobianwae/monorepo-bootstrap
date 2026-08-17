'use client';

import * as React from 'react';
import { THEMES } from '@ds/tokens';
import { useTheme } from '@ds/ui';

const LIGHTNESS_STEPS = [0.95, 0.85, 0.75, 0.65, 0.55, 0.45, 0.35] as const;

function parseOklch(value: string): { c: number; h: number } | null {
  const match = value.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!match) return null;
  return { c: Number(match[2]), h: Number(match[3]) };
}

/**
 * Interactive OKLCH lightness ramp derived from the ACTIVE palette's real
 * swatch values. Switching tones or modes rebuilds the ramp; hovering any
 * step reveals its exact oklch() coordinate.
 */
export function OklchRamp() {
  const { palette, resolvedTheme } = useTheme();
  const [readout, setReadout] = React.useState<string | null>(null);

  const theme = THEMES.find((t) => t.id === palette) ?? THEMES[0];
  const isDark = resolvedTheme === 'dark';

  const channels = [
    {
      label: 'Primary',
      oklch: isDark ? theme.swatches.primary.dark : theme.swatches.primary.light,
    },
    {
      label: 'Highlight',
      oklch: isDark ? theme.swatches.highlight.dark : theme.swatches.highlight.light,
    },
  ];

  return (
    <div className="space-y-4">
      {channels.map((channel) => {
        const parsed = parseOklch(channel.oklch);
        if (!parsed) return null;

        return (
          <div key={channel.label}>
            <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {channel.label} · hue {parsed.h}
            </p>
            <div className="flex h-12 gap-1" role="group" aria-label={`${channel.label} lightness ramp`}>
              {LIGHTNESS_STEPS.map((lightness) => {
                const value = `oklch(${lightness.toFixed(2)} ${parsed.c.toFixed(2)} ${parsed.h})`;
                return (
                  <button
                    key={lightness}
                    type="button"
                    aria-label={value}
                    onMouseEnter={() => setReadout(value)}
                    onFocus={() => setReadout(value)}
                    className="flex-1 rounded-md transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    style={{ backgroundColor: value }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      <p aria-live="polite" className="h-4 font-mono text-xs text-muted-foreground">
        {readout ?? 'Hover the ramp — live oklch() coordinates'}
      </p>
    </div>
  );
}
