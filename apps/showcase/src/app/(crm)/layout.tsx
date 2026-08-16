'use client';

import * as React from 'react';
import { CrmProvider } from '@/scenarios/crm/store/crm-context';
import { CrmSidebar } from '@/scenarios/crm/components/crm-sidebar';
import { CrmHeader } from '@/scenarios/crm/components/crm-header';
import { CrmCopilotDrawer } from '@/scenarios/crm/components/crm-copilot-drawer';
import { CrmCommandPalette } from '@/scenarios/crm/components/crm-command-palette';
import { ArtCanvas } from '@/components/art-canvas';
import { SidebarProvider } from '@ds/ui';

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const openCommandPalette = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent('ds:open-command-palette'));
  }, []);

  return (
    <CrmProvider>
      <ArtCanvas />
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex min-h-screen w-full bg-transparent font-sans text-foreground antialiased selection:bg-highlight/30 selection:text-highlight-foreground">
          {/* Design System Unified Sidebar */}
          <CrmSidebar />

          {/* Main Content Area */}
          <div className="flex min-w-0 flex-1 flex-col">
            <CrmHeader onOpenCommandPalette={openCommandPalette} />
            <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>

          {/* Floating Scenario Drawers & Command Palette */}
          <CrmCopilotDrawer />
          <CrmCommandPalette />
        </div>
      </SidebarProvider>
    </CrmProvider>
  );
}
