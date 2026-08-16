'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Users,
  Target,
  Headphones,
  Sparkles,
  Plus,
  ArrowRight,
  Flame,
  Lightbulb,
  TrendingUp,
  RefreshCw,
  CheckCircle2,
  Megaphone,
  UserPlus,
  MessageSquare,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  StatCard,
  Progress,
  Skeleton,
  AreaChartComponent,
  PieChartComponent,
  EmptyState,
  Timeline,
  GradientText,
  type TimelineItem,
  type TimelineItemStatus,
} from '@ds/ui';
import { PageHeader } from '@/components/page-header';
import { useCrm } from '@/scenarios/crm/store/crm-context';
import { REVENUE_CHART_DATA, PIPELINE_STAGE_DATA } from '@/scenarios/crm/data/fixtures';

const STAGE_PIE_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-success)',
];

export default function CrmDashboardPage() {
  const {
    leads,
    activities,
    metrics,
    currentAgent,
    openAiDrawer,
  } = useCrm();

  const [isLoading, setIsLoading] = React.useState(false);

  const simulateReload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  const highIntentLeads = React.useMemo(() => {
    return leads
      .filter((l) => l.aiScore >= 80 && l.stage !== 'won' && l.stage !== 'lost')
      .sort((a, b) => b.aiScore - a.aiScore)
      .slice(0, 4);
  }, [leads]);

  const totalCalculatedPipeline = React.useMemo(() => {
    return leads
      .filter((l) => l.stage !== 'lost')
      .reduce((acc, l) => acc + l.dealValue, 0);
  }, [leads]);

  const pieChartData = React.useMemo(() => {
    return PIPELINE_STAGE_DATA.map((st) => ({
      name: st.stage,
      value: st.value,
    }));
  }, []);

  const timelineItems: TimelineItem[] = React.useMemo(() => {
    return activities.slice(0, 5).map((act) => {
      let status: TimelineItemStatus = 'info';
      let icon = Sparkles;
      if (act.type === 'deal_won') {
        status = 'success';
        icon = CheckCircle2;
      } else if (act.type === 'campaign_launched') {
        status = 'warning';
        icon = Megaphone;
      } else if (act.type === 'lead_created') {
        status = 'info';
        icon = UserPlus;
      } else if (act.type === 'message_sent') {
        status = 'default';
        icon = MessageSquare;
      }

      return {
        id: act.id,
        title: act.title,
        description: act.description,
        timestamp: act.timestamp,
        status,
        icon,
        badges: [{ label: act.actorName, variant: 'outline' }],
      };
    });
  }, [activities]);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Standardized Design System PageHeader with GradientText */}
      <PageHeader
        eyebrow="Executive Intelligence"
        eyebrowIcon={Sparkles}
        title={
          <span>
            Welcome back, <GradientText>{currentAgent.name}</GradientText>
          </span>
        }
        description={`Pipeline velocity is up +${metrics.pipelineGrowthPct}% this month with ${metrics.leadsWonThisMonth} closed deals. AI prioritization has flagged ${highIntentLeads.length} high-intent enterprise opportunities.`}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={simulateReload}
              className="h-8 w-8 p-0"
              aria-label="Refresh dashboard data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Link href="/crm/leads">
              <Button size="sm" className="h-8 gap-1.5 shadow-xs">
                <Plus className="h-3.5 w-3.5" />
                <span>Pipeline & Leads</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 Primary KPI Stat Cards with Elevated Visual Hierarchy */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32" />
            </Card>
          ))
        ) : (
          <>
            <StatCard
              title="Total Pipeline Value"
              value={`$${totalCalculatedPipeline.toLocaleString()}`}
              delta={{
                value: `+${metrics.pipelineGrowthPct}%`,
                trend: 'up',
                label: 'vs last month',
              }}
              icon={DollarSign}
              variant="highlight"
            />

            <StatCard
              title="Active Opportunities"
              value={leads.filter((l) => l.stage !== 'lost' && l.stage !== 'won').length}
              delta={{
                value: 'Active',
                trend: 'neutral',
                label: `${leads.filter((l) => l.stage === 'negotiation').length} deals in closing`,
              }}
              icon={Users}
            />

            <StatCard
              title="Win Rate (MTD)"
              value={`${metrics.winRatePct}%`}
              delta={{
                value: '+4.2%',
                trend: 'up',
                label: `${metrics.leadsWonThisMonth} won deals`,
              }}
              icon={Target}
            />

            <StatCard
              title="Avg Support Response"
              value={`${metrics.avgResponseTimeMin}m`}
              delta={{
                value: `${metrics.csatScore}% CSAT`,
                trend: 'up',
                label: 'Omnichannel speed',
              }}
              icon={Headphones}
            />
          </>
        )}
      </div>

      {/* Visual Analytics Grid: Revenue Trend (AreaChartComponent) + Pipeline Stage Breakdown (Donut PieChart) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Performance Chart via official DS AreaChartComponent */}
        <Card className="lg:col-span-2 shadow-xs flex flex-col justify-between">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold text-foreground">
                Revenue & Pipeline Trajectory
              </CardTitle>
              <CardDescription className="text-xs">
                Monthly closed revenue vs quota target with area gradient
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Q1 FY2025
            </Badge>
          </CardHeader>
          <CardContent className="pt-4 flex-1 flex flex-col justify-between space-y-4">
            {/* Screen-reader accessible data summary */}
            <div className="sr-only">
              <table>
                <caption>Monthly Revenue and Target Breakdown</caption>
                <thead>
                  <tr>
                    <th scope="col">Month</th>
                    <th scope="col">Closed Revenue</th>
                    <th scope="col">Target Quota</th>
                  </tr>
                </thead>
                <tbody>
                  {REVENUE_CHART_DATA.map((item) => (
                    <tr key={item.month}>
                      <td>{item.month}</td>
                      <td>${item.revenue.toLocaleString()}</td>
                      <td>${item.target.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex-1 min-h-64 flex flex-col">
              <AreaChartComponent
                data={REVENUE_CHART_DATA}
                dataKey={['revenue', 'target']}
                xKey="month"
                colors={['var(--color-chart-1)', 'var(--color-chart-2)']}
                grid={true}
                showLegend={true}
                variant="gradient"
                fillOpacity={0.3}
                className="border-none p-0 bg-transparent aspect-auto flex-1 min-h-64 h-full"
              />
            </div>

            <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground border-t border-border/40">
              <span className="flex items-center gap-1.5 font-medium text-success">
                <TrendingUp className="h-3.5 w-3.5" />
                +38% growth compared to previous quarter
              </span>
              <span className="font-mono">Pacing at 114% of annual plan</span>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Distribution Breakdown: Donut PieChart + Progress bars */}
        <Card className="shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold text-foreground">
                Pipeline Stage Breakdown
              </CardTitle>
              <CardDescription className="text-xs">
                Distribution across deal lifecycle stages
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-3 flex-1 flex flex-col justify-between">
            {/* Donut Pie Chart */}
            <div className="h-44 flex items-center justify-center">
              <PieChartComponent
                data={pieChartData}
                colors={STAGE_PIE_COLORS}
                innerRadius={45}
                outerRadius={65}
                showLegend={false}
                className="border-none p-0 bg-transparent aspect-auto h-44"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border/40">
              {PIPELINE_STAGE_DATA.map((st) => {
                const maxStageVal = 400000;
                const pct = Math.round((st.value / maxStageVal) * 100);

                return (
                  <div key={st.stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground flex items-center gap-1.5 truncate">
                        <span
                          className="h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: st.color }}
                        />
                        <span className="truncate">{st.stage}</span>
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-[11px] shrink-0">
                        <span className="text-muted-foreground">({st.count})</span>
                        <span className="font-bold text-foreground">
                          ${(st.value / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                    <Progress value={pct} className="h-1.5" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-Column Operational Activity (Timeline) + AI Priority Opportunities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* High-Intent AI Opportunities */}
        <Card className="shadow-xs border-highlight/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-highlight" />
                <CardTitle className="text-base font-semibold text-foreground">
                  AI Priority Opportunities
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Leads with highest conversion probability based on real-time activity
              </CardDescription>
            </div>
            <Badge variant="highlight" className="text-xs font-mono px-2">
              Score ≥ 80
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            {highIntentLeads.length === 0 ? (
              <EmptyState
                icon={Sparkles}
                title="No High-Intent Leads Flagged"
                description="All current opportunities are progressing normally or need initial qualification."
                actionLabel="View All Leads"
                onAction={() => window.location.assign('/crm/leads')}
                className="py-6"
              />
            ) : (
              <>
                {highIntentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60 hover:bg-accent/40 hover:border-highlight/40 transition-all group"
                  >
                    <div className="space-y-1 min-w-0 flex-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                          {lead.name}
                        </span>
                        <Badge variant="outline" className="text-xs uppercase font-mono">
                          {lead.stage}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {lead.company} • ${lead.dealValue.toLocaleString()} deal value
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 line-clamp-1 italic">
                        <Lightbulb className="h-3.5 w-3.5 text-highlight shrink-0" />
                        <span>{lead.aiScoreReason}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-sm font-bold text-highlight font-mono">
                          {lead.aiScore}/100
                        </span>
                        <p className="text-[11px] text-muted-foreground font-mono">AI Score</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        onClick={() =>
                          openAiDrawer({
                            type: 'lead',
                            entityId: lead.id,
                            initialTab: 'lead-scoring',
                          })
                        }
                        title="Analyze with AI Copilot"
                        aria-label={`Analyze ${lead.name} with AI Copilot`}
                      >
                        <Sparkles className="h-4 w-4 text-highlight" />
                      </Button>
                    </div>
                  </div>
                ))}

                <Link href="/crm/leads" className="w-full block pt-1">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View All {leads.length} Leads in Pipeline
                    <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        {/* Live Activity Stream using DS Timeline */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
            <div className="space-y-1">
              <CardTitle className="text-base font-semibold text-foreground">
                Real-Time Activity Stream
              </CardTitle>
              <CardDescription className="text-xs">
                Live audit trail across leads, campaigns and omnichannel chats
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Live
            </Badge>
          </CardHeader>
          <CardContent className="p-5 pt-4 space-y-4">
            <Timeline items={timelineItems} />

            <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
              <span className="font-mono">Showing 5 of {activities.length} logged events</span>
              <Link href="/crm/contact-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground hover:text-foreground font-medium"
                >
                  Open Contact Center
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
