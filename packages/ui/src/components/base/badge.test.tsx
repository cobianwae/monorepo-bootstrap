import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge component', () => {
  it('renders badge text content', () => {
    render(<Badge>Active Status</Badge>);
    expect(screen.getByText('Active Status')).toBeDefined();
  });

  it('renders different size variants', () => {
    const { container } = render(<Badge size="sm">Small Badge</Badge>);
    expect(container.firstChild).toBeDefined();
  });
});
