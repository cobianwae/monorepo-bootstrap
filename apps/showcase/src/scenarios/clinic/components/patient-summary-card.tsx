'use client';

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
  Badge,
  Card,
  Progress,
} from '@ds/ui';
import type { Patient } from '../types';
import { TrendingDown } from 'lucide-react';

interface PatientSummaryCardProps {
  patient: Patient;
  className?: string;
}

export const PROGRAM_BADGE_MAP: Record<
  string,
  { label: string; variant: 'highlight' | 'default' | 'secondary' | 'warning' | 'info' | 'success' }
> = {
  'glp1-medical': { label: 'GLP-1 Medical', variant: 'highlight' },
  'metabolic-reset': { label: 'Metabolic Reset', variant: 'info' },
  'lifestyle-behavioral': { label: 'Lifestyle Behavioral', variant: 'secondary' },
  'bariatric-post': { label: 'Bariatric Post-Op', variant: 'warning' },
  'keto-intensive': { label: 'Keto Intensive', variant: 'default' },
};

export const STATUS_BADGE_MAP: Record<
  string,
  { label: string; variant: 'success' | 'secondary' | 'warning' | 'outline' }
> = {
  active: { label: 'Active', variant: 'success' },
  maintenance: { label: 'Maintenance', variant: 'secondary' },
  paused: { label: 'Paused', variant: 'warning' },
  graduated: { label: 'Graduated', variant: 'outline' },
};

export function getBmiCategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: 'Underweight', color: 'text-info' };
  if (bmi < 25) return { label: 'Normal Weight', color: 'text-success' };
  if (bmi < 30) return { label: 'Overweight', color: 'text-warning' };
  if (bmi < 35) return { label: 'Obese Class I', color: 'text-destructive' };
  return { label: 'Obese Class II+', color: 'text-destructive' };
}

export function PatientSummaryCard({
  patient,
  className,
}: PatientSummaryCardProps) {
  const totalWeightLoss = Number((patient.startWeight - patient.currentWeight).toFixed(1));
  const totalTargetLoss = Math.max(0.1, patient.startWeight - patient.targetWeight);
  const progressPct = Math.min(
    100,
    Math.max(0, Math.round((totalWeightLoss / totalTargetLoss) * 100))
  );

  const progInfo = PROGRAM_BADGE_MAP[patient.program] || {
    label: patient.program,
    variant: 'default',
  };
  const statusInfo = STATUS_BADGE_MAP[patient.status] || {
    label: patient.status,
    variant: 'secondary',
  };
  const bmiInfo = getBmiCategory(patient.bmi);

  return (
    <Card className={`p-4 md:p-6 bg-card border-border shadow-xs ${className || ''}`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Patient Avatar & Core Demographics */}
        <div className="flex items-start gap-4">
          <Avatar size="lg" className="h-14 w-14 ring-2 ring-primary/20">
            {patient.avatarUrl && <AvatarImage src={patient.avatarUrl} alt={patient.name} />}
            <AvatarFallback className="font-display font-semibold text-base">
              {patient.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display font-bold text-lg text-foreground tracking-tight">
                {patient.name}
              </h3>
              <span className="font-mono text-xs text-muted-foreground">({patient.id})</span>
              <Badge variant={progInfo.variant} size="sm">
                {progInfo.label}
              </Badge>
              <Badge variant={statusInfo.variant} size="sm">
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex flex-wrap items-center gap-2">
              <span>{patient.age} y/o {patient.gender}</span>
              <span>•</span>
              <span>Height: {patient.height} cm</span>
              <span>•</span>
              <span>Joined: {patient.joinedAt}</span>
              <span>•</span>
              <span>Last Visit: {patient.lastVisit}</span>
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-muted-foreground font-mono">
              <span>Doctor: <strong className="text-foreground font-sans font-medium">{patient.assignedDoctor.split(',')[0]}</strong></span>
              <span>|</span>
              <span>Diet: <strong className="text-foreground font-sans font-medium">{patient.assignedDietician.split(',')[0]}</strong></span>
            </div>
          </div>
        </div>

        {/* Right: Weight Metric Tiles & Goal Progress */}
        <div className="flex flex-col gap-3 min-w-[280px] lg:max-w-md bg-muted/30 p-3.5 rounded-xl border border-border/50">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-background/80 p-2 rounded-lg border border-border/40">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Start</span>
              <span className="font-display font-bold text-sm text-foreground">{patient.startWeight} kg</span>
            </div>
            <div className="bg-background/80 p-2 rounded-lg border border-border/40 ring-1 ring-primary/30">
              <span className="text-[10px] uppercase font-mono text-primary font-semibold block">Current</span>
              <span className="font-display font-bold text-base text-foreground">{patient.currentWeight} kg</span>
            </div>
            <div className="bg-background/80 p-2 rounded-lg border border-border/40">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">Target</span>
              <span className="font-display font-bold text-sm text-success">{patient.targetWeight} kg</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground flex items-center gap-1 font-medium">
                <TrendingDown className="h-3.5 w-3.5 text-success" />
                Lost <strong className="text-success font-bold font-mono">-{totalWeightLoss} kg</strong>
              </span>
              <span className="font-mono text-[11px] font-semibold text-foreground">
                {progressPct}% to goal
              </span>
            </div>
            <Progress value={progressPct} className="h-2 bg-muted" />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/30">
            <span className="text-muted-foreground">
              BMI: <strong className="text-foreground font-mono font-bold">{patient.bmi}</strong> ({bmiInfo.label})
            </span>
            <span className="text-muted-foreground">
              Body Fat: <strong className="text-foreground font-mono font-bold">{patient.bodyFatPct}%</strong>
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
