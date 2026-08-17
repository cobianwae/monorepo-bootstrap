import Link from 'next/link';
import { Container } from '@ds/ui';
import { BrandMark } from './brand-mark';

const FOOTER_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'Getting Started', href: '/getting-started' },
      { label: 'Guidelines', href: '/guidelines' },
      { label: 'Foundations', href: '/foundations/colors' },
      { label: 'Components', href: '/components' },
    ],
  },
  {
    title: 'Patterns',
    links: [
      { label: 'Data Table', href: '/patterns/data-table' },
      { label: 'Kanban', href: '/patterns/kanban' },
      { label: 'Command Palette', href: '/patterns/command-palette' },
      { label: 'Dashboard', href: '/patterns/dashboard' },
    ],
  },
  {
    title: 'Scenarios',
    links: [
      { label: 'CRM Workspace', href: '/crm' },
      { label: 'Clinic Workspace', href: '/clinic' },
      { label: "What's New", href: '/whats-new' },
      { label: 'Contribution', href: '/contribution' },
    ],
  },
] as const;

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <Container size="xl" className="py-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_repeat(3,1fr)]">
          <div className="space-y-4">
            <Link
              href="/landing"
              className="inline-block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Arah — landing"
            >
              <BrandMark />
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              A design system built layer by layer — slowly, surely, and never bland.
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={`Footer — ${column.title}`}>
              <h3 className="mb-4 font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {column.title}
              </h3>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© 2026 Arah Design System. Built slowly, built surely.</p>
          <div className="flex items-center gap-4 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              WCAG 2.1 AAA
            </span>
            <span aria-hidden="true">·</span>
            <span>OKLCH Native</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
