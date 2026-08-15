import Link from 'next/link';
import {
  Palette,
  Box,
  GitFork,
  Layers,
  TableProperties,
  KeyRound,
  LayoutDashboard,
  BellRing,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, Button, Badge } from '@ds/ui';

export default function OverviewPage() {
  const sections = [
    {
      title: 'Foundations & Contrast Matrix',
      description: 'OKLCH color system with mathematically audited WCAG AA/AAA contrast ratios.',
      href: '/foundations/colors',
      icon: Palette,
      badge: 'Audited',
    },
    {
      title: 'UI Components',
      description: '25+ accessible primitives built on Radix UI, cva variants, and Tailwind v4.',
      href: '/components',
      icon: Box,
      badge: '25+ Primitives',
    },
    {
      title: 'Stepper / Wizard Flow',
      description: 'Multi-step onboarding flow with real-time validation, progress indicator, and review step.',
      href: '/patterns/stepper',
      icon: GitFork,
      badge: 'Interactive UX',
    },
    {
      title: 'Workspace Layout',
      description: 'Collapsible navigation, context switcher, breadcrumbs, split panels, and command palette.',
      href: '/patterns/workspace',
      icon: Layers,
      badge: 'Layout',
    },
    {
      title: 'Data Table & Filtering',
      description: 'Advanced data table with column sorting, fuzzy search, bulk actions, and skeleton loading.',
      href: '/patterns/data-table',
      icon: TableProperties,
      badge: 'Complex UX',
    },
    {
      title: 'Master Data CRUD',
      description: 'Enterprise reference data management: category filters, drawer forms, audit logs, and status controls.',
      href: '/patterns/master-data',
      icon: Database,
      badge: 'Enterprise',
    },
    {
      title: 'Auth & Onboarding',
      description: 'Login, registration, password recovery, and 2FA OTP verification screens.',
      href: '/patterns/auth',
      icon: KeyRound,
      badge: 'Security UX',
    },
    {
      title: 'Dashboard & Metrics',
      description: 'Executive stat cards with delta trends, charts, and activity timelines.',
      href: '/patterns/dashboard',
      icon: LayoutDashboard,
      badge: 'Analytics',
    },
    {
      title: 'Overlays & Feedback',
      description: 'Dialogs, slide-over sheets, rich toasts with undo triggers, and empty states.',
      href: '/patterns/overlays',
      icon: BellRing,
      badge: 'Feedback',
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 p-8 sm:p-10 shadow-xs">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Coherent Design System Architecture</span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Design System & UX Scenarios
          </h1>

          <p className="text-base text-muted-foreground leading-relaxed">
            A comprehensive design system based on <strong>Tailwind CSS v4</strong> and <strong>shadcn/ui</strong> principles.
            Engineered with strict WCAG AA/AAA contrast compliance, fluid responsiveness, and production-ready UX scenario patterns.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/foundations/colors">
              <Button className="gap-2">
                Explore Colors & Contrast
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/patterns/stepper">
              <Button variant="outline" className="gap-2">
                View UX Stepper Scenario
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Guaranteed WCAG Contrast</CardTitle>
            <CardDescription>
              All color token pairs are mathematically validated against WCAG 2.1 AA (4.5:1) & AAA (7.0:1) with automated CI tests.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <GitFork className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Deep UX Scenario Recipes</CardTitle>
            <CardDescription>
              Beyond basic buttons — includes full multi-step wizards, workspace split layouts, master data CRUD, and rich data tables.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/80">
          <CardHeader className="pb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary mb-2">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-base">Tailwind v4 CSS-First</CardTitle>
            <CardDescription>
              Built with modern CSS `@theme` directives, OKLCH color space for perceptual uniformity, and seamless dark mode support.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Showcase Sections Navigation Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-foreground">
          Showcase Sections & Scenarios
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href} className="group">
                <Card className="h-full border-border hover:border-primary/50 hover:shadow-md transition-all duration-200">
                  <CardHeader className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                        <Icon className="h-4 w-4" />
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {section.badge}
                      </Badge>
                    </div>

                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {section.title}
                    </CardTitle>

                    <CardDescription className="text-xs line-clamp-2 mt-1.5">
                      {section.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
