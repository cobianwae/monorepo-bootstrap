'use client';

import * as React from 'react';
import Link from 'next/link';
import { Layers, ArrowRight, AlertCircle } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  cn,
} from '@ds/ui';

interface FunnelStage {
  stage: string;
  count: number;
  value: number;
  color: string;
  conversionRate: number; // percentage of deals moving to next step
  avgCycleDays: number;
  isHotspot?: boolean;
}

const FUNNEL_STAGES: FunnelStage[] = [
  {
    stage: 'New Inbound',
    count: 14,
    value: 164000,
    color: 'var(--color-chart-1)',
    conversionRate: 85,
    avgCycleDays: 3,
  },
  {
    stage: 'Contacted',
    count: 12,
    value: 148000,
    color: 'var(--color-chart-2)',
    conversionRate: 75,
    avgCycleDays: 5,
  },
  {
    stage: 'Qualified',
    count: 9,
    value: 192000,
    color: 'var(--color-chart-3)',
    conversionRate: 66,
    avgCycleDays: 8,
  },
  {
    stage: 'Proposal',
    count: 6,
    value: 218000,
    color: 'var(--color-chart-4)',
    conversionRate: 66,
    avgCycleDays: 12,
  },
  {
    stage: 'Negotiation',
    count: 4,
    value: 242000,
    color: 'var(--color-chart-5)',
    conversionRate: 75,
    avgCycleDays: 18,
    isHotspot: true,
  },
  {
    stage: 'Closed Won',
    count: 12,
    value: 380000,
    color: 'var(--color-success)',
    conversionRate: 100,
    avgCycleDays: 24,
  },
];

interface CrmPipelineFunnelCardProps {
  className?: string;
}

export function CrmPipelineFunnelCard({ className }: CrmPipelineFunnelCardProps) {
  const totalValue = React.useMemo(() => {
    return FUNNEL_STAGES.reduce((sum, s) => sum + s.value, 0);
  }, []);

  const totalDeals = React.useMemo(() => {
    return FUNNEL_STAGES.reduce((sum, s) => sum + s.count, 0);
  }, []);

  const maxValue = 400000;

  return (
    <Card className={cn('flex flex-col justify-between shadow-xs border-border/80 bg-card/90 backdrop-blur-sm', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <CardTitle className="font-display text-base font-bold text-foreground">
              Pipeline Conversion Funnel
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Deal velocity & drop-off rates across stages
          </CardDescription>
        </div>

        <Link href="/crm/leads">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
            <span>Kanban</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="pt-4 space-y-4 flex-1 flex flex-col justify-between">
        {/* Stepped Conversion Funnel List */}
        <div className="space-y-3">
          {FUNNEL_STAGES.map((st, idx) => {
            const widthPct = Math.min(100, Math.max(15, Math.round((st.value / maxValue) * 100)));

            return (
              <div key={st.stage} className="space-y-1 group">
                <div className="flex items-center justify-between text-xs">
                  {/* Left: Stage Name & Color Dot */}
                  <span className="font-medium text-foreground flex items-center gap-1.5 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0 ring-1 ring-border/50"
                      style={{ backgroundColor: st.color }}
                    />
                    <span className="truncate">{st.stage}</span>
                    {st.isHotspot && (
                      <Badge
                        variant="highlight"
                        className="text-[9px] px-1.5 py-0 h-4 uppercase font-mono tracking-wider ml-1"
                      >
                        High ARR
                      </Badge>
                    )}
                  </span>

                  {/* Right: Deal count, Value, and Conversion rate */}
                  <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                    <span className="text-muted-foreground">({st.count} deals)</span>
                    <span className="font-bold text-foreground tabular-nums">
                      ${(st.value / 1000).toFixed(0)}k
                    </span>
                    {idx < FUNNEL_STAGES.length - 1 && (
                      <span className="text-[10px] text-muted-foreground/80 bg-muted/60 px-1 py-0.5 rounded">
                        {st.conversionRate}% pass
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden p-0.5 border border-border/30">
                  <div
                    className="h-full rounded-full transition-all duration-500 group-hover:opacity-90"
                    style={{
                      width: `${widthPct}%`,
                      backgroundColor: st.color,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottleneck Diagnostic Well */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
              <AlertCircle className="h-3.5 w-3.5 text-highlight" />
              Stage Liquidity Hotspot
            </span>
            <Badge variant="outline" className="font-mono text-[10px]">
              18d avg cycle
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground font-mono">$242,000 (28.6%)</span> of active pipeline is concentrated in <span className="font-medium text-foreground">Negotiation</span>. SAML & BAA compliance are the primary catalysts.
          </p>
        </div>

        {/* Summary Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">
            Total: ${totalValue.toLocaleString()} ({totalDeals} total entries)
          </span>
          <Link
            href="/crm/leads"
            className="text-xs font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            Manage Pipeline
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
