'use client';

import * as React from 'react';
import {
  ClipboardList,
  Stethoscope,
  Sparkles,
  Brain,
  Save,
  Apple,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Input,
  Label,
  Textarea,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Slider,
} from '@ds/ui';
import { PageHeader } from '@/components/page-header';
import { useClinic } from '@/scenarios/clinic/store/clinic-context';
import { PatientSummaryCard } from '@/scenarios/clinic/components/patient-summary-card';
import type { ScreeningType } from '@/scenarios/clinic/types';

export default function ConsultationsPage() {
  const {
    patients,
    selectedPatientId,
    setSelectedPatientId,
    doctorNotes,
    psychologistNotes,
    dieticianPlans,
    addDoctorNote,
    addPsychologistNote,
    addDieticianPlan,
    openAiCoach,
  } = useClinic();

  const activePatient = React.useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || patients[0],
    [patients, selectedPatientId]
  );

  // --- Doctor SOAP State ---
  const [docName, setDocName] = React.useState('Dr. Evelyn Vance, M.D., Ph.D.');
  const [bp, setBp] = React.useState('118/76 mmHg');
  const [hr, setHr] = React.useState('72');
  const [soapWeight, setSoapWeight] = React.useState('76.2');
  const [glucose, setGlucose] = React.useState('89');
  const [glp1Dose, setGlp1Dose] = React.useState('1.0 mg/week');
  const [subjective, setSubjective] = React.useState(
    'Patient reports noticeable appetite suppression and 80% reduction in late-night food noise. No severe gastrointestinal distress.'
  );
  const [assessment, setAssessment] = React.useState(
    'Steady metabolic trajectory. -12.3 kg total weight loss from baseline. Excellent glycemic control and adherence.'
  );
  const [plan, setPlan] = React.useState(
    '1. Maintain current GLP-1 peptide dose at 1.0 mg weekly.\n2. Dietician Alicia to review protein pacing (>=90g daily).\n3. Re-evaluate fasting lipid panel in 4 weeks.'
  );

  // --- Psychologist State ---
  const [psychName, setPsychName] = React.useState('Chloe Thorne, M.Psi., Psikolog');
  const [screeningType, setScreeningType] = React.useState<ScreeningType>('BES');
  const [q1, setQ1] = React.useState(1);
  const [q2, setQ2] = React.useState(2);
  const [q3, setQ3] = React.useState(1);
  const [q4, setQ4] = React.useState(1);
  const [psychTriggers, setPsychTriggers] = React.useState<string[]>([
    'Work deadlines after 8 PM',
    'Stress from social gatherings',
  ]);
  const [psychNotes, setPsychNotes] = React.useState(
    'Patient demonstrated improved cognitive reframing around body neutrality. Identified late-night snacking as primary remaining risk zone.'
  );

  const totalPsychScore = q1 + q2 + q3 + q4 * 2;
  const psychRiskLevel: 'low' | 'moderate' | 'severe' =
    totalPsychScore > 14 ? 'severe' : totalPsychScore > 7 ? 'moderate' : 'low';

  // --- Dietician State ---
  const [dietName, setDietName] = React.useState('Alicia Ray, S.Gz., RD');
  const [deficitKcal, setDeficitKcal] = React.useState(450);
  const [proteinGrams, setProteinGrams] = React.useState(110);
  const [carbsGrams, setCarbsGrams] = React.useState(115);
  const [fatGrams, setFatGrams] = React.useState(45);
  const [waterLiters, setWaterLiters] = React.useState(2.4);
  const [dietPlanType, setDietPlanType] = React.useState<
    'High Protein Balanced' | 'Keto Metabolic' | 'Intermittent 16:8' | 'Plant-Forward GLP-1'
  >('Plant-Forward GLP-1');
  const [dietNotes, setDietNotes] = React.useState(
    'High protein density prioritized to prevent lean skeletal muscle loss during active GLP-1 titration.'
  );

  const calculatedCalories = proteinGrams * 4 + carbsGrams * 4 + fatGrams * 9;

  // Filtered Notes
  const patientDocNotes = React.useMemo(
    () => doctorNotes.filter((n) => n.patientId === activePatient?.id),
    [doctorNotes, activePatient?.id]
  );
  const patientPsychNotes = React.useMemo(
    () => psychologistNotes.filter((n) => n.patientId === activePatient?.id),
    [psychologistNotes, activePatient?.id]
  );
  const patientDietPlans = React.useMemo(
    () => dieticianPlans.filter((p) => p.patientId === activePatient?.id),
    [dieticianPlans, activePatient?.id]
  );

  const handleSaveSoap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    addDoctorNote({
      patientId: activePatient.id,
      patientName: activePatient.name,
      doctorName: docName,
      subjective,
      objective: {
        bloodPressure: bp,
        heartRate: parseInt(hr) || 72,
        currentWeight: parseFloat(soapWeight) || activePatient.currentWeight,
        fastingGlucose: parseInt(glucose) || 90,
        glp1Dose,
      },
      assessment,
      plan,
    });
  };

  const handleSavePsych = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    addPsychologistNote({
      patientId: activePatient.id,
      patientName: activePatient.name,
      psychologistName: psychName,
      screeningType,
      score: totalPsychScore,
      riskLevel: psychRiskLevel,
      emotionalTriggers: psychTriggers,
      copingMechanisms: ['5-min box breathing', 'Journaling thought records', 'Hydration cue replacement'],
      sessionNotes: psychNotes,
    });
  };

  const handleSaveDiet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;
    addDieticianPlan({
      patientId: activePatient.id,
      patientName: activePatient.name,
      dieticianName: dietName,
      targetCalories: calculatedCalories,
      proteinGrams,
      carbsGrams,
      fatGrams,
      waterIntakeLiters: waterLiters,
      deficitKcal,
      planType: dietPlanType,
      mealRules: [
        '30g protein pacing at breakfast',
        '20 min slow chewing to match gastric delay',
        'Cease eating upon first satiety signal',
      ],
      notes: dietNotes,
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="Multi-Disciplinary Care Workspace"
        eyebrowIcon={ClipboardList}
        title="Clinical Consultations & Therapy Notes"
        description="Unified electronic chart workspace for Medical Doctors (SOAP notes), Psychologists (CBT-E behavioral screening), and Dieticians (macro meal plans)."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={openAiCoach}
            className="gap-1.5 border-highlight/30 text-highlight hover:bg-highlight/10"
          >
            <Sparkles className="h-3.5 w-3.5 text-highlight animate-pulse" />
            <span className="font-mono text-xs">AI Trajectory Insight</span>
          </Button>
        }
      />

      {/* Patient Selector Strip & Summary Card */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-muted/30 rounded-xl border border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase font-semibold text-muted-foreground">Active Patient:</span>
            <Select value={activePatient?.id} onValueChange={setSelectedPatientId}>
              <SelectTrigger className="h-8 w-64 text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name} ({p.id}) — {p.program.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            Current Weight: <strong className="text-foreground">{activePatient?.currentWeight} kg</strong> • BMI {activePatient?.bmi}
          </span>
        </div>

        {activePatient && <PatientSummaryCard patient={activePatient} />}
      </div>

      {/* Multi-Role Consultation Tabs */}
      <Tabs defaultValue="doctor" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full h-11 bg-muted/60 p-1">
          <TabsTrigger value="doctor" className="text-xs gap-2 font-display">
            <Stethoscope className="h-4 w-4" />
            <span>Doctor SOAP Workspace</span>
          </TabsTrigger>
          <TabsTrigger value="psychologist" className="text-xs gap-2 font-display">
            <Brain className="h-4 w-4" />
            <span>Psychology CBT-E Workspace</span>
          </TabsTrigger>
          <TabsTrigger value="dietician" className="text-xs gap-2 font-display">
            <Apple className="h-4 w-4" />
            <span>Dietician Nutrition Workspace</span>
          </TabsTrigger>
        </TabsList>

        {/* ================= DOCTOR TAB ================= */}
        <TabsContent value="doctor" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Doctor SOAP Form */}
            <Card className="lg:col-span-2 p-6 bg-card border-border shadow-xs space-y-5">
              <form onSubmit={handleSaveSoap} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      Physician SOAP Clinical Assessment
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Medical history review, peptide titration, and metabolic vitals entry.
                    </p>
                  </div>
                  <Select value={docName} onValueChange={setDocName}>
                    <SelectTrigger className="h-8 w-56 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. Evelyn Vance, M.D., Ph.D.">Dr. Evelyn Vance (Endocrine)</SelectItem>
                      <SelectItem value="Dr. Marcus Sterling, Sp.GK">Dr. Marcus Sterling (Metabolism)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Objective Vitals Strip */}
                <div className="space-y-2">
                  <Label className="text-xs font-mono uppercase text-muted-foreground">
                    Objective Baseline Vitals
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div className="space-y-1">
                      <Label htmlFor="bp" className="text-[11px]">Blood Pressure</Label>
                      <Input
                        id="bp"
                        value={bp}
                        onChange={(e) => setBp(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="hr" className="text-[11px]">Heart Rate (bpm)</Label>
                      <Input
                        id="hr"
                        type="number"
                        value={hr}
                        onChange={(e) => setHr(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="weight" className="text-[11px]">Scale Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.1"
                        value={soapWeight}
                        onChange={(e) => setSoapWeight(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="glucose" className="text-[11px]">Glucose (mg/dL)</Label>
                      <Input
                        id="glucose"
                        type="number"
                        value={glucose}
                        onChange={(e) => setGlucose(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="dose" className="text-[11px]">Current Peptide Dose</Label>
                      <Input
                        id="dose"
                        value={glp1Dose}
                        onChange={(e) => setGlp1Dose(e.target.value)}
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* S - O - A - P text fields */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <Label htmlFor="subj" className="text-xs font-bold text-foreground">
                      S — Subjective (Patient Report & Symptoms)
                    </Label>
                    <Textarea
                      id="subj"
                      rows={2}
                      value={subjective}
                      onChange={(e) => setSubjective(e.target.value)}
                      className="text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="assess" className="text-xs font-bold text-foreground">
                      A — Clinical Assessment & Weight Trajectory
                    </Label>
                    <Textarea
                      id="assess"
                      rows={2}
                      value={assessment}
                      onChange={(e) => setAssessment(e.target.value)}
                      className="text-xs resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="plan" className="text-xs font-bold text-foreground">
                      P — Treatment Plan, Titration & Orders
                    </Label>
                    <Textarea
                      id="plan"
                      rows={3}
                      value={plan}
                      onChange={(e) => setPlan(e.target.value)}
                      className="text-xs resize-none font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" variant="highlight" className="gap-1.5">
                    <Save className="h-3.5 w-3.5" />
                    Save Doctor SOAP Note
                  </Button>
                </div>
              </form>
            </Card>

            {/* Right: History of Doctor Notes for Active Patient */}
            <Card className="p-6 bg-card border-border shadow-xs space-y-4">
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-foreground">
                Previous Doctor Notes ({patientDocNotes.length})
              </h4>
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {patientDocNotes.map((note) => (
                  <div key={note.id} className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-foreground font-display">{note.doctorName.split(',')[0]}</span>
                      <span className="font-mono text-muted-foreground">{note.date}</span>
                    </div>
                    <p className="text-muted-foreground line-clamp-2"><strong>A:</strong> {note.assessment}</p>
                    <p className="text-muted-foreground line-clamp-2 font-mono text-[11px]"><strong>P:</strong> {note.plan}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ================= PSYCHOLOGIST TAB ================= */}
        <TabsContent value="psychologist" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Behavioral Assessment Form */}
            <Card className="lg:col-span-2 p-6 bg-card border-border shadow-xs space-y-5">
              <form onSubmit={handleSavePsych} className="space-y-4">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      Psychological Behavioral Assessment (CBT-E)
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Eating disorder screening, cognitive emotional triggers, and habit reframing.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={psychName} onValueChange={setPsychName}>
                      <SelectTrigger className="h-8 w-48 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Chloe Thorne, M.Psi., Psikolog">Chloe Thorne, M.Psi.</SelectItem>
                        <SelectItem value="Julian Hayes, M.Psi.">Julian Hayes, M.Psi.</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={screeningType} onValueChange={(v: any) => setScreeningType(v)}>
                      <SelectTrigger className="h-8 w-36 text-xs font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BES">BES (Binge Scale)</SelectItem>
                        <SelectItem value="EAT-26">EAT-26 Inventory</SelectItem>
                        <SelectItem value="PHQ-9">PHQ-9 Mood Screen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Live Scoring Questionnaire Grid */}
                <div className="space-y-3 bg-muted/20 p-4 rounded-xl border border-border/40">
                  <div className="flex items-center justify-between pb-2 border-b border-border/30">
                    <span className="text-xs font-semibold text-foreground font-display">
                      {screeningType} Interactive Questionnaire Scoring
                    </span>
                    <Badge variant={psychRiskLevel === 'low' ? 'success' : psychRiskLevel === 'moderate' ? 'warning' : 'destructive'} size="sm">
                      Score: {totalPsychScore} ({psychRiskLevel.toUpperCase()} RISK)
                    </Badge>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="space-y-1.5">
                      <Label className="text-xs">1. Loss of control / Urge over snacking between meals (0-3)</Label>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3].map((val) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setQ1(val)}
                            className={`flex-1 p-2 rounded-lg border text-center transition-all cursor-pointer font-mono ${
                              q1 === val ? 'bg-highlight text-highlight-foreground font-bold border-highlight' : 'bg-card border-border text-muted-foreground'
                            }`}
                          >
                            {val} {val === 0 ? '(Never)' : val === 3 ? '(Severe)' : ''}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">2. Emotional guilt / Distress experienced post-dinner (0-3)</Label>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3].map((val) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setQ2(val)}
                            className={`flex-1 p-2 rounded-lg border text-center transition-all cursor-pointer font-mono ${
                              q2 === val ? 'bg-highlight text-highlight-foreground font-bold border-highlight' : 'bg-card border-border text-muted-foreground'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">3. Eating rapidly even when not physically hungry (0-3)</Label>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3].map((val) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setQ3(val)}
                            className={`flex-1 p-2 rounded-lg border text-center transition-all cursor-pointer font-mono ${
                              q3 === val ? 'bg-highlight text-highlight-foreground font-bold border-highlight' : 'bg-card border-border text-muted-foreground'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">4. Turning to comfort foods when anxious or overwhelmed (0-3)</Label>
                      <div className="flex gap-2">
                        {[0, 1, 2, 3].map((val) => (
                          <button
                            type="button"
                            key={val}
                            onClick={() => setQ4(val)}
                            className={`flex-1 p-2 rounded-lg border text-center transition-all cursor-pointer font-mono ${
                              q4 === val ? 'bg-highlight text-highlight-foreground font-bold border-highlight' : 'bg-card border-border text-muted-foreground'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-border/30">
                      <Label className="text-xs">Documented Emotional Triggers</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Work deadlines after 8 PM',
                          'Stress from social gatherings',
                          'Peer pressure during dining',
                          'Fatigue after skipping lunch',
                          'Boredom snacking in evening',
                        ].map((trig) => {
                          const active = psychTriggers.includes(trig);
                          return (
                            <button
                              type="button"
                              key={trig}
                              onClick={() => {
                                setPsychTriggers((prev) =>
                                  active ? prev.filter((t) => t !== trig) : [...prev, trig]
                                );
                              }}
                              className={`px-2 py-1 rounded-md text-[11px] border transition-all cursor-pointer ${
                                active
                                  ? 'bg-highlight/15 text-highlight border-highlight/40 font-medium'
                                  : 'bg-card border-border text-muted-foreground hover:bg-muted/40'
                              }`}
                            >
                              {trig}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Session Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="psych-notes" className="text-xs font-bold text-foreground">
                    Therapist Session Notes & CBT-E Reframing Interventions
                  </Label>
                  <Textarea
                    id="psych-notes"
                    rows={4}
                    value={psychNotes}
                    onChange={(e) => setPsychNotes(e.target.value)}
                    className="text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" variant="highlight" className="gap-1.5">
                    <Save className="h-3.5 w-3.5" />
                    Save Psychological Assessment
                  </Button>
                </div>
              </form>
            </Card>

            {/* Right: Previous Psych Sessions */}
            <Card className="p-6 bg-card border-border shadow-xs space-y-4">
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-foreground">
                Psychology History ({patientPsychNotes.length})
              </h4>
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {patientPsychNotes.map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-foreground font-display">{n.psychologistName.split(',')[0]}</span>
                      <Badge variant={n.riskLevel === 'low' ? 'success' : 'warning'} size="sm">
                        {n.screeningType} Score: {n.score}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">{n.sessionNotes}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* ================= DIETICIAN TAB ================= */}
        <TabsContent value="dietician" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Nutrition & Macro Builder */}
            <Card className="lg:col-span-2 p-6 bg-card border-border shadow-xs space-y-5">
              <form onSubmit={handleSaveDiet} className="space-y-5">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div>
                    <h3 className="font-display font-bold text-base text-foreground">
                      Dietician Nutrition & Macro Prescription
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Calculate daily energy deficit, protein density, and structured meal guidelines.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={dietName} onValueChange={setDietName}>
                      <SelectTrigger className="h-8 w-44 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Alicia Ray, S.Gz., RD">Alicia Ray, RD</SelectItem>
                        <SelectItem value="Tariq Anderson, S.Gz., RD">Tariq Anderson, RD</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dietPlanType} onValueChange={(v: any) => setDietPlanType(v)}>
                      <SelectTrigger className="h-8 w-48 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Plant-Forward GLP-1">Plant-Forward GLP-1</SelectItem>
                        <SelectItem value="High Protein Balanced">High Protein Balanced</SelectItem>
                        <SelectItem value="Keto Metabolic">Keto Metabolic</SelectItem>
                        <SelectItem value="Intermittent 16:8">Intermittent 16:8 Fasting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Energy & Macros Calculator KPI Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-center">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Target Energy</span>
                    <span className="font-display font-bold text-lg text-primary">{calculatedCalories} kcal</span>
                    <span className="text-[10px] text-success font-mono block">(-{deficitKcal} deficit)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Protein Target</span>
                    <span className="font-display font-bold text-base text-foreground">{proteinGrams}g</span>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      ({Math.round((proteinGrams * 4 / calculatedCalories) * 100)}% kcal)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Carbohydrates</span>
                    <span className="font-display font-bold text-base text-foreground">{carbsGrams}g</span>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      ({Math.round((carbsGrams * 4 / calculatedCalories) * 100)}% kcal)
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                    <span className="text-[10px] uppercase font-mono text-muted-foreground block">Dietary Fat</span>
                    <span className="font-display font-bold text-base text-foreground">{fatGrams}g</span>
                    <span className="text-[10px] text-muted-foreground font-mono block">
                      ({Math.round((fatGrams * 9 / calculatedCalories) * 100)}% kcal)
                    </span>
                  </div>
                </div>

                {/* Interactive Macro Sliders */}
                <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border/40">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span>Daily Caloric Deficit Target</span>
                      <strong>-{deficitKcal} kcal</strong>
                    </div>
                    <Slider
                      value={[deficitKcal]}
                      min={200}
                      max={800}
                      step={25}
                      onValueChange={(val) => setDeficitKcal(val[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span>Protein Goal (Pacing ≥ 1.4g/kg)</span>
                      <strong>{proteinGrams}g</strong>
                    </div>
                    <Slider
                      value={[proteinGrams]}
                      min={60}
                      max={200}
                      step={5}
                      onValueChange={(val) => setProteinGrams(val[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span>Carbohydrate Limit</span>
                      <strong>{carbsGrams}g</strong>
                    </div>
                    <Slider
                      value={[carbsGrams]}
                      min={20}
                      max={220}
                      step={5}
                      onValueChange={(val) => setCarbsGrams(val[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span>Dietary Healthy Fats</span>
                      <strong>{fatGrams}g</strong>
                    </div>
                    <Slider
                      value={[fatGrams]}
                      min={20}
                      max={120}
                      step={5}
                      onValueChange={(val) => setFatGrams(val[0])}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span>Minimum Daily Water Hydration</span>
                      <strong>{waterLiters} Liters</strong>
                    </div>
                    <Slider
                      value={[waterLiters]}
                      min={1.5}
                      max={4.5}
                      step={0.1}
                      onValueChange={(val) => setWaterLiters(val[0])}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="diet-notes" className="text-xs font-bold text-foreground">
                    Meal Timing Directives & Satiety Rules
                  </Label>
                  <Textarea
                    id="diet-notes"
                    rows={3}
                    value={dietNotes}
                    onChange={(e) => setDietNotes(e.target.value)}
                    className="text-xs resize-none"
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" size="sm" variant="highlight" className="gap-1.5">
                    <Save className="h-3.5 w-3.5" />
                    Generate Nutrition Plan
                  </Button>
                </div>
              </form>
            </Card>

            {/* Right: Previous Meal Plans */}
            <Card className="p-6 bg-card border-border shadow-xs space-y-4">
              <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-foreground">
                Meal Plan History ({patientDietPlans.length})
              </h4>
              <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
                {patientDietPlans.map((plan) => (
                  <div key={plan.id} className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs space-y-2">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-foreground font-display">{plan.planType}</span>
                      <span className="font-mono text-muted-foreground">{plan.date}</span>
                    </div>
                    <p className="font-mono font-bold text-primary text-[11px]">{plan.targetCalories} kcal (P:{plan.proteinGrams}g C:{plan.carbsGrams}g F:{plan.fatGrams}g)</p>
                    <p className="text-muted-foreground text-[11px] leading-relaxed line-clamp-2">{plan.notes}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
