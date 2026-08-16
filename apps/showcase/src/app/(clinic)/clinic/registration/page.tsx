'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  UserPlus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Users,
  FileCheck2,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Input,
  Label,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Checkbox,
  Stepper,
  DescriptionList,
  type DescriptionListItem,
} from '@ds/ui';
import { PageHeader } from '@/components/page-header';
import { useClinic } from '@/scenarios/clinic/store/clinic-context';
import type { WeightLossProgram } from '@/scenarios/clinic/types';

const STEPS = [
  { id: 'demographics', title: 'Demographics', description: 'Personal details' },
  { id: 'measurements', title: 'Body Vitals', description: 'Scale & goals' },
  { id: 'medical', title: 'Medical History', description: 'Allergies & conditions' },
  { id: 'program', title: 'Program & Team', description: 'Care protocol' },
  { id: 'review', title: 'Review & Enroll', description: 'Generate EMR' },
];

const AVAILABLE_COMORBIDITIES = [
  'Insulin Resistance / Pre-Diabetes',
  'Polycystic Ovary Syndrome (PCOS)',
  'Hypertension (Elevated Blood Pressure)',
  'Fatty Liver Disease (NAFLD)',
  'Sleep Apnea / Heavy Snoring',
  'Hypothyroidism (Thyroid Sluggishness)',
  'Dyslipidemia / Elevated Triglycerides',
  'Emotional / Binge Eating Tendencies',
];

const PROGRAM_OPTIONS: Array<{
  id: WeightLossProgram;
  title: string;
  badge: string;
  description: string;
  monthlyEstimate: string;
}> = [
  {
    id: 'glp1-medical',
    title: 'GLP-1 Medical Protocol',
    badge: 'Physician Supervised',
    description: 'Weekly GLP-1 peptide injections with slow dose titration, blood glucose monitoring, and clinical guidance.',
    monthlyEstimate: 'Rp 4,500,000 / mo',
  },
  {
    id: 'metabolic-reset',
    title: 'Total Metabolic Reset',
    badge: 'Multidisciplinary',
    description: 'Whole-body metabolic recalibration combining nutrition macro pacing, InBody scans, and body sculpting.',
    monthlyEstimate: 'Rp 3,200,000 / mo',
  },
  {
    id: 'lifestyle-behavioral',
    title: 'Lifestyle & CBT-E Therapy',
    badge: 'Psychology Focused',
    description: 'Cognitive behavioral habit modification, emotional eating coaching, and mindful nutrition.',
    monthlyEstimate: 'Rp 2,800,000 / mo',
  },
  {
    id: 'keto-intensive',
    title: 'Keto Intensive & Intermittent Fasting',
    badge: 'Ketogenic Lab',
    description: 'Targeted ketogenic macros under dietician supervision with electrolyte balancing and ketone tracking.',
    monthlyEstimate: 'Rp 2,400,000 / mo',
  },
  {
    id: 'bariatric-post',
    title: 'Bariatric Post-Operative Support',
    badge: 'Post-Surgery',
    description: 'Specialized micronutrient supplementation, gastric pouch pacing, and post-surgery body composition.',
    monthlyEstimate: 'Rp 3,600,000 / mo',
  },
];

export default function PatientRegistrationPage() {
  const { registerPatient } = useClinic();

  const [currentStep, setCurrentStep] = React.useState(0);
  const [isCompleted, setIsCompleted] = React.useState(false);

  // Form State
  const [name, setName] = React.useState('');
  const [age, setAge] = React.useState('32');
  const [gender, setGender] = React.useState<'female' | 'male' | 'other'>('female');
  const [phone, setPhone] = React.useState('+62 812-');
  const [email, setEmail] = React.useState('');

  const [height, setHeight] = React.useState('165');
  const [currentWeight, setCurrentWeight] = React.useState('84.0');
  const [targetWeight, setTargetWeight] = React.useState('62.0');
  const [bodyFatPct, setBodyFatPct] = React.useState('34.5');

  const [allergiesText, setAllergiesText] = React.useState('');
  const [selectedConditions, setSelectedConditions] = React.useState<string[]>([
    'Insulin Resistance / Pre-Diabetes',
  ]);

  const [selectedProgram, setSelectedProgram] = React.useState<WeightLossProgram>('glp1-medical');
  const [assignedDoctor, setAssignedDoctor] = React.useState('Dr. Evelyn Vance, M.D., Ph.D.');
  const [assignedDietician, setAssignedDietician] = React.useState('Alicia Ray, S.Gz., RD');
  const [assignedPsychologist, setAssignedPsychologist] = React.useState('Chloe Thorne, M.Psi., Psikolog');

  // Live computed BMI
  const computedBmi = React.useMemo(() => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(currentWeight);
    if (!h || !w || h <= 0) return 0;
    return Number((w / (h * h)).toFixed(1));
  }, [height, currentWeight]);

  const toggleCondition = (cond: string) => {
    setSelectedConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    const allergiesList = allergiesText
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    registerPatient({
      name,
      age: parseInt(age) || 30,
      gender,
      phone,
      email,
      program: selectedProgram,
      assignedDoctor,
      assignedDietician,
      assignedPsychologist,
      startWeight: parseFloat(currentWeight) || 80,
      currentWeight: parseFloat(currentWeight) || 80,
      targetWeight: parseFloat(targetWeight) || 60,
      height: parseFloat(height) || 165,
      bodyFatPct: parseFloat(bodyFatPct) || 30,
      status: 'active',
      allergies: allergiesList,
      medicalHistory: selectedConditions,
    });

    setIsCompleted(true);
  };

  const reviewItems: DescriptionListItem[] = [
    { label: 'Patient Name', value: name || 'Not specified' },
    { label: 'Demographics', value: `${age} years old • ${gender.toUpperCase()}` },
    { label: 'Contact', value: `${phone} • ${email}` },
    { label: 'Baseline Vitals', value: `Height: ${height} cm • Weight: ${currentWeight} kg (BMI ${computedBmi})` },
    { label: 'Target Goal', value: `Goal: ${targetWeight} kg • Est. Body Fat: ${bodyFatPct}%` },
    { label: 'Enrolled Program', value: selectedProgram.toUpperCase() },
    { label: 'Care Team', value: `Dr: ${assignedDoctor.split(',')[0]} • Diet: ${assignedDietician.split(',')[0]}` },
    { label: 'Allergies', value: allergiesText || 'None reported' },
    { label: 'Clinical History', value: selectedConditions.join(', ') || 'None documented' },
  ];

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto py-12 space-y-6 text-center animate-in fade-in-50">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-success/10 border border-success/30 flex items-center justify-center text-success">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-bold text-2xl text-foreground">
            Patient Intake & EMR Created!
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            {name} has been enrolled into the <strong>{selectedProgram.toUpperCase()}</strong> clinical track. An electronic medical chart has been generated.
          </p>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          <Link href="/clinic/patients">
            <Button size="default" variant="highlight" className="gap-2">
              <Users className="h-4 w-4" />
              View in Patient Directory
            </Button>
          </Link>
          <Button
            variant="outline"
            size="default"
            onClick={() => {
              setIsCompleted(false);
              setCurrentStep(0);
              setName('');
              setEmail('');
            }}
          >
            Register Another Patient
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="Patient Onboarding Workflow"
        eyebrowIcon={UserPlus}
        title="Patient Intake & Registration Wizard"
        description="Structured multi-step intake: demographics, body composition vitals, clinical comorbidities, and multidisciplinary care assignment."
      />

      {/* Stepper Navigation Indicator */}
      <Card className="p-4 bg-card border-border shadow-xs">
        <Stepper
          steps={STEPS}
          currentStep={currentStep}
          onStepClick={(idx) => setCurrentStep(idx)}
        />
      </Card>

      {/* Wizard Form Body */}
      <Card className="p-6 bg-card border-border shadow-xs space-y-6">
        {/* Step 1: Personal Demographics */}
        {currentStep === 0 && (
          <div className="space-y-5 animate-in fade-in-50">
            <div className="border-b border-border/40 pb-3">
              <h3 className="font-display font-bold text-base text-foreground">
                Step 1: Personal Demographics & Contact
              </h3>
              <p className="text-xs text-muted-foreground">
                Enter patient primary identification details for billing and medical record matching.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="fullname" className="text-xs">Full Legal Name *</Label>
                <Input
                  id="fullname"
                  required
                  placeholder="e.g. Jacqueline Montgomery"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="age" className="text-xs">Age (Years) *</Label>
                <Input
                  id="age"
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Gender *</Label>
                <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="other">Other / Prefer not to say</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">Mobile WhatsApp / Phone *</Label>
                <Input
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="e.g. j.montgomery@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Body Vitals & Goals */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in-50">
            <div className="border-b border-border/40 pb-3">
              <h3 className="font-display font-bold text-base text-foreground">
                Step 2: Baseline Body Vitals & Target Goal
              </h3>
              <p className="text-xs text-muted-foreground">
                Starting scale metrics, height, and target weight to generate body mass index (BMI).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="height" className="text-xs">Height (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  required
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="currentWeight" className="text-xs">Current Body Weight (kg) *</Label>
                <Input
                  id="currentWeight"
                  type="number"
                  step="0.1"
                  required
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="targetWeight" className="text-xs">Target Goal Weight (kg) *</Label>
                <Input
                  id="targetWeight"
                  type="number"
                  step="0.1"
                  required
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bodyFatPct" className="text-xs">Estimated Body Fat (%)</Label>
                <Input
                  id="bodyFatPct"
                  type="number"
                  step="0.1"
                  value={bodyFatPct}
                  onChange={(e) => setBodyFatPct(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              {/* Real-time Computed BMI Card */}
              <div className="md:col-span-2 p-3.5 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase text-muted-foreground block">
                    Computed Baseline BMI
                  </span>
                  <span className="font-display font-bold text-2xl text-primary">
                    {computedBmi > 0 ? computedBmi : '—'}
                  </span>
                </div>
                <Badge variant={computedBmi >= 30 ? 'destructive' : computedBmi >= 25 ? 'warning' : 'success'}>
                  {computedBmi >= 35
                    ? 'Class II+ Obesity'
                    : computedBmi >= 30
                    ? 'Class I Obesity'
                    : computedBmi >= 25
                    ? 'Overweight'
                    : 'Normal Range'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Medical History & Allergies */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in-50">
            <div className="border-b border-border/40 pb-3">
              <h3 className="font-display font-bold text-base text-foreground">
                Step 3: Medical History & Known Allergies
              </h3>
              <p className="text-xs text-muted-foreground">
                Screening for metabolic contraindications, hormonal factors, and drug sensitivities.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="allergies" className="text-xs">Known Allergies (Comma separated)</Label>
                <Input
                  id="allergies"
                  placeholder="e.g. Penicillin, Shellfish, Latex"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">Leave empty if No Known Drug Allergies (NKDA).</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Clinical Comorbidities & Risk Factors</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_COMORBIDITIES.map((cond) => {
                    const isChecked = selectedConditions.includes(cond);
                    return (
                      <div
                        key={cond}
                        onClick={() => toggleCondition(cond)}
                        className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-primary/5 border-primary text-foreground font-medium'
                            : 'bg-card border-border text-muted-foreground hover:bg-muted/40'
                        }`}
                      >
                        <Checkbox checked={isChecked} />
                        <span>{cond}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Program & Care Team */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in-50">
            <div className="border-b border-border/40 pb-3">
              <h3 className="font-display font-bold text-base text-foreground">
                Step 4: Clinical Program & Assigned Care Team
              </h3>
              <p className="text-xs text-muted-foreground">
                Select the primary weight loss protocol and assign endocrinologist, dietician, and psychologist.
              </p>
            </div>

            {/* Program Selection Cards */}
            <div className="space-y-2.5">
              <Label className="text-xs">Select Primary Program Protocol *</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {PROGRAM_OPTIONS.map((prog) => {
                  const isSelected = selectedProgram === prog.id;
                  return (
                    <div
                      key={prog.id}
                      onClick={() => setSelectedProgram(prog.id)}
                      className={`p-3.5 rounded-xl border text-xs cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? 'bg-highlight/10 border-highlight ring-1 ring-highlight/40'
                          : 'bg-card border-border hover:border-border/80'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-display font-bold text-foreground text-sm">
                            {prog.title}
                          </span>
                          <Badge variant={isSelected ? 'highlight' : 'secondary'} size="sm">
                            {prog.badge}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">
                          {prog.description}
                        </p>
                      </div>
                      <span className="font-mono text-[11px] font-semibold text-foreground pt-1 border-t border-border/30">
                        {prog.monthlyEstimate}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Care Team Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Supervising Physician</Label>
                <Select value={assignedDoctor} onValueChange={setAssignedDoctor}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dr. Evelyn Vance, M.D., Ph.D.">Dr. Evelyn Vance (Endocrinology)</SelectItem>
                    <SelectItem value="Dr. Marcus Sterling, Sp.GK">Dr. Marcus Sterling (Metabolism)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Assigned Dietician</Label>
                <Select value={assignedDietician} onValueChange={setAssignedDietician}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alicia Ray, S.Gz., RD">Alicia Ray, RD (Metabolic & Keto)</SelectItem>
                    <SelectItem value="Tariq Anderson, S.Gz., RD">Tariq Anderson, RD (Sports & Bariatric)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Assigned Psychologist</Label>
                <Select value={assignedPsychologist} onValueChange={setAssignedPsychologist}>
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Chloe Thorne, M.Psi., Psikolog">Chloe Thorne, M.Psi. (CBT-E Eating)</SelectItem>
                    <SelectItem value="Julian Hayes, M.Psi.">Julian Hayes, M.Psi. (Habits Coach)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Final Review & Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-in fade-in-50">
            <div className="border-b border-border/40 pb-3">
              <h3 className="font-display font-bold text-base text-foreground">
                Step 5: Review & Confirm Registration
              </h3>
              <p className="text-xs text-muted-foreground">
                Verify all patient intake records before initializing the electronic medical record (EMR).
              </p>
            </div>

            <DescriptionList items={reviewItems} columns={2} className="text-xs" />

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/40 text-xs flex items-center gap-3">
              <FileCheck2 className="h-5 w-5 text-primary shrink-0" />
              <p className="text-muted-foreground text-[11px] leading-relaxed">
                By submitting, a new unique patient identifier (e.g. PAT-1009) will be assigned, and notification will be dispatched to the supervising care team.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="gap-1.5"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Previous
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={handleNext}
              disabled={currentStep === 0 && !name}
              className="gap-1.5"
            >
              Next Step
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="highlight"
              onClick={handleSubmit}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              Enroll Patient & Generate EMR
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
