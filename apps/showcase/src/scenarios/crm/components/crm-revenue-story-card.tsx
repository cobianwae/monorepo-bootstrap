'use client';

import * as React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  AreaChartComponent,
  Skeleton,
  SegmentedControl,
  SegmentedControlItem,
  formatCurrency,
  cn,
} from '@ds/ui';
import { REVENUE_CHART_DATA } from '../data/fixtures';
import type { TimeHorizon } from './crm-executive-briefing';

interface CrmRevenueStoryCardProps {
  timeHorizon: TimeHorizon;
  className?: string;
  isLoading?: boolean;
}

export function CrmRevenueStoryCard({
  timeHorizon,
  className,
  isLoading = false,
}: CrmRevenueStoryCardProps) {
  // Derive chart slice based on selected time horizon
  const chartData = React.useMemo(() => {
    switch (timeHorizon) {
      case 'mtd':
        return REVENUE_CHART_DATA.slice(4); // Dec, Jan, Feb (Est)
      case 'q1':
        return REVENUE_CHART_DATA.slice(2); // Oct through Feb (Est)
      case 'ytd':
      default:
        return REVENUE_CHART_DATA;
    }
  }, [timeHorizon]);

  // Derive aggregated period metrics dynamically based on horizon
  const periodMetrics = React.useMemo(() => {
    switch (timeHorizon) {
      case 'mtd': {
        const current = REVENUE_CHART_DATA[5]; // Jan
        const pacingPct = ((current.revenue / current.target) * 100).toFixed(1);
        return {
          closedRevenue: current.revenue,
          targetQuota: current.target,
          weightedPipeline: current.pipeline,
          planPacing: `${pacingPct}%`,
          growthBadge: '+38%',
          targetSubtext: '140% paced',
          pipelineSubtext: 'Active ARR',
          goalLabel: 'MTD Goal',
        };
      }
      case 'q1': {
        const q1Months = [REVENUE_CHART_DATA[4], REVENUE_CHART_DATA[5]]; // Dec, Jan
        const closed = q1Months.reduce((s, m) => s + m.revenue, 0);
        const target = q1Months.reduce((s, m) => s + m.target, 0);
        const pacingPct = ((closed / target) * 100).toFixed(1);
        return {
          closedRevenue: closed,
          targetQuota: target,
          weightedPipeline: 380000,
          planPacing: `${pacingPct}%`,
          growthBadge: '+42% YoY',
          targetSubtext: 'Pacing ahead',
          pipelineSubtext: 'Q1 ARR',
          goalLabel: 'Q1 Goal',
        };
      }
      case 'ytd': {
        const totalClosed = REVENUE_CHART_DATA.slice(0, 6).reduce((s, m) => s + m.revenue, 0);
        const totalTarget = REVENUE_CHART_DATA.slice(0, 6).reduce((s, m) => s + m.target, 0);
        const pacingPct = ((totalClosed / totalTarget) * 100).toFixed(1);
        return {
          closedRevenue: totalClosed,
          targetQuota: totalTarget,
          weightedPipeline: 440000,
          planPacing: `${pacingPct}%`,
          growthBadge: '+56% YoY',
          targetSubtext: 'Exceeding target',
          pipelineSubtext: 'Run-rate ARR',
          goalLabel: 'FY25 Goal',
        };
      }
    }
  }, [timeHorizon]);

  // Interactive series selection
  const [activeSeries, setActiveSeries] = React.useState<{
    revenue: boolean;
    target: boolean;
    pipeline: boolean;
  }>({
    revenue: true,
    target: true,
    pipeline: false,
  });

  // Compute selected data keys and color mapping
  const selectedDataKeys = React.useMemo(() => {
    const keys: string[] = [];
    if (activeSeries.revenue) keys.push('revenue');
    if (activeSeries.target) keys.push('target');
    if (activeSeries.pipeline) keys.push('pipeline');
    return keys;
  }, [activeSeries]);

  const selectedColors = React.useMemo(() => {
    const colorMap: Record<string, string> = {
      revenue: 'var(--color-chart-1)',
      target: 'var(--color-chart-2)',
      pipeline: 'var(--color-chart-3)',
    };
    return selectedDataKeys.map((k) => colorMap[k]);
  }, [selectedDataKeys]);

  if (isLoading) {
    return (
      <Card
        className={cn(
          'flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 md:p-7 shadow-xs',
          className
        )}
      >
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-0 pb-4 border-b border-border/60">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-52" />
              <Skeleton className="h-4 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3.5 w-72" />
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-muted/30 rounded-lg">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-18" />
            <Skeleton className="h-6 w-20" />
          </div>
        </CardHeader>

        <CardContent className="p-0 pt-6 flex-1 flex flex-col justify-between space-y-6">
          <Skeleton className="w-full h-72 sm:h-80 rounded-xl" />

          <div className="pt-5 border-t border-border/60">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-7 w-28" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-6 md:p-7 shadow-xs transition-all duration-200',
        className
      )}
    >
      {/* =========================================================================
          HEADER: Title, Time Horizon & Interactive Series Selectors
          ========================================================================= */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-0 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="font-display text-lg sm:text-xl font-bold text-foreground tracking-tight">
              Revenue Trajectory & Quota Pacing
            </CardTitle>
            <Badge variant="outline" className="font-mono text-[10px] border-border/70 shadow-2xs">
              {timeHorizon === 'mtd' ? 'MTD Pacing' : timeHorizon === 'q1' ? 'Q1 FY25' : 'YTD Horizon'}
            </Badge>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Closed enterprise ARR vs baseline quota with forward run-rate projection
          </CardDescription>
        </div>

        {/* Interactive Metric Selection Pills */}
        <SegmentedControl
          type="multiple"
          value={selectedDataKeys}
          onValueChange={(val: string[]) => {
            if (val && val.length > 0) {
              setActiveSeries({
                revenue: val.includes('revenue'),
                target: val.includes('target'),
                pipeline: val.includes('pipeline'),
              });
            }
          }}
          className="h-8 bg-muted/50 p-0.5 shadow-2xs shrink-0 self-start sm:self-auto"
        >
          <SegmentedControlItem
            value="revenue"
            className="h-7 px-2.5 text-xs font-mono gap-1.5"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--color-chart-1)' }}
            />
            <span>Revenue</span>
          </SegmentedControlItem>

          <SegmentedControlItem
            value="target"
            className="h-7 px-2.5 text-xs font-mono gap-1.5"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--color-chart-2)' }}
            />
            <span>Target</span>
          </SegmentedControlItem>

          <SegmentedControlItem
            value="pipeline"
            className="h-7 px-2.5 text-xs font-mono gap-1.5"
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--color-chart-3)' }}
            />
            <span>Pipeline</span>
          </SegmentedControlItem>
        </SegmentedControl>
      </CardHeader>

      <CardContent className="p-0 pt-6 flex-1 flex flex-col justify-between space-y-6">
        {/* Screen Reader Table */}
        <div className="sr-only">
          <table>
            <caption>Monthly Revenue and Target Breakdown</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Closed Revenue</th>
                <th scope="col">Target Quota</th>
                <th scope="col">Pipeline</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item) => (
                <tr key={item.month}>
                  <td>{item.month}</td>
                  <td>${item.revenue.toLocaleString()}</td>
                  <td>${item.target.toLocaleString()}</td>
                  <td>${item.pipeline.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Refined Visual Area Chart with True Luminous Gradients */}
        <div className="w-full h-72 sm:h-80">
          <AreaChartComponent
            data={chartData}
            dataKey={selectedDataKeys}
            xKey="month"
            colors={selectedColors}
            grid={true}
            showLegend={false}
            variant="gradient"
            fillOpacity={0.3}
            className="border-none p-0 bg-transparent aspect-auto h-full w-full"
          />
        </div>

        {/* Clean High-Contrast Metrics Strip */}
        <div className="pt-5 border-t border-border/60">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-5">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground block font-medium">
                Closed Revenue
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display font-extrabold text-xl sm:text-2xl text-foreground tabular-nums">
                  {formatCurrency(periodMetrics.closedRevenue)}
                </span>
                <span className="font-mono text-xs text-success font-semibold">
                  {periodMetrics.growthBadge}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground block font-medium">
                Target Quota
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display font-extrabold text-xl sm:text-2xl text-foreground tabular-nums">
                  {formatCurrency(periodMetrics.targetQuota)}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {periodMetrics.targetSubtext}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground block font-medium">
                Weighted Pipeline
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display font-extrabold text-xl sm:text-2xl text-foreground tabular-nums">
                  {formatCurrency(periodMetrics.weightedPipeline)}
                </span>
                <span className="font-mono text-xs text-primary font-medium">
                  {periodMetrics.pipelineSubtext}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground block font-medium">
                Plan Pacing
              </span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="font-display font-extrabold text-xl sm:text-2xl text-foreground tabular-nums">
                  {periodMetrics.planPacing}
                </span>
                <span className="font-mono text-xs text-success font-medium">
                  {periodMetrics.goalLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
