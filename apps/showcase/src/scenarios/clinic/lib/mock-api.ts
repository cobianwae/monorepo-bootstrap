import type {
  Patient,
  Appointment,
  Treatment,
  DoctorSoapNote,
  PsychologistNote,
  DieticianMealPlan,
  Product,
  Transaction,
  Activity,
  ClinicMetrics,
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_APPOINTMENTS,
  INITIAL_TREATMENTS,
  INITIAL_DOCTOR_NOTES,
  INITIAL_PSYCHOLOGIST_NOTES,
  INITIAL_DIETICIAN_PLANS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_ACTIVITIES,
  INITIAL_CLINIC_METRICS,
} from '../data/fixtures';

export const delay = (ms = 180): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getMockPatients(): Promise<Patient[]> {
  await delay(120);
  return [...INITIAL_PATIENTS];
}

export async function getMockAppointments(): Promise<Appointment[]> {
  await delay(120);
  return [...INITIAL_APPOINTMENTS];
}

export async function getMockTreatments(): Promise<Treatment[]> {
  await delay(100);
  return [...INITIAL_TREATMENTS];
}

export async function getMockDoctorNotes(): Promise<DoctorSoapNote[]> {
  await delay(100);
  return [...INITIAL_DOCTOR_NOTES];
}

export async function getMockPsychologistNotes(): Promise<PsychologistNote[]> {
  await delay(100);
  return [...INITIAL_PSYCHOLOGIST_NOTES];
}

export async function getMockDieticianPlans(): Promise<DieticianMealPlan[]> {
  await delay(100);
  return [...INITIAL_DIETICIAN_PLANS];
}

export async function getMockProducts(): Promise<Product[]> {
  await delay(100);
  return [...INITIAL_PRODUCTS];
}

export async function getMockTransactions(): Promise<Transaction[]> {
  await delay(120);
  return [...INITIAL_TRANSACTIONS];
}

export async function getMockActivities(): Promise<Activity[]> {
  await delay(80);
  return [...INITIAL_ACTIVITIES];
}

export async function getMockMetrics(): Promise<ClinicMetrics> {
  await delay(80);
  return { ...INITIAL_CLINIC_METRICS };
}

export interface PatientAiInsight {
  patientId: string;
  adherenceScore: number; // 0-100
  weightLossVelocityKgPerWeek: number;
  metabolicRisk: 'low' | 'moderate' | 'high';
  keyInsights: string[];
  recommendedAdjustments: string[];
  suggestedAction: string;
}

/**
 * Deterministic AI Clinical Coach Assessment
 */
export async function analyzePatientWithAi(patient: Patient): Promise<PatientAiInsight> {
  await delay(280);
  const totalLoss = patient.startWeight - patient.currentWeight;
  const progressPct = ((patient.startWeight - patient.currentWeight) / (patient.startWeight - patient.targetWeight)) * 100;

  const isRapid = totalLoss > 10;
  const isSteady = totalLoss > 4 && totalLoss <= 10;

  const adherenceScore = Math.min(
    98,
    Math.max(65, Math.round(75 + (patient.program === 'glp1-medical' ? 12 : 5) + (patient.status === 'active' ? 8 : -10)))
  );

  return {
    patientId: patient.id,
    adherenceScore,
    weightLossVelocityKgPerWeek: isRapid ? 1.2 : isSteady ? 0.8 : 0.4,
    metabolicRisk: patient.bmi > 32 ? 'high' : patient.bmi > 27 ? 'moderate' : 'low',
    keyInsights: [
      `Total weight loss: ${totalLoss.toFixed(1)} kg (${progressPct.toFixed(0)}% towards target of ${patient.targetWeight} kg)`,
      `Current BMI: ${patient.bmi.toFixed(1)} (Initial: ${(patient.startWeight / Math.pow(patient.height / 100, 2)).toFixed(1)})`,
      `Protocol: ${patient.program.toUpperCase()} with ${patient.notesCount} documented clinical sessions`,
      `Allergies on record: ${patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None documented'}`,
    ],
    recommendedAdjustments: [
      patient.program === 'glp1-medical'
        ? 'Evaluate maintenance protein intake (>= 1.4g/kg) to guard against sarcopenic lean mass loss.'
        : 'Incorporate structured resistance training 3x/week to stimulate resting metabolic rate.',
      'Schedule routine InBody 770 composition scan in 2 weeks.',
      'Check psychological trigger log before next titration step.',
    ],
    suggestedAction: isRapid
      ? 'Preserve muscle mass with targeted amino acid supplementation and dietician review.'
      : 'Maintain current protocol; metabolic trajectory on track for graduation.',
  };
}
