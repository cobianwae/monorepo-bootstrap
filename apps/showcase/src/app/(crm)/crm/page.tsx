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
  Avatar,
  AvatarImage,
  AvatarFallback,
  Skeleton,
  BarChartComponent,
  SectionNumber,
} from '@ds/ui';
import { PageHeader } from '@/components/page-header';
import { useCrm } from '@/scenarios/crm/store/crm-context';
import { REVENUE_CHART_DATA, PIPELINE_STAGE_DATA } from '@/scenarios/crm/data/fixtures';

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

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Standardized Design System PageHeader */}
      <PageHeader
        eyebrow="Executive Intelligence"
        eyebrowIcon={Sparkles}
        title={`Welcome back, ${currentAgent.name}`}
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

      {/* 4 Primary KPI Stat Cards with Loading Skeleton Parity */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 space-y-3">
              <div className="flex justify-between items-center">
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
              title="Total Pipeline Value"
              value={`$${totalCalculatedPipeline.toLocaleString()}`}
              delta={{
                value: `+${metrics.pipelineGrowthPct}%`,
                trend: 'up',
                label: 'vs last month',
              }}
              icon={DollarSign}
            />

            <StatCard
              title="Active Opportunities"
              value={leads.filter((l) => l.stage !== 'lost' && l.stage !== 'won').length}
              delta={{
                value: `${leads.filter((l) => l.stage === 'negotiation').length} in closing`,
                trend: 'neutral',
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

      {/* Visual Analytics Grid: Revenue Trend (BarChartComponent) + Pipeline Stage Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue Performance Chart via official DS BarChartComponent */}
        <Card className="lg:col-span-2 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SectionNumber number="01" />
                <CardTitle className="text-base font-bold text-foreground font-display">
                  Revenue & Pipeline Trajectory
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Monthly closed revenue vs quota target in USD
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Q1 FY2025
            </Badge>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Screen-reader accessible data summary */}
            <table className="sr-only">
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

            <BarChartComponent
              data={REVENUE_CHART_DATA}
              dataKey={['revenue', 'target']}
              xKey="month"
              colors={['var(--primary)', 'var(--highlight)']}
              grid={true}
              showLegend={true}
              className="border-none p-0 bg-transparent aspect-auto h-64"
            />

            <div className="flex items-center justify-between pt-4 text-xs text-muted-foreground border-t border-border/40">
              <span className="flex items-center gap-1.5 font-medium text-success">
                <TrendingUp className="h-3.5 w-3.5" />
                +38% growth compared to previous quarter
              </span>
              <span className="font-mono">Pacing at 114% of annual plan</span>
            </div>
          </CardContent>
        </Card>

        {/* Pipeline Distribution Breakdown */}
        <Card className="shadow-xs flex flex-col justify-between">
          <CardHeader className="pb-2 border-b border-border/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SectionNumber number="02" />
                <CardTitle className="text-base font-bold text-foreground font-display">
                  Pipeline Stage Breakdown
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Value and count distribution across deal stages
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4 flex-1 flex flex-col justify-center">
            {PIPELINE_STAGE_DATA.map((st) => {
              const maxStageVal = 400000;
              const pct = Math.round((st.value / maxStageVal) * 100);

              return (
                <div key={st.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: st.color }}
                      />
                      {st.stage}
                    </span>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-muted-foreground">({st.count})</span>
                      <span className="font-bold text-foreground">
                        ${(st.value / 1000).toFixed(0)}k
                      </span>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Two-Column Operational Activity + AI Priority Opportunities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* High-Intent AI Opportunities */}
        <Card className="shadow-xs border-highlight/30">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SectionNumber number="03" />
                <Flame className="h-4 w-4 text-highlight" />
                <CardTitle className="text-base font-bold text-foreground font-display">
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
            {highIntentLeads.map((lead) => (
              <div
                key={lead.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/60 hover:bg-accent/40 transition-colors group"
              >
                <div className="space-y-1 min-w-0 flex-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground truncate">
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
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <SectionNumber number="04" />
                <CardTitle className="text-base font-bold text-foreground font-display">
                  Real-Time Activity Stream
                </CardTitle>
              </div>
              <CardDescription className="text-xs">
                Audit trail across leads, campaigns and omnichannel chats
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              Live
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3.5 pt-3">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex items-start gap-3 text-xs">
                {act.actorAvatar ? (
                  <Avatar className="h-8 w-8 mt-0.5 shrink-0 border border-border">
                    <AvatarImage src={act.actorAvatar} alt={act.actorName} />
                    <AvatarFallback className="text-xs font-mono">
                      {act.actorName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4" />
                  </div>
                )}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm text-foreground truncate">
                      {act.title}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono shrink-0 ml-2">
                      {act.timestamp}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-1">{act.description}</p>
                </div>
              </div>
            ))}

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
