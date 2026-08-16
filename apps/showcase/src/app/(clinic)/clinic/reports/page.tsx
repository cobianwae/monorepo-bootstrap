'use client';

import {
  BarChart3,
  TrendingDown,
  DollarSign,
  Users,
  Award,
  Download,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  StatCard,
  BarChartComponent,
  PieChartComponent,
} from '@ds/ui';
import { PageHeader } from '@/components/page-header';
import { useClinic } from '@/scenarios/clinic/store/clinic-context';
import { TREATMENT_CATEGORY_DATA } from '@/scenarios/clinic/data/fixtures';

const CATEGORY_REVENUE_DATA = [
  { name: 'GLP-1 Protocols', revenue: 68500000, target: 55000000 },
  { name: 'HIFEM & RF Sculpt', revenue: 42000000, target: 35000000 },
  { name: 'Consultations Pack', revenue: 28400000, target: 25000000 },
  { name: 'Retail & InBody Labs', revenue: 19800000, target: 15000000 },
];

const STAFF_VOLUME_DATA = [
  { name: 'Dr. Evelyn (Endo)', sessions: 38 },
  { name: 'Dr. Marcus (Metab)', sessions: 32 },
  { name: 'Alicia (RD)', sessions: 46 },
  { name: 'Tariq (RD)', sessions: 29 },
  { name: 'Chloe (Psych)', sessions: 27 },
  { name: 'Julian (Psych)', sessions: 22 },
];

export default function ClinicReportsPage() {
  const { metrics } = useClinic();

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="Clinical Intelligence & Outcomes"
        eyebrowIcon={BarChart3}
        title="Metabolic Outcomes & Revenue Analytics"
        description="Comprehensive clinical performance reports: treatment efficacy, weight loss velocity across cohorts, revenue breakdown, and care team productivity."
        actions={
          <div className="flex items-center gap-2.5">
            <Button size="sm" variant="outline" className="gap-1.5 font-mono text-xs">
              <Download className="h-3.5 w-3.5" />
              Export PDF Report
            </Button>
          </div>
        }
      />

      {/* 4 Analytics KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Gross Revenue"
          value="Rp 184.5M"
          description="+22.4% vs previous cycle"
          icon={DollarSign}
          delta={{ value: '+22.4%', trend: 'up', label: 'vs last month' }}
        />
        <StatCard
          title="GLP-1 Adherence Rate"
          value={`${metrics.glp1AdherenceRate}%`}
          description="Consistent weekly titration"
          icon={Award}
          delta={{ value: '+3.2%', trend: 'up', label: 'clinical benchmark' }}
        />
        <StatCard
          title="Average Cohort Loss"
          value={`${metrics.avgWeightLossKg} kg`}
          description="-11.8% of starting body weight"
          icon={TrendingDown}
          variant="highlight"
          delta={{ value: '8.4 kg', trend: 'up', label: 'high efficacy' }}
        />
        <StatCard
          title="90-Day Graduation Rate"
          value="74.2%"
          description="Transitioning to maintenance"
          icon={Users}
          delta={{ value: '+5.1%', trend: 'up', label: 'retention' }}
        />
      </div>

      {/* Row 1: Revenue by Category & Program Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue by Treatment Category Bar Chart */}
        <Card className="lg:col-span-2 p-6 bg-card border-border shadow-xs">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-base">Monthly Revenue by Clinical Service Category</CardTitle>
                <CardDescription className="text-xs">
                  Direct comparison between actual revenue vs budget targets.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[11px]">
                Currency: IDR
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className="w-full"
              role="img"
              aria-label="Monthly revenue by clinical service category compared to budget targets"
            >
              <BarChartComponent
                data={CATEGORY_REVENUE_DATA}
                dataKey={['revenue', 'target']}
                xKey="name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Treatment Category Distribution Pie */}
        <Card className="p-6 bg-card border-border shadow-xs flex flex-col justify-between">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-display text-base">Service Volume Share</CardTitle>
            <CardDescription className="text-xs">
              Relative volume proportion of clinic services.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className="w-full"
              role="img"
              aria-label={`Clinical service volume share: ${TREATMENT_CATEGORY_DATA.map((t) => `${t.name}: ${t.value}%`).join(', ')}`}
            >
              <PieChartComponent
                data={TREATMENT_CATEGORY_DATA}
                className="mx-auto aspect-square w-full max-w-[300px] border-none p-0 bg-transparent"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Care Team Productivity & Staff Utilization */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6 bg-card border-border shadow-xs">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-display text-base">Clinician Monthly Consultation Volume</CardTitle>
            <CardDescription className="text-xs">
              Number of completed 1-on-1 sessions per practitioner.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div
              className="w-full"
              role="img"
              aria-label="Clinician monthly consultation volumes per practitioner"
            >
              <BarChartComponent
                data={STAFF_VOLUME_DATA}
                dataKey="sessions"
                xKey="name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clinical Summary Insights Card */}
        <Card className="p-6 bg-card border-border shadow-xs space-y-4">
          <h3 className="font-display font-bold text-base text-foreground">
            Clinical Outcome Highlights
          </h3>
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-highlight/10 border border-highlight/20 space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-highlight block">
                Endocrinology GLP-1 Cohort
              </span>
              <p className="text-foreground leading-relaxed">
                92% of patients on Semaglutide/Tirzepatide achieved ≥ 10% total body weight reduction at Month 3 without severe adverse events.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-success/10 border border-success/20 space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-success block">
                CBT-E Psychology Behavioral Impact
              </span>
              <p className="text-foreground leading-relaxed">
                Binge Eating Scale (BES) scores dropped by an average of 54% after 4 structured behavioral therapy sessions.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-1">
              <span className="font-mono text-[10px] uppercase font-bold text-primary block">
                Dietician High-Protein Protocol
              </span>
              <p className="text-foreground leading-relaxed">
                Lean body mass retention exceeded 88% across all body composition scans due to structured 1.4g/kg protein targets.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
