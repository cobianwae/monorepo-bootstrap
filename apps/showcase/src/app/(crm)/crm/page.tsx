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
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Executive Command Briefing */}
      <CrmExecutiveBriefing
        timeHorizon={timeHorizon}
        onTimeHorizonChange={setTimeHorizon}
        onRefresh={simulateReload}
        isLoading={isLoading}
      />

      {/* KPI Metric Cards */}
      <section aria-label="Performance pulse">
        <CrmStatsGrid isLoading={isLoading} />
      </section>

      {/* Revenue Story + Pipeline Funnel Compound Cards */}
      <section aria-label="Revenue and pipeline">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Compound Card 1: Revenue Trajectory (Wide Canvas · 2 cols) */}
          <CrmRevenueStoryCard
            timeHorizon={timeHorizon}
            isLoading={isLoading}
            className="lg:col-span-2"
          />

          {/* Compound Card 2: Stepped Conversion Funnel (1 col) */}
          <CrmPipelineFunnelCard
            isLoading={isLoading}
            className="lg:col-span-1"
          />
        </div>
      </section>

      {/* AI Opportunity Radar + Omnichannel Pulse */}
      <section aria-label="Signals and activity">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Compound Card 3: AI Opportunity Radar */}
          <CrmDealRadarCard isLoading={isLoading} />

          {/* Compound Card 4: Omnichannel Live Pulse & Activity Stream */}
          <CrmOmnichannelPulseCard isLoading={isLoading} />
        </div>
      </section>
    </div>
  );
}
