import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  AreaChartComponent,
  BarChartComponent,
  LineChartComponent,
  PieChartComponent,
  Sparkline,
  ChartTooltipContent,
} from './chart';

const DATA = [
  { month: 'Jan', revenue: 1200, cost: 800 },
  { month: 'Feb', revenue: 1500, cost: 900 },
  { month: 'Mar', revenue: 1400, cost: 950 },
];

describe('chart components', () => {
  it('renders AreaChart with title', () => {
    render(<AreaChartComponent data={DATA} dataKey="revenue" xKey="month" title="Revenue" />);
    expect(screen.getByText('Revenue')).toBeDefined();
  });

  it('renders BarChart with multiple series', () => {
    render(<BarChartComponent data={DATA} dataKey={['revenue', 'cost']} xKey="month" title="P&L" />);
    expect(screen.getByText('P&L')).toBeDefined();
  });

  it('renders LineChart with stacked flag', () => {
    render(<LineChartComponent data={DATA} dataKey={['revenue']} xKey="month" title="Trend" />);
    expect(screen.getByText('Trend')).toBeDefined();
  });

  it('renders PieChart', () => {
    render(<PieChartComponent data={[{ name: 'A', value: 10 }, { name: 'B', value: 20 }]} title="Split" />);
    expect(screen.getByText('Split')).toBeDefined();
  });

  it('renders Sparkline', () => {
    const { container } = render(<Sparkline data={DATA} dataKey="revenue" />);
    expect(container.querySelector('.recharts-responsive-container')).toBeDefined();
  });

  it('ChartTooltipContent returns null when inactive', () => {
    const { container } = render(<ChartTooltipContent active={false} />);
    expect(container.firstChild).toBeNull();
  });
});