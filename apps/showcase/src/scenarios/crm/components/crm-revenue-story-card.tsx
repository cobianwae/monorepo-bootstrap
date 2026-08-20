'use client';

import { TrendingUp } from 'lucide-react';
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

  return (
    <Card className={cn('flex flex-col justify-between border border-border/80 bg-card p-6 shadow-xs rounded-xl', className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-0 pb-4 border-b border-border/60">
        <div className="space-y-1">
          <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
            Revenue Trajectory & Quota Pacing
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Closed enterprise ARR vs baseline quota with forward run-rate projection
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs border-border/70 shadow-2xs">
            {timeHorizon === 'mtd' ? 'MTD Pacing' : timeHorizon === 'q1' ? 'Q1 FY25' : 'YTD Horizon'}
          </Badge>
          <Badge variant="success-outline" className="font-mono text-xs flex items-center gap-1 shadow-2xs font-semibold">
            <TrendingUp className="h-3 w-3" />
            <span>114% to Target</span>
          </Badge>
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

        {/* Visual Area Chart */}
        <div className="w-full h-64 sm:h-72">
          <AreaChartComponent
            data={REVENUE_CHART_DATA}
            dataKey={['revenue', 'target']}
            xKey="month"
            colors={['var(--color-chart-1)', 'var(--color-chart-2)']}
            grid={true}
            showLegend={true}
            variant="gradient"
            fillOpacity={0.2}
            className="border-none p-0 bg-transparent aspect-auto h-full w-full"
          />
        </div>

        {/* Clean Single-Row Metrics Strip */}
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
