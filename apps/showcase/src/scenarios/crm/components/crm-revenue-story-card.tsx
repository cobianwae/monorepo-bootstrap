'use client';

import { TrendingUp, Target, DollarSign, ArrowUpRight, Sparkles } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Progress,
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
  // Compute key summary figures based on chart data
  const currentMonthData = REVENUE_CHART_DATA[5]; // Jan
  const projectedData = REVENUE_CHART_DATA[6]; // Feb (Est)

  return (
    <Card className={cn('flex flex-col justify-between shadow-xs border-border/80 bg-card/90 backdrop-blur-sm', className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <CardTitle className="font-display text-base sm:text-lg font-bold text-foreground">
              Revenue Trajectory & Quota Pacing
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Closed enterprise ARR vs baseline quota with forward projection
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs border-border/80">
            {timeHorizon === 'mtd' ? 'MTD Pacing' : timeHorizon === 'q1' ? 'Q1 FY25' : 'YTD Horizon'}
          </Badge>
          <Badge variant="success" className="font-mono text-xs flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>114% to Target</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-5">
        {/* Accessible Data Summary Table for Screen Readers */}
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
            fillOpacity={0.25}
            className="border-none p-0 bg-transparent aspect-auto h-full w-full"
          />
        </div>

        {/* Embedded Financial Ticker Well (Nested Surface for Optical Depth) */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-3.5 sm:p-4 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Tile 1: Closed ARR */}
            <div className="space-y-1 bg-card/70 p-2.5 rounded-lg border border-border/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                Closed MTD
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-base text-foreground tabular-nums">
                  ${(currentMonthData.revenue / 1000).toFixed(0)}k
                </span>
                <span className="font-mono text-[11px] text-success font-medium">+38%</span>
              </div>
            </div>

            {/* Tile 2: Target Quota */}
            <div className="space-y-1 bg-card/70 p-2.5 rounded-lg border border-border/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                Target Quota
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-base text-foreground tabular-nums">
                  ${(currentMonthData.target / 1000).toFixed(0)}k
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">120% pacing</span>
              </div>
            </div>

            {/* Tile 3: Pipeline Potential */}
            <div className="space-y-1 bg-card/70 p-2.5 rounded-lg border border-border/40">
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground block">
                Total Pipeline
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-base text-foreground tabular-nums">
                  ${(currentMonthData.pipeline / 1000).toFixed(0)}k
                </span>
                <span className="font-mono text-[11px] text-primary">Weighted</span>
              </div>
            </div>

            {/* Tile 4: Forecast Feb */}
            <div className="space-y-1 bg-card/70 p-2.5 rounded-lg border border-border/40 ring-1 ring-highlight/20">
              <span className="text-[10px] uppercase font-mono tracking-wider text-highlight font-semibold block flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                Feb Projection
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-extrabold text-base text-foreground tabular-nums">
                  ${(projectedData.revenue / 1000).toFixed(0)}k
                </span>
                <span className="font-mono text-[11px] text-highlight">96% conf</span>
              </div>
            </div>
          </div>

          {/* Quota Progress Pacing Bar */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-primary" />
                Annual Plan Pacing (Q1 Target $500k)
              </span>
              <span className="font-mono text-[11px] font-bold text-foreground">
                $363k / $500k (72.6%)
              </span>
            </div>
            <Progress value={72.6} className="h-2 bg-muted/60" />
          </div>
        </div>

        {/* Narrative Contextual Footnote */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-border/40 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium text-foreground">
            <ArrowUpRight className="h-3.5 w-3.5 text-success shrink-0" />
            Closing momentum accelerated in Dec/Jan driven by enterprise AI adoption in FinTech & Health accounts.
          </span>
          <span className="font-mono text-[11px] shrink-0 text-muted-foreground">
            Updated 2m ago
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
