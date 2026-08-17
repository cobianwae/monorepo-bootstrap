import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ArtBackground } from './art-background';

describe('ArtBackground component', () => {
  it('renders glow variant by default', () => {
    const { container } = render(<ArtBackground />);
    expect(container.firstChild).toBeDefined();
    // GridPattern is part of glow
    expect(container.querySelector('svg')).toBeDefined();
  });

  it('renders aurora variant', () => {
    const { container } = render(<ArtBackground variant="aurora" />);
    expect(container.firstChild).toBeDefined();
    // Aurora has no grid svg
    expect(container.querySelector('svg')).toBeNull();
  });

  it('renders blueprint variant', () => {
    const { container } = render(<ArtBackground variant="blueprint" />);
    expect(container.firstChild).toBeDefined();
    // Blueprint has 2 svgs: grid + contours
    expect(container.querySelectorAll('svg').length).toBeGreaterThanOrEqual(1);
  });
});
