export type WeightLossProgram =
  | 'glp1-medical'
  | 'metabolic-reset'
  | 'lifestyle-behavioral'
  | 'bariatric-post'
  | 'keto-intensive';

export type PatientStatus = 'active' | 'maintenance' | 'paused' | 'graduated';

export interface WeightRecord {
  date: string;
  weight: number; // kg
  bmi: number;
  bodyFatPct: number; // %
}

export interface Patient {
  id: string; // e.g. PAT-1001
  name: string;
  age: number;
  gender: 'female' | 'male' | 'other';
  phone: string;
  email: string;
  avatarUrl?: string;
  program: WeightLossProgram;
  assignedDoctor: string;
  assignedDietician: string;
  assignedPsychologist: string;
  startWeight: number; // kg
  currentWeight: number; // kg
  targetWeight: number; // kg
  height: number; // cm
  bmi: number;
  bodyFatPct: number;
  status: PatientStatus;
  joinedAt: string;
  lastVisit: string;
  allergies: string[];
  medicalHistory: string[];
  weightHistory: WeightRecord[];
  notesCount: number;
}

export type PractitionerRole = 'doctor' | 'psychologist' | 'dietician';

export type StaffStatus = 'available' | 'in-consult' | 'break' | 'off-duty';

export type AppointmentStatus =
  | 'scheduled'
  | 'checked-in'
  | 'in-consult'
  | 'completed'
  | 'no-show'
  | 'cancelled';

export type AppointmentType =
  | 'initial-assessment'
  | 'doctor-followup'
  | 'psychologist-counseling'
  | 'dietician-mealplan'
  | 'glp1-titration'
  | 'inbody-scan'
  | 'emsculpt-session'
  | 'rf-lipolysis';

export interface Appointment {
  id: string; // APT-2024-001
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  patientProgram: WeightLossProgram;
  practitionerRole: PractitionerRole;
  practitionerName: string;
  type: AppointmentType;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "09:00 - 09:45"
  status: AppointmentStatus;
  room: string;
  notes?: string;
}

export type TreatmentCategory =
  | 'injectable'
  | 'body-contouring'
  | 'rf-therapy'
  | 'metabolic-package'
  | 'consultation-pack'
  | 'nutrition-lab';

export interface Treatment {
  id: string;
  code: string; // TRT-GLP1-01
  name: string;
  category: TreatmentCategory;
  sessions: number;
  durationMinutes: number;
  price: number;
  cost: number;
  active: boolean;
  description: string;
  contraindications: string[];
  popular?: boolean;
}

export interface DoctorSoapNote {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  doctorName: string;
  subjective: string; // appetite, tolerance, cravings, side effects
  objective: {
    bloodPressure: string;
    heartRate: number;
    currentWeight: number;
    fastingGlucose: number;
    glp1Dose: string;
  };
  assessment: string;
  plan: string;
}

export type ScreeningType = 'BES' | 'EAT-26' | 'PHQ-9';

export interface PsychologistNote {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  psychologistName: string;
  screeningType: ScreeningType;
  score: number;
  riskLevel: 'low' | 'moderate' | 'severe';
  emotionalTriggers: string[];
  copingMechanisms: string[];
  sessionNotes: string;
}

export interface DieticianMealPlan {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  dieticianName: string;
  targetCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  waterIntakeLiters: number;
  deficitKcal: number;
  planType: 'High Protein Balanced' | 'Keto Metabolic' | 'Intermittent 16:8' | 'Plant-Forward GLP-1';
  mealRules: string[];
  notes: string;
}

export type ProductCategory =
  | 'supplement'
  | 'meal-replacement'
  | 'device'
  | 'treatment-voucher'
  | 'injection-pen';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  price: number;
  stock: number;
  unit: string;
  imageUrl?: string;
  description: string;
}

export interface CartItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
  discount: number; // percentage e.g. 0 or 10
  category: ProductCategory;
}

export type PaymentMethod = 'qris' | 'credit-card' | 'debit-card' | 'cash' | 'split-package' | 'insurance';

export interface Transaction {
  id: string; // TRX-99042
  patientId?: string;
  patientName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: 'completed' | 'refunded' | 'pending';
  cashierName: string;
  timestamp: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  type: 'registration' | 'appointment' | 'consultation' | 'pos' | 'treatment' | 'alert';
  actor: string;
  action: string;
  target: string;
  badgeVariant: 'default' | 'success' | 'warning' | 'info' | 'destructive';
}

export interface ClinicMetrics {
  todayRevenue: number;
  revenueTrend: number; // percentage e.g. +14.2
  patientsToday: number;
  appointmentsScheduled: number;
  activeProgramsCount: number;
  avgWeightLossKg: number;
  consultationsCompleted: number;
  glp1AdherenceRate: number; // percentage e.g. 96.4
}

export interface StaffPractitioner {
  id: string;
  name: string;
  role: PractitionerRole;
  specialty: string;
  avatarUrl?: string;
  status: StaffStatus;
  room: string;
  todayAppointmentsCount: number;
}
