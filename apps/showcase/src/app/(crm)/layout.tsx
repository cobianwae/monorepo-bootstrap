import * as React from 'react';
import { CrmProvider } from '@/scenarios/crm/store/crm-context';
import { CrmSidebar } from '@/scenarios/crm/components/crm-sidebar';
import { CrmHeader } from '@/scenarios/crm/components/crm-header';
import { CrmCopilotDrawer } from '@/scenarios/crm/components/crm-copilot-drawer';
import { CrmCommandPalette } from '@/scenarios/crm/components/crm-command-palette';
import { ScenarioShell } from '@/components/scenario-shell';

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return (
    <ScenarioShell
      Provider={CrmProvider}
      Sidebar={CrmSidebar}
      Header={CrmHeader}
      Drawer={CrmCopilotDrawer}
      CommandPalette={CrmCommandPalette}
    >
      {children}
    </ScenarioShell>
  );
}