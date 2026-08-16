import type { Metadata } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from '@ds/ui';
import { ThemeProvider } from '../components/theme-provider';
import { ShowcaseSidebar } from '../components/showcase-sidebar';
import { ShowcaseHeader } from '../components/showcase-header';
import { GlobalCommandPalette } from '../components/global-command-palette';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Design System — Tailwind v4 + shadcn/ui',
  description:
    'Comprehensive, coherent design system with verified WCAG contrast, creative UX scenario patterns, and accessible primitives.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-highlight/30 selection:text-highlight-foreground">
        <ThemeProvider>
          <div className="flex min-h-screen">
            <ShowcaseSidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <ShowcaseHeader />
              <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto">
                {children}
              </main>
            </div>
          </div>
          <Toaster />
          <GlobalCommandPalette />
        </ThemeProvider>
      </body>
    </html>
  );
}
