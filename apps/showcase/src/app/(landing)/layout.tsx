import type * as React from 'react';
import { ArtCanvas } from '@/components/art-canvas';

export default function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-background font-sans text-foreground antialiased selection:bg-highlight/30 selection:text-highlight-foreground">
      <ArtCanvas />
      <div className="relative z-10">{children}</div>
    </div>
  );
}