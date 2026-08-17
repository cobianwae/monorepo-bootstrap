'use client';

import * as React from 'react';
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  ArrowRight,
  CheckCircle2,
  Bot,
  Database,
  Code2,
} from 'lucide-react';
import {
  PageHeader,
  Card,
  CardContent,
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
  StatementCard,
  DotPattern,
  TableOfContents,
} from '@ds/ui';

export default function MarketingBlocksPage() {
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('monthly');

  const tocHeadings = [
    { id: 'hero', text: 'Hero Section', level: 2 },
    { id: 'features', text: 'Feature Grid', level: 2 },
    { id: 'stats', text: 'Stats & Metrics', level: 2 },
    { id: 'pricing', text: 'Pricing Matrix', level: 2 },
    { id: 'testimonials', text: 'Testimonials', level: 2 },
    { id: 'logos', text: 'Logo Cloud', level: 2 },
    { id: 'statement', text: 'Statement Cards', level: 2 },
    { id: 'cta', text: 'Call to Action', level: 2 },
    { id: 'faq', text: 'FAQ Accordion', level: 2 },
  ];

  return (
    <div className="space-y-12">
      <PageHeader
        eyebrow="Commercial & Web Blocks"
        eyebrowIcon={Sparkles}
        title="Marketing & Landing Blocks"
        description="High-conversion marketing section recipes composed from design system primitives, OKLCH art directions, and responsive typography."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              8 Marketing Blocks
            </Badge>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <div className="xl:col-span-9 space-y-12 min-w-0">
          {/* SECTION 1: HERO */}
          <section id="hero" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-highlight" />
                <span>Hero Section</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Hero block featuring eyebrow badges, gradient typography, action buttons, and responsive media preview cards.
              </p>
            </div>

            <Card>
              <CardContent className="p-0 overflow-hidden">
                <div className="border border-border/80 rounded-xl bg-gradient-to-b from-card via-background to-muted/20">
                  <Hero variant="centered" containerSize="xl">
                    <HeroEyebrow icon={Sparkles}>Next-Gen Design System v2.2</HeroEyebrow>
                    <HeroTitle gradient>Scale Enterprise UI with Precision</HeroTitle>
                    <HeroDescription>
                      Fullstack TypeScript monorepo with Tailwind CSS v4, OKLCH tokens, Radix UI primitives, and integrated UX scenario recipes.
                    </HeroDescription>
                    <HeroActions>
                      <Button size="lg" variant="highlight" className="gap-2 shadow-md">
                        <span>Explore Components</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button size="lg" variant="outline">
                        View Documentation
                      </Button>
                    </HeroActions>

                    <HeroMedia>
                      <div className="p-4 sm:p-6 rounded-xl bg-muted/20 border border-border flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full bg-destructive" />
                          <div className="h-3 w-3 rounded-full bg-warning" />
                          <div className="h-3 w-3 rounded-full bg-success" />
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">apps/showcase & packages/ui</span>
                      </div>
                    </HeroMedia>
                  </Hero>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 2: FEATURES */}
          <section id="features" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Layers className="h-6 w-6 text-highlight" />
                <span>Feature Grid</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Responsive feature grids with icons, badges, and gradient borders.
              </p>
            </div>

            <FeatureGrid columns={3}>
              <FeatureCard
                icon={Zap}
                badge="Tokens"
                title="OKLCH Color Tokens"
                description="8 vibrant tone palettes engineered with automated WCAG AA contrast validation."
                href="#"
              />
              <FeatureCard
                icon={Bot}
                badge="AI Ready"
                variant="highlight"
                title="AI & Copilot Kit"
                description="Chat thread, message bubbles, typing wave, and streaming response hooks."
                href="#"
              />
              <FeatureCard
                icon={Database}
                badge="Fullstack"
                title="Prisma & NestJS Backend"
                description="Type-safe API endpoints with DTO validation and PostgreSQL schema."
                href="#"
              />
            </FeatureGrid>
          </section>

          {/* SECTION 3: STATS */}
          <section id="stats" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Zap className="h-6 w-6 text-highlight" />
                <span>Stats & Metrics Band</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Display quantitative KPIs, performance benchmarks, and traction statistics.
              </p>
            </div>

            <StatsBand variant="card" columns={4}>
              <StatItem value="99.99" suffix="%" label="Uptime Reliability" description="High availability SLA" />
              <StatItem value="75" suffix="+" label="UI Components" description="Radix primitives & composites" />
              <StatItem prefix="<" value="50" suffix="ms" label="Response Latency" description="Global edge distribution" />
              <StatItem prefix="$" value="12" suffix="M+" label="Pipeline Handled" description="CRM simulation scale" />
            </StatsBand>
          </section>

          {/* SECTION 4: PRICING */}
          <section id="pricing" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <ShieldCheck className="h-6 w-6 text-highlight" />
                <span>Pricing Matrix</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Pricing tier cards with monthly/yearly interval toggles, feature checklists, and prominent popular tier highlights.
              </p>
            </div>

            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setBillingInterval('monthly')}
                  className={`rounded-md px-3 py-1.5 font-semibold transition-colors cursor-pointer ${
                    billingInterval === 'monthly'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingInterval('yearly')}
                  className={`rounded-md px-3 py-1.5 font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    billingInterval === 'yearly'
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>Annual Billing</span>
                  <Badge variant="highlight" className="text-[10px] py-0 px-1 font-mono">
                    Save 20%
                  </Badge>
                </button>
              </div>
            </div>

            <PricingGrid columns={3}>
              <PricingCard
                name="Starter"
                description="For solo developers and prototypes"
                price={billingInterval === 'yearly' ? 19 : 24}
                period="/mo"
                ctaText="Start Free"
                ctaVariant="outline"
                features={[
                  { text: 'Up to 3 workspaces' },
                  { text: 'Core UI component library' },
                  { text: 'OKLCH Design Tokens' },
                  { text: 'Custom domains', included: false },
                  { text: '24/7 Priority SLA', included: false },
                ]}
              />

              <PricingCard
                name="Professional"
                description="For growing engineering teams"
                price={billingInterval === 'yearly' ? 49 : 59}
                period="/seat/mo"
                popular
                badge="Most Popular"
                ctaText="Upgrade to Pro"
                ctaVariant="highlight"
                features={[
                  { text: 'Unlimited workspaces' },
                  { text: 'Full 75+ UI primitives & blocks' },
                  { text: 'AI Copilot drawer & chat kit' },
                  { text: 'Master Data CRUD scenarios' },
                  { text: 'Automated WCAG AA audits' },
                ]}
              />

              <PricingCard
                name="Enterprise"
                description="Custom architecture & dedicated SLA"
                price="Custom"
                period=""
                ctaText="Contact Sales"
                ctaVariant="outline"
                features={[
                  { text: 'Custom OKLCH brand palette' },
                  { text: 'Okta SAML SCIM SSO' },
                  { text: 'SOC2 Type II security report' },
                  { text: 'Dedicated solutions engineer' },
                  { text: '99.99% Uptime guarantee' },
                ]}
              />
            </PricingGrid>
          </section>

          {/* SECTION 5: TESTIMONIALS */}
          <section id="testimonials" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-highlight" />
                <span>Testimonials & Social Proof</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Quotes, customer avatars, star ratings, and company attributions.
              </p>
            </div>

            <TestimonialGrid columns={3}>
              <TestimonialCard
                quote="The OKLCH tokens and art directions gave our enterprise apps a visual polish we previously couldn't achieve."
                authorName="Alex Rivera"
                authorRole="Head of Product"
                authorCompany="FinTech Velocity"
                rating={5}
              />
              <TestimonialCard
                variant="featured"
                quote="Having complete layout primitives, split resizable panels, and mega menus out of the box cut our MVP sprint by 4 weeks."
                authorName="Elena Rostova"
                authorRole="Lead Architect"
                authorCompany="CloudScale"
                rating={5}
              />
              <TestimonialCard
                quote="The accessibility compliance with Radix primitives and automated contrast tests gives us total peace of mind."
                authorName="Marcus Chen"
                authorRole="Engineering VP"
                authorCompany="OmniDesk"
                rating={5}
              />
            </TestimonialGrid>
          </section>

          {/* SECTION 6: LOGO CLOUD */}
          <section id="logos" className="space-y-4 scroll-mt-20">
            <Card>
              <CardContent className="p-6">
                <LogoCloud title="Engineered for teams shipping modern fullstack applications">
                  <LogoItem name="ACME CORP" />
                  <LogoItem name="NEBULA AI" />
                  <LogoItem name="PULSE LABS" />
                  <LogoItem name="GLOBAL METRICS" />
                  <LogoItem name="APEX STACK" />
                </LogoCloud>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 6.5: STATEMENT & DOT PATTERN */}
          <section id="statement" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-highlight" />
                <span>Statement Cards & Dot Pattern</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Atmospheric marketing surfaces — statement cards with glow, gradient, and glass variants, plus a decarative dot-pattern backdrop.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatementCard variant="neon" glow padding="lg">
                <h3 className="text-2xl font-extrabold font-display text-foreground mb-2">
                  Design systems are code, not mood boards.
                </h3>
                <p className="statement-muted text-sm text-muted-foreground leading-relaxed">
                  Every decision is a token, every token is audited, every audit ships in CI.
                </p>
              </StatementCard>
              <StatementCard variant="inverted" padding="lg">
                <h3 className="text-2xl font-extrabold font-display mb-2">
                  Perceptual color, guaranteed contrast.
                </h3>
                <p className="statement-muted text-sm text-background/70 leading-relaxed">
                  OKLCH keeps hue stable while lightness moves — so AA/AAA is a property of the system, not a fluke of the design.
                </p>
              </StatementCard>
            </div>
            <Card>
              <CardContent className="p-6">
                <div className="relative overflow-hidden rounded-2xl border border-border bg-muted/20 p-8 sm:p-12 min-h-[180px] flex items-center justify-center">
                  <DotPattern
                    width={18}
                    height={18}
                    cx={1}
                    cy={1}
                    cr={1}
                    className="opacity-40"
                  />
                  <p className="relative z-10 text-sm font-mono text-muted-foreground">
                    DotPattern · GridPattern · GlowOrb — decorative primitives
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 7: CTA BAND */}
          <section id="cta" className="space-y-4 scroll-mt-20">
            <CtaBand
              variant="glow"
              badge="Ready to Build"
              title="Supercharge your product velocity today"
              description="Deploy a production-grade fullstack monorepo with verified WCAG contrast tokens, Tailwind CSS v4, and ready-to-use UX scenario recipes."
              actions={
                <>
                  <Button size="lg" variant="highlight" className="gap-2 shadow-md">
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button size="lg" variant="outline">
                    Browse Showcase
                  </Button>
                </>
              }
            />
          </section>

          {/* SECTION 8: FAQ */}
          <section id="faq" className="space-y-4 scroll-mt-20">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground font-display flex items-center gap-2">
                <Code2 className="h-6 w-6 text-highlight" />
                <span>FAQ Accordion</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Expandable questions and answers with accessible keyboard control.
              </p>
            </div>

            <Card>
              <CardContent className="p-6">
                <FaqSection
                  items={[
                    {
                      question: 'How do OKLCH tokens differ from traditional RGB/HSL color spaces?',
                      answer:
                        'OKLCH provides perceptual uniformity, ensuring that lightness and chroma remain consistent across hues. This makes automatic light/dark mode transformations and WCAG contrast guarantees mathematical and reliable.',
                    },
                    {
                      question: 'Can I compose the MegaMenu with custom server components?',
                      answer:
                        'Yes. MegaMenu is built on Radix NavigationMenu, allowing custom grid layouts, links, and featured cards with complete keyboard and screen reader accessibility.',
                    },
                    {
                      question: 'How does the Resizable Panel handle responsive viewports?',
                      answer:
                        'On desktop viewports it provides interactive drag handles with keyboard support; on mobile screens it gracefully stacks or transitions into master-detail views without layout crushing.',
                    },
                    {
                      question: 'Are all components compatible with React 19 and Next.js 15?',
                      answer:
                        'All components are engineered for React 19 and Next.js 15 App Router, supporting Server Components first with client interactivity only when needed.',
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Sticky Table of Contents Sidebar */}
        <div className="hidden xl:block xl:col-span-3 sticky top-20">
          <Card className="p-4 bg-card/60 backdrop-blur-sm border-border">
            <TableOfContents headings={tocHeadings} title="Marketing Sections" />
          </Card>
        </div>
      </div>
    </div>
  );
}
