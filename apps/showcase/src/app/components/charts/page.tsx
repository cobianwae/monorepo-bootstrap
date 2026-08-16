'use client';

import * as React from 'react';
import {
  AreaChartComponent,
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  Sparkline,
  ChartCard,
  ChartContainer,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  SegmentedControl,
  SegmentedControlItem,
} from '@ds/ui';
import { Sparkles, TrendingUp, DollarSign, Users, ShoppingCart, Activity } from 'lucide-react';
import { PageHeader } from '../../../components/page-header';

const MONTHLY = [
  { month: 'Jan', revenue: 4200, cost: 3100, profit: 1100, users: 210 },
  { month: 'Feb', revenue: 4800, cost: 3300, profit: 1500, users: 245 },
  { month: 'Mar', revenue: 5100, cost: 3400, profit: 1700, users: 260 },
  { month: 'Apr', revenue: 5600, cost: 3600, profit: 2000, users: 290 },
  { month: 'May', revenue: 5900, cost: 3800, profit: 2100, users: 320 },
  { month: 'Jun', revenue: 6500, cost: 4100, profit: 2400, users: 355 },
  { month: 'Jul', revenue: 6900, cost: 4300, profit: 2600, users: 390 },
  { month: 'Aug', revenue: 7400, cost: 4600, profit: 2800, users: 430 },
  { month: 'Sep', revenue: 7800, cost: 4800, profit: 3000, users: 460 },
  { month: 'Oct', revenue: 8200, cost: 5100, profit: 3100, users: 505 },
  { month: 'Nov', revenue: 8900, cost: 5400, profit: 3500, users: 545 },
  { month: 'Dec', revenue: 9600, cost: 5800, profit: 3800, users: 590 },
];

const PIE_DATA = [
  { name: 'Organic', value: 38 },
  { name: 'Paid', value: 27 },
  { name: 'Referral', value: 20 },
  { name: 'Social', value: 15 },
];

export default function ChartsPage() {
  const [metric, setMetric] = React.useState<'revenue' | 'users'>('revenue');

  const kpi = metric === 'revenue'
    ? [
        { label: 'Revenue', value: '$82.4k', change: '+14.2%', icon: DollarSign },
        { label: 'Gross profit', value: '$32.1k', change: '+11.8%', icon: TrendingUp },
        { label: 'New users', value: '5,905', change: '+21.4%', icon: Users },
        { label: 'Orders', value: '1,842', change: '+9.6%', icon: ShoppingCart },
      ]
    : [
        { label: 'Active users', value: '5,905', change: '+21.4%', icon: Users },
        { label: 'Sign-ups', value: '1,230', change: '+31.0%', icon: Activity },
        { label: 'Churn', value: '2.1%', change: '-0.8%', icon: TrendingUp },
        { label: 'DAU/MAU', value: '0.42', change: '+4.0%', icon: Users },
      ];

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Design System"
        eyebrowIcon={Sparkles}
        title="Charts & Data Visualization"
        description="Recharts 3 chart kit themed with the OKLCH design tokens — automatic light & dark parity, WCAG-friendly tooltips, and no hardcoded colors."
      />

      {/* KPI cards with sparklines */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpi.map((item) => {
          const Icon = item.icon;
          return (
            <ChartCard
              key={item.label}
              title={item.label}
              icon={Icon}
              trend={{ value: item.change, direction: item.change.startsWith('-') ? 'down' : 'up' }}
              action={
                <Badge variant={item.change.startsWith('-') ? 'destructive' : 'success'}>
                  {item.change}
                </Badge>
              }
            >
              <div className="mt-3 flex items-end justify-between">
                <span className="text-2xl font-semibold text-foreground">{item.value}</span>
                <Sparkline data={MONTHLY} dataKey={metric === 'revenue' ? 'revenue' : 'users'} />
              </div>
            </ChartCard>
          );
        })}
      </div>

      {/* Metric toggle */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Performance overview</h2>
        <SegmentedControl
          type="single"
          value={metric}
          onValueChange={(v) => {
            if (v) setMetric(v as 'revenue' | 'users');
          }}
          aria-label="Chart metric"
        >
          <SegmentedControlItem value="revenue">Revenue</SegmentedControlItem>
          <SegmentedControlItem value="users">Users</SegmentedControlItem>
        </SegmentedControl>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AreaChartComponent
          data={MONTHLY}
          dataKey={metric === 'revenue' ? 'revenue' : 'users'}
          xKey="month"
          title="Revenue trend"
          description="Monthly recurring revenue, gradient fill"
        />
        <BarChartComponent
          data={MONTHLY}
          dataKey={['revenue', 'cost']}
          xKey="month"
          title="Revenue vs cost"
          description="Side-by-side monthly comparison"
        />
        <LineChartComponent
          data={MONTHLY}
          dataKey={['revenue', 'profit']}
          xKey="month"
          title="Revenue & profit lines"
          description="Two-series line chart"
        />
        <PieChartComponent
          data={PIE_DATA}
          title="Acquisition channels"
          description="Donut breakdown of traffic sources"
        />
      </div>

      {/* Stacked example */}
      <ChartContainer title="Stacked monthly breakdown" description="Revenue stacked by series">
        <BarChartComponent
          data={MONTHLY}
          dataKey={['revenue', 'cost', 'profit']}
          xKey="month"
          stacked
          grid={false}
          showLegend={false}
        />
      </ChartContainer>

      <Card>
        <CardHeader>
          <CardTitle>Theming note</CardTitle>
          <CardDescription>
            Chart colors map to <code className="font-mono text-xs">--chart-1</code> through{' '}
            <code className="font-mono text-xs">--chart-5</code> in the OKLCH token set, with
            dedicated light and dark values for contrast parity on card surfaces.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="flex items-center gap-2 rounded-md border border-border px-3 py-2"
            >
              <span
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: `var(--chart-${n})` }}
              />
              <span className="font-mono text-xs text-muted-foreground">--chart-{n}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}