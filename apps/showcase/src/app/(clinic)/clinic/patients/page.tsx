'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  UserPlus,
  Scale,
  Stethoscope,
  ClipboardList,
  FileText,
  CreditCard,
  Plus,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  Button,
  Badge,
  Card,
  Input,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Label,
  EmptyState,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@ds/ui';
import { PageHeader } from '@/components/page-header';
import { useClinic } from '@/scenarios/clinic/store/clinic-context';
import {
  PatientSummaryCard,
  PROGRAM_BADGE_MAP,
  STATUS_BADGE_MAP,
  getBmiCategory,
} from '@/scenarios/clinic/components/patient-summary-card';
import { WeightTrajectoryChart } from '@/scenarios/clinic/components/weight-trajectory-chart';

export default function PatientsDirectoryPage() {
  const {
    patients,
    doctorNotes,
    psychologistNotes,
    dieticianPlans,
    transactions,
    selectedPatientId,
    setSelectedPatientId,
    recordWeightEntry,
    openAiCoach,
  } = useClinic();

  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedProgram, setSelectedProgram] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');
  const [isEmrOpen, setIsEmrOpen] = React.useState(false);
  const [isRecordWeightOpen, setIsRecordWeightOpen] = React.useState(false);
  const [newWeight, setNewWeight] = React.useState<string>('');
  const [newBodyFat, setNewBodyFat] = React.useState<string>('');

  const activePatient = React.useMemo(
    () => patients.find((p) => p.id === selectedPatientId) || patients[0],
    [patients, selectedPatientId]
  );

  const filteredPatients = React.useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProgram =
        selectedProgram === 'all' || p.program === selectedProgram;

      const matchesStatus =
        selectedStatus === 'all' || p.status === selectedStatus;

      return matchesSearch && matchesProgram && matchesStatus;
    });
  }, [patients, searchTerm, selectedProgram, selectedStatus]);

  const patientDoctorNotes = React.useMemo(
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

  const patientTransactions = React.useMemo(
    () => transactions.filter((t) => t.patientId === activePatient?.id),
    [transactions, activePatient?.id]
  );

  const handleOpenEmr = (patientId: string) => {
    setSelectedPatientId(patientId);
    setIsEmrOpen(true);
  };

  const handleSaveWeight = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient || !newWeight) return;
    const w = parseFloat(newWeight);
    const bf = newBodyFat ? parseFloat(newBodyFat) : undefined;
    if (isNaN(w)) return;

    recordWeightEntry(activePatient.id, w, bf);
    setIsRecordWeightOpen(false);
    setNewWeight('');
    setNewBodyFat('');
  };

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <PageHeader
        eyebrow="Clinical EMR & Directory"
        eyebrowIcon={Users}
        title="Patients & Electronic Medical Records"
        description="Searchable patient directory, body composition trajectories, multi-disciplinary clinical histories, and electronic health charts."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={openAiCoach}
              className="gap-1.5 border-highlight/30 text-highlight hover:bg-highlight/10"
            >
              <Sparkles className="h-3.5 w-3.5 text-highlight animate-pulse" />
              <span className="font-mono text-xs">AI Insights</span>
            </Button>
            <Link href="/clinic/registration">
              <Button size="sm" className="gap-1.5 font-medium">
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register Patient</span>
              </Button>
            </Link>
          </div>
        }
      />

      {/* Filter Toolbar Card */}
      <Card className="p-4 bg-card border-border shadow-xs">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Program & Status Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="h-9 w-44 text-xs">
                <SelectValue placeholder="All Programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Programs</SelectItem>
                <SelectItem value="glp1-medical">GLP-1 Medical</SelectItem>
                <SelectItem value="metabolic-reset">Metabolic Reset</SelectItem>
                <SelectItem value="lifestyle-behavioral">Lifestyle Behavioral</SelectItem>
                <SelectItem value="bariatric-post">Bariatric Post-Op</SelectItem>
                <SelectItem value="keto-intensive">Keto Intensive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="h-9 w-36 text-xs">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="graduated">Graduated</SelectItem>
              </SelectContent>
            </Select>

            {(searchTerm || selectedProgram !== 'all' || selectedStatus !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedProgram('all');
                  setSelectedStatus('all');
                }}
                className="h-9 text-xs font-mono text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Patient Data Table */}
      <Card className="border-border bg-card shadow-xs overflow-hidden">
        {filteredPatients.length === 0 ? (
          <div className="p-12">
            <EmptyState
              icon={Users}
              title="No Patients Found"
              description="No patient records match the selected filters or search keyword."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchTerm('');
                setSelectedProgram('all');
                setSelectedStatus('all');
              }}
            />
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="w-12 font-mono text-[11px]">ID</TableHead>
                <TableHead className="font-mono text-[11px]">Patient</TableHead>
                <TableHead className="font-mono text-[11px]">Program</TableHead>
                <TableHead className="font-mono text-[11px]">Weight Trajectory</TableHead>
                <TableHead className="font-mono text-[11px]">BMI / Status</TableHead>
                <TableHead className="font-mono text-[11px]">Assigned Doctor</TableHead>
                <TableHead className="text-right font-mono text-[11px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => {
                const totalLoss = Number((patient.startWeight - patient.currentWeight).toFixed(1));
                const progBadge = PROGRAM_BADGE_MAP[patient.program];
                const statusBadge = STATUS_BADGE_MAP[patient.status];
                const bmiCat = getBmiCategory(patient.bmi);

                return (
                  <TableRow
                    key={patient.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() => handleOpenEmr(patient.id)}
                  >
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                      {patient.id}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar size="default" className="h-9 w-9">
                          {patient.avatarUrl && (
                            <AvatarImage src={patient.avatarUrl} alt={patient.name} />
                          )}
                          <AvatarFallback className="text-xs font-display">
                            {patient.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-display font-semibold text-sm text-foreground">
                            {patient.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {patient.age} y/o {patient.gender} • {patient.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant={progBadge?.variant || 'default'} size="sm">
                        {progBadge?.label || patient.program}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="text-muted-foreground">{patient.startWeight}</span>
                          <span>→</span>
                          <span className="font-bold text-foreground">{patient.currentWeight} kg</span>
                          <span className="text-success font-semibold text-[11px]">(-{totalLoss} kg)</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          Goal: {patient.targetWeight} kg
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-foreground">
                            BMI {patient.bmi}
                          </span>
                          <Badge variant={statusBadge?.variant || 'secondary'} size="sm" className="text-[10px]">
                            {statusBadge?.label || patient.status}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground block font-mono">
                          {bmiCat.label}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-foreground font-medium">
                      {patient.assignedDoctor.split(',')[0]}
                    </TableCell>

                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEmr(patient.id)}
                          className="h-8 text-xs gap-1 font-mono"
                        >
                          <FileText className="h-3 w-3" />
                          EMR Chart
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Slide-over Patient EMR Comprehensive Sheet */}
      {activePatient && (
        <Sheet open={isEmrOpen} onOpenChange={setIsEmrOpen}>
          <SheetContent side="right" className="w-full sm:max-w-3xl overflow-y-auto p-6 space-y-6">
            <SheetHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <SheetTitle className="font-display text-lg">Electronic Medical Record (EMR)</SheetTitle>
                <Button
                  size="sm"
                  variant="highlight"
                  onClick={() => setIsRecordWeightOpen(true)}
                  className="gap-1.5 h-8 text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Record New Weight
                </Button>
              </div>
              <SheetDescription className="text-xs">
                Patient ID: {activePatient.id} • Registered: {activePatient.joinedAt}
              </SheetDescription>
            </SheetHeader>

            {/* Patient Demographics & Goals Summary Card */}
            <PatientSummaryCard patient={activePatient} />

            {/* EMR Tabbed Sections */}
            <Tabs defaultValue="trajectory" className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="trajectory" className="text-xs gap-1.5">
                  <Scale className="h-3.5 w-3.5" />
                  Trajectory
                </TabsTrigger>
                <TabsTrigger value="consultations" className="text-xs gap-1.5">
                  <ClipboardList className="h-3.5 w-3.5" />
                  Consult Notes
                </TabsTrigger>
                <TabsTrigger value="medical" className="text-xs gap-1.5">
                  <Stethoscope className="h-3.5 w-3.5" />
                  Medical Profile
                </TabsTrigger>
                <TabsTrigger value="invoices" className="text-xs gap-1.5">
                  <CreditCard className="h-3.5 w-3.5" />
                  Billing
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Weight & Body Composition Trajectory Chart */}
              <TabsContent value="trajectory" className="space-y-4">
                <WeightTrajectoryChart
                  records={activePatient.weightHistory}
                  targetWeight={activePatient.targetWeight}
                />

                {/* Weigh-in log table */}
                <Card className="p-4 bg-card border-border space-y-3">
                  <h4 className="text-xs font-semibold font-display uppercase tracking-wider text-foreground">
                    Historical Weigh-In Log ({activePatient.weightHistory.length} readings)
                  </h4>
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead className="font-mono text-[11px]">Date</TableHead>
                        <TableHead className="font-mono text-[11px]">Weight (kg)</TableHead>
                        <TableHead className="font-mono text-[11px]">BMI</TableHead>
                        <TableHead className="font-mono text-[11px]">Body Fat (%)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activePatient.weightHistory.map((rec, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-xs">{rec.date}</TableCell>
                          <TableCell className="font-mono text-xs font-bold text-foreground">
                            {rec.weight} kg
                          </TableCell>
                          <TableCell className="font-mono text-xs">{rec.bmi}</TableCell>
                          <TableCell className="font-mono text-xs">{rec.bodyFatPct}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>

              {/* Tab 2: Clinical Consultation Records */}
              <TabsContent value="consultations" className="space-y-4">
                {/* Doctor SOAP Notes */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold font-display uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    Doctor SOAP Notes ({patientDoctorNotes.length})
                  </h4>
                  {patientDoctorNotes.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/20 border border-border/40">
                      No doctor SOAP notes recorded for this patient yet.
                    </p>
                  ) : (
                    patientDoctorNotes.map((note) => (
                      <Card key={note.id} className="p-4 bg-card border-border space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-border/40">
                          <div>
                            <span className="font-semibold text-xs text-foreground font-display">
                              {note.doctorName}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground ml-2">
                              {note.date}
                            </span>
                          </div>
                          <Badge variant="highlight" size="sm">
                            SOAP
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/30 p-2.5 rounded-lg text-[11px] font-mono">
                          <div>BP: <strong className="text-foreground">{note.objective.bloodPressure}</strong></div>
                          <div>HR: <strong className="text-foreground">{note.objective.heartRate} bpm</strong></div>
                          <div>Glucose: <strong className="text-foreground">{note.objective.fastingGlucose} mg/dL</strong></div>
                          <div>Dose: <strong className="text-foreground">{note.objective.glp1Dose}</strong></div>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <p><strong className="text-foreground font-semibold">Subjective:</strong> <span className="text-muted-foreground">{note.subjective}</span></p>
                          <p><strong className="text-foreground font-semibold">Assessment:</strong> <span className="text-muted-foreground">{note.assessment}</span></p>
                          <p><strong className="text-foreground font-semibold">Plan:</strong> <span className="text-muted-foreground whitespace-pre-line">{note.plan}</span></p>
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                {/* Psychologist Screening & Notes */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold font-display uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-highlight" />
                    Psychology Behavioral Sessions ({patientPsychNotes.length})
                  </h4>
                  {patientPsychNotes.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/20 border border-border/40">
                      No psychological screening notes recorded for this patient.
                    </p>
                  ) : (
                    patientPsychNotes.map((note) => (
                      <Card key={note.id} className="p-4 bg-card border-border space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-border/40">
                          <div>
                            <span className="font-semibold text-xs text-foreground font-display">
                              {note.psychologistName}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground ml-2">
                              {note.date}
                            </span>
                          </div>
                          <Badge variant={note.riskLevel === 'low' ? 'success' : 'warning'} size="sm">
                            {note.screeningType} Score: {note.score} ({note.riskLevel.toUpperCase()})
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{note.sessionNotes}</p>
                      </Card>
                    ))
                  )}
                </div>

                {/* Dietician Meal Plans */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold font-display uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <Scale className="h-4 w-4 text-success" />
                    Dietician Nutrition Plans ({patientDietPlans.length})
                  </h4>
                  {patientDietPlans.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3 rounded-lg bg-muted/20 border border-border/40">
                      No customized nutrition plan assigned yet.
                    </p>
                  ) : (
                    patientDietPlans.map((plan) => (
                      <Card key={plan.id} className="p-4 bg-card border-border space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-border/40">
                          <div>
                            <span className="font-semibold text-xs text-foreground font-display">
                              {plan.planType}
                            </span>
                            <span className="font-mono text-[11px] text-muted-foreground ml-2">
                              by {plan.dieticianName} ({plan.date})
                            </span>
                          </div>
                          <Badge variant="info" size="sm">
                            {plan.targetCalories} kcal (Deficit: -{plan.deficitKcal})
                          </Badge>
                        </div>
                        <div className="grid grid-cols-4 gap-2 bg-muted/30 p-2.5 rounded-lg text-center text-xs font-mono">
                          <div><span className="text-muted-foreground text-[10px] block">Protein</span><strong>{plan.proteinGrams}g</strong></div>
                          <div><span className="text-muted-foreground text-[10px] block">Carbs</span><strong>{plan.carbsGrams}g</strong></div>
                          <div><span className="text-muted-foreground text-[10px] block">Fat</span><strong>{plan.fatGrams}g</strong></div>
                          <div><span className="text-muted-foreground text-[10px] block">Water</span><strong>{plan.waterIntakeLiters}L</strong></div>
                        </div>
                        <ul className="text-xs space-y-1 text-muted-foreground list-disc pl-4">
                          {plan.mealRules.map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* Tab 3: Medical History & Allergies */}
              <TabsContent value="medical" className="space-y-4">
                <Card className="p-4 bg-card border-border space-y-3">
                  <h4 className="text-xs font-semibold font-display uppercase tracking-wider text-foreground">
                    Documented Allergies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activePatient.allergies.length === 0 ? (
                      <Badge variant="outline" size="sm">No Known Drug/Food Allergies (NKDA)</Badge>
                    ) : (
                      activePatient.allergies.map((all, i) => (
                        <Badge key={i} variant="destructive" size="sm">
                          {all}
                        </Badge>
                      ))
                    )}
                  </div>
                </Card>

                <Card className="p-4 bg-card border-border space-y-3">
                  <h4 className="text-xs font-semibold font-display uppercase tracking-wider text-foreground">
                    Clinical Comorbidities & Medical History
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {activePatient.medicalHistory.map((mh, i) => (
                      <li key={i} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span>{mh}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </TabsContent>

              {/* Tab 4: Billing & Transactions */}
              <TabsContent value="invoices" className="space-y-4">
                {patientTransactions.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-4 rounded-lg bg-muted/20 border border-border/40">
                    No billing transactions on file for this patient.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {patientTransactions.map((trx) => (
                      <Card key={trx.id} className="p-4 bg-card border-border space-y-2 text-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-border/40">
                          <div>
                            <span className="font-mono font-bold text-foreground">{trx.id}</span>
                            <span className="font-mono text-[11px] text-muted-foreground ml-2">
                              {trx.timestamp}
                            </span>
                          </div>
                          <Badge variant="success" size="sm">
                            {trx.paymentMethod.toUpperCase()} • Rp {trx.total.toLocaleString()}
                          </Badge>
                        </div>
                        <ul className="space-y-1 text-muted-foreground font-mono text-[11px]">
                          {trx.items.map((item, idx) => (
                            <li key={idx} className="flex justify-between">
                              <span>{item.quantity}x {item.name}</span>
                              <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>
      )}

      {/* Record Weight Modal Dialog */}
      <Dialog open={isRecordWeightOpen} onOpenChange={setIsRecordWeightOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSaveWeight} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="font-display text-base">Record New Weigh-In</DialogTitle>
              <DialogDescription className="text-xs">
                Log new clinical scale reading for {activePatient?.name} ({activePatient?.id}).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="weight" className="text-xs">Current Body Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 75.4"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bodyFat" className="text-xs">Body Fat Percentage (%) (Optional)</Label>
                <Input
                  id="bodyFat"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 29.8"
                  value={newBodyFat}
                  onChange={(e) => setNewBodyFat(e.target.value)}
                  className="h-9 text-xs font-mono"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsRecordWeightOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="highlight">
                Save Weigh-In
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
