'use client';

import * as React from 'react';
import {
  StatCard,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
} from '@ds/ui';
import {
  DollarSign,
  Users,
  Activity,
  Zap,
  Sparkles,
  Download,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '../../../components/page-header';

export default function DashboardPatternPage() {
  const [timeRange, setTimeRange] = React.useState('30d');

  const chartBars = [
    { label: 'Mon', value: 45, height: '45%' },
    { label: 'Tue', value: 68, height: '68%' },
    { label: 'Wed', value: 92, height: '92%' },
    { label: 'Thu', value: 80, height: '80%' },
    { label: 'Fri', value: 100, height: '100%' },
    { label: 'Sat', value: 55, height: '55%' },
    { label: 'Sun', value: 40, height: '40%' },
  ];

  const activities = [
    {
      title: 'Production Deployment v2.4.0',
      time: '12 minutes ago',
      user: 'Sarah Miller',
      type: 'deploy',
      icon: CheckCircle2,
      color: 'text-success',
    },
    {
      title: 'New Enterprise Customer: Acme Ltd',
      time: '2 hours ago',
      user: 'Sales Bot',
      type: 'customer',
      icon: DollarSign,
      color: 'text-primary',
    },
    {
      title: 'Failed Webhook Retry (Customer #482)',
      time: '4 hours ago',
      user: 'Worker-01',
      type: 'warning',
      icon: Clock,
      color: 'text-warning',
    },
    {
      title: 'Security Token Rotated',
      time: '1 day ago',
      user: 'Admin Alex',
      type: 'security',
      icon: ShieldAlert,
      color: 'text-info',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Executive Metrics & Dashboard"
        description="High-density analytics overview with KPI sparkcards, visual distribution bars, and activity audit timeline."
        actions={
          <>
            <div className="flex rounded-lg border border-border bg-card p-1">
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium uppercase transition-colors ${
                    timeRange === range
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <Button size="sm" variant="outline" className="gap-1.5 h-8">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </>
        }
      />

      {/* 4 Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Recurring Revenue"
          value="$84,230"
          delta={{ value: '+18.4%', trend: 'up', label: 'vs last month' }}
          icon={DollarSign}
        />
        <StatCard
          title="Active Subscriptions"
          value="2,419"
          delta={{ value: '+8.2%', trend: 'up', label: 'vs last month' }}
          icon={Users}
        />
        <StatCard
          title="Average Latency (P99)"
          value="18.4 ms"
          delta={{ value: '-3.1 ms', trend: 'up', label: 'optimized' }}
          icon={Zap}
        />
        <StatCard
          title="Churn Rate"
          value="0.82%"
          delta={{ value: '+0.1%', trend: 'down', label: 'within threshold' }}
          icon={Activity}
        />
      </div>

      {/* Main Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Traffic & Revenue Distribution */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base">Weekly Request Volume</CardTitle>
              <CardDescription className="text-xs">
                Total API calls processed across regions
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              4.8M reqs
            </Badge>
          </CardHeader>
          <CardContent>
            {/* Visual Bar Chart */}
            <div className="h-64 flex items-end justify-between gap-3 pt-6 pb-2 px-4 border-b border-border/50">
              {chartBars.map((bar) => (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    {bar.value}k
                  </span>
                  <div className="w-full max-w-[40px] bg-muted/60 rounded-t-lg overflow-hidden h-48 flex items-end">
                    <div
                      className="w-full bg-primary group-hover:bg-primary/80 transition-all rounded-t-sm"
                      style={{ height: bar.height }}
                    />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
              <span>Peak: Friday 18:00 UTC (100k req/min)</span>
              <span className="flex items-center gap-1.5 text-success font-medium">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse motion-reduce:animate-none" />
                All 12 clusters healthy
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Realtime Activity Feed */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Audit Activity Feed</CardTitle>
            <CardDescription className="text-xs">
              Recent events logged in workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4 before:absolute before:left-3 before:top-2 before:h-full before:w-0.5 before:bg-border/60">
              {activities.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="relative flex items-start gap-3 pl-2">
                    <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-background border border-border shadow-xs ${item.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col">
                      <p className="text-xs font-semibold text-foreground leading-tight">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-1">
                        <span>{item.user}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
