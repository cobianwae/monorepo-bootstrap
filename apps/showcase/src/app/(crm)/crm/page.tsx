'use client';

import * as React from 'react';
import {
  CrmExecutiveBriefing,
  CrmStatsGrid,
  CrmRevenueStoryCard,
  CrmPipelineFunnelCard,
  CrmDealRadarCard,
  CrmOmnichannelPulseCard,
  type TimeHorizon,
} from '@/scenarios/crm';

export default function CrmDashboardPage() {
  const [timeHorizon, setTimeHorizon] = React.useState<TimeHorizon>('q1');
  const [isLoading, setIsLoading] = React.useState(false);

  const simulateReload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in fade-in-50 duration-200">
      {/* Chapter 0: Executive Command Briefing (Airy, punchy, editorial tabs) */}
      <CrmExecutiveBriefing
        timeHorizon={timeHorizon}
        onTimeHorizonChange={setTimeHorizon}
        onRefresh={simulateReload}
        isLoading={isLoading}
      />

      {/* Chapter 0.5: Creative Metric Radar (4 Custom Crafted KPI Cards) */}
      <CrmStatsGrid isLoading={isLoading} />

      {/* Chapter 1 & 2: Revenue Story + Pipeline Funnel Compound Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Compound Card 1: Revenue Trajectory (Wide Canvas · 2 cols) */}
        <CrmRevenueStoryCard
          timeHorizon={timeHorizon}
          className="lg:col-span-2"
        />

        {/* Compound Card 2: Stepped Conversion Funnel (1 col) */}
        <CrmPipelineFunnelCard className="lg:col-span-1" />
      </div>

      {/* Chapter 3 & 4: AI Opportunity Radar + Omnichannel Pulse */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Compound Card 3: AI Opportunity Radar */}
        <CrmDealRadarCard />

        {/* Compound Card 4: Omnichannel Live Pulse & Activity Stream */}
        <CrmOmnichannelPulseCard />
      </div>
    </div>
  );
}
