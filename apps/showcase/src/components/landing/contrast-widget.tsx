'use client';

import * as React from 'react';
import { THEMES, checkWcagCompliance, getContrastRatio } from '@ds/tokens';
import { Badge, cn, useTheme } from '@ds/ui';

const FEATURED_PAIRS = ['Default Body Text', 'Primary Action Button', 'Muted Caption Text'];

/**
 * Live WCAG contrast checker — every ratio is computed at render time from
 * the active palette's real hex pairs via @ds/tokens. No hardcoded numbers.
 */
export function ContrastWidget() {
  const { palette, resolvedTheme } = useTheme();
  const [activeIndex, setActiveIndex] = React.useState(0);

  const theme = THEMES.find((t) => t.id === palette) ?? THEMES[0];
  const pairs = theme.pairs.filter((p) => FEATURED_PAIRS.includes(p.name));
  const pair = pairs[activeIndex] ?? pairs[0];

  const isDark = resolvedTheme === 'dark';
  const fg = isDark ? pair.darkFg : pair.lightFg;
  const bg = isDark ? pair.darkBg : pair.lightBg;
  const compliance = checkWcagCompliance(getContrastRatio(fg, bg));

  return (
    <div className="flex h-full flex-col gap-4">
      <div role="tablist" aria-label="Token pair" className="flex flex-wrap gap-1.5">
        {pairs.map((p, i) => (
          <button
            key={p.name}
            role="tab"
            aria-selected={i === activeIndex}
            onClick={() => setActiveIndex(i)}
            className={cn(
              'rounded-full border px-3 py-1 font-mono text-[10px] font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              i === activeIndex
                ? 'border-highlight/50 bg-highlight/10 text-highlight'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-xl border border-success/20 bg-success/5 p-4">
        <div className="space-y-1">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-success">
            Contrast ratio
          </span>
          <div className="font-display text-3xl font-extrabold tabular-nums text-foreground">
            {compliance.ratioFormatted}
          </div>
        </div>
        <Badge variant="success" className="font-mono text-xs">
          {compliance.level}
        </Badge>
      </div>

      <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground">
        <span
          className="h-3.5 w-3.5 rounded-full ring-1 ring-border"
          style={{ backgroundColor: fg }}
          aria-hidden="true"
        />
        {pair.fgName} {fg}
        <span aria-hidden="true">on</span>
        <span
          className="h-3.5 w-3.5 rounded-full ring-1 ring-border"
          style={{ backgroundColor: bg }}
          aria-hidden="true"
        />
        {pair.bgName} {bg}
      </div>

      <p className="mt-auto text-[11px] leading-snug text-muted-foreground">
        Computed live from <span className="font-mono text-highlight">@ds/tokens</span> — switch
        tone or mode and this re-audits instantly.
      </p>
    </div>
  );
}
