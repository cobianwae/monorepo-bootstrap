'use client';

import * as React from 'react';
import {
  Sparkles,
  ArrowRight,
  Zap,
  ShieldCheck,
  Bot,
  Database,
  Cpu,
  Layers,
  Globe,
  Code2,
  Workflow,
} from 'lucide-react';
import {
  Navbar,
  NavbarBrand,
  NavbarNav,
  NavbarLink,
  NavbarActions,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  MegaMenuGrid,
  MegaMenuGroup,
  MegaMenuGroupLabel,
  MegaMenuItem,
  MegaMenuFeaturedCard,
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
  Footer,
  FooterGrid,
  FooterColumn,
  FooterLink,
  FooterBottom,
  Button,
  Badge,
  Container,
  Banner,
} from '@ds/ui';

export default function WebHomePage() {
  const [billingInterval, setBillingInterval] = React.useState<'monthly' | 'yearly'>('monthly');

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Announcement Banner */}
      <Banner variant="highlight" actionText="Explore CRM" actionHref="http://localhost:3000/crm">
        <strong>Apex Design System v2.2:</strong> Complete Layouts, Mega Menus & Fullstack Monorepo!
      </Banner>

      {/* Main Navbar with MegaMenu */}
      <Navbar variant="default" sticky={true}>
        <NavbarBrand href="/">
          <div className="h-7 w-7 rounded-lg bg-highlight flex items-center justify-center text-highlight-foreground font-bold text-xs shadow-xs">
            DS
          </div>
          <span className="font-display font-bold text-lg">Apex Platform</span>
        </NavbarBrand>

        <NavbarNav>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Solutions</NavigationMenuTrigger>
                <MegaMenuGrid columns={3}>
                  <MegaMenuGroup>
                    <MegaMenuGroupLabel>AI Capabilities</MegaMenuGroupLabel>
                    <MegaMenuItem
                      icon={Bot}
                      title="Agent Orchestration"
                      description="Autonomous multi-agent workflows"
                      badge="Live"
                    />
                    <MegaMenuItem
                      icon={Zap}
                      title="Instant Triage"
                      description="Real-time predictive scoring"
                    />
                    <MegaMenuItem
                      icon={Cpu}
                      title="Vector Intelligence"
                      description="Semantic embeddings & search"
                    />
                  </MegaMenuGroup>

                  <MegaMenuGroup>
                    <MegaMenuGroupLabel>Architecture</MegaMenuGroupLabel>
                    <MegaMenuItem
                      icon={Database}
                      title="PostgreSQL Monorepo"
                      description="Prisma ORM multi-tenant engine"
                    />
                    <MegaMenuItem
                      icon={ShieldCheck}
                      title="Zero-Trust SCIM"
                      description="SOC2 compliant authentication"
                    />
                    <MegaMenuItem
                      icon={Globe}
                      title="Edge Global CDN"
                      description="Ultra low-latency distribution"
                    />
                  </MegaMenuGroup>

                  <MegaMenuFeaturedCard
                    badge="Interactive"
                    title="Live Showcase Suite"
                    description="Explore 25+ UX patterns, full CRM scenarios, and OKLCH color matrix."
                    href="http://localhost:3000"
                    ctaText="Open Showcase"
                  />
                </MegaMenuGrid>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>Product</NavigationMenuTrigger>
                <MegaMenuGrid columns={2}>
                  <MegaMenuGroup>
                    <MegaMenuGroupLabel>UI System</MegaMenuGroupLabel>
                    <MegaMenuItem
                      icon={Code2}
                      title="React 19 Primitives"
                      description="Radix UI + Tailwind CSS v4"
                    />
                    <MegaMenuItem
                      icon={Layers}
                      title="Layouts & Panels"
                      description="AppShell & Resizable split panes"
                    />
                  </MegaMenuGroup>
                  <MegaMenuGroup>
                    <MegaMenuGroupLabel>Design Tokens</MegaMenuGroupLabel>
                    <MegaMenuItem
                      icon={Sparkles}
                      title="OKLCH Color Space"
                      description="WCAG AA verified contrast"
                    />
                    <MegaMenuItem
                      icon={Workflow}
                      title="3 Art Directions"
                      description="Atelier, Aurora, and Blueprint"
                    />
                  </MegaMenuGroup>
                </MegaMenuGrid>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <NavbarLink href="#features">Features</NavbarLink>
          <NavbarLink href="#pricing">Pricing</NavbarLink>
        </NavbarNav>

        <NavbarActions>
          <Button size="sm" variant="outline" className="h-9 text-xs">
            Sign In
          </Button>
          <Button size="sm" variant="highlight" className="h-9 text-xs gap-1.5 shadow-sm">
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </NavbarActions>
      </Navbar>

      {/* Hero Section */}
      <Hero variant="centered" containerSize="xl">
        <HeroEyebrow icon={Sparkles}>Engineering Design Systems at Scale</HeroEyebrow>
        <HeroTitle gradient>Build Flawless Enterprise Applications</HeroTitle>
        <HeroDescription>
          A unified design system and fullstack monorepo featuring Tailwind CSS v4, OKLCH tokens, Radix UI primitives, Resizable Split Layouts, and live CRM workflows.
        </HeroDescription>
        <HeroActions>
          <Button size="lg" variant="highlight" className="gap-2 shadow-md">
            <span>Launch Showcase</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline">
            Read Architecture Docs
          </Button>
        </HeroActions>

        <HeroMedia>
          <div className="p-6 rounded-xl bg-muted/20 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <div className="h-3 w-3 rounded-full bg-warning" />
              <div className="h-3 w-3 rounded-full bg-success" />
              <span className="text-xs font-mono text-muted-foreground ml-2">apps/web consumer</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-highlight">
              <Sparkles className="h-3.5 w-3.5" />
              <span>@ds/ui & @ds/tokens integrated</span>
            </div>
          </div>
        </HeroMedia>
      </Hero>

      {/* Logo Cloud */}
      <Container size="xl" className="my-8">
        <LogoCloud title="Trusted by teams deploying modern TypeScript applications">
          <LogoItem name="ACME GLOBAL" />
          <LogoItem name="NEBULA AI" />
          <LogoItem name="PULSE LABS" />
          <LogoItem name="APEX CLOUD" />
          <LogoItem name="QUANTUM SYSTEMS" />
        </LogoCloud>
      </Container>

      {/* Features Grid */}
      <section id="features" className="py-20 sm:py-28 border-t border-border/60 bg-muted/20">
        <Container size="xl" className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="highlight" className="font-mono text-xs">
              Platform Features
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-display">
              Engineered for Velocity & Visual Cohesion
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Everything required to build, test, and ship production enterprise applications.
            </p>
          </div>

          <FeatureGrid columns={3}>
            <FeatureCard
              icon={Zap}
              badge="OKLCH"
              title="Perceptually Uniform Tokens"
              description="Mathematical light & dark mode parity with automated WCAG AA compliance auditing."
            />
            <FeatureCard
              icon={Bot}
              badge="AI Ready"
              variant="highlight"
              title="Copilot Chat Primitives"
              description="Rich message history, streaming response hooks, canned suggestions, and copy actions."
            />
            <FeatureCard
              icon={Layers}
              badge="Layout"
              title="AppShell & Resizable Panels"
              description="Split pane master-detail workspaces, responsive dvh boundaries, and accessible skip links."
            />
          </FeatureGrid>
        </Container>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 sm:py-28 border-t border-border/60">
        <Container size="xl" className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="outline" className="font-mono text-xs">
              Simple Pricing
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-display">
              Transparent Plans for Every Stage
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg">
              Start building for free or scale your enterprise team with dedicated support.
            </p>
          </div>

          <div className="flex justify-center">
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
                Monthly
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
                <span>Yearly</span>
                <Badge variant="highlight" className="text-[10px] py-0 px-1 font-mono">
                  -20%
                </Badge>
              </button>
            </div>
          </div>

          <PricingGrid columns={3}>
            <PricingCard
              name="Starter"
              description="For prototypes and solo developers"
              price={billingInterval === 'yearly' ? 19 : 24}
              period="/mo"
              ctaText="Start Free"
              ctaVariant="outline"
              features={[
                { text: 'Core 75+ UI primitives' },
                { text: 'OKLCH Design tokens' },
                { text: 'Community Discord' },
                { text: 'AI Copilot drawer', included: false },
              ]}
            />
            <PricingCard
              name="Professional"
              description="For high-growth software teams"
              price={billingInterval === 'yearly' ? 49 : 59}
              period="/seat/mo"
              popular
              badge="Most Popular"
              ctaText="Start Free Trial"
              ctaVariant="highlight"
              features={[
                { text: 'Everything in Starter' },
                { text: 'Full AI & Copilot Kit' },
                { text: 'Resizable workspace panels' },
                { text: 'Automated WCAG AA audits' },
                { text: 'Priority support SLA' },
              ]}
            />
            <PricingCard
              name="Enterprise"
              description="Custom security & dedicated SLA"
              price="Custom"
              period=""
              ctaText="Contact Sales"
              ctaVariant="outline"
              features={[
                { text: 'Custom brand tokens' },
                { text: 'Okta SAML 2.0 SCIM' },
                { text: 'SOC2 Type II compliance' },
                { text: 'Dedicated Solutions Architect' },
              ]}
            />
          </PricingGrid>
        </Container>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-28 border-t border-border/60 bg-muted/15">
        <Container size="xl" className="space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <Badge variant="highlight" className="font-mono text-xs">
              Social Proof
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground font-display">
              Loved by Engineering Leaders
            </h2>
          </div>

          <TestimonialGrid columns={3}>
            <TestimonialCard
              quote="The speed at which we deployed our CRM interface with @ds/ui layout primitives was astonishing."
              authorName="Rachel Zhang"
              authorRole="Head of Engineering"
              authorCompany="Vanguard Flow"
              rating={5}
            />
            <TestimonialCard
              variant="featured"
              quote="Having mega menus, resizable panels, and chat primitives pre-built in a single monorepo saved us months."
              authorName="Marcus Aurelius"
              authorRole="Lead Architect"
              authorCompany="Imperial Cloud"
              rating={5}
            />
            <TestimonialCard
              quote="The OKLCH tokens and art directions look stunning in both light and dark mode automatically."
              authorName="Sofia Lindqvist"
              authorRole="Design Director"
              authorCompany="Nordic Labs"
              rating={5}
            />
          </TestimonialGrid>
        </Container>
      </section>

      {/* CTA Band */}
      <div className="py-16">
        <CtaBand
          variant="glow"
          badge="Ready to Scale"
          title="Build your next application with Apex UI"
          description="A complete fullstack monorepo with verified design tokens, Radix UI components, and rich UX scenario recipes."
          actions={
            <>
              <Button size="lg" variant="highlight" className="gap-2 shadow-md">
                <span>Explore Showcase</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </>
          }
        />
      </div>

      {/* Footer */}
      <Footer variant="muted" spacing="default">
        <FooterGrid columns={4}>
          <FooterColumn title="Product">
            <FooterLink href="#">Design Tokens</FooterLink>
            <FooterLink href="#" badge="New">Components</FooterLink>
            <FooterLink href="#">UX Scenarios</FooterLink>
          </FooterColumn>
          <FooterColumn title="Architecture">
            <FooterLink href="#">Next.js 15 App Router</FooterLink>
            <FooterLink href="#">Tailwind CSS v4</FooterLink>
            <FooterLink href="#">Prisma ORM</FooterLink>
          </FooterColumn>
          <FooterColumn title="Resources">
            <FooterLink href="#" external>Documentation</FooterLink>
            <FooterLink href="#" external>GitHub Repo</FooterLink>
            <FooterLink href="#">Changelog</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="#">Privacy Policy</FooterLink>
            <FooterLink href="#">Terms of Service</FooterLink>
          </FooterColumn>
        </FooterGrid>
        <FooterBottom>
          <p>© 2026 Apex Design System. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">System Status</a>
            <a href="#" className="hover:underline">Security</a>
          </div>
        </FooterBottom>
      </Footer>
    </div>
  );
}
