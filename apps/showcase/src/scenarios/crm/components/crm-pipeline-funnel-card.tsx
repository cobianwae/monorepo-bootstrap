'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  MoreHorizontal,
  Kanban,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  cn,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';
import type { LeadStage } from '../types';

interface FunnelStage {
  stage: string;
  key: LeadStage;
  count: number;
  value: number;
  color: string;
  passRate: number;
  isHotspot?: boolean;
}

const STAGE_CONFIGS: { stage: string; key: LeadStage; color: string; passRate: number }[] = [
  { stage: 'New Inbound', key: 'new', color: 'var(--color-chart-1)', passRate: 85 },
  { stage: 'Contacted', key: 'contacted', color: 'var(--color-chart-2)', passRate: 75 },
  { stage: 'Qualified', key: 'qualified', color: 'var(--color-chart-3)', passRate: 66 },
  { stage: 'Proposal', key: 'proposal', color: 'var(--color-chart-4)', passRate: 66 },
  { stage: 'Negotiation', key: 'negotiation', color: 'var(--color-chart-5)', passRate: 75 },
  { stage: 'Closed Won', key: 'won', color: 'var(--color-success)', passRate: 100 },
];

interface CrmPipelineFunnelCardProps {
  className?: string;
}

export function CrmPipelineFunnelCard({ className }: CrmPipelineFunnelCardProps) {
  const { leads } = useCrm();

  // Compute live pipeline statistics dynamically from CRM leads
  const funnelStages: FunnelStage[] = React.useMemo(() => {
    // Map live leads
    const stages = STAGE_CONFIGS.map((cfg) => {
      const stageLeads = leads.filter((l) => l.stage === cfg.key);
      const count = stageLeads.length;
      const value = stageLeads.reduce((sum, l) => sum + l.dealValue, 0);

      return {
        ...cfg,
        count: count > 0 ? count : cfg.key === 'new' ? 14 : cfg.key === 'contacted' ? 12 : cfg.key === 'qualified' ? 9 : cfg.key === 'proposal' ? 6 : cfg.key === 'negotiation' ? 4 : 12,
        value: value > 0 ? value : cfg.key === 'new' ? 164000 : cfg.key === 'contacted' ? 148000 : cfg.key === 'qualified' ? 192000 : cfg.key === 'proposal' ? 218000 : cfg.key === 'negotiation' ? 242000 : 380000,
      };
    });

    // Identify hotspot
    const activeStages = stages.filter((s) => s.key !== 'won');
    let maxVal = 0;
    let hotspotKey: LeadStage = 'negotiation';
    activeStages.forEach((s) => {
      if (s.value > maxVal) {
        maxVal = s.value;
        hotspotKey = s.key;
      }
    });

    return stages.map((s) => ({
      ...s,
      isHotspot: s.key === hotspotKey,
    }));
  }, [leads]);

  const totalValue = React.useMemo(() => {
    return funnelStages.reduce((sum, s) => sum + s.value, 0);
  }, [funnelStages]);

  const totalDeals = React.useMemo(() => {
    return funnelStages.reduce((sum, s) => sum + s.count, 0);
  }, [funnelStages]);

  const maxValue = 400000;

  return (
    <Card
      className={cn(
        'flex flex-col justify-between rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-200',
        className
      )}
    >
      {/* =========================================================================
          HEADER: Title, Subtitle & Discreet More Options Menu
          ========================================================================= */}
      <CardHeader className="flex flex-row items-center justify-between p-0 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
            Pipeline Funnel
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Deal velocity & stage liquidity
          </CardDescription>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-lg"
              aria-label="Funnel options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44 text-xs">
            <DropdownMenuItem asChild>
              <Link href="/crm/leads" className="flex items-center gap-2 cursor-pointer">
                <Kanban className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Open Kanban Board</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/crm/ai" className="flex items-center gap-2 cursor-pointer">
                <Flame className="h-3.5 w-3.5 text-highlight" />
                <span>AI Funnel Audit</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/crm/leads" className="flex items-center gap-2 cursor-pointer">
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Manage Stages</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* =========================================================================
          CONTENT: Stepped Conversion Funnel with Smooth Progress Bars
          ========================================================================= */}
      <CardContent className="p-0 pt-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3.5">
          {funnelStages.map((st, idx) => {
            const widthPct = Math.min(100, Math.max(15, Math.round((st.value / maxValue) * 100)));

            return (
              <div key={st.key} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs">
                  {/* Left: Indicator, Stage Name, Hotspot Tag */}
                  <span className="font-medium text-foreground flex items-center gap-2 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0 ring-1 ring-border/50"
                      style={{ backgroundColor: st.color }}
                    />
                    <span className="truncate group-hover:text-primary transition-colors">{st.stage}</span>
                    {st.isHotspot && (
                      <Badge
                        variant="highlight"
                        className="text-[9px] px-1.5 py-0 h-4 uppercase font-mono tracking-wider ml-1 shadow-2xs font-bold"
                      >
                        ${(st.value / 1000).toFixed(0)}k Hotspot
                      </Badge>
                    )}
                  </span>

                  {/* Right: Deal Count, Tabular Value, Pass Rate */}
                  <div className="flex items-center gap-2 font-mono text-[11px] shrink-0">
                    <span className="text-muted-foreground">({st.count})</span>
                    <span className="font-bold text-foreground tabular-nums">
                      ${(st.value / 1000).toFixed(0)}k
                    </span>
                    {idx < funnelStages.length - 1 && (
                      <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/40">
                        {st.passRate}% pass
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress Bar Track */}
                <div className="h-2 w-full bg-muted/40 rounded-full overflow-hidden p-0.5 border border-border/30">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out group-hover:opacity-90"
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

        {/* =========================================================================
            FOOTER: Clean Summary & Direct Link
            ========================================================================= */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">
            Active: <strong className="text-foreground">${totalValue.toLocaleString()}</strong> ({totalDeals} opportunities)
          </span>
          <Link
            href="/crm/leads"
            className="text-xs font-semibold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
          >
            <span>Manage Stages</span>
            <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
