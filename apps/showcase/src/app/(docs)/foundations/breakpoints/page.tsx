'use client';

import { BREAKPOINT_TOKENS, Z_INDEX_TOKENS } from '@ds/tokens';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, Badge, Banner } from '@ds/ui';
import { MonitorSmartphone, Layers } from 'lucide-react';
import { PageHeader } from '@ds/ui';

const RESPONSIVE_PATTERNS = [
  {
    name: 'Mobile-first',
    cls: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    note: 'Stack on mobile, columns appear at md, expand at lg.',
  },
  {
    name: 'Density shift',
    cls: 'gap-2 sm:gap-4 lg:gap-6',
    note: 'Tighter spacing on small screens, breathing room on desktop.',
  },
  {
    name: 'Table collapse',
    cls: 'block lg:table',
    note: 'Cards on mobile, data table on large viewports.',
  },
];

export default function BreakpointsPage() {
  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Foundations"
        eyebrowIcon={MonitorSmartphone}
        title="Breakpoints & Responsive"
        description={
          <>
            Mobile-first breakpoint tokens aligned with the default Tailwind scale — build for <strong>375px</strong> first, enhance for <strong>1280px+</strong>.
          </>
        }
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              Mobile-first
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              sm → 2xl
            </Badge>
          </div>
        }
      />

      <Banner variant="highlight">
        <strong>Rule of thumb:</strong> write the base styles for mobile, then layer <code className="font-mono text-xs">sm:</code>, <code className="font-mono text-xs">md:</code>, <code className="font-mono text-xs">lg:</code> modifiers on top. Never write desktop-first.
      </Banner>

      {/* Breakpoint Scale */}
      <section id="scale" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <MonitorSmartphone className="h-6 w-6 text-highlight" />
            <span>Breakpoint Scale</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Each token represents the minimum viewport width where the modifier applies.
          </p>
        </div>

        <div className="space-y-3">
          {BREAKPOINT_TOKENS.map((bp) => {
            const pct = Math.round((bp.px / 1536) * 100);
            return (
              <Card key={bp.name} className="border-border">
                <CardContent className="p-4 flex items-center gap-4">
                  <span className="w-12 shrink-0 font-mono text-xs font-bold text-highlight">{bp.name}</span>
                  <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">{bp.value}</span>
                  <div className="h-6 flex-1 rounded-md bg-muted/60 overflow-hidden">
                    <div
                      className="h-full rounded-md bg-primary/20 border-r-2 border-primary flex items-center px-2 text-[10px] font-mono text-primary"
                      style={{ width: `${pct}%` }}
                    >
                      ≤{bp.px}px
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Responsive Patterns */}
      <section id="patterns" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Layers className="h-6 w-6 text-highlight" />
            <span>Responsive Composition Patterns</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Standard recipes for grids, spacing, and tables that adapt gracefully across breakpoints.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {RESPONSIVE_PATTERNS.map((pattern) => (
            <Card key={pattern.name} className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">{pattern.name}</CardTitle>
                <CardDescription className="text-xs">{pattern.note}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className={`grid ${pattern.cls} gap-2`}>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-10 rounded-md bg-muted/40 border border-border/60" />
                  ))}
                </div>
                <div className="rounded-lg bg-muted/40 p-3 font-mono text-[10px] text-muted-foreground overflow-x-auto">
                  <pre>{pattern.cls}</pre>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Z-Index Scale */}
      <section id="z-index" className="space-y-4 scroll-mt-20">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
            <Layers className="h-6 w-6 text-highlight" />
            <span>Z-Index Scale</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            A disciplined stacking order prevents overlay collisions. Components must not invent ad-hoc z-values.
          </p>
        </div>

        <Card className="border-border">
          <CardContent className="p-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border text-muted-foreground font-mono">
                  <th className="pb-2 pr-4 font-semibold">Token</th>
                  <th className="pb-2 pr-4 font-semibold">Value</th>
                  <th className="pb-2 font-semibold">Usage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {Object.entries(Z_INDEX_TOKENS).map(([name, value]) => (
                  <tr key={name}>
                    <td className="py-2.5 pr-4 text-highlight font-bold">{name}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{value}</td>
                    <td className="py-2.5 text-muted-foreground font-sans">{zUsage(name)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function zUsage(name: string): string {
  const map: Record<string, string> = {
    hide: 'Content hidden behind surfaces',
    base: 'Default document flow',
    docked: 'Sticky headers, fixed navbars',
    dropdown: 'Dropdown and select menus',
    sticky: 'Sticky filter bars',
    banner: 'Alert banners',
    overlay: 'In-page overlay scrims',
    modal: 'Dialog and alert dialog content',
    popover: 'Popover and hover-card surfaces',
    toast: 'Toast notifications',
    tooltip: 'Tooltips',
    max: 'Emergency overlay / screen reader veil',
  };
  return map[name] ?? '—';
}