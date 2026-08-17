'use client';

import * as React from 'react';
import { SidebarProvider } from '@ds/ui';
import { ArtCanvas } from './art-canvas';

interface ScenarioShellProps {
  Provider: React.ElementType;
  Sidebar: React.ElementType;
  Header: React.ElementType<{ onOpenCommandPalette: () => void }>;
  Drawer: React.ElementType;
  CommandPalette: React.ElementType;
  children: React.ReactNode;
}

export function ScenarioShell({
  Provider,
  Sidebar,
  Header,
  Drawer,
  CommandPalette,
  children,
}: ScenarioShellProps) {
  const openCommandPalette = React.useCallback(() => {
    window.dispatchEvent(new CustomEvent('ds:open-command-palette'));
  }, []);

  return (
    <Provider>
      <ArtCanvas />
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex min-h-screen w-full bg-transparent font-sans text-foreground antialiased selection:bg-highlight/30 selection:text-highlight-foreground">
          <Sidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <Header onOpenCommandPalette={openCommandPalette} />
            <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">{children}</main>
          </div>

          <Drawer />
          <CommandPalette />
        </div>
      </SidebarProvider>
    </Provider>
  );
}