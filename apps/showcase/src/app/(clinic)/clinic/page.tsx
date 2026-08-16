'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Users,
  CalendarClock,
  TrendingDown,
  DollarSign,
  Sparkles,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Activity as ActivityIcon,
  Stethoscope,
  RefreshCw,
  Scale,
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
  AreaChartComponent,
  PieChartComponent,
  EmptyState,
  Timeline,
  GradientText,
  type TimelineItem,
  type TimelineItemStatus,
} from '@ds/ui';
import { PageHeader } from '@/components/page-header';
import { useClinic } from '@/scenarios/clinic/store/clinic-context';
import { PatientSummaryCard } from '@/scenarios/clinic/components/patient-summary-card';
import {
  REVENUE_CHART_DATA,
  WEIGHT_FUNNEL_DATA,
} from '@/scenarios/clinic/data/fixtures';

export default function ClinicDashboardPage() {
  const {
    patients,
    appointments,
    activities,
    metrics,
    selectedPatientId,
    updateAppointmentStatus,
    openAiCoach,
  } = useClinic();

  const [isLoading, setIsLoading] = React.useState(false);

  const simulateReload = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const activePatient = React.useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || patients[0],
    [patients, selectedPatientId]
  );

  const todayAppointments = React.useMemo(
    () => appointments.filter((a) => a.date === '2024-03-16'),
    [appointments]
  );

  const timelineItems: TimelineItem[] = React.useMemo(() => {
    return activities.slice(0, 6).map((act) => {
      let status: TimelineItemStatus = 'success';
      if (act.type === 'alert') status = 'error';
      else if (act.type === 'registration') status = 'warning';
      else if (act.type === 'appointment') status = 'info';

      return {
        id: act.id,
        title: act.action,
        description: `${act.target} • by ${act.actor}`,
        timestamp: act.timestamp,
        status,
        badgeText: act.type.toUpperCase(),
        badgeVariant: act.badgeVariant,
      };
    });
  }, [activities]);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Executive Page Header */}
      <PageHeader
        eyebrow="Clinical Management & EMR"
        eyebrowIcon={HeartPulse}
        title={
          <span>
            Aura Metabolic <GradientText>Weight Loss Clinic</GradientText>
          </span>
        }
        description="Comprehensive clinical information system: patient intake stepper, multi-disciplinary consultations (Doctor, Dietician, Psychologist), treatment catalog, and retail POS."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={simulateReload}
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="font-mono text-xs">Sync Feed</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openAiCoach}
              className="gap-1.5 border-highlight/30 text-highlight hover:bg-highlight/10"
            >
              <Sparkles className="h-3.5 w-3.5 text-highlight animate-pulse" />
              <span className="font-mono text-xs">AI Coach</span>
            </Button>
            <Link href="/clinic/registration">
              <Button size="sm" className="gap-1.5 font-medium">
                <UserPlus className="h-3.5 w-3.5" />
                <span>New Patient Intake</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Revenue"
          value={`Rp ${(metrics.todayRevenue / 1000000).toFixed(1)}M`}
          description="+18.5% vs yesterday"
          icon={DollarSign}
          delta={{ value: '18.5%', trend: 'up', label: 'vs yesterday' }}
        />
        <StatCard
          title="Today's Appointments"
          value={String(todayAppointments.length)}
          description={`${appointments.filter((a) => a.status === 'in-consult').length} in-consultation now`}
          icon={CalendarClock}
          delta={{ value: '8%', trend: 'up', label: 'capacity 90%' }}
        />
        <StatCard
          title="Active Enrolled Patients"
          value={String(patients.filter((p) => p.status === 'active').length)}
          description="Across 5 clinical weight loss programs"
          icon={Users}
          delta={{ value: '+12', trend: 'up', label: 'new enrollments' }}
        />
        <StatCard
          title="Avg Weight Loss Velocity"
          value={`${metrics.avgWeightLossKg} kg`}
          description="96.2% GLP-1 titration adherence"
          icon={TrendingDown}
          variant="highlight"
          delta={{ value: '4.8 kg', trend: 'up', label: 'cohort success' }}
        />
      </div>

      {/* Featured Patient Trajectory Spotlight */}
      {activePatient && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Scale className="h-3.5 w-3.5 text-primary" />
              Patient Focus Spotlight (EMR Active Selection)
            </span>
            <Link
              href="/clinic/patients"
              className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
            >
              View Full Patient Directory <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <PatientSummaryCard patient={activePatient} />
        </div>
      )}

      {/* Analytics & Distribution Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Revenue & Target Area Chart */}
        <Card className="lg:col-span-2 border-border bg-card p-6 shadow-xs">
          <CardHeader className="p-0 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-base">Weekly Revenue & Target</CardTitle>
                <CardDescription className="text-xs">
                  Daily income across clinical packages, consultations, and retail supplements.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[11px]">
                Target: Rp 120M / wk
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full">
              <AreaChartComponent
                data={REVENUE_CHART_DATA}
                dataKey={['revenue', 'target']}
                xKey="name"
              />
            </div>
            {/* Screen reader table mirror for accessibility */}
            <table className="sr-only">
              <caption>Daily revenue and target comparison</caption>
              <thead>
                <tr>
                  <th scope="col">Day</th>
                  <th scope="col">Revenue</th>
                  <th scope="col">Target</th>
                </tr>
              </thead>
              <tbody>
                {REVENUE_CHART_DATA.map((row) => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>Rp {row.revenue.toLocaleString()}</td>
                    <td>Rp {row.target.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Patient Cohort Funnel */}
        <Card className="border-border bg-card p-6 shadow-xs flex flex-col justify-between">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-display text-base">Weight Loss Cohort Funnel</CardTitle>
            <CardDescription className="text-xs">
              Distribution of patients by treatment stage.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full">
              <PieChartComponent
                data={WEIGHT_FUNNEL_DATA.map((d) => ({ name: d.name, value: d.count }))}
                innerRadius={50}
              />
            </div>
            {/* Accessible table mirror */}
            <table className="sr-only">
              <caption>Patient distribution by program cohort</caption>
              <thead>
                <tr>
                  <th scope="col">Stage</th>
                  <th scope="col">Patient Count</th>
                </tr>
              </thead>
              <tbody>
                {WEIGHT_FUNNEL_DATA.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td>{c.count} patients</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Split: Today's Schedule + Live Activity Timeline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Today's Appointments List */}
        <Card className="border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-primary" />
              <h3 className="font-display font-bold text-base text-foreground">
                Today's Schedule ({todayAppointments.length})
              </h3>
            </div>
            <Link
              href="/clinic/appointments"
              className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
            >
              Open Kanban Board <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No Appointments Today"
              description="All patient consultations for today have been concluded or none were booked."
            />
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {todayAppointments.map((appt) => {
                const isCurrent = appt.status === 'in-consult';
                const isDone = appt.status === 'completed';
                return (
                  <div
                    key={appt.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border text-xs transition-all ${
                      isCurrent
                        ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/30'
                        : isDone
                        ? 'bg-muted/20 border-border/40 opacity-70'
                        : 'bg-card border-border hover:border-border/80'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm font-display">
                          {appt.patientName}
                        </span>
                        <Badge
                          variant={
                            appt.status === 'in-consult'
                              ? 'highlight'
                              : appt.status === 'checked-in'
                              ? 'warning'
                              : appt.status === 'completed'
                              ? 'success'
                              : 'secondary'
                          }
                          size="sm"
                        >
                          {appt.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] flex items-center gap-2 font-mono">
                        <span>{appt.timeSlot}</span>
                        <span>•</span>
                        <span>{appt.room}</span>
                        <span>•</span>
                        <span className="text-foreground">{appt.practitionerName.split(',')[0]}</span>
                      </p>
                    </div>

                    {/* Quick status transitions */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      {appt.status === 'scheduled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateAppointmentStatus(appt.id, 'checked-in')}
                          className="h-7 text-[11px] gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3 text-warning" />
                          Check-In
                        </Button>
                      )}
                      {appt.status === 'checked-in' && (
                        <Button
                          size="sm"
                          variant="highlight"
                          onClick={() => updateAppointmentStatus(appt.id, 'in-consult')}
                          className="h-7 text-[11px] gap-1"
                        >
                          <Stethoscope className="h-3 w-3" />
                          Start Consult
                        </Button>
                      )}
                      {appt.status === 'in-consult' && (
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => updateAppointmentStatus(appt.id, 'completed')}
                          className="h-7 text-[11px] gap-1"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Live Activity & Audit Log */}
        <Card className="border-border bg-card p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <ActivityIcon className="h-4 w-4 text-primary" />
              <h3 className="font-display font-bold text-base text-foreground">
                Clinical Audit & Live Feed
              </h3>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground">Auto-recorded</span>
          </div>

          <div className="max-h-[380px] overflow-y-auto pr-2">
            <Timeline items={timelineItems} />
          </div>
        </Card>
      </div>
    </div>
  );
}
