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
  Wand2,
  ListTree,
  Columns3,
  Search,
  Activity,
  Briefcase,
  HeartPulse,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  GridPattern,
  GlowOrb,
  SectionNumber,
} from '@ds/ui';

export default function OverviewPage() {
  const sections = [
    {
      title: 'Full Integrated CRM Suite',
      description: 'End-to-end interactive CRM app with Leads Kanban, Campaign Builder, Omnichannel Contact Center & AI Copilot.',
      href: '/crm',
      icon: Briefcase,
      badge: 'Interactive App',
      tag: 'INTEGRATED SCENARIO',
    },
    {
      title: 'Weight Loss Clinic (CIS)',
      description: 'Full-suite Clinic Information System: patient intake wizard, multi-disciplinary consultations (Doctor, Psych, Dietician), treatments catalog, appointments board, and retail POS.',
      href: '/clinic',
      icon: HeartPulse,
      badge: 'New Suite',
      tag: 'INTEGRATED SCENARIO',
    },
    {
      title: 'Art Directions & Tones',
      description: '3 art directions and 8 color tones with live switching and audited WCAG AA/AAA parity.',
      href: '/foundations/themes',
      icon: Palette,
      badge: '3 Styles',
      tag: 'FOUNDATION',
    },
    {
      title: 'Color & Contrast Matrix',
      description: 'OKLCH color system with mathematically audited WCAG AA/AAA contrast ratios.',
      href: '/foundations/colors',
      icon: Sparkles,
      badge: 'Audited',
      tag: 'FOUNDATION',
    },
    {
      title: 'UI Components',
      description: '25+ accessible primitives built on Radix UI, cva variants, and Tailwind v4.',
      href: '/components',
      icon: Box,
      badge: '25+ Primitives',
      tag: 'PRIMITIVES',
    },
    {
      title: 'Stepper / Wizard Flow',
      description: 'Multi-step onboarding flow with real-time validation, progress indicator, and review step.',
      href: '/patterns/stepper',
      icon: GitFork,
      badge: 'Interactive UX',
      tag: 'SCENARIO',
    },
    {
      title: 'Workspace Layout',
      description: 'Collapsible navigation, context switcher, breadcrumbs, split panels, and command palette.',
      href: '/patterns/workspace',
      icon: Layers,
      badge: 'Layout',
      tag: 'SCENARIO',
    },
    {
      title: 'Data Table & Filtering',
      description: 'Advanced data table with column sorting, fuzzy search, bulk actions, and skeleton loading.',
      href: '/patterns/data-table',
      icon: TableProperties,
      badge: 'Complex UX',
      tag: 'SCENARIO',
    },
    {
      title: 'Advanced Filtering & Views',
      description: 'Multi-condition rule builder, saved views, column presets, and facet filtering.',
      href: '/patterns/advanced-filtering',
      icon: ListTree,
      badge: 'New',
      tag: 'SCENARIO',
    },
    {
      title: 'Master Data CRUD',
      description: 'Enterprise reference data management: category filters, drawer forms, audit logs, and status controls.',
      href: '/patterns/master-data',
      icon: Database,
      badge: 'Enterprise',
      tag: 'SCENARIO',
    },
    {
      title: 'Kanban & Drag & Drop',
      description: 'Multi-column workflow board with card ordering, column limits, and quick task creation.',
      href: '/patterns/kanban',
      icon: Columns3,
      badge: 'New',
      tag: 'SCENARIO',
    },
    {
      title: 'Global Search',
      description: 'Unified omni-search modal with categorized instant results and keyboard shortcuts.',
      href: '/patterns/global-search',
      icon: Search,
      badge: 'New',
      tag: 'SCENARIO',
    },
    {
      title: 'Dashboard & Metrics',
      description: 'Executive stat cards with delta trends, charts, and activity timelines.',
      href: '/patterns/dashboard',
      icon: LayoutDashboard,
      badge: 'Analytics',
      tag: 'SCENARIO',
    },
    {
      title: 'Charts & Data Viz',
      description: 'Perceptually uniform OKLCH charts with responsive containers and tooltips.',
      href: '/components/charts',
      icon: Activity,
      badge: 'New',
      tag: 'DATA VIZ',
    },
    {
      title: 'Advanced Form Kit',
      description: 'Tag input, date pickers, OTP verification, numeric steppers, and range sliders.',
      href: '/components/forms-advanced',
      icon: Wand2,
      badge: 'New',
      tag: 'FORMS',
    },
    {
      title: 'Auth & Onboarding',
      description: 'Login, registration, password recovery, and 2FA OTP verification screens.',
      href: '/patterns/auth',
      icon: KeyRound,
      badge: 'Security UX',
      tag: 'AUTH',
    },
    {
      title: 'Overlays & Feedback',
      description: 'Dialogs, slide-over sheets, rich toasts with undo triggers, and empty states.',
      href: '/patterns/overlays',
      icon: BellRing,
      badge: 'Feedback',
      tag: 'OVERLAY',
    },
  ];

  return (
    <div className="space-y-12 animate-in fade-in-50 duration-300">
      {/* Hero Header with Ambient Aura & Pattern Grid */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card/95 to-card p-8 sm:p-12 shadow-sm">
        {/* Background Accents */}
        <GridPattern
          width={44}
          height={44}
          squares={[
            [4, 1],
            [6, 3],
            [12, 2],
            [15, 4],
          ]}
          fade="radial"
          className="opacity-40 dark:opacity-30"
        />
        <GlowOrb color="highlight" size="xl" position="top-right" />
        <GlowOrb color="primary" size="lg" position="bottom-left" />

        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-highlight/30 bg-highlight/10 px-3.5 py-1 text-xs font-semibold text-highlight font-mono">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>TAILWIND V4 + RADIX + OKLCH TOKENS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground font-display leading-[1.1]">
            Engineering Artistry in{' '}
            <span className="bg-gradient-to-r from-primary via-highlight to-primary bg-clip-text text-transparent">
              Design Systems
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            A comprehensive, character-rich design system featuring <strong>4 curated art directions</strong>, strict WCAG 2.1 AA/AAA contrast guarantees, and production-ready UX scenario patterns.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link href="/crm">
              <Button variant="highlight" className="gap-2 h-10 px-5 font-semibold text-sm shadow-md">
                <Briefcase className="h-4 w-4" />
                Launch CRM Full Experience
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/foundations/themes">
              <Button variant="outline" className="gap-2 h-10 px-5 text-sm bg-background/50 backdrop-blur-sm hover:border-highlight/50">
                Explore Art Directions
              </Button>
            </Link>
            <Link href="/patterns/stepper">
              <Button variant="ghost" className="gap-2 h-10 px-4 text-sm text-muted-foreground hover:text-foreground">
                UX Recipes
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid with Monospace Indexing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/80 relative overflow-hidden group hover:border-highlight/50 transition-all duration-200">
          <div className="absolute top-0 right-0 p-4">
            <SectionNumber number="01" />
          </div>
          <CardHeader className="pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-highlight/10 text-highlight mb-3 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-display">
              Guaranteed WCAG Contrast
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              All 160 token pairs across 8 tones are mathematically verified against WCAG 2.1 AA (≥ 4.5:1) & AAA (≥ 7.0:1) with automated CI tests.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/80 relative overflow-hidden group hover:border-highlight/50 transition-all duration-200">
          <div className="absolute top-0 right-0 p-4">
            <SectionNumber number="02" />
          </div>
          <CardHeader className="pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3 group-hover:scale-105 transition-transform">
              <GitFork className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-display">
              18+ UX Scenario Recipes
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Beyond basic buttons — includes multi-step wizards, workspace split layouts, master data CRUD, Kanban boards, and complex filters.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-border/80 relative overflow-hidden group hover:border-highlight/50 transition-all duration-200">
          <div className="absolute top-0 right-0 p-4">
            <SectionNumber number="03" />
          </div>
          <CardHeader className="pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success mb-3 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <CardTitle className="text-base font-display">
              Tailwind v4 + OKLCH Tokens
            </CardTitle>
            <CardDescription className="text-xs leading-relaxed">
              Engineered with modern CSS-first `@theme` directives, perceptually uniform OKLCH space, and seamless light & dark mode parity.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Showcase Sections Navigation Grid */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground font-display">
              Showcase Catalog & Scenarios
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Comprehensive reference library for components, foundations, and interaction patterns
            </p>
          </div>
          <span className="text-xs font-mono text-muted-foreground hidden sm:inline">
            {sections.length} MODULES
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <Link key={section.href} href={section.href} className="group">
                <Card className="h-full border-border hover:border-highlight/50 hover:shadow-md transition-all duration-200 relative overflow-hidden">
                  <CardHeader className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground group-hover:bg-highlight group-hover:text-highlight-foreground transition-all duration-200 shadow-xs">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          #{String(idx + 1).padStart(2, '0')}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-2 py-0 border-border group-hover:border-highlight/30 group-hover:text-highlight transition-colors"
                        >
                          {section.badge}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/80">
                        {section.tag}
                      </span>
                      <CardTitle className="text-base font-display group-hover:text-highlight transition-colors">
                        {section.title}
                      </CardTitle>
                    </div>

                    <CardDescription className="text-xs line-clamp-2 mt-1.5 leading-relaxed">
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
