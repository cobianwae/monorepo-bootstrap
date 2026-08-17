'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, Moon, Laptop, ShieldCheck } from 'lucide-react';
import {
  Button,
  SidebarTrigger,
  useTheme,
  PaletteSwitcher,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@ds/ui';

export function ShowcaseHeader() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const pathParts = pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-4 md:px-6 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="lg:hidden" />

        <Breadcrumb className="hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/" className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground">
                  Docs
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathParts.map((part, index) => {
              const isLast = index === pathParts.length - 1;
              const href = `/${pathParts.slice(0, index + 1).join('/')}`;
              const label = part.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

              return (
                <span key={href} className="inline-flex items-center gap-1.5">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="font-display font-semibold text-foreground text-sm">
                        {label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={href} className="text-muted-foreground hover:text-foreground text-xs font-medium">
                          {label}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </span>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Mobile Title */}
        <span className="sm:hidden truncate text-sm font-semibold text-foreground font-display">
          {pathParts.length === 0
            ? 'Overview'
            : pathParts[pathParts.length - 1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Palette Switcher */}
        <PaletteSwitcher />

        {/* Compliance Badge */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          <span className="font-mono text-[11px]">WCAG AA/AAA</span>
        </div>

        {/* Theme Toggle Button */}
        <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
          <Button
            variant={theme === 'light' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('light')}
            className="h-7 w-7 p-0"
            title="Light mode"
          >
            <Sun className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={theme === 'dark' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('dark')}
            className="h-7 w-7 p-0"
            title="Dark mode"
          >
            <Moon className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant={theme === 'system' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTheme('system')}
            className="h-7 w-7 p-0"
            title="System theme"
          >
            <Laptop className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}