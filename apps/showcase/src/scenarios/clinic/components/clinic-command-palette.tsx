'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { RotateCcw, User, Calendar } from 'lucide-react';
import { CommandPalette, type CommandPaletteGroup } from '@ds/ui';
import { useClinic } from '../store/clinic-context';
import { CLINIC_NAV_GROUPS } from '../nav-config';

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
        items: CLINIC_NAV_GROUPS.flatMap((group) =>
          group.items.map((item) => ({
            id: item.id,
            label: item.label,
            description: item.description,
            icon: item.icon,
            keywords: item.keywords,
            onSelect: () => router.push(item.href),
          }))
        ),
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
