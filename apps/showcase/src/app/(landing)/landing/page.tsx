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
  StatItem,
} from '@ds/ui';

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

export default function LandingDemoPage() {
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="space-y-24">
      {/* Floating frame note */}
      <div className="fixed top-4 right-4 z-50 hidden sm:flex items-center gap-2">
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-1.5 bg-background/70 backdrop-blur-sm text-xs shadow-sm">
            <ArrowUpRight className="h-3.5 w-3.5" />
            Back to Docs
          </Button>
        </Link>
      </div>

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

          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Customers</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex text-sm">Sign in</Button>
            </Link>
            <Link href="/#catalog">
              <Button variant="highlight" size="sm" className="gap-1.5 text-sm">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </Container>
      </header>

      {/* HERO */}
      <Hero variant="split" containerSize="xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <HeroEyebrow icon={Rocket}>THE DESIGN SYSTEM FOR SERIOUS PRODUCT TEAMS</HeroEyebrow>
            <HeroTitle gradient>
              Engineering artistry,<br />
              measurable contrast.
            </HeroTitle>
            <HeroDescription>
              An OKLCH design system with audited WCAG AA/AAA guarantees, Radix-powered
              accessibility, and battle-tested UX scenario recipes — light and dark from day one.
            </HeroDescription>
            <HeroActions>
              <Button variant="highlight" size="lg" className="gap-2 shadow-md">
                <Rocket className="h-4 w-4" />
                Start Building Free
              </Button>
              <Button variant="outline" size="lg" className="gap-2">
                <Github className="h-4 w-4" />
                View Components
              </Button>
            </HeroActions>
            <p className="mt-4 text-xs text-muted-foreground font-mono">
              No credit card required · MIT licensed primitives · pnpm monorepo
            </p>
          </div>

          <HeroMedia>
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-lg">
              <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-highlight" />
                </div>
                <span className="text-xs font-mono text-muted-foreground">app.lumenui.dev/dashboard</span>
              </div>
              <div className="grid grid-cols-4 gap-3 p-4">
                {[Zap, ShieldCheck, Palette, Layers].map((Icon, i) => (
                  <div key={i} className="rounded-lg border border-border/60 bg-muted/20 p-3 flex flex-col items-center gap-2 text-muted-foreground">
                    <Icon className="h-5 w-5 text-highlight" />
                    <span className="text-[10px] font-mono">MOD{i + 1}</span>
                  </div>
                ))}
                <div className="col-span-2 row-span-2 rounded-lg border border-highlight/40 bg-highlight/10 p-4">
                  <p className="text-xs font-bold text-foreground mb-1">Contrast Audit</p>
                  <div className="text-3xl font-extrabold font-display text-foreground">AAA</div>
                  <p className="text-[10px] text-muted-foreground mt-1">160 token pairs verified</p>
                </div>
                <div className="col-span-2 rounded-lg border border-border/60 bg-card p-4">
                  <p className="text-xs font-bold text-foreground mb-2">Dark Mode Parity</p>
                  <div className="flex gap-1.5">
                    <div className="h-8 w-8 rounded-md bg-zinc-950 border border-zinc-800" />
                    <div className="h-8 w-8 rounded-md bg-card border border-border" />
                  </div>
                </div>
                <div className="col-span-4 rounded-lg border border-border/60 bg-muted/20 p-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Build time</span>
                  <Badge variant="success" className="font-mono text-[10px]">2.4s</Badge>
                </div>
              </div>
            </div>
          </HeroMedia>
        </div>
      </Hero>

      {/* LOGO CLOUD */}
      <LogoCloud title="Trusted by product teams shipping on our system" variant="bordered">
        {['Vercel', 'Linear', 'Ramp', 'Notion', 'Framer'].map((name) => (
          <LogoItem key={name} name={name} />
        ))}
      </LogoCloud>

      {/* STATS */}
      <StatsBand variant="card" columns={4} containerSize="xl">
        <StatItem value={160} suffix="+" label="Token pairs" description="Verified against WCAG AA & AAA" />
        <StatItem value={25} suffix="+" label="Components" description="Built on Radix with cva variants" />
        <StatItem value={18} suffix="+" label="UX Recipes" description="Wizards, tables, Kanban & more" />
        <StatItem value={100} suffix="%" label="Audited" description="Automated contrast CI on every commit" />
      </StatsBand>

      {/* FEATURES */}
      <div id="features" className="scroll-mt-24">
        <Container size="xl">
          <div className="mx-auto max-w-2xl text-center space-y-3 mb-12">
            <Badge variant="highlight" className="font-mono text-xs">WHY LUMENUI</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground">
              Everything you need to ship premium interfaces
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              From tokens to full scenario recipes — a single source of truth that keeps your product
              coherent, accessible, and fast to assemble.
            </p>
          </div>
          <FeatureGrid columns={3}>
            {FEATURES.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                badge={feature.badge}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </FeatureGrid>
        </Container>
      </div>

      {/* PRICING */}
      <div id="pricing" className="scroll-mt-24">
        <Container size="xl">
          <div className="mx-auto max-w-2xl text-center space-y-3 mb-10">
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
          </div>

          <PricingGrid columns={3}>
            {PRICING_FEATURES.map((plan) => (
              <PricingCard
                key={plan.text}
                name={plan.text}
                description={plan.description}
                price={billingInterval === 'yearly' && typeof plan.price === 'number' && plan.price > 0 ? plan.price * 12 : plan.price}
                period={billingInterval === 'yearly' && typeof plan.price === 'number' && plan.price > 0 ? '/year' : plan.period}
                badge={plan.text === 'Pro' ? 'Most Popular' : undefined}
                popular={plan.popular}
                ctaText={plan.ctaText}
                ctaVariant={plan.popular ? 'highlight' : 'outline'}
                features={plan.features}
              />
            ))}
          </PricingGrid>
        </Container>
      </div>

      {/* TESTIMONIALS */}
      <div id="testimonials" className="scroll-mt-24">
        <Container size="xl">
          <div className="mx-auto max-w-2xl text-center space-y-3 mb-12">
            <Badge variant="highlight" className="font-mono text-xs">CUSTOMERS</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground">
              Loved by engineers who care about detail
            </h2>
          </div>
          <TestimonialGrid columns={3}>
            {TESTIMONIALS.map((t) => (
              <TestimonialCard
                key={t.authorName}
                quote={t.quote}
                authorName={t.authorName}
                authorRole={t.authorRole}
                authorCompany={t.authorCompany}
                rating={t.rating}
              />
            ))}
          </TestimonialGrid>
        </Container>
      </div>

      {/* FAQ */}
      <div id="faq" className="scroll-mt-24">
        <Container size="xl">
          <div className="mx-auto max-w-2xl text-center space-y-3 mb-10">
            <Badge variant="highlight" className="font-mono text-xs">FAQ</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-foreground">
              Frequently asked questions
            </h2>
          </div>
          <FaqSection items={FAQ_ITEMS} />
        </Container>
      </div>

      {/* CTA */}
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
            <Button variant="outline" size="lg">
              Book a Demo
            </Button>
          </>
        }
      />

      {/* FOOTER */}
      <footer className="border-t border-border/60 bg-muted/20">
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
              <span>WCAG 2.1 AA</span>
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