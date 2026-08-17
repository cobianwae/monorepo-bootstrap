import {
  LayoutDashboard,
  UserPlus,
  CalendarClock,
  Users,
  Stethoscope,
  ClipboardList,
  ShoppingBag,
  BarChart3,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface ScenarioNavItem {
  id: string;
  title: string;
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
  keywords: string[];
  description: string;
}

export interface ScenarioNavGroup {
  label: string;
  items: ScenarioNavItem[];
}

export const CLINIC_NAV_GROUPS: ScenarioNavGroup[] = [
  {
    label: 'Front Desk & Schedule',
    items: [
      {
        id: 'nav-dashboard',
        title: 'Dashboard',
        label: 'Executive Dashboard',
        href: '/clinic',
        icon: LayoutDashboard,
        exact: true,
        keywords: ['home', 'metrics', 'overview', 'stats', 'kpi'],
        description: 'KPIs, revenue trends, weight-loss funnels and daily overview',
      },
      {
        id: 'nav-registration',
        title: 'Registration',
        label: 'Patient Intake Registration',
        href: '/clinic/registration',
        icon: UserPlus,
        keywords: ['register', 'new patient', 'wizard', 'stepper', 'intake'],
        description: '5-step onboarding wizard for new weight loss patients',
      },
      {
        id: 'nav-appointments',
        title: 'Appointments',
        label: 'Appointments & Scheduling',
        href: '/clinic/appointments',
        icon: CalendarClock,
        keywords: ['schedule', 'calendar', 'booking', 'checkin', 'slots'],
        description: 'Kanban scheduling board with live check-in workflow',
      },
      {
        id: 'nav-patients',
        title: 'Patients & EMR',
        label: 'Patients & EMR Directory',
        href: '/clinic/patients',
        icon: Users,
        keywords: ['patients', 'emr', 'directory', 'records', 'charts'],
        description: 'Searchable patient table and comprehensive medical charts',
      },
    ],
  },
  {
    label: 'Clinical & Therapy',
    items: [
      {
        id: 'nav-treatments',
        title: 'Treatments Catalog',
        label: 'Treatment Catalog (Master CRUD)',
        href: '/clinic/treatments',
        icon: Stethoscope,
        keywords: ['treatments', 'catalog', 'pricing', 'protocols', 'packages'],
        description: 'Manage GLP-1, body contouring, RF lipolysis, and package pricing',
      },
      {
        id: 'nav-consultations',
        title: 'Consultations',
        label: 'Multi-Role Consultations Workspace',
        href: '/clinic/consultations',
        icon: ClipboardList,
        keywords: [
          'consultation',
          'doctor',
          'psychologist',
          'dietician',
          'soap',
          'macros',
          'screening',
        ],
        description:
          'Doctor SOAP notes, Psychologist BES screening, Dietician macro meal plans',
      },
    ],
  },
  {
    label: 'Commerce & Insights',
    items: [
      {
        id: 'nav-pos',
        title: 'Point of Sale (POS)',
        label: 'Point of Sale (POS) & Checkout',
        href: '/clinic/pos',
        icon: ShoppingBag,
        keywords: ['pos', 'cart', 'billing', 'checkout', 'payment', 'qris', 'retail'],
        description: 'Product catalog, cart, multi-payment options & invoice receipts',
      },
      {
        id: 'nav-reports',
        title: 'Reports & Analytics',
        label: 'Reports & Metabolic Outcomes',
        href: '/clinic/reports',
        icon: BarChart3,
        keywords: ['reports', 'analytics', 'charts', 'revenue', 'outcomes'],
        description: 'Weight-loss trajectories, category revenue, and clinical adherence analytics',
      },
    ],
  },
];