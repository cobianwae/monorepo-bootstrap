'use client';

import * as React from 'react';
import type {
  Patient,
  Appointment,
  AppointmentStatus,
  Treatment,
  DoctorSoapNote,
  PsychologistNote,
  DieticianMealPlan,
  Product,
  CartItem,
  Transaction,
  Activity,
  ClinicMetrics,
  StaffPractitioner,
  StaffStatus,
  PaymentMethod,
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
  INITIAL_STAFF,
} from '../data/fixtures';
import { toast } from '@ds/ui';

interface ClinicNotification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'appointment' | 'consultation' | 'pos' | 'clinical-alert';
}

interface ClinicState {
  patients: Patient[];
  appointments: Appointment[];
  treatments: Treatment[];
  doctorNotes: DoctorSoapNote[];
  psychologistNotes: PsychologistNote[];
  dieticianPlans: DieticianMealPlan[];
  products: Product[];
  transactions: Transaction[];
  cart: CartItem[];
  activities: Activity[];
  metrics: ClinicMetrics;
  staff: StaffPractitioner[];
  currentStaffId: string;
  selectedPatientId: string | null;
  selectedAppointmentId: string | null;
  isAiCoachOpen: boolean;
  notifications: ClinicNotification[];
  isLoading: boolean;
}

type ClinicAction =
  | { type: 'REGISTER_PATIENT'; payload: Omit<Patient, 'id' | 'joinedAt' | 'lastVisit' | 'notesCount' | 'bmi' | 'weightHistory'> }
  | { type: 'UPDATE_PATIENT'; payload: { id: string; patch: Partial<Patient> } }
  | { type: 'RECORD_WEIGHT_ENTRY'; payload: { patientId: string; weight: number; bodyFatPct?: number } }
  | { type: 'ADD_APPOINTMENT'; payload: Omit<Appointment, 'id'> }
  | { type: 'UPDATE_APPOINTMENT_STATUS'; payload: { id: string; status: AppointmentStatus } }
  | { type: 'DELETE_APPOINTMENT'; payload: { id: string } }
  | { type: 'ADD_TREATMENT'; payload: Omit<Treatment, 'id'> }
  | { type: 'UPDATE_TREATMENT'; payload: { id: string; patch: Partial<Treatment> } }
  | { type: 'DELETE_TREATMENT'; payload: { id: string } }
  | { type: 'ADD_DOCTOR_NOTE'; payload: Omit<DoctorSoapNote, 'id' | 'date'> }
  | { type: 'ADD_PSYCHOLOGIST_NOTE'; payload: Omit<PsychologistNote, 'id' | 'date'> }
  | { type: 'ADD_DIETICIAN_PLAN'; payload: Omit<DieticianMealPlan, 'id' | 'date'> }
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity?: number } }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'PROCESS_CHECKOUT'; payload: { patientId?: string; patientName: string; paymentMethod: PaymentMethod; cashierName: string; discountAmount?: number } }
  | { type: 'SET_SELECTED_PATIENT'; payload: string | null }
  | { type: 'SET_SELECTED_APPOINTMENT'; payload: string | null }
  | { type: 'SET_CURRENT_STAFF'; payload: string }
  | { type: 'SET_STAFF_STATUS'; payload: { staffId: string; status: StaffStatus } }
  | { type: 'OPEN_AI_COACH' }
  | { type: 'CLOSE_AI_COACH' }
  | { type: 'MARK_NOTIFICATIONS_READ' }
  | { type: 'ADD_ACTIVITY'; payload: Omit<Activity, 'id' | 'timestamp'> }
  | { type: 'RESET_ALL_DATA' };

const INITIAL_CLINIC_NOTIFICATIONS: ClinicNotification[] = [
  {
    id: 'notif-1',
    title: 'GLP-1 Titration Completed',
    description: 'Dr. Evelyn Vance completed SOAP note for Clara Oswald (PAT-1001).',
    timestamp: '10m ago',
    read: false,
    type: 'consultation',
  },
  {
    id: 'notif-2',
    title: 'Patient Checked In',
    description: 'Robert Langdon arrived for InBody Scan & Nutrition consult.',
    timestamp: '25m ago',
    read: false,
    type: 'appointment',
  },
  {
    id: 'notif-3',
    title: 'Retail POS Sale',
    description: 'TRX-99041 completed: Whey Isolate & 32G Needles (Rp 1,543,455).',
    timestamp: '45m ago',
    read: false,
    type: 'pos',
  },
];

const initialState: ClinicState = {
  patients: INITIAL_PATIENTS,
  appointments: INITIAL_APPOINTMENTS,
  treatments: INITIAL_TREATMENTS,
  doctorNotes: INITIAL_DOCTOR_NOTES,
  psychologistNotes: INITIAL_PSYCHOLOGIST_NOTES,
  dieticianPlans: INITIAL_DIETICIAN_PLANS,
  products: INITIAL_PRODUCTS,
  transactions: INITIAL_TRANSACTIONS,
  cart: [],
  activities: INITIAL_ACTIVITIES,
  metrics: INITIAL_CLINIC_METRICS,
  staff: INITIAL_STAFF,
  currentStaffId: 'staff-1',
  selectedPatientId: 'PAT-1001',
  selectedAppointmentId: null,
  isAiCoachOpen: false,
  notifications: INITIAL_CLINIC_NOTIFICATIONS,
  isLoading: false,
};

function clinicReducer(state: ClinicState, action: ClinicAction): ClinicState {
  switch (action.type) {
    case 'REGISTER_PATIENT': {
      const newId = `PAT-${1000 + state.patients.length + 1}`;
      const heightInM = action.payload.height / 100;
      const bmi = Number((action.payload.currentWeight / (heightInM * heightInM)).toFixed(1));
      const today = new Date().toISOString().split('T')[0];

      const newPatient: Patient = {
        ...action.payload,
        id: newId,
        joinedAt: today,
        lastVisit: today,
        notesCount: 0,
        bmi,
        weightHistory: [
          {
            date: today,
            weight: action.payload.currentWeight,
            bmi,
            bodyFatPct: action.payload.bodyFatPct,
          },
        ],
      };

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: 'registration',
        actor: 'Reception',
        action: `Registered new patient (${newPatient.program.toUpperCase()})`,
        target: `${newPatient.name} (${newPatient.id})`,
        badgeVariant: 'warning',
      };

      return {
        ...state,
        patients: [newPatient, ...state.patients],
        activities: [newActivity, ...state.activities.slice(0, 19)],
        selectedPatientId: newId,
        metrics: {
          ...state.metrics,
          activeProgramsCount: state.metrics.activeProgramsCount + 1,
          patientsToday: state.metrics.patientsToday + 1,
        },
      };
    }

    case 'UPDATE_PATIENT': {
      const updated = state.patients.map((p) => {
        if (p.id === action.payload.id) {
          const merged = { ...p, ...action.payload.patch };
          if (action.payload.patch.currentWeight || action.payload.patch.height) {
            const h = (merged.height || 170) / 100;
            merged.bmi = Number((merged.currentWeight / (h * h)).toFixed(1));
          }
          return merged;
        }
        return p;
      });

      return { ...state, patients: updated };
    }

    case 'RECORD_WEIGHT_ENTRY': {
      const today = new Date().toISOString().split('T')[0];
      const updated = state.patients.map((p) => {
        if (p.id === action.payload.patientId) {
          const h = p.height / 100;
          const bmi = Number((action.payload.weight / (h * h)).toFixed(1));
          const newEntry = {
            date: today,
            weight: action.payload.weight,
            bmi,
            bodyFatPct: action.payload.bodyFatPct ?? p.bodyFatPct,
          };
          return {
            ...p,
            currentWeight: action.payload.weight,
            bmi,
            bodyFatPct: action.payload.bodyFatPct ?? p.bodyFatPct,
            lastVisit: today,
            weightHistory: [...p.weightHistory, newEntry],
          };
        }
        return p;
      });

      return { ...state, patients: updated };
    }

    case 'ADD_APPOINTMENT': {
      const newId = `APT-2024-${String(state.appointments.length + 1).padStart(3, '0')}`;
      const newAppt: Appointment = {
        ...action.payload,
        id: newId,
      };

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: 'appointment',
        actor: 'Front Desk',
        action: `Booked appointment (${newAppt.type})`,
        target: `${newAppt.patientName} with ${newAppt.practitionerName}`,
        badgeVariant: 'info',
      };

      return {
        ...state,
        appointments: [newAppt, ...state.appointments],
        activities: [newActivity, ...state.activities.slice(0, 19)],
        metrics: {
          ...state.metrics,
          appointmentsScheduled: state.metrics.appointmentsScheduled + 1,
        },
      };
    }

    case 'UPDATE_APPOINTMENT_STATUS': {
      const updated = state.appointments.map((a) =>
        a.id === action.payload.id ? { ...a, status: action.payload.status } : a
      );

      const targetAppt = state.appointments.find((a) => a.id === action.payload.id);
      const isCompleted = action.payload.status === 'completed';

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: 'appointment',
        actor: 'Front Desk',
        action: `Status changed to ${action.payload.status.toUpperCase()}`,
        target: targetAppt ? `${targetAppt.patientName} (${targetAppt.id})` : action.payload.id,
        badgeVariant: isCompleted ? 'success' : action.payload.status === 'no-show' ? 'destructive' : 'default',
      };

      return {
        ...state,
        appointments: updated,
        activities: [newActivity, ...state.activities.slice(0, 19)],
        metrics: {
          ...state.metrics,
          consultationsCompleted: isCompleted
            ? state.metrics.consultationsCompleted + 1
            : state.metrics.consultationsCompleted,
        },
      };
    }

    case 'DELETE_APPOINTMENT': {
      return {
        ...state,
        appointments: state.appointments.filter((a) => a.id !== action.payload.id),
      };
    }

    case 'ADD_TREATMENT': {
      const newId = `trt-${Date.now()}`;
      const newTreatment: Treatment = {
        ...action.payload,
        id: newId,
      };

      return {
        ...state,
        treatments: [newTreatment, ...state.treatments],
      };
    }

    case 'UPDATE_TREATMENT': {
      return {
        ...state,
        treatments: state.treatments.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload.patch } : t
        ),
      };
    }

    case 'DELETE_TREATMENT': {
      return {
        ...state,
        treatments: state.treatments.filter((t) => t.id !== action.payload.id),
      };
    }

    case 'ADD_DOCTOR_NOTE': {
      const newId = `soap-${Date.now()}`;
      const today = new Date().toISOString().split('T')[0];
      const newNote: DoctorSoapNote = {
        ...action.payload,
        id: newId,
        date: today,
      };

      const updatedPatients = state.patients.map((p) =>
        p.id === action.payload.patientId
          ? { ...p, notesCount: p.notesCount + 1, lastVisit: today }
          : p
      );

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: 'consultation',
        actor: action.payload.doctorName,
        action: 'Completed Doctor SOAP Note',
        target: `${action.payload.patientName} (${action.payload.patientId})`,
        badgeVariant: 'success',
      };

      return {
        ...state,
        doctorNotes: [newNote, ...state.doctorNotes],
        patients: updatedPatients,
        activities: [newActivity, ...state.activities.slice(0, 19)],
        metrics: {
          ...state.metrics,
          consultationsCompleted: state.metrics.consultationsCompleted + 1,
        },
      };
    }

    case 'ADD_PSYCHOLOGIST_NOTE': {
      const newId = `psych-${Date.now()}`;
      const today = new Date().toISOString().split('T')[0];
      const newNote: PsychologistNote = {
        ...action.payload,
        id: newId,
        date: today,
      };

      const updatedPatients = state.patients.map((p) =>
        p.id === action.payload.patientId
          ? { ...p, notesCount: p.notesCount + 1, lastVisit: today }
          : p
      );

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: 'consultation',
        actor: action.payload.psychologistName,
        action: `Saved ${action.payload.screeningType} Screening (Score: ${action.payload.score})`,
        target: `${action.payload.patientName} (${action.payload.patientId})`,
        badgeVariant: 'success',
      };

      return {
        ...state,
        psychologistNotes: [newNote, ...state.psychologistNotes],
        patients: updatedPatients,
        activities: [newActivity, ...state.activities.slice(0, 19)],
      };
    }

    case 'ADD_DIETICIAN_PLAN': {
      const newId = `diet-${Date.now()}`;
      const today = new Date().toISOString().split('T')[0];
      const newPlan: DieticianMealPlan = {
        ...action.payload,
        id: newId,
        date: today,
      };

      const updatedPatients = state.patients.map((p) =>
        p.id === action.payload.patientId
          ? { ...p, notesCount: p.notesCount + 1, lastVisit: today }
          : p
      );

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: 'consultation',
        actor: action.payload.dieticianName,
        action: `Generated Meal Plan (${action.payload.planType} - ${action.payload.targetCalories} kcal)`,
        target: `${action.payload.patientName} (${action.payload.patientId})`,
        badgeVariant: 'info',
      };

      return {
        ...state,
        dieticianPlans: [newPlan, ...state.dieticianPlans],
        patients: updatedPatients,
        activities: [newActivity, ...state.activities.slice(0, 19)],
      };
    }

    case 'ADD_TO_CART': {
      const { product, quantity = 1 } = action.payload;
      const existing = state.cart.find((item) => item.productId === product.id);

      let newCart: CartItem[];
      if (existing) {
        newCart = state.cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCart = [
          ...state.cart,
          {
            productId: product.id,
            sku: product.sku,
            name: product.name,
            price: product.price,
            quantity,
            discount: 0,
            category: product.category,
          },
        ];
      }

      return { ...state, cart: newCart };
    }

    case 'UPDATE_CART_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter((item) => item.productId !== productId),
        };
      }
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        ),
      };
    }

    case 'REMOVE_FROM_CART': {
      return {
        ...state,
        cart: state.cart.filter((item) => item.productId !== action.payload.productId),
      };
    }

    case 'CLEAR_CART': {
      return { ...state, cart: [] };
    }

    case 'PROCESS_CHECKOUT': {
      const subtotal = state.cart.reduce(
        (acc, item) => acc + item.price * item.quantity * (1 - item.discount / 100),
        0
      );
      const discount = action.payload.discountAmount || 0;
      const tax = Math.round((subtotal - discount) * 0.11);
      const total = Math.max(0, subtotal - discount + tax);

      const newTrx: Transaction = {
        id: `TRX-${Math.floor(10000 + Math.random() * 90000)}`,
        patientId: action.payload.patientId,
        patientName: action.payload.patientName,
        items: state.cart.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal,
        discountAmount: discount,
        tax,
        total,
        paymentMethod: action.payload.paymentMethod,
        status: 'completed',
        cashierName: action.payload.cashierName,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      };

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        type: 'pos',
        actor: action.payload.cashierName,
        action: `Processed ${action.payload.paymentMethod.toUpperCase()} payment Rp ${total.toLocaleString()}`,
        target: `${newTrx.id} (${action.payload.patientName})`,
        badgeVariant: 'success',
      };

      return {
        ...state,
        transactions: [newTrx, ...state.transactions],
        cart: [],
        activities: [newActivity, ...state.activities.slice(0, 19)],
        metrics: {
          ...state.metrics,
          todayRevenue: state.metrics.todayRevenue + total,
        },
      };
    }

    case 'SET_SELECTED_PATIENT':
      return { ...state, selectedPatientId: action.payload };

    case 'SET_SELECTED_APPOINTMENT':
      return { ...state, selectedAppointmentId: action.payload };

    case 'SET_CURRENT_STAFF':
      return { ...state, currentStaffId: action.payload };

    case 'SET_STAFF_STATUS':
      return {
        ...state,
        staff: state.staff.map((s) =>
          s.id === action.payload.staffId ? { ...s, status: action.payload.status } : s
        ),
      };

    case 'OPEN_AI_COACH':
      return { ...state, isAiCoachOpen: true };

    case 'CLOSE_AI_COACH':
      return { ...state, isAiCoachOpen: false };

    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [
          {
            ...action.payload,
            id: `act-${Date.now()}`,
            timestamp: 'Just now',
          },
          ...state.activities.slice(0, 19),
        ],
      };

    case 'RESET_ALL_DATA':
      return {
        ...initialState,
        patients: [...INITIAL_PATIENTS],
        appointments: [...INITIAL_APPOINTMENTS],
        treatments: [...INITIAL_TREATMENTS],
        doctorNotes: [...INITIAL_DOCTOR_NOTES],
        psychologistNotes: [...INITIAL_PSYCHOLOGIST_NOTES],
        dieticianPlans: [...INITIAL_DIETICIAN_PLANS],
        products: [...INITIAL_PRODUCTS],
        transactions: [...INITIAL_TRANSACTIONS],
        activities: [...INITIAL_ACTIVITIES],
        metrics: { ...INITIAL_CLINIC_METRICS },
        currentStaffId: 'staff-1',
      };

    default:
      return state;
  }
}

interface ClinicContextType extends ClinicState {
  currentStaff: StaffPractitioner;
  registerPatient: (patient: Omit<Patient, 'id' | 'joinedAt' | 'lastVisit' | 'notesCount' | 'bmi' | 'weightHistory'>) => void;
  updatePatient: (id: string, patch: Partial<Patient>) => void;
  recordWeightEntry: (patientId: string, weight: number, bodyFatPct?: number) => void;
  addAppointment: (appt: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  addTreatment: (trt: Omit<Treatment, 'id'>) => void;
  updateTreatment: (id: string, patch: Partial<Treatment>) => void;
  deleteTreatment: (id: string) => void;
  addDoctorNote: (note: Omit<DoctorSoapNote, 'id' | 'date'>) => void;
  addPsychologistNote: (note: Omit<PsychologistNote, 'id' | 'date'>) => void;
  addDieticianPlan: (plan: Omit<DieticianMealPlan, 'id' | 'date'>) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  processCheckout: (payload: { patientId?: string; patientName: string; paymentMethod: PaymentMethod; cashierName: string; discountAmount?: number }) => void;
  setSelectedPatientId: (id: string | null) => void;
  setSelectedAppointmentId: (id: string | null) => void;
  setCurrentStaff: (id: string) => void;
  setStaffStatus: (staffId: string, status: StaffStatus) => void;
  openAiCoach: () => void;
  closeAiCoach: () => void;
  markNotificationsRead: () => void;
  resetAllData: () => void;
}

const ClinicContext = React.createContext<ClinicContextType | null>(null);

export function ClinicProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(clinicReducer, initialState);

  const registerPatient = React.useCallback(
    (patient: Omit<Patient, 'id' | 'joinedAt' | 'lastVisit' | 'notesCount' | 'bmi' | 'weightHistory'>) => {
      dispatch({ type: 'REGISTER_PATIENT', payload: patient });
      toast({
        variant: 'success',
        title: 'Patient Registered Successfully',
        description: `${patient.name} has been enrolled in ${patient.program.toUpperCase()}.`,
      });
    },
    []
  );

  const updatePatient = React.useCallback((id: string, patch: Partial<Patient>) => {
    dispatch({ type: 'UPDATE_PATIENT', payload: { id, patch } });
    toast({
      title: 'Patient Profile Updated',
      description: 'Changes saved to clinical records.',
    });
  }, []);

  const recordWeightEntry = React.useCallback((patientId: string, weight: number, bodyFatPct?: number) => {
    dispatch({ type: 'RECORD_WEIGHT_ENTRY', payload: { patientId, weight, bodyFatPct } });
    toast({
      variant: 'success',
      title: 'Vitals Recorded',
      description: `New weight: ${weight} kg recorded in EMR trajectory.`,
    });
  }, []);

  const addAppointment = React.useCallback((appt: Omit<Appointment, 'id'>) => {
    dispatch({ type: 'ADD_APPOINTMENT', payload: appt });
    toast({
      variant: 'success',
      title: 'Appointment Booked',
      description: `${appt.type} booked for ${appt.patientName} on ${appt.date} (${appt.timeSlot}).`,
    });
  }, []);

  const updateAppointmentStatus = React.useCallback((id: string, status: AppointmentStatus) => {
    dispatch({ type: 'UPDATE_APPOINTMENT_STATUS', payload: { id, status } });
    toast({
      title: 'Appointment Status Updated',
      description: `Appointment moved to ${status.toUpperCase()}.`,
    });
  }, []);

  const deleteAppointment = React.useCallback((id: string) => {
    dispatch({ type: 'DELETE_APPOINTMENT', payload: { id } });
    toast({
      title: 'Appointment Cancelled',
      description: 'The booking has been removed from the schedule.',
    });
  }, []);

  const addTreatment = React.useCallback((trt: Omit<Treatment, 'id'>) => {
    dispatch({ type: 'ADD_TREATMENT', payload: trt });
    toast({
      variant: 'success',
      title: 'Treatment Added',
      description: `${trt.name} added to clinical catalog.`,
    });
  }, []);

  const updateTreatment = React.useCallback((id: string, patch: Partial<Treatment>) => {
    dispatch({ type: 'UPDATE_TREATMENT', payload: { id, patch } });
    toast({
      title: 'Treatment Updated',
      description: 'Catalog item changes applied.',
    });
  }, []);

  const deleteTreatment = React.useCallback((id: string) => {
    dispatch({ type: 'DELETE_TREATMENT', payload: { id } });
    toast({
      variant: 'destructive',
      title: 'Treatment Removed',
      description: 'Item deactivated from clinical catalog.',
    });
  }, []);

  const addDoctorNote = React.useCallback((note: Omit<DoctorSoapNote, 'id' | 'date'>) => {
    dispatch({ type: 'ADD_DOCTOR_NOTE', payload: note });
    toast({
      variant: 'success',
      title: 'SOAP Note Saved',
      description: `Clinical assessment for ${note.patientName} recorded in EMR.`,
    });
  }, []);

  const addPsychologistNote = React.useCallback((note: Omit<PsychologistNote, 'id' | 'date'>) => {
    dispatch({ type: 'ADD_PSYCHOLOGIST_NOTE', payload: note });
    toast({
      variant: 'success',
      title: 'Psychological Screening Saved',
      description: `${note.screeningType} score: ${note.score} recorded for ${note.patientName}.`,
    });
  }, []);

  const addDieticianPlan = React.useCallback((plan: Omit<DieticianMealPlan, 'id' | 'date'>) => {
    dispatch({ type: 'ADD_DIETICIAN_PLAN', payload: plan });
    toast({
      variant: 'success',
      title: 'Meal Plan Generated',
      description: `${plan.planType} (${plan.targetCalories} kcal) saved for ${plan.patientName}.`,
    });
  }, []);

  const addToCart = React.useCallback((product: Product, quantity?: number) => {
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } });
    toast({
      title: 'Added to Cart',
      description: `${product.name} added to POS invoice.`,
    });
  }, []);

  const updateCartQuantity = React.useCallback((productId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, quantity } });
  }, []);

  const removeFromCart = React.useCallback((productId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId } });
  }, []);

  const clearCart = React.useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  const processCheckout = React.useCallback(
    (payload: { patientId?: string; patientName: string; paymentMethod: PaymentMethod; cashierName: string; discountAmount?: number }) => {
      dispatch({ type: 'PROCESS_CHECKOUT', payload });
      toast({
        variant: 'success',
        title: 'Transaction Completed',
        description: `Receipt generated for ${payload.patientName} via ${payload.paymentMethod.toUpperCase()}.`,
      });
    },
    []
  );

  const setSelectedPatientId = React.useCallback((id: string | null) => {
    dispatch({ type: 'SET_SELECTED_PATIENT', payload: id });
  }, []);

  const setSelectedAppointmentId = React.useCallback((id: string | null) => {
    dispatch({ type: 'SET_SELECTED_APPOINTMENT', payload: id });
  }, []);

  const setCurrentStaff = React.useCallback((id: string) => {
    dispatch({ type: 'SET_CURRENT_STAFF', payload: id });
  }, []);

  const setStaffStatus = React.useCallback((staffId: string, status: StaffStatus) => {
    dispatch({ type: 'SET_STAFF_STATUS', payload: { staffId, status } });
  }, []);

  const openAiCoach = React.useCallback(() => {
    dispatch({ type: 'OPEN_AI_COACH' });
  }, []);

  const closeAiCoach = React.useCallback(() => {
    dispatch({ type: 'CLOSE_AI_COACH' });
  }, []);

  const markNotificationsRead = React.useCallback(() => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
  }, []);

  const resetAllData = React.useCallback(() => {
    dispatch({ type: 'RESET_ALL_DATA' });
    toast({
      title: 'Data Reset to Fixtures',
      description: 'All clinic patients, appointments, and transactions restored to initial demo state.',
    });
  }, []);

  const value = React.useMemo<ClinicContextType>(() => {
    const currentStaff =
      state.staff.find((s) => s.id === state.currentStaffId) ?? state.staff[0];

    return {
      ...state,
      currentStaff,
      registerPatient,
      updatePatient,
      recordWeightEntry,
      addAppointment,
      updateAppointmentStatus,
      deleteAppointment,
      addTreatment,
      updateTreatment,
      deleteTreatment,
      addDoctorNote,
      addPsychologistNote,
      addDieticianPlan,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      processCheckout,
      setSelectedPatientId,
      setSelectedAppointmentId,
      setCurrentStaff,
      setStaffStatus,
      openAiCoach,
      closeAiCoach,
      markNotificationsRead,
      resetAllData,
    };
  }, [
    state,
    registerPatient,
    updatePatient,
    recordWeightEntry,
    addAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    addTreatment,
    updateTreatment,
    deleteTreatment,
    addDoctorNote,
    addPsychologistNote,
    addDieticianPlan,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    processCheckout,
    setSelectedPatientId,
    setSelectedAppointmentId,
    setCurrentStaff,
    setStaffStatus,
    openAiCoach,
    closeAiCoach,
    markNotificationsRead,
    resetAllData,
  ]);

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic(): ClinicContextType {
  const context = React.useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}
