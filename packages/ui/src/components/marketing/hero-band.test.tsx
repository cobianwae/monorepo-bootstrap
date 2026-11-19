import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sparkles } from 'lucide-react';
import { HeroBand } from './hero-band';

describe('HeroBand', () => {
  it('renders eyebrow, title, description, and actions', () => {
    render(
      <HeroBand
        eyebrow="TAILWIND V4 + RADIX + OKLCH"
        eyebrowIcon={Sparkles}
        title="Engineering Artistry"
        description="A character-rich design system."
        actions={<button>Get Started</button>}
      />
    );

    expect(screen.getByText('TAILWIND V4 + RADIX + OKLCH')).toBeDefined();
    expect(screen.getByText('Engineering Artistry')).toBeDefined();
    expect(screen.getByText('A character-rich design system.')).toBeDefined();
    expect(screen.getByText('Get Started')).toBeDefined();
  });

  it('renders heading as an h1 with display font', () => {
    render(<HeroBand title="Hello Band" />);
    const heading = screen.getByRole('heading', { level: 1, name: 'Hello Band' });
    expect(heading).toBeDefined();
  });
});
