import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Apex Consumer Web — Powered by Design System',
  description: 'Production consumer application using @ds/ui and OKLCH design tokens',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="pulse" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-highlight selection:text-highlight-foreground">
        {children}
      </body>
    </html>
  );
}
