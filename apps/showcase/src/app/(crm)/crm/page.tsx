'use client';

import * as React from 'react';
import {
  DollarSign,
  Users,
  Target,
  Headphones,
} from 'lucide-react';
import {
  StatCard,
  Card,
  Skeleton,
} from '@ds/ui';
import { useCrm } from '@/scenarios/crm/store/crm-context';
import {
  CrmExecutiveBriefing,
  CrmRevenueStoryCard,
  CrmPipelineFunnelCard,
  CrmDealRadarCard,
  CrmOmnichannelPulseCard,
  type TimeHorizon,
} from '@/scenarios/crm';

export default function CrmDashboardPage() {
  const { leads, metrics } = useCrm();
  const [timeHorizon, setTimeHorizon] = React.useState<TimeHorizon>('q1');
  const [isLoading, setIsLoading] = React.useState(false);

  const simulateReload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const totalCalculatedPipeline = React.useMemo(() => {
    return leads
      .filter((l) => l.stage !== 'lost')
      .reduce((acc, l) => acc + l.dealValue, 0);
  }, [leads]);

  const activeLeadsCount = React.useMemo(() => {
    return leads.filter((l) => l.stage !== 'lost' && l.stage !== 'won').length;
  }, [leads]);

  const urgentLeadsCount = React.useMemo(() => {
    return leads.filter((l) => l.priority === 'urgent' && l.stage !== 'won' && l.stage !== 'lost').length;
  }, [leads]);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Chapter 0: Executive Command Briefing (Personalized synthesis + time horizon + 1-click triage) */}
      <CrmExecutiveBriefing
        timeHorizon={timeHorizon}
        onTimeHorizonChange={setTimeHorizon}
        onRefresh={simulateReload}
        isLoading={isLoading}
      />

      {/* Chapter 0.5: Asymmetric Metric Barometer (Hierarchical Visual Weight) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))
        ) : (
          <>
            {/* Featured Primary Hero Card: Total Pipeline ARR */}
            <StatCard
              title="Total Active Pipeline"
              value={`$${totalCalculatedPipeline.toLocaleString()}`}
              delta={{
                value: `+${metrics.pipelineGrowthPct}%`,
                trend: 'up',
                label: 'vs last month',
              }}
              icon={DollarSign}
              variant="highlight"
              className="border-highlight/40 bg-card/90"
            />

            {/* Metric 2: Win Rate with Closed Volume */}
            <StatCard
              title="Win Rate (MTD)"
              value={`${metrics.winRatePct}%`}
              delta={{
                value: '+4.2%',
                trend: 'up',
                label: `${metrics.leadsWonThisMonth} closed deals`,
              }}
              icon={Target}
            />

            {/* Metric 3: Active Opportunities & Urgent Focus */}
            <StatCard
              title="Active Opportunities"
              value={activeLeadsCount}
              delta={{
                value: `${urgentLeadsCount} urgent`,
                trend: urgentLeadsCount > 0 ? 'up' : 'neutral',
                label: `${leads.filter((l) => l.stage === 'negotiation').length} in negotiation`,
              }}
              icon={Users}
            />

            {/* Metric 4: Support Velocity & CSAT */}
            <StatCard
              title="Avg Response SLA"
              value={`${metrics.avgResponseTimeMin}m`}
              delta={{
                value: `${metrics.csatScore}%`,
                trend: 'up',
                label: 'CSAT Omnichannel',
              }}
              icon={Headphones}
            />
          </>
        )}
      </div>

      {/* Chapter 1 & 2: Revenue Story + Pipeline Funnel Compound Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Compound Card 1: Revenue Trajectory + Quota Run-Rate Ticker (2 cols) */}
        <CrmRevenueStoryCard
          timeHorizon={timeHorizon}
          className="lg:col-span-2"
        />

        {/* Compound Card 2: Stepped Conversion Funnel & Stage Liquidity (1 col) */}
        <CrmPipelineFunnelCard className="lg:col-span-1" />
      </div>

      {/* Chapter 3 & 4: AI Opportunity Radar + Live Omnichannel Pulse Compound Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Compound Card 3: AI Opportunity Radar & 1-Click Deal Triage */}
        <CrmDealRadarCard />

        {/* Compound Card 4: Omnichannel Channel Pulse & Live Activity Stream */}
        <CrmOmnichannelPulseCard />
      </div>
    </div>
  );
}
