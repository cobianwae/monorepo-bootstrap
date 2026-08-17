import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionNumber } from './section-number';
import { StatementCard } from './statement-card';
import { DotPattern } from './dot-pattern';
import { GridPattern } from './grid-pattern';
import { GlowOrb } from './glow-orb';
import { GradientText } from './gradient-text';
import { TableOfContents } from '../navigation/toc';

describe('Marketing & Decorative Primitives', () => {
  describe('SectionNumber', () => {
    it('pads numeric numbers and renders an optional label', () => {
      render(<SectionNumber number={3} label="Overview" />);
      expect(screen.getByText('03')).toBeDefined();
      expect(screen.getByText('Overview')).toBeDefined();
    });

    it('renders string numbers as-is', () => {
      render(<SectionNumber number="A" />);
      expect(screen.getByText('A')).toBeDefined();
    });
  });

  describe('StatementCard', () => {
    it('renders children inside the card', () => {
      render(<StatementCard variant="neon">Statement text</StatementCard>);
      expect(screen.getByText('Statement text')).toBeDefined();
    });

    it('renders a decorative glow element when glow is enabled', () => {
      const { container } = render(<StatementCard glow>Glowing</StatementCard>);
      expect(container.querySelector('[aria-hidden="true"]')).toBeDefined();
    });
  });

  describe('DotPattern', () => {
    it('renders an svg pattern', () => {
      const { container } = render(<DotPattern />);
      expect(container.querySelector('svg')).toBeDefined();
    });
  });

  describe('GridPattern', () => {
    it('renders an svg pattern with aria-hidden', () => {
      const { container } = render(<GridPattern />);
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });
  });

  describe('GlowOrb', () => {
    it('renders a blurred decorative circle', () => {
      const { container } = render(<GlowOrb color="primary" size="sm" />);
      expect(container.querySelector('.rounded-full')).toBeDefined();
    });
  });

  describe('GradientText', () => {
    it('renders children in a span by default', () => {
      render(<GradientText>Glow</GradientText>);
      expect(screen.getByText('Glow')).toBeDefined();
    });

    it('renders with a custom element', () => {
      const { container } = render(<GradientText as="h2">Heading</GradientText>);
      expect(container.querySelector('h2')?.textContent).toBe('Heading');
    });
  });

  describe('TableOfContents', () => {
    it('renders headings as anchor links with controlled active id', () => {
      render(
        <TableOfContents
          headings={[
            { id: 'intro', text: 'Introduction', level: 2 },
            { id: 'usage', text: 'Usage', level: 3 },
          ]}
          activeId="usage"
        />
      );

      const introLink = screen.getByText('Introduction').closest('a');
      const usageLink = screen.getByText('Usage').closest('a');
      expect(introLink?.getAttribute('href')).toBe('#intro');
      expect(usageLink?.getAttribute('href')).toBe('#usage');
      expect(usageLink?.textContent).toBe('Usage');
    });

    it('returns null when there are no headings', () => {
      const { container } = render(<TableOfContents headings={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });
});