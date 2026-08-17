import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sparkles } from 'lucide-react';
import { Hero, HeroEyebrow, HeroTitle, HeroDescription, HeroActions } from './hero';
import { FeatureGrid, FeatureCard } from './feature-grid';
import { PricingCard, PricingGrid } from './pricing';
import { TestimonialCard, TestimonialGrid } from './testimonial';
import { LogoCloud, LogoItem } from './logo-cloud';
import { CtaBand } from './cta-band';
import { FaqSection } from './faq';
import { StatsBand, StatItem } from './stats-band';

describe('Marketing Blocks', () => {
  describe('Hero', () => {
    it('renders hero with eyebrow, title, description, and actions', () => {
      render(
        <Hero variant="centered">
          <HeroEyebrow icon={Sparkles}>New Release v2.0</HeroEyebrow>
          <HeroTitle gradient>Build Modern Apps</HeroTitle>
          <HeroDescription>Production-ready design system monorepo.</HeroDescription>
          <HeroActions>
            <button>Get Started</button>
          </HeroActions>
        </Hero>
      );

      expect(screen.getByText('New Release v2.0')).toBeDefined();
      expect(screen.getByText('Build Modern Apps')).toBeDefined();
      expect(screen.getByText('Production-ready design system monorepo.')).toBeDefined();
      expect(screen.getByText('Get Started')).toBeDefined();
    });
  });

  describe('FeatureGrid & FeatureCard', () => {
    it('renders feature grid with cards', () => {
      render(
        <FeatureGrid columns={3}>
          <FeatureCard
            icon={Sparkles}
            badge="AI Powered"
            title="Smart Workflows"
            description="Automate repetitive CRM actions."
            href="/features/ai"
          />
        </FeatureGrid>
      );

      expect(screen.getByText('AI Powered')).toBeDefined();
      expect(screen.getByText('Smart Workflows')).toBeDefined();
      expect(screen.getByText('Automate repetitive CRM actions.')).toBeDefined();
      expect(screen.getByText('Learn more')).toBeDefined();
    });
  });

  describe('PricingCard & PricingGrid', () => {
    it('renders pricing card with features and CTA', () => {
      render(
        <PricingGrid columns={2}>
          <PricingCard
            name="Pro Plan"
            description="For high-growth teams"
            price={49}
            period="/seat/mo"
            popular
            features={[
              { text: 'Unlimited workspaces', included: true },
              { text: 'Custom domain', included: true },
              { text: 'Dedicated support', included: false },
            ]}
          />
        </PricingGrid>
      );

      expect(screen.getByText('Pro Plan')).toBeDefined();
      expect(screen.getByText('For high-growth teams')).toBeDefined();
      expect(screen.getByText('$49')).toBeDefined();
      expect(screen.getByText('Most Popular')).toBeDefined();
      expect(screen.getByText('Unlimited workspaces')).toBeDefined();
    });
  });

  describe('TestimonialCard', () => {
    it('renders testimonial with quote, author, and rating', () => {
      render(
        <TestimonialGrid columns={2}>
          <TestimonialCard
            quote="This design system transformed our engineering velocity."
            authorName="Sarah Connor"
            authorRole="VP Engineering"
            authorCompany="Cyberdyne"
            rating={5}
          />
        </TestimonialGrid>
      );

      expect(
        screen.getByText('“This design system transformed our engineering velocity.”')
      ).toBeDefined();
      expect(screen.getByText('Sarah Connor')).toBeDefined();
      expect(screen.getByText(/VP Engineering/)).toBeDefined();
    });
  });

  describe('LogoCloud', () => {
    it('renders logo cloud title and items', () => {
      render(
        <LogoCloud title="Backed by leading tech companies">
          <LogoItem name="Acme Corp" />
          <LogoItem name="GlobalTech" />
        </LogoCloud>
      );

      expect(screen.getByText('Backed by leading tech companies')).toBeDefined();
      expect(screen.getByText('Acme Corp')).toBeDefined();
      expect(screen.getByText('GlobalTech')).toBeDefined();
    });
  });

  describe('CtaBand', () => {
    it('renders CTA band with title and actions', () => {
      render(
        <CtaBand
          badge="Instant Deployment"
          title="Ready to supercharge your design workflow?"
          description="Join thousands of engineers today."
          actions={<button>Start Free Trial</button>}
        />
      );

      expect(screen.getByText('Instant Deployment')).toBeDefined();
      expect(
        screen.getByText('Ready to supercharge your design workflow?')
      ).toBeDefined();
      expect(screen.getByText('Start Free Trial')).toBeDefined();
    });
  });

  describe('FaqSection', () => {
    it('renders FAQ questions in accordion', () => {
      render(
        <FaqSection
          items={[
            { question: 'Is it accessible?', answer: 'Yes, full WCAG AA compliance.' },
            { question: 'Does it support dark mode?', answer: 'Yes, with OKLCH parity.' },
          ]}
        />
      );

      expect(screen.getByText('Is it accessible?')).toBeDefined();
      expect(screen.getByText('Does it support dark mode?')).toBeDefined();
    });
  });

  describe('StatsBand & StatItem', () => {
    it('renders stats items with prefix and suffix', () => {
      render(
        <StatsBand variant="card" columns={2}>
          <StatItem value="99.9" suffix="%" label="Uptime SLA" />
          <StatItem prefix="$" value="10" suffix="M+" label="Processed" />
        </StatsBand>
      );

      expect(screen.getByText('99.9')).toBeDefined();
      expect(screen.getByText('Uptime SLA')).toBeDefined();
      expect(screen.getByText('Processed')).toBeDefined();
    });
  });
});
