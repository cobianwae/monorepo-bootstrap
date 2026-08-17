'use client';

import { Columns3, Command, Search, Table2 } from 'lucide-react';
import { Badge, Button, Card, Kbd, Progress, Slider, Switch } from '@ds/ui';
import { usePointerParallax } from '@/hooks/use-pointer-parallax';

const SPARKLINE_POINTS = '0,32 12,28 24,30 36,22 48,24 60,16 72,18 84,10 96,12 108,4';

/**
 * "Living canvas" — the hero centrepiece. A layered collage of REAL design
 * system components (switch, slider, progress, badges…) that re-theme live
 * with every art direction and respond to the pointer with soft parallax.
 */
export function HeroCanvas() {
  const containerRef = usePointerParallax<HTMLDivElement>();

  return (
    <div
      ref={containerRef}
      className="relative mx-auto aspect-[5/4] w-full max-w-xl select-none"
      aria-label="Live composition of Arah design system components"
    >
      {/* Ambient blob — deepest layer */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div data-depth={8} className="will-change-transform">
          <div
            className="h-72 w-72 rounded-full opacity-60 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, color-mix(in oklch, var(--color-highlight) 30%, transparent), color-mix(in oklch, var(--color-primary) 12%, transparent) 55%, transparent 75%)',
            }}
          />
        </div>
      </div>

      {/* Main analytics window */}
      <div className="absolute inset-x-[8%] top-[22%]">
        <div data-depth={14} className="will-change-transform">
          <Card className="overflow-hidden border-border/60 bg-card/90 py-0 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
              <span className="flex gap-1.5" aria-hidden="true">
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
                <span className="h-2.5 w-2.5 rounded-full bg-border" />
              </span>
              <span className="ml-1 font-mono text-[10px] tracking-wide text-muted-foreground">
                arah — analytics
              </span>
              <Badge variant="success-outline" className="ml-auto font-mono text-[10px]">
                Live
              </Badge>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    Monthly revenue
                  </p>
                  <p className="font-display text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
                    $48.2K
                  </p>
                </div>
                <Badge variant="success" className="font-mono text-[10px]">
                  +12.4%
                </Badge>
              </div>
              <svg
                viewBox="0 0 108 36"
                className="h-10 w-full"
                aria-hidden="true"
                preserveAspectRatio="none"
              >
                <polyline
                  points={SPARKLINE_POINTS}
                  fill="none"
                  stroke="var(--color-highlight)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Progress value={72} aria-label="Quarterly goal progress" />
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Q3 · 72% of goal
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Command palette card */}
      <div className="absolute bottom-[6%] left-0 w-[52%]">
        <div data-depth={30} className="will-change-transform">
          <div className="animate-float" style={{ animationDelay: '-2s' }}>
            <Card className="gap-0 border-border/60 bg-card/90 py-0 shadow-xl backdrop-blur">
              <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
                <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="flex-1 truncate text-xs text-muted-foreground">
                  Search patterns…
                </span>
                <Kbd className="text-[10px]">⌘K</Kbd>
              </div>
              <div className="space-y-0.5 p-2">
                {[
                  { icon: Table2, label: 'Data Table' },
                  { icon: Columns3, label: 'Kanban Board' },
                  { icon: Command, label: 'Command Palette' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/60"
                  >
                    <Icon className="h-3.5 w-3.5 text-highlight" aria-hidden="true" />
                    {label}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Controls card — fully interactive */}
      <div className="absolute right-0 top-[2%] w-[48%]">
        <div data-depth={38} className="will-change-transform">
          <div className="animate-float rotate-[-3deg]" style={{ animationDelay: '-4.5s' }}>
            <Card className="gap-0 border-border/60 bg-card/90 py-0 shadow-xl backdrop-blur">
              <div className="space-y-4 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-foreground">Notifications</span>
                  <Switch defaultChecked aria-label="Toggle notifications" />
                </div>
                <Slider defaultValue={[64]} max={100} aria-label="Volume" />
                <div className="flex gap-2">
                  <Button size="sm" className="h-8 flex-1 text-xs">
                    Deploy
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 flex-1 text-xs">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Floating chips — shallowest layers */}
      <div className="absolute bottom-[24%] right-[6%]">
        <div data-depth={48} className="will-change-transform">
          <div className="animate-float rotate-3" style={{ animationDelay: '-1s' }}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/30 bg-card px-3 py-1.5 font-mono text-[10px] font-semibold text-success shadow-lg">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              WCAG AAA
            </span>
          </div>
        </div>
      </div>

      <div className="absolute left-[10%] top-[8%]">
        <div data-depth={44} className="will-change-transform">
          <div className="animate-float rotate-[-6deg]" style={{ animationDelay: '-3.2s' }}>
            <span className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-card px-2.5 py-2 shadow-lg">
              <Kbd className="text-[10px]">⌘</Kbd>
              <Kbd className="text-[10px]">K</Kbd>
            </span>
          </div>
        </div>
      </div>

      {/* Baseline caption */}
      <p className="absolute -bottom-2 right-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
        Every pixel above is a live component
      </p>
    </div>
  );
}
