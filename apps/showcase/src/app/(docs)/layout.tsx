'use client';

import type * as React from 'react';
import { SidebarProvider } from '@ds/ui';
import { ArtCanvas } from '@/components/art-canvas';
import { ShowcaseHeader } from '@/components/showcase-header';
import { ShowcaseSidebar } from '@/components/showcase-sidebar';
import { GlobalCommandPalette } from '@/components/global-command-palette';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ArtCanvas />
      <SidebarProvider defaultOpen={true}>
        <div className="relative flex min-h-screen w-full bg-transparent font-sans text-foreground antialiased selection:bg-highlight/30 selection:text-highlight-foreground">
          <ShowcaseSidebar />

          <div className="flex min-w-0 flex-1 flex-col">
            <ShowcaseHeader />
            <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">{children}</main>
          </div>
        </div>
      </SidebarProvider>
      <GlobalCommandPalette />
    </>
  );
}