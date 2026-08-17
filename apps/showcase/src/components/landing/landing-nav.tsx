'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, Sun, Moon, Laptop } from 'lucide-react';
import {
  Button,
  Container,
  PaletteSwitcher,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  useTheme,
  cn,
} from '@ds/ui';
import { BrandMark } from './brand-mark';

const NAV_LINKS = [
  { label: 'Voices', href: '#voices' },
  { label: 'Craft', href: '#craft' },
  { label: 'Patterns', href: '#patterns' },
  { label: 'Scenarios', href: '#scenarios' },
] as const;

function ThemeModeToggle() {
  const { theme, setTheme } = useTheme();

  const items = [
    { mode: 'light', icon: Sun, label: 'Light mode' },
    { mode: 'dark', icon: Moon, label: 'Dark mode' },
    { mode: 'system', icon: Laptop, label: 'System theme' },
  ] as const;

  return (
    <div
      role="radiogroup"
      aria-label="Theme mode"
      className="flex items-center rounded-lg border border-border bg-card p-0.5"
    >
      {items.map(({ mode, icon: Icon, label }) => (
        <Button
          key={mode}
          role="radio"
          aria-checked={theme === mode}
          variant={theme === mode ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setTheme(mode)}
          className="h-7 w-7 p-0"
          aria-label={label}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      ))}
    </div>
  );
}

export function LandingNav() {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <Container size="xl" className="flex h-16 items-center justify-between">
        <Link
          href="/landing"
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Arah — landing"
        >
          <BrandMark />
        </Link>

        <nav aria-label="Landing sections" className="hidden lg:flex items-center gap-6 text-sm text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-medium transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/" className="hidden lg:block">
            <Button variant="ghost" size="sm" className="text-sm">
              Documentation
            </Button>
          </Link>
          <div className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
          <PaletteSwitcher />
          <div className="hidden sm:block">
            <ThemeModeToggle />
          </div>
          <Link href="/getting-started" className="ml-1 hidden sm:block">
            <Button variant="default" size="sm" className="gap-1.5 text-sm">
              Get Started
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </Link>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 lg:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6">
              <SheetTitle className="sr-only">Landing navigation</SheetTitle>
              <div className="mb-8">
                <BrandMark />
              </div>
              <nav aria-label="Mobile sections" className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'rounded-lg px-3 py-2.5 text-sm font-medium text-foreground',
                      'transition-colors hover:bg-muted/60'
                    )}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
              <div className="mt-8 flex flex-col gap-3 border-t border-border/60 pt-6">
                <Link href="/getting-started" onClick={() => setOpen(false)}>
                  <Button variant="default" size="sm" className="w-full gap-1.5">
                    Get Started
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </Button>
                </Link>
                <div className="flex justify-center pt-2">
                  <ThemeModeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
