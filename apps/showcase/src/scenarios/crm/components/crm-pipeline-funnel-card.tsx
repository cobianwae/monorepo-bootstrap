'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
  conversionRate: number;
  isHotspot?: boolean;
}

const FUNNEL_STAGES: FunnelStage[] = [
  {
    stage: 'New Inbound',
    count: 14,
    value: 164000,
    color: 'var(--color-chart-1)',
    conversionRate: 85,
  },
  {
    stage: 'Contacted',
    count: 12,
    value: 148000,
    color: 'var(--color-chart-2)',
    conversionRate: 75,
  },
  {
    stage: 'Qualified',
    count: 9,
    value: 192000,
    color: 'var(--color-chart-3)',
    conversionRate: 66,
  },
  {
    stage: 'Proposal',
    count: 6,
    value: 218000,
    color: 'var(--color-chart-4)',
    conversionRate: 66,
  },
  {
    stage: 'Negotiation',
    count: 4,
    value: 242000,
    color: 'var(--color-chart-5)',
    conversionRate: 75,
    isHotspot: true,
  },
  {
    stage: 'Closed Won',
    count: 12,
    value: 380000,
    color: 'var(--color-success)',
    conversionRate: 100,
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
    <Card className={cn('flex flex-col justify-between border border-border/80 bg-card p-6 shadow-xs rounded-xl', className)}>
      <CardHeader className="flex flex-row items-center justify-between p-0 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
            Pipeline Funnel
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Deal velocity & stage liquidity
          </CardDescription>
        </div>

        <Link href="/crm/leads">
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground">
            <span>Kanban</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-0 pt-6 space-y-4 flex-1 flex flex-col justify-between">
        {/* Stepped Conversion Funnel */}
        <div className="space-y-3.5">
          {FUNNEL_STAGES.map((st, idx) => {
            const widthPct = Math.min(100, Math.max(15, Math.round((st.value / maxValue) * 100)));

            return (
              <div key={st.stage} className="space-y-1 group">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground flex items-center gap-2 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0 ring-1 ring-border/50"
                      style={{ backgroundColor: st.color }}
                    />
                    <span className="truncate">{st.stage}</span>
                    {st.isHotspot && (
                      <Badge
                        variant="highlight"
                        className="text-[9px] px-1.5 py-0 h-4 uppercase font-mono tracking-wider ml-1 shadow-2xs"
                      >
                        $242k Hotspot
                      </Badge>
                    )}
                  </span>

                  <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                    <span className="text-muted-foreground">({st.count})</span>
                    <span className="font-bold text-foreground tabular-nums">
                      ${(st.value / 1000).toFixed(0)}k
                    </span>
                    {idx < FUNNEL_STAGES.length - 1 && (
                      <span className="text-[10px] text-muted-foreground bg-muted/50 px-1 py-0.5 rounded">
                        {st.conversionRate}% pass
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden p-0.5 border border-border/30">
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

        {/* Clean Summary Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40 text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">
            Active: ${totalValue.toLocaleString()} ({totalDeals} opportunities)
          </span>
          <Link
            href="/crm/leads"
            className="text-xs font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            Manage Stages
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
