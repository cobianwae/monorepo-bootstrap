'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight,
  Bot,
  Code2,
  Palette,
  Github,
  Twitter,
  Linkedin,
  ArrowUpRight,
  Rocket,
  Sun,
  Moon,
  Laptop,
  LayoutDashboard,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';
import {
  Container,
  Button,
  Badge,
  Hero,
  HeroEyebrow,
  HeroTitle,
  HeroDescription,
  HeroActions,
  HeroMedia,
  FeatureGrid,
  FeatureCard,
  PricingGrid,
  PricingCard,
  TestimonialGrid,
  TestimonialCard,
  LogoCloud,
  LogoItem,
  CtaBand,
  FaqSection,
  StatsBand,
  GlowOrb,
  GridPattern,
  PaletteSwitcher,
  useTheme,
} from '@ds/ui';
import { Reveal } from '@/components/reveal';
import { AnimatedStat } from '@/components/animated-stat';
import { ArtDirectionShowcase } from '@/components/art-direction-showcase';

const FEATURES = [
  {
    icon: Palette,
    title: 'Art-Directed Tokens',
    description: '4 curated art directions with 8 OKLCH color tones, mathematically audited for WCAG AA/AAA contrast in both light and dark mode.',
    badge: 'OKLCH',
  },
  {
    icon: Code2,
    title: 'Radix-Powered Components',
    description: 'Accessible primitives built on Radix UI with cva variants — keyboard navigation, focus management, and ARIA semantics out of the box.',
    badge: 'a11y',
  },
  {
    icon: Zap,
    title: 'Tailwind v4 CSS-First',
    description: 'Modern @theme directives, native cascade layers, and zero-runtime design tokens that ship straight to the browser.',
    badge: 'v4',
  },
  {
    icon: ShieldCheck,
    title: 'Contrast Guarantees',
    description: 'Every token pair is verified in CI against WCAG 2.1 AA (≥ 4.5:1) and AAA (≥ 7.0:1) — no more guessing, no more dark-mode regressions.',
    badge: 'AA / AAA',
  },
  {
    icon: Bot,
    title: 'Full UX Scenario Recipes',
    description: 'Data tables with saved views, multi-step wizards, Kanban boards, command palettes, and optimistic updates — ready to assemble.',
    badge: '18+',
  },
  {
    icon: Layers,
    title: 'Component-Driven Codebase',
    description: 'A pnpm monorepo with shared types, design tokens, and a UI package — consume via @ds/ui and @ds/tokens aliases.',
    badge: 'pnpm',
  },
];

const PRICING_FEATURES = [
  { text: 'Community', description: 'Free forever', price: 0, period: '', features: [{ text: 'All components', included: true }, { text: 'Light & dark parity' }, { text: 'Community support' }, { text: 'Priority support', included: false }], ctaText: 'Get Started', popular: false },
  { text: 'Pro', description: 'For product teams', price: 49, period: '/month', features: [{ text: 'Everything in Free' }, { text: 'All UX pattern recipes' }, { text: 'New components monthly' }, { text: 'Email & Slack support' }, { text: 'Priority support', included: false }], ctaText: 'Start Free Trial', popular: true },
  { text: 'Enterprise', description: 'Scale & compliance', price: 'Custom', period: '', features: [{ text: 'Everything in Pro' }, { text: 'Private npm registry' }, { text: 'SSO & audit logs' }, { text: 'Dedicated support' }], ctaText: 'Contact Sales', popular: false },
];

const TESTIMONIALS = [
  { quote: 'The contrast auditing alone is worth it. We found 12 dark-mode regressions we had shipped unknowingly.', authorName: 'Arya Pratama', authorRole: 'Frontend Lead', authorCompany: 'Finora', rating: 5 },
  { quote: 'Radix primitives plus opinionated art directions means our product finally looks like one coherent system.', authorName: 'Dewi Lestari', authorRole: 'Staff Engineer', authorCompany: 'Kopi Kode', rating: 5 },
  { quote: 'We assembled a full CRM interface in a day by composing the UX scenario recipes. Unreal DX.', authorName: 'Bimo Wicaksono', authorRole: 'CPO', authorCompany: 'Shiftly', rating: 5 },
];

const FAQ_ITEMS = [
  { question: 'Is the design system really dependency-free beyond Radix and Tailwind?', answer: 'Yes. Core components depend only on Radix primitives, class-variance-authority, and Tailwind v4. Optional recipes (charts, virtual lists, rich text) use focused libraries that are clearly documented.' },
  { question: 'How is accessibility handled?', answer: 'Every interactive component builds on Radix UI, which implements WAI-ARIA patterns for keyboard navigation and focus management. We add screen-reader labels, reduced-motion support, and run contrast audits in CI.' },
  { question: 'Can I use just the tokens without the components?', answer: 'Absolutely. The tokens package ships CSS @theme variables and an OKLCH contrast validator you can drop into any Tailwind v4 project.' },
  { question: 'How often is it updated?', answer: 'A What\'s New changelog tracks every release. New UX pattern recipes ship monthly, and the roadmap includes calendar scheduling, rich text editing, and product tours.' },
];

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Experience', href: '#experience' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Customers', href: '#testimonials' },
  { label: 'FAQ', href: '#faq' },
];

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
          variant={theme === mode ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setTheme(mode)}
          className="h-7 w-7 p-0"
          aria-label={label}
          title={label}
        >
          <Icon className="h-3.5 w-3.5" />
        </Button>
      ))}
    </div>
  );
}

const SIDEBAR_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview' },
  { icon: Users, label: 'Customers' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Settings, label: 'Settings' },
];

export default function LandingDemoPage() {
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="space-y-24">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <Container size="xl" className="flex h-16 items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2 font-display font-bold text-foreground">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-highlight text-highlight-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <span>LumenUI</span>
            <Badge variant="outline" className="font-mono text-[10px] ml-1 text-muted-foreground">
              v2.0
            </Badge>
          </Link>

          <nav className="hidden xl:flex items-center gap-6 text-sm text-muted-foreground">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/" className="hidden lg:block">
              <Button variant="ghost" size="sm" className="text-sm">
                Docs
              </Button>
            </Link>
            <PaletteSwitcher />
            <ThemeModeToggle />

            <Link href="/#catalog" className="hidden sm:block">
              <Button variant="highlight" size="sm" className="gap-1.5 text-sm">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Container>
      </header>

      {/* HERO */}
      <Hero variant="split" containerSize="xl" className="relative">
        <GridPattern fade="radial" className="opacity-40" />
        <GlowOrb color="gradient" size="xl" position="top-right" className="opacity-30" />
        <GlowOrb color="primary" size="lg" position="bottom-left" className="opacity-20" />

        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <HeroEyebrow icon={Rocket} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              THE DESIGN SYSTEM FOR SERIOUS PRODUCT TEAMS
            </HeroEyebrow>
            <HeroTitle
              gradient
              className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:80ms]"
            >
              Engineering artistry,<br />
              measurable contrast.
            </HeroTitle>
            <HeroDescription className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:160ms]">
              An OKLCH design system with audited WCAG AA/AAA guarantees, Radix-powered
              accessibility, and battle-tested UX scenario recipes — light and dark from day one.
            </HeroDescription>
            <HeroActions className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:240ms]">
              <Button variant="highlight" size="lg" className="gap-2 shadow-md">
                <Rocket className="h-4 w-4" />
                Start Building Free
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Github className="h-4 w-4" />
                View Components
              </Button>
            </HeroActions>
            <p className="mt-4 text-xs text-muted-foreground font-mono animate-in fade-in duration-500 [animation-delay:320ms]">
              No credit card required · MIT licensed primitives · pnpm monorepo
            </p>
          </div>

          <div className="relative animate-in fade-in zoom-in-95 duration-700 [animation-delay:200ms]">
            <GlowOrb color="highlight" size="lg" position="top-right" className="opacity-40" />
            <HeroMedia className="overflow-hidden">
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xl shadow-highlight/10 relative">
                <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-3">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/50" />
                    <span className="h-2.5 w-2.5 rounded-full bg-warning/50" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success/50" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">app.lumenui.dev/dashboard</span>
                  <Badge variant="outline" className="font-mono text-[10px] text-muted-foreground">OKLCH</Badge>
                </div>

                <div className="grid grid-cols-[1fr_2fr] gap-3 p-4">
                  <div className="space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-2">
                    {SIDEBAR_ITEMS.map(({ icon: Icon, label }) => (
                      <div
                        key={label}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] text-muted-foreground transition-colors hover:bg-highlight/10 hover:text-highlight"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        <span className="font-mono">{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-lg border border-highlight/40 bg-highlight/10 p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-foreground">Contrast Audit</p>
                        <Badge variant="success" className="font-mono text-[10px]">7.2:1</Badge>
                      </div>
                      <div className="mt-2 flex items-end gap-2">
                        <span className="text-3xl font-extrabold font-display text-foreground">AAA</span>
                        <span className="text-[10px] text-muted-foreground mb-1">160 token pairs verified</span>
                      </div>
                      <div className="mt-3 flex gap-1.5">
                        {[0.9, 0.7, 0.95, 0.55, 0.8, 0.6].map((opacity, i) => (
                          <div
                            key={i}
                            className="h-1.5 flex-1 rounded-full bg-gradient-to-r from-highlight to-primary"
                            style={{ opacity }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card p-3">
                      <span className="text-xs font-bold text-foreground">Dark Mode Parity</span>
                      <div className="flex gap-1.5">
                        <div className="h-6 w-6 rounded-md bg-zinc-950 border border-zinc-800" />
                        <div className="h-6 w-6 rounded-md bg-card border border-border" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
                      <span className="text-xs text-muted-foreground">Build time</span>
                      <Badge variant="success" className="font-mono text-[10px]">2.4s</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </HeroMedia>
          </div>
        </div>
      </Hero>

      {/* EXPERIENCE THE SYSTEM */}
      <div className="relative">
        <GlowOrb color="gradient" size="xl" position="top-center" className="opacity-20" />
        <Container size="xl">
          <ArtDirectionShowcase />
        </Container>
      </div>

      {/* LOGO CLOUD */}
      <Reveal variant="fade">
        <LogoCloud title="Trusted by product teams shipping on our system" variant="bordered">
          {['Vercel', 'Linear', 'Ramp', 'Notion', 'Framer'].map((name) => (
            <LogoItem key={name} name={name} />
          ))}
        </LogoCloud>
      </Reveal>

      {/* STATS */}
      <StatsBand variant="card" columns={4} containerSize="xl">
        <AnimatedStat value={160} suffix="+" label="Token pairs" description="Verified against WCAG AA & AAA" />
        <AnimatedStat value={25} suffix="+" label="Components" description="Built on Radix with cva variants" delay={120} />
        <AnimatedStat value={18} suffix="+" label="UX Recipes" description="Wizards, tables, Kanban & more" delay={240} />
        <AnimatedStat value={100} suffix="%" label="Audited" description="Automated contrast CI on every commit" delay={360} />
      </StatsBand>

      {/* FEATURES */}
      <div id="features" className="scroll-mt-24">
        <Container size="xl">
          <Reveal className="mx-auto max-w-2xl text-center space-y-3 mb-12">
            <Badge variant="highlight" className="font-mono text-xs">WHY LUMENUI</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground">
              Everything you need to ship premium interfaces
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              From tokens to full scenario recipes — a single source of truth that keeps your product
              coherent, accessible, and fast to assemble.
            </p>
          </Reveal>
          <FeatureGrid columns={3}>
            {FEATURES.map((feature, i) => (
              <Reveal key={feature.title} delay={i * 90}>
                <FeatureCard
                  variant="gradient"
                  icon={feature.icon}
                  badge={feature.badge}
                  title={feature.title}
                  description={feature.description}
                  className="h-full"
                />
              </Reveal>
            ))}
          </FeatureGrid>
        </Container>
      </div>

      {/* PRICING */}
      <div id="pricing" className="scroll-mt-24">
        <Container size="xl">
          <Reveal className="mx-auto max-w-2xl text-center space-y-3 mb-10">
            <Badge variant="highlight" className="font-mono text-xs">PRICING</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground">
              Simple, transparent plans
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Start free, scale with your team. Every plan includes the full component library.
            </p>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card p-1 text-xs font-medium">
              <button
                onClick={() => setBillingInterval('monthly')}
                className={`rounded-full px-4 py-1.5 transition-colors ${billingInterval === 'monthly' ? 'bg-highlight text-highlight-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('yearly')}
                className={`rounded-full px-4 py-1.5 transition-colors ${billingInterval === 'yearly' ? 'bg-highlight text-highlight-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Yearly <span className="ml-1 text-highlight font-bold">-20%</span>
              </button>
            </div>
          </Reveal>

          <PricingGrid columns={3}>
            {PRICING_FEATURES.map((plan, i) => (
              <Reveal key={plan.text} delay={i * 100} className="h-full">
                <PricingCard
                  name={plan.text}
                  description={plan.description}
                  price={billingInterval === 'yearly' && typeof plan.price === 'number' && plan.price > 0 ? plan.price * 12 : plan.price}
                  period={billingInterval === 'yearly' && typeof plan.price === 'number' && plan.price > 0 ? '/year' : plan.period}
                  badge={plan.text === 'Pro' ? 'Most Popular' : undefined}
                  popular={plan.popular}
                  ctaText={plan.ctaText}
                  ctaVariant={plan.popular ? 'highlight' : 'outline'}
                  features={plan.features}
                  className="h-full"
                />
              </Reveal>
            ))}
          </PricingGrid>
        </Container>
      </div>

      {/* TESTIMONIALS */}
      <div id="testimonials" className="scroll-mt-24">
        <Container size="xl">
          <Reveal className="mx-auto max-w-2xl text-center space-y-3 mb-12">
            <Badge variant="highlight" className="font-mono text-xs">CUSTOMERS</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground">
              Loved by engineers who care about detail
            </h2>
          </Reveal>
          <TestimonialGrid columns={3}>
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.authorName} delay={i * 100} className="h-full">
                <TestimonialCard
                  quote={t.quote}
                  authorName={t.authorName}
                  authorRole={t.authorRole}
                  authorCompany={t.authorCompany}
                  rating={t.rating}
                  className="h-full"
                />
              </Reveal>
            ))}
          </TestimonialGrid>
        </Container>
      </div>

      {/* FAQ */}
      <div id="faq" className="scroll-mt-24">
        <Container size="xl">
          <Reveal className="mx-auto max-w-2xl text-center space-y-3 mb-10">
            <Badge variant="highlight" className="font-mono text-xs">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground">
              Frequently asked questions
            </h2>
          </Reveal>
          <Reveal className="mx-auto max-w-3xl">
            <FaqSection items={FAQ_ITEMS} />
          </Reveal>
        </Container>
      </div>

      {/* CTA */}
      <div className="relative">
        <GlowOrb color="gradient" size="xl" position="top-center" className="opacity-25" />
        <Reveal variant="zoom">
          <CtaBand
            variant="glow"
            align="center"
            badge="GET STARTED"
            badgeIcon={Rocket}
            title="Ready to ship interfaces you're proud of?"
            description="Join teams building accessible, art-directed products with audited contrast and production-ready UX recipes."
            actions={
              <>
                <Button variant="highlight" size="lg" className="gap-2 shadow-md">
                  <Rocket className="h-4 w-4" />
                  Start Building Free
                </Button>
                <Button variant="outline" size="lg" className="gap-2">
                  Book a Demo
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </>
            }
          />
        </Reveal>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-highlight/50 to-transparent" />
        <Container size="xl" className="py-12">
          <div className="grid gap-10 md:grid-cols-4">
            <div className="md:col-span-2 space-y-3">
              <Link href="/landing" className="flex items-center gap-2 font-display font-bold text-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-highlight text-highlight-foreground shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span>LumenUI</span>
              </Link>
              <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
                An OKLCH design system with audited contrast, Radix accessibility, and UX scenario
                recipes — engineered for light & dark parity.
              </p>
              <div className="flex gap-3 pt-2">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" aria-label="Social link" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-highlight/40 transition-colors">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Changelog', 'Roadmap'] },
              { title: 'Resources', links: ['Documentation', 'Components', 'UX Patterns', 'Foundations'] },
              { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            ].map((col) => (
              <div key={col.title} className="space-y-3">
                <p className="text-sm font-semibold text-foreground">{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
            <p>© 2026 LumenUI. Engineered with OKLCH, Radix, and Tailwind v4.</p>
            <div className="flex gap-4 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                WCAG 2.1 AA
              </span>
              <span>·</span>
              <span>OKLCH</span>
              <span>·</span>
              <span>v2.0</span>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}