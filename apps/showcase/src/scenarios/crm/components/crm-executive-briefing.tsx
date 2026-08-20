'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  Plus,
  ArrowUpRight,
  Flame,
} from 'lucide-react';
import {
  Button,
  Avatar,
  AvatarFallback,
  AvatarImage,
  SegmentedControl,
  SegmentedControlItem,
  cn,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';

export type TimeHorizon = 'mtd' | 'q1' | 'ytd';

interface CrmExecutiveBriefingProps {
  timeHorizon: TimeHorizon;
  onTimeHorizonChange: (val: TimeHorizon) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const HORIZONS: { id: TimeHorizon; label: string }[] = [
  { id: 'mtd', label: 'MTD' },
  { id: 'q1', label: 'Q1 FY25' },
  { id: 'ytd', label: 'YTD' },
];

export function CrmExecutiveBriefing({
  timeHorizon,
  onTimeHorizonChange,
  onRefresh,
  isLoading = false,
}: CrmExecutiveBriefingProps) {
  const { currentAgent, metrics, leads, openAiDrawer, setSelectedLeadId } = useCrm();

  const urgentDeals = React.useMemo(() => {
    return leads
      .filter((l) => l.priority === 'urgent' && l.stage !== 'won' && l.stage !== 'lost')
      .slice(0, 3);
  }, [leads]);

  const urgentDealsValue = React.useMemo(() => {
    return urgentDeals.reduce((sum, d) => sum + d.dealValue, 0);
  }, [urgentDeals]);

  return (
    <div className="flex flex-col gap-5 pt-1">
      {/* Top bar: Overview Context + Unified Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-border/80 shadow-2xs">
            <AvatarImage src={currentAgent.avatarUrl} alt={currentAgent.name} />
            <AvatarFallback className="font-mono text-xs font-semibold">
              {currentAgent.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display text-sm font-semibold text-foreground tracking-tight">
                Executive Overview
              </h2>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success border border-success/20">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {currentAgent.name} · {currentAgent.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap">
          {/* Unified Time Horizon Controls */}
          <SegmentedControl
            type="single"
            value={timeHorizon}
            onValueChange={(val) => {
              if (val) onTimeHorizonChange(val as TimeHorizon);
            }}
            className="h-8 bg-muted/50 p-0.5 shadow-2xs"
          >
            {HORIZONS.map((hz) => (
              <SegmentedControlItem
                key={hz.id}
                value={hz.id}
                className="h-7 px-2.5 text-xs font-mono"
              >
                {hz.label}
              </SegmentedControlItem>
            ))}
          </SegmentedControl>

          {/* Refresh Action */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8 w-8 p-0 shadow-2xs"
            aria-label="Refresh revenue data"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
          </Button>

          {/* Primary Action: New Deal */}
          <Link href="/crm/leads">
            <Button size="sm" className="h-8 gap-1.5 text-xs shadow-2xs px-3 font-medium">
              <Plus className="h-3.5 w-3.5" />
              <span>New Deal</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Narrative Headline & Synthesis (Airy, Direct & Crisp) */}
      <div className="space-y-2 py-1">
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          Pipeline pacing at{' '}
          <span className="text-primary font-extrabold">
            +{metrics.pipelineGrowthPct}%
          </span>{' '}
          with{' '}
          <span className="font-extrabold">
            ${metrics.totalPipelineValue.toLocaleString()}
          </span>{' '}
          active ARR.
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-4xl">
          {urgentDeals.length > 0 ? (
            <>
              <span className="font-medium text-foreground">
                {urgentDeals.length} high-priority enterprise deals
              </span>{' '}
              (${Math.round(urgentDealsValue / 1000)}k pipeline) are in late-stage negotiation,
              sustaining a <span className="font-medium text-foreground">{metrics.winRatePct}%</span> win rate with{' '}
              <span className="font-medium text-foreground">{metrics.leadsWonThisMonth} closed deals</span> across{' '}
              {metrics.activeLeadsCount} active accounts this period.
            </>
          ) : (
            <>
              <span className="font-medium text-foreground">{metrics.leadsWonThisMonth} deals closed</span> this period with a{' '}
              <span className="font-medium text-foreground">{metrics.winRatePct}%</span> win rate across{' '}
              {metrics.activeLeadsCount} active opportunities.
            </>
          )}
        </p>
      </div>

      {/* Clean Priority Deals Strip */}
      {urgentDeals.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-mono font-semibold text-muted-foreground shrink-0">
            <Flame className="h-3.5 w-3.5 text-warning" />
            <span>Priority Deals:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {urgentDeals.map((deal) => (
              <button
                key={deal.id}
                type="button"
                onClick={() => {
                  setSelectedLeadId(deal.id);
                  openAiDrawer({
                    type: 'lead',
                    entityId: deal.id,
                    initialTab: 'lead-scoring',
                  });
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-border/80 bg-card px-2.5 py-1 text-xs text-foreground hover:bg-accent/60 hover:border-border transition-all cursor-pointer group shadow-2xs"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-warning shrink-0" />
                <span className="font-medium group-hover:text-primary transition-colors">
                  {deal.company}
                </span>
                <span className="font-mono text-muted-foreground text-[11px]">
                  ${Math.round(deal.dealValue / 1000)}k
                </span>
                <ArrowUpRight className="h-3 w-3 text-muted-foreground opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
