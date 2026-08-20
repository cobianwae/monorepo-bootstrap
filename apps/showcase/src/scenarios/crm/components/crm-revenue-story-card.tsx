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
  cn,
} from '@ds/ui';
import { REVENUE_CHART_DATA } from '../data/fixtures';
import type { TimeHorizon } from './crm-executive-briefing';

interface CrmRevenueStoryCardProps {
  timeHorizon: TimeHorizon;
  className?: string;
}

export function CrmRevenueStoryCard({
  timeHorizon,
  className,
}: CrmRevenueStoryCardProps) {
  const currentMonthData = REVENUE_CHART_DATA[5]; // Jan

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

  const toggleSeries = (key: 'revenue' | 'target' | 'pipeline') => {
    setActiveSeries((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      // Ensure at least one series remains selected
      if (!next.revenue && !next.target && !next.pipeline) {
        return prev;
      }
      return next;
    });
  };

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

  return (
    <Card
      className={cn(
        'flex flex-col justify-between rounded-xl border border-border/80 bg-card p-6 shadow-xs transition-all duration-200',
        className
      )}
    >
      {/* =========================================================================
          HEADER: Title, Time Horizon & Interactive Series Selectors
          ========================================================================= */}
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-0 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
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
        <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-lg border border-border/40 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => toggleSeries('revenue')}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer',
              activeSeries.revenue
                ? 'bg-card text-foreground font-semibold shadow-2xs border border-border/60'
                : 'text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground'
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--color-chart-1)' }}
            />
            <span>Revenue</span>
          </button>

          <button
            type="button"
            onClick={() => toggleSeries('target')}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer',
              activeSeries.target
                ? 'bg-card text-foreground font-semibold shadow-2xs border border-border/60'
                : 'text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground'
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--color-chart-2)' }}
            />
            <span>Target</span>
          </button>

          <button
            type="button"
            onClick={() => toggleSeries('pipeline')}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all cursor-pointer',
              activeSeries.pipeline
                ? 'bg-card text-foreground font-semibold shadow-2xs border border-border/60'
                : 'text-muted-foreground opacity-60 hover:opacity-100 hover:text-foreground'
            )}
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: 'var(--color-chart-3)' }}
            />
            <span>Pipeline</span>
          </button>
        </div>
      </CardHeader>

      <CardContent className="p-0 pt-5 flex-1 flex flex-col justify-between space-y-5">
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
              {REVENUE_CHART_DATA.map((item) => (
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
        <div className="w-full h-64 sm:h-72">
          <AreaChartComponent
            data={REVENUE_CHART_DATA}
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
        <div className="pt-4 border-t border-border/60">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground block font-medium">
                Closed Revenue
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display font-extrabold text-lg sm:text-xl text-foreground tabular-nums">
                  ${(currentMonthData.revenue / 1000).toFixed(0)}k
                </span>
                <span className="font-mono text-xs text-success font-semibold">+38%</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground block font-medium">
                Target Quota
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display font-extrabold text-lg sm:text-xl text-foreground tabular-nums">
                  ${(currentMonthData.target / 1000).toFixed(0)}k
                </span>
                <span className="font-mono text-xs text-muted-foreground">120% paced</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground block font-medium">
                Weighted Pipeline
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display font-extrabold text-lg sm:text-xl text-foreground tabular-nums">
                  ${(currentMonthData.pipeline / 1000).toFixed(0)}k
                </span>
                <span className="font-mono text-xs text-primary font-medium">ARR</span>
              </div>
            </div>

            <div>
              <span className="text-[11px] uppercase font-mono tracking-wider text-muted-foreground block font-medium">
                Plan Pacing
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="font-display font-extrabold text-lg sm:text-xl text-foreground tabular-nums">
                  72.6%
                </span>
                <span className="font-mono text-xs text-success font-medium">Q1 Goal</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
