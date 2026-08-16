'use client';

import * as React from 'react';
import { CrmProvider } from '@/scenarios/crm/store/crm-context';
import { CrmSidebar } from '@/scenarios/crm/components/crm-sidebar';
import { CrmHeader } from '@/scenarios/crm/components/crm-header';
import { CrmCopilotDrawer } from '@/scenarios/crm/components/crm-copilot-drawer';
import { CrmCommandPalette } from '@/scenarios/crm/components/crm-command-palette';
import { ArtCanvas } from '@/components/art-canvas';
import { Sheet, SheetContent, SheetTitle } from '@ds/ui';

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const openCommandPalette = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent('ds:open-command-palette'));
  }, []);

  return (
    <CrmProvider>
      <ArtCanvas />
      <div className="relative flex min-h-screen bg-transparent font-sans text-foreground antialiased selection:bg-highlight/30 selection:text-highlight-foreground">
        {/* Desktop Collapsible Sidebar */}
        <CrmSidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((prev) => !prev)}
        />

        {/* Mobile Slide-out Drawer */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72 max-w-[85vw]">
            <SheetTitle className="sr-only">Mobile Navigation</SheetTitle>
            <CrmSidebar onNavigateMobile={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex min-w-0 flex-1 flex-col">
          <CrmHeader
            sidebarCollapsed={sidebarCollapsed}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenCommandPalette={openCommandPalette}
          />
          <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>

        {/* Floating Components */}
        <CrmCopilotDrawer />
        <CrmCommandPalette />
      </div>
    </CrmProvider>
  );
}
