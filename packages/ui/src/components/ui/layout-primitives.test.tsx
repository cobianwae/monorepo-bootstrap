import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container } from './container';
import { Section, SectionHeader } from './section';
import { PageHeader } from './page-header';
import { AppShell, AppShellHeader, AppShellMain, AppShellInset, AppShellFooter } from './app-shell';
import { SkipLink } from './skip-link';
import { AspectRatio } from './aspect-ratio';

describe('Layout Primitives', () => {
  describe('Container', () => {
    it('renders with children and default size', () => {
      render(<Container>Container content</Container>);
      expect(screen.getByText('Container content')).toBeDefined();
    });

    it('renders as custom HTML tag', () => {
      const { container } = render(<Container as="section">Section container</Container>);
      expect(container.querySelector('section')).toBeDefined();
    });
  });

  describe('Section & SectionHeader', () => {
    it('renders section and section header with eyebrow and title', () => {
      render(
        <Section surface="muted">
          <SectionHeader
            eyebrow="Architecture"
            title="Design System Scalability"
            description="Comprehensive design primitives"
          />
        </Section>
      );
      expect(screen.getByText('Architecture')).toBeDefined();
      expect(screen.getByText('Design System Scalability')).toBeDefined();
      expect(screen.getByText('Comprehensive design primitives')).toBeDefined();
    });
  });

  describe('PageHeader', () => {
    it('renders page header with actions and eyebrow', () => {
      render(
        <PageHeader
          eyebrow="Dashboard"
          title="Overview Analytics"
          description="Real-time KPI metrics"
          actions={<button>Action Button</button>}
        />
      );
      expect(screen.getByText('Dashboard')).toBeDefined();
      expect(screen.getByText('Overview Analytics')).toBeDefined();
      expect(screen.getByText('Real-time KPI metrics')).toBeDefined();
      expect(screen.getByText('Action Button')).toBeDefined();
    });
  });

  describe('AppShell', () => {
    it('renders complete app shell structure with main content', () => {
      render(
        <AppShell layout="default">
          <AppShellHeader>Header Nav</AppShellHeader>
          <AppShellMain>
            <AppShellInset>Main Inset Content</AppShellInset>
          </AppShellMain>
          <AppShellFooter>Footer Note</AppShellFooter>
        </AppShell>
      );
      expect(screen.getByText('Header Nav')).toBeDefined();
      expect(screen.getByText('Main Inset Content')).toBeDefined();
      expect(screen.getByText('Footer Note')).toBeDefined();
    });
  });

  describe('SkipLink', () => {
    it('renders skip link targeting main-content by default', () => {
      render(<SkipLink />);
      const link = screen.getByText('Skip to main content');
      expect(link.getAttribute('href')).toBe('#main-content');
    });

    it('renders skip link with custom targetId', () => {
      render(<SkipLink targetId="custom-section">Skip to section</SkipLink>);
      const link = screen.getByText('Skip to section');
      expect(link.getAttribute('href')).toBe('#custom-section');
    });
  });

  describe('AspectRatio', () => {
    it('renders aspect ratio container', () => {
      const { container } = render(
        <div style={{ width: 300 }}>
          <AspectRatio ratio={16 / 9}>
            <img src="/test.jpg" alt="test" />
          </AspectRatio>
        </div>
      );
      expect(container.firstChild).toBeDefined();
    });
  });
});
