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
  Skeleton,
  toast,
  BarChartComponent,
  SectionNumber,
} from '@ds/ui';
import {
  DollarSign,
  Users,
  Activity,
  Zap,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';

export default function DashboardPatternPage() {
  const [timeRange, setTimeRange] = React.useState('30d');
  const [isLoading, setIsLoading] = React.useState(false);

  const metrics = React.useMemo(() => {
    switch (timeRange) {
      case '7d':
        return {
          mrr: '$21,450',
          mrrDelta: { value: '+4.2%', trend: 'up' as const, label: 'vs last week' },
          subs: '2,380',
          subsDelta: { value: '+2.1%', trend: 'up' as const, label: 'vs last week' },
          latency: '16.2 ms',
          latencyDelta: { value: '-1.4 ms', trend: 'up' as const, label: 'optimized' },
          churn: '0.74%',
          churnDelta: { value: '-0.05%', trend: 'up' as const, label: 'healthy' },
          volume: '1.2M reqs',
        };
      case '90d':
        return {
          mrr: '$248,100',
          mrrDelta: { value: '+42.1%', trend: 'up' as const, label: 'vs last quarter' },
          subs: '2,710',
          subsDelta: { value: '+19.5%', trend: 'up' as const, label: 'vs last quarter' },
          latency: '19.8 ms',
          latencyDelta: { value: '+0.5 ms', trend: 'down' as const, label: 'load increase' },
          churn: '0.91%',
          churnDelta: { value: '+0.1%', trend: 'down' as const, label: 'within threshold' },
          volume: '14.6M reqs',
        };
      case '1y':
        return {
          mrr: '$980,400',
          mrrDelta: { value: '+124%', trend: 'up' as const, label: 'vs last year' },
          subs: '3,840',
          subsDelta: { value: '+88%', trend: 'up' as const, label: 'vs last year' },
          latency: '18.1 ms',
          latencyDelta: { value: '-5.2 ms', trend: 'up' as const, label: 'infra overhaul' },
          churn: '0.80%',
          churnDelta: { value: '-0.2%', trend: 'up' as const, label: 'retention high' },
          volume: '58.2M reqs',
        };
      case '30d':
      default:
        return {
          mrr: '$84,230',
          mrrDelta: { value: '+18.4%', trend: 'up' as const, label: 'vs last month' },
          subs: '2,419',
          subsDelta: { value: '+8.2%', trend: 'up' as const, label: 'vs last month' },
          latency: '18.4 ms',
          latencyDelta: { value: '-3.1 ms', trend: 'up' as const, label: 'optimized' },
          churn: '0.82%',
          churnDelta: { value: '+0.1%', trend: 'down' as const, label: 'within threshold' },
          volume: '4.8M reqs',
        };
    }
  }, [timeRange]);

  const chartBars = React.useMemo(() => [
    { label: 'Mon', value: 34 },
    { label: 'Tue', value: 48 },
    { label: 'Wed', value: 72 },
    { label: 'Thu', value: 65 },
    { label: 'Fri', value: 89 },
    { label: 'Sat', value: 42 },
    { label: 'Sun', value: 28 },
  ], []);

  const chartData = React.useMemo(() => [
    { day: 'Mon', requests: 34 },
    { day: 'Tue', requests: 48 },
    { day: 'Wed', requests: 72 },
    { day: 'Thu', requests: 65 },
    { day: 'Fri', requests: 89 },
    { day: 'Sat', requests: 42 },
    { day: 'Sun', requests: 28 },
  ], []);

  const activities = [
    {
      id: 1,
      title: 'Database Backup Completed',
      desc: 'Automatic snapshot replica stored to secondary S3 bucket.',
      time: '12m ago',
      icon: CheckCircle2,
      color: 'text-success',
    },
    {
      id: 2,
      title: 'High CPU Utilization on Node-03',
      desc: 'Worker node exceeded 85% capacity for 5 consecutive minutes.',
      time: '44m ago',
      icon: AlertTriangle,
      color: 'text-warning',
    },
    {
      id: 3,
      title: 'New Enterprise Plan Subscribed',
      desc: 'Acme Global upgraded from Starter tier to Enterprise Annual.',
      time: '2h ago',
      icon: ArrowUpRight,
      color: 'text-primary',
    },
    {
      id: 4,
      title: 'API Rate Limit Throttle Triggered',
      desc: 'IP 192.168.1.42 hit 1,000 req/min endpoint threshold.',
      time: '5h ago',
      icon: ShieldAlert,
      color: 'text-info',
    },
  ];

  const handleExport = () => {
    toast({
      variant: 'success',
      title: 'Report Generated',
      description: `Executive metrics for (${timeRange}) compiled to CSV report.`,
    });
  };

  const simulateReload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Executive Metrics & Dashboard"
        description="High-density analytics overview with KPI sparkcards, visual distribution bars, and accessible activity audit timeline."
        actions={
          <>
            <div
              role="radiogroup"
              aria-label="Select metric timeframe"
              className="flex rounded-lg border border-border bg-card p-1"
            >
              {['7d', '30d', '90d', '1y'].map((range) => (
                <button
                  key={range}
                  type="button"
                  role="radio"
                  aria-checked={timeRange === range}
                  onClick={() => setTimeRange(range)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium uppercase transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    timeRange === range
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={simulateReload}
              className="gap-1.5 h-8"
              aria-label="Reload dashboard metrics"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>

            <Button size="sm" variant="outline" onClick={handleExport} className="gap-1.5 h-8">
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
          </>
        }
      />

      {/* 4 Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Monthly Recurring Revenue"
              value={metrics.mrr}
              delta={metrics.mrrDelta}
              icon={DollarSign}
            />
            <StatCard
              title="Active Subscriptions"
              value={metrics.subs}
              delta={metrics.subsDelta}
              icon={Users}
            />
            <StatCard
              title="Average Latency (P99)"
              value={metrics.latency}
              delta={metrics.latencyDelta}
              icon={Zap}
            />
            <StatCard
              title="Churn Rate"
              value={metrics.churn}
              delta={metrics.churnDelta}
              icon={Activity}
            />
          </>
        )}
      </div>

      {/* Main Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Traffic & Revenue Distribution */}
        <Card className="lg:col-span-2 border-border shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SectionNumber number="01" />
                <CardTitle className="text-base font-display">Weekly Request Volume ({timeRange})</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Total API calls processed across distributed gateway regions
              </CardDescription>
            </div>
            <Badge variant="highlight-outline" className="font-mono text-xs">
              {metrics.volume}
            </Badge>
          </CardHeader>
          <CardContent>
            {/* Screen-reader accessible data summary */}
            <div className="sr-only">
              <table>
                <caption>Daily Request Volume Summary for {timeRange}</caption>
                <thead>
                  <tr>
                    <th scope="col">Day</th>
                    <th scope="col">Requests (Thousands)</th>
                  </tr>
                </thead>
                <tbody>
                  {chartBars.map((bar) => (
                    <tr key={bar.label}>
                      <td>{bar.label}</td>
                      <td>{bar.value}k</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recharts bar chart themed with OKLCH tokens */}
            <BarChartComponent
              data={chartData}
              dataKey="requests"
              xKey="day"
              grid={false}
              showLegend={false}
            />

            <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground">
              <span>Peak: Friday (89,000 requests)</span>
              <span>Health: 99.98% uptime SLA verified</span>
            </div>
          </CardContent>
        </Card>

        {/* Right 1 Col: Live Activity Feed */}
        <Card className="border-border shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <SectionNumber number="02" />
              <CardTitle className="text-base font-display">Live Activity Feed</CardTitle>
            </div>
            <CardDescription className="text-xs">Real-time system audit events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {activities.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex items-start gap-3 text-xs">
                    <div className="mt-0.5 shrink-0">
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{item.title}</span>
                        <span className="text-[10px] text-muted-foreground">{item.time}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
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
