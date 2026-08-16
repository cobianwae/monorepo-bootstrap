'use client';

import * as React from 'react';
import { ClinicProvider } from '@/scenarios/clinic/store/clinic-context';
import { ClinicSidebar } from '@/scenarios/clinic/components/clinic-sidebar';
import { ClinicHeader } from '@/scenarios/clinic/components/clinic-header';
import { ClinicAiCoachDrawer } from '@/scenarios/clinic/components/clinic-ai-coach-drawer';
import { ClinicCommandPalette } from '@/scenarios/clinic/components/clinic-command-palette';
import { ArtCanvas } from '@/components/art-canvas';
import { SidebarProvider } from '@ds/ui';

export default function ClinicLayout({ children }: { children: React.ReactNode }) {
  const openCommandPalette = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent('ds:open-command-palette'));
  }, []);

  return (
    <ClinicProvider>
      <ArtCanvas />
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex min-h-screen w-full bg-transparent font-sans text-foreground antialiased selection:bg-highlight/30 selection:text-highlight-foreground">
          {/* Design System Unified Sidebar */}
          <ClinicSidebar />

          {/* Main Content Area */}
          <div className="flex min-w-0 flex-1 flex-col">
            <ClinicHeader onOpenCommandPalette={openCommandPalette} />
            <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>

          {/* Floating Scenario Drawers & Command Palette */}
          <ClinicAiCoachDrawer />
          <ClinicCommandPalette />
        </div>
      </SidebarProvider>
    </ClinicProvider>
  );
}
