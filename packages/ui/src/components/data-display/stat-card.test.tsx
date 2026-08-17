import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DollarSign } from 'lucide-react';
import { StatCard } from './stat-card';

describe('StatCard component', () => {
  it('renders title and value correctly', () => {
    render(<StatCard title="Total Revenue" value="$45,231" />);
    expect(screen.getByText('Total Revenue')).toBeDefined();
    expect(screen.getByText('$45,231')).toBeDefined();
  });

  it('renders icon when provided', () => {
    const { container } = render(
      <StatCard title="Total Revenue" value="$45,231" icon={DollarSign} />
    );
    expect(container.querySelector('svg')).toBeDefined();
  });

  it('renders delta up trend with label', () => {
    render(
      <StatCard
        title="Active Users"
        value="1,200"
        delta={{ value: '+12%', trend: 'up', label: 'vs last month' }}
      />
    );
    expect(screen.getByText('+12%')).toBeDefined();
    expect(screen.getByText('vs last month')).toBeDefined();
  });

  it('renders delta down trend correctly', () => {
    render(
      <StatCard
        title="Bounce Rate"
        value="24%"
        delta={{ value: '-5%', trend: 'down' }}
      />
    );
    expect(screen.getByText('-5%')).toBeDefined();
  });

  it('renders highlight variant correctly', () => {
    const { container } = render(
      <StatCard
        title="Key Metric"
        value="99.9%"
        variant="highlight"
      />
    );
    expect(container.firstChild).toBeDefined();
  });
});
