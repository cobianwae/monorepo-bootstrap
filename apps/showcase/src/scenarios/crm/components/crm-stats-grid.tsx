'use client';

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  Zap,
} from 'lucide-react';
import {
  Card,
  Skeleton,
  formatCurrency,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';
import { calculateActivePipeline } from '../lib/pipeline';

interface CrmStatsGridProps {
  isLoading?: boolean;
}

export function CrmStatsGrid({ isLoading = false }: CrmStatsGridProps) {
  const { leads, metrics } = useCrm();

  const totalCalculatedPipeline = React.useMemo(() => {
    return calculateActivePipeline(leads);
  }, [leads]);

  const quota = metrics.quotaTarget;
  const pipelinePacingPct = Math.round((totalCalculatedPipeline / quota) * 100);

  const urgentLeadsCount = React.useMemo(() => {
    return leads.filter((l) => l.priority === 'urgent' && l.stage !== 'won' && l.stage !== 'lost').length;
  }, [leads]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 space-y-4 bg-card border-border rounded-2xl">
            <div className="flex justify-between items-center">
              <Skeleton className="h-9 w-9 rounded-xl" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-4 w-40" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Active Pipeline (Subtly Highlighted Hero Card) */}
      <Card className="relative flex flex-col justify-between p-6 rounded-2xl border border-primary/35 bg-gradient-to-b from-primary/[0.06] via-card to-card shadow-xs transition-all duration-200 hover:border-primary/60 hover:shadow-sm">
        {/* Subtle Top Hairline Highlight */}
        <div className="absolute inset-x-0 top-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-primary/70 to-transparent" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                <DollarSign className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Pipeline
              </span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-success">
              <TrendingUp className="h-3.5 w-3.5" />
              +{metrics.pipelineGrowthPct}%
            </span>
          </div>

          <div>
            <div className="font-display text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
              {formatCurrency(totalCalculatedPipeline)}
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1.5">
              {pipelinePacingPct}% pacing toward {formatCurrency(quota)} quota
            </p>
          </div>
        </div>
      </Card>

      {/* 2. Win Rate */}
      <Card className="flex flex-col justify-between p-6 rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-200 hover:border-border hover:shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                <Target className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Win Rate
              </span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-success">
              <TrendingUp className="h-3.5 w-3.5" />
              +{metrics.winRateDeltaPct}%
            </span>
          </div>

          <div>
            <div className="font-display text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
              {metrics.winRatePct}%
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1.5">
              {metrics.leadsWonThisMonth} won deals · Target: 30%
            </p>
          </div>
        </div>
      </Card>

      {/* 3. Deal Velocity */}
      <Card className="flex flex-col justify-between p-6 rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-200 hover:border-border hover:shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                <Clock className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Sales Cycle
              </span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-warning-text">
              <TrendingUp className="h-3.5 w-3.5" />
              +{metrics.salesCycleDeltaDays}d
            </span>
          </div>

          <div>
            <div className="font-display text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
              {metrics.avgSalesCycleDays} days
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1.5">
              {urgentLeadsCount} urgent deals in review
            </p>
          </div>
        </div>
      </Card>

      {/* 4. Response Time */}
      <Card className="flex flex-col justify-between p-6 rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-200 hover:border-border hover:shadow-sm">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                <Zap className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
                Avg Response
              </span>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-success">
              <TrendingDown className="h-3.5 w-3.5" />
              -{metrics.responseTimeDeltaMin}m WoW
            </span>
          </div>

          <div>
            <div className="font-display text-3xl font-extrabold text-foreground tabular-nums tracking-tight">
              {metrics.avgResponseTimeMin} min
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-1.5">
              Omnichannel SLA &lt; 5m target
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
