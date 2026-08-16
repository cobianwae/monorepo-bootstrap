'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  UserPlus,
  CalendarClock,
  Users,
  Stethoscope,
  ClipboardList,
  ShoppingBag,
  BarChart3,
  RotateCcw,
  User,
  Calendar,
} from 'lucide-react';
import { CommandPalette, type CommandPaletteGroup } from '@ds/ui';
import { useClinic } from '../store/clinic-context';

export function ClinicCommandPalette() {
  const router = useRouter();
  const {
    patients,
    appointments,
    setSelectedPatientId,
    resetAllData,
  } = useClinic();

  const groups: CommandPaletteGroup[] = React.useMemo(() => {
    return [
      {
        heading: 'Quick Navigation',
        items: [
          {
            id: 'nav-dashboard',
            label: 'Executive Dashboard',
            description: 'KPIs, revenue trends, weight-loss funnels and daily overview',
            icon: LayoutDashboard,
            keywords: ['home', 'metrics', 'overview', 'stats', 'kpi'],
            onSelect: () => router.push('/clinic'),
          },
          {
            id: 'nav-registration',
            label: 'Patient Intake Registration',
            description: '5-step onboarding wizard for new weight loss patients',
            icon: UserPlus,
            keywords: ['register', 'new patient', 'wizard', 'stepper', 'intake'],
            onSelect: () => router.push('/clinic/registration'),
          },
          {
            id: 'nav-appointments',
            label: 'Appointments & Scheduling',
            description: 'Kanban scheduling board with live check-in workflow',
            icon: CalendarClock,
            keywords: ['schedule', 'calendar', 'booking', 'checkin', 'slots'],
            onSelect: () => router.push('/clinic/appointments'),
          },
          {
            id: 'nav-patients',
            label: 'Patients & EMR Directory',
            description: 'Searchable patient table and comprehensive medical charts',
            icon: Users,
            keywords: ['patients', 'emr', 'directory', 'records', 'charts'],
            onSelect: () => router.push('/clinic/patients'),
          },
          {
            id: 'nav-treatments',
            label: 'Treatment Catalog (Master CRUD)',
            description: 'Manage GLP-1, body contouring, RF lipolysis, and package pricing',
            icon: Stethoscope,
            keywords: ['treatments', 'catalog', 'pricing', 'protocols', 'packages'],
            onSelect: () => router.push('/clinic/treatments'),
          },
          {
            id: 'nav-consultations',
            label: 'Multi-Role Consultations Workspace',
            description: 'Doctor SOAP notes, Psychologist BES screening, Dietician macro meal plans',
            icon: ClipboardList,
            keywords: ['consultation', 'doctor', 'psychologist', 'dietician', 'soap', 'macros', 'screening'],
            onSelect: () => router.push('/clinic/consultations'),
          },
          {
            id: 'nav-pos',
            label: 'Point of Sale (POS) & Checkout',
            description: 'Product catalog, cart, multi-payment options & invoice receipts',
            icon: ShoppingBag,
            keywords: ['pos', 'cart', 'billing', 'checkout', 'payment', 'qris', 'retail'],
            onSelect: () => router.push('/clinic/pos'),
          },
          {
            id: 'nav-reports',
            label: 'Reports & Metabolic Outcomes',
            description: 'Weight-loss trajectories, category revenue, and clinical adherence analytics',
            icon: BarChart3,
            keywords: ['reports', 'analytics', 'charts', 'revenue', 'outcomes'],
            onSelect: () => router.push('/clinic/reports'),
          },
        ],
      },
      {
        heading: 'Search Patients (EMR)',
        items: patients.slice(0, 8).map((patient) => ({
          id: `patient-${patient.id}`,
          label: `${patient.name} (${patient.id})`,
          description: `Program: ${patient.program.toUpperCase()} • Weight: ${patient.currentWeight} kg (BMI ${patient.bmi})`,
          icon: User,
          keywords: [patient.name, patient.id, patient.email, patient.phone, patient.program],
          onSelect: () => {
            setSelectedPatientId(patient.id);
            router.push('/clinic/patients');
          },
        })),
      },
      {
        heading: "Today's Appointments",
        items: appointments.slice(0, 6).map((appt) => ({
          id: `appt-${appt.id}`,
          label: `${appt.patientName} • ${appt.type}`,
          description: `${appt.timeSlot} with ${appt.practitionerName} (${appt.status.toUpperCase()})`,
          icon: Calendar,
          keywords: [appt.patientName, appt.type, appt.practitionerName, appt.status],
          onSelect: () => router.push('/clinic/appointments'),
        })),
      },
      {
        heading: 'Quick Actions',
        items: [
          {
            id: 'action-reset-data',
            label: 'Reset Clinic Scenario Demo Data',
            description: 'Restore all initial patients, appointments, treatments & transactions',
            icon: RotateCcw,
            keywords: ['reset', 'restore', 'fixtures', 'demo data'],
            onSelect: resetAllData,
          },
        ],
      },
    ];
  }, [patients, appointments, router, setSelectedPatientId, resetAllData]);

  return <CommandPalette groups={groups} />;
}
