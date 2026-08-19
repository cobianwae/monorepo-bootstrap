'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RefreshCw,
  Plus,
  ArrowRight,
  Flame,
  MessageSquare,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Avatar,
  AvatarFallback,
  AvatarImage,
  SegmentedControl,
  SegmentedControlItem,
  GradientText,
  Kbd,
} from '@ds/ui';
import { useCrm } from '../store/crm-context';

export type TimeHorizon = 'mtd' | 'q1' | 'ytd';

interface CrmExecutiveBriefingProps {
  timeHorizon: TimeHorizon;
  onTimeHorizonChange: (val: TimeHorizon) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

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

  const urgentTotalValue = React.useMemo(() => {
    return urgentDeals.reduce((sum, d) => sum + d.dealValue, 0);
  }, [urgentDeals]);

  return (
    <Card className="relative overflow-hidden border-border/80 bg-card/90 shadow-xs backdrop-blur-sm">
      <div className="flex flex-col gap-5 p-5 md:p-6">
        {/* Top bar: Persona / Executive Breadcrumb + Horizon Selector + Quick Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border/80 shadow-xs">
              <AvatarImage src={currentAgent.avatarUrl} alt={currentAgent.name} />
              <AvatarFallback className="font-mono text-xs font-bold">
                {currentAgent.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-base font-bold text-foreground">
                  {currentAgent.name}
                </span>
                <Badge variant="outline" className="font-mono text-[10px] uppercase">
                  {currentAgent.role}
                </Badge>
                <span className="flex items-center gap-1 text-[11px] text-success font-medium">
                  <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {currentAgent.email} • Rating: {currentAgent.rating.toFixed(1)}/5.0
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Horizon Filter */}
            <SegmentedControl
              type="single"
              value={timeHorizon}
              onValueChange={(val: string) => {
                if (val) onTimeHorizonChange(val as TimeHorizon);
              }}
              className="h-8"
            >
              <SegmentedControlItem value="mtd" className="text-xs px-2.5">
                MTD
              </SegmentedControlItem>
              <SegmentedControlItem value="q1" className="text-xs px-2.5">
                Q1 FY25
              </SegmentedControlItem>
              <SegmentedControlItem value="ytd" className="text-xs px-2.5">
                YTD
              </SegmentedControlItem>
            </SegmentedControl>

            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="h-8 w-8 p-0"
              aria-label="Refresh revenue data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            {/* Copilot Trigger */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => openAiDrawer({ type: 'general' })}
              className="h-8 gap-1.5 border-highlight/40 bg-highlight/10 text-foreground hover:bg-highlight/20 text-xs shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 text-highlight" />
              <span>Copilot</span>
              <Kbd size="sm" className="hidden sm:inline-flex ml-1 text-[10px]">
                ⌘J
              </Kbd>
            </Button>

            {/* New Lead Pipeline Link */}
            <Link href="/crm/leads">
              <Button size="sm" className="h-8 gap-1.5 text-xs shadow-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Pipeline</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Narrative Headline & Synthesis */}
        <div className="space-y-2">
          <h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
            Pipeline velocity is pacing at{' '}
            <GradientText className="font-extrabold">
              +{metrics.pipelineGrowthPct}% of target
            </GradientText>{' '}
            with ${metrics.totalPipelineValue.toLocaleString()} in play.
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-4xl">
            {urgentDeals.length} high-value enterprise accounts (
            <span className="font-mono font-semibold text-foreground">
              ${urgentTotalValue.toLocaleString()}
            </span>
            ) are in final negotiation or compliance signoff. Review flagged items below to accelerate closing.
          </p>
        </div>

        {/* 3 Actionable Triage Pills: Direct One-Click Resolutions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 pt-1">
          <span className="text-[11px] uppercase tracking-wider font-mono font-semibold text-muted-foreground shrink-0 flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-highlight shrink-0" />
            Immediate Triage:
          </span>

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
                className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/40 px-2.5 py-1 text-xs text-foreground hover:bg-muted hover:border-highlight/40 transition-colors cursor-pointer group"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-highlight shrink-0" />
                <span className="font-medium group-hover:text-highlight transition-colors">
                  {deal.company}
                </span>
                <span className="font-mono font-semibold text-muted-foreground text-[11px]">
                  (${Math.round(deal.dealValue / 1000)}k)
                </span>
                <Sparkles className="h-3 w-3 text-highlight opacity-70 group-hover:opacity-100 transition-opacity ml-0.5" />
              </button>
            ))}

            <Link
              href="/crm/contact-center"
              className="inline-flex items-center gap-1.5 rounded-md border border-border/80 bg-muted/40 px-2.5 py-1 text-xs text-foreground hover:bg-muted transition-colors"
            >
              <MessageSquare className="h-3 w-3 text-primary shrink-0" />
              <span>3 Inbound VIP Chats</span>
              <ArrowRight className="h-3 w-3 text-muted-foreground ml-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
