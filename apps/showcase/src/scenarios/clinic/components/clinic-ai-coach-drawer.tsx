'use client';

import * as React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Button,
  Badge,
  Card,
  Spinner,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Progress,
} from '@ds/ui';
import { Sparkles, Brain, CheckCircle2, Activity, ShieldCheck } from 'lucide-react';
import { useClinic } from '../store/clinic-context';
import { analyzePatientWithAi, type PatientAiInsight } from '../lib/mock-api';

export function ClinicAiCoachDrawer() {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    isAiCoachOpen,
    closeAiCoach,
  } = useClinic();

  const [insight, setInsight] = React.useState<PatientAiInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const currentPatient = React.useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || patients[0],
    [patients, selectedPatientId]
  );

  const runAnalysis = React.useCallback(async () => {
    if (!currentPatient) return;
    setIsAnalyzing(true);
    try {
      const res = await analyzePatientWithAi(currentPatient);
      setInsight(res);
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentPatient]);

  React.useEffect(() => {
    if (isAiCoachOpen && currentPatient) {
      runAnalysis();
    }
  }, [isAiCoachOpen, currentPatient?.id]);

  return (
    <Sheet open={isAiCoachOpen} onOpenChange={(open) => !open && closeAiCoach()}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-6 space-y-6">
        <SheetHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-highlight/10 text-highlight">
              <Sparkles className="h-4 w-4" />
            </div>
            <SheetTitle className="font-display text-lg">AI Clinical Coach Assistant</SheetTitle>
          </div>
          <SheetDescription className="text-xs">
            Metabolic trajectory prediction, adherence analytics, and multidisciplinary safety adjustments.
          </SheetDescription>
        </SheetHeader>

        {/* Patient Selector */}
        <div className="space-y-2">
          <label className="text-xs font-mono uppercase text-muted-foreground">Select Patient to Analyze</label>
          <div className="flex gap-2">
            <Select
              value={currentPatient?.id}
              onValueChange={(val) => {
                setSelectedPatientId(val);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.id}) — {p.program.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="default"
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="shrink-0 gap-1.5"
            >
              {isAnalyzing ? <Spinner size="sm" /> : <Brain className="h-4 w-4 text-highlight" />}
              Re-Analyze
            </Button>
          </div>
        </div>

        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Spinner size="lg" className="text-highlight" />
            <p className="text-xs font-mono text-muted-foreground animate-pulse">
              Evaluating metabolic velocity & multi-omics data...
            </p>
          </div>
        ) : insight && currentPatient ? (
          <div className="space-y-5 animate-in fade-in-50">
            {/* Score & Risk KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 bg-highlight/5 border-highlight/20 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono uppercase text-muted-foreground">Adherence Score</span>
                  <Badge variant="highlight" size="sm">
                    {insight.adherenceScore}/100
                  </Badge>
                </div>
                <Progress value={insight.adherenceScore} className="h-2 bg-muted" />
                <p className="text-[10px] text-muted-foreground">
                  Based on weigh-in frequency, appointment attendance & titration pace.
                </p>
              </Card>

              <Card className="p-4 bg-muted/30 border-border space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] font-mono uppercase text-muted-foreground">Metabolic Velocity</span>
                  <Badge variant="success" size="sm">
                    {insight.weightLossVelocityKgPerWeek} kg/wk
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5 pt-1 text-xs font-medium">
                  <Activity className="h-3.5 w-3.5 text-primary" />
                  <span>Risk Level: </span>
                  <strong
                    className={
                      insight.metabolicRisk === 'high'
                        ? 'text-destructive uppercase'
                        : insight.metabolicRisk === 'moderate'
                        ? 'text-warning uppercase'
                        : 'text-success uppercase'
                    }
                  >
                    {insight.metabolicRisk}
                  </strong>
                </div>
                <p className="text-[10px] text-muted-foreground">Optimal clinical safety zone: 0.5 - 1.2 kg/wk.</p>
              </Card>
            </div>

            {/* Key Clinical Insights */}
            <Card className="p-4 space-y-3 bg-card border-border">
              <h4 className="text-xs font-semibold font-display uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Trajectory Insights
              </h4>
              <ul className="space-y-2 text-xs">
                {insight.keyInsights.map((ki, i) => (
                  <li key={i} className="flex items-start gap-2 text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{ki}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Actionable Adjustments */}
            <Card className="p-4 space-y-3 bg-card border-border">
              <h4 className="text-xs font-semibold font-display uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-highlight" />
                Recommended Care Plan Adjustments
              </h4>
              <div className="space-y-2">
                {insight.recommendedAdjustments.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 text-xs border border-border/40">
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                    <span className="text-foreground leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* AI Summary Banner */}
            <div className="p-3.5 rounded-xl bg-highlight/10 border border-highlight/20 text-xs space-y-1">
              <span className="font-mono text-[10px] uppercase tracking-wider font-semibold text-highlight block">
                Primary Clinical Recommendation
              </span>
              <p className="text-foreground font-medium">{insight.suggestedAction}</p>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
