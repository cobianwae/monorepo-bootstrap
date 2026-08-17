import type * as React from 'react';
import { ClinicProvider } from '@/scenarios/clinic/store/clinic-context';
import { ClinicSidebar } from '@/scenarios/clinic/components/clinic-sidebar';
import { ClinicHeader } from '@/scenarios/clinic/components/clinic-header';
import { ClinicAiCoachDrawer } from '@/scenarios/clinic/components/clinic-ai-coach-drawer';
import { ClinicCommandPalette } from '@/scenarios/clinic/components/clinic-command-palette';
import { ScenarioShell } from '@/components/scenario-shell';

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScenarioShell
      Provider={ClinicProvider}
      Sidebar={ClinicSidebar}
      Header={ClinicHeader}
      Drawer={ClinicAiCoachDrawer}
      CommandPalette={ClinicCommandPalette}
    >
      {children}
    </ScenarioShell>
  );
}