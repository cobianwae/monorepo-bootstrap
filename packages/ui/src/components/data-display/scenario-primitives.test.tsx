import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Home, BarChart3 } from 'lucide-react';
import { PageShell } from '../layout/page-shell';
import { DemoSection } from '../layout/demo-section';
import { PageSkeleton } from '../layout/page-skeleton';
import { ErrorPage } from '../feedback/error-page';
import { MetricTilesCard } from './metric-tiles-card';
import { ChartA11yTable } from './chart-a11y-table';
import { SidebarNav } from '../navigation/sidebar-nav';
import { SidebarUserStatus } from '../navigation/sidebar-user-status';
import { SidebarProvider } from '../navigation/sidebar';

describe('Scenario Primitives', () => {
  describe('PageShell', () => {
    it('renders a page header and content', () => {
      render(
        <PageShell
          eyebrow="Overview"
          title="Dashboard"
          description="Metrics at a glance"
        >
          <div>Content area</div>
        </PageShell>
      );
      expect(screen.getByText('Dashboard')).toBeDefined();
      expect(screen.getByText('Metrics at a glance')).toBeDefined();
      expect(screen.getByText('Content area')).toBeDefined();
    });
  });

  describe('DemoSection', () => {
    it('renders label, description and children', () => {
      render(
        <DemoSection label="Variants" description="All styles">
          <p>Demo content</p>
        </DemoSection>
      );
      expect(screen.getByText('Variants')).toBeDefined();
      expect(screen.getByText('All styles')).toBeDefined();
      expect(screen.getByText('Demo content')).toBeDefined();
    });
  });

  describe('PageSkeleton', () => {
    it('renders header skeletons and the requested number of cards', () => {
      const { container } = render(<PageSkeleton cards={3} />);
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThanOrEqual(8);
    });

    it('hides header when showHeader is false', () => {
      const { container } = render(<PageSkeleton cards={1} showHeader={false} />);
      expect(container.querySelectorAll('.animate-pulse').length).toBe(5);
    });
  });

  describe('ErrorPage', () => {
    it('renders default copy and an error message', () => {
      render(<ErrorPage error={new Error('boom')} />);
      expect(screen.getByText('Terjadi kesalahan')).toBeDefined();
      expect(screen.getByText('boom')).toBeDefined();
    });

    it('fires reset and reload handlers', () => {
      const onReset = vi.fn();
      const onReload = vi.fn();
      render(<ErrorPage onReset={onReset} onReload={onReload} />);
      fireEvent.click(screen.getByText('Coba Lagi'));
      fireEvent.click(screen.getByText('Muat Ulang'));
      expect(onReset).toHaveBeenCalledTimes(1);
      expect(onReload).toHaveBeenCalledTimes(1);
    });
  });

  describe('MetricTilesCard', () => {
    it('renders tiles and a progress section', () => {
      render(
        <MetricTilesCard
          tiles={[
            { label: 'Revenue', value: '12M', unit: 'IDR' },
            { label: 'Patients', value: 84, highlight: true },
          ]}
          progress={{ value: 65, label: 'Target', sublabel: '65%' }}
        />
      );
      expect(screen.getByText('Revenue')).toBeDefined();
      expect(screen.getByText('Patients')).toBeDefined();
      expect(screen.getByText('Target')).toBeDefined();
      expect(screen.getByText('65%')).toBeDefined();
    });
  });

  describe('ChartA11yTable', () => {
    it('renders a visually hidden table with caption and rows', () => {
      render(
        <ChartA11yTable
          caption="Revenue by month"
          columns={[
            { key: 'month', header: 'Month' },
            { key: 'value', header: 'Value' },
          ]}
          rows={[{ month: 'Jan', value: '1.2M' }]}
        />
      );
      expect(screen.getByText('Revenue by month')).toBeDefined();
      expect(screen.getByText('Month')).toBeDefined();
      expect(screen.getByText('Jan')).toBeDefined();
      expect(screen.getByText('1.2M')).toBeDefined();
    });
  });

  describe('SidebarNav', () => {
    const groups = [
      {
        label: 'Main',
        items: [
          { title: 'Home', href: '/home', icon: Home },
          { title: 'Reports', href: '/reports', icon: BarChart3, badge: '3' },
        ],
      },
    ];

    it('renders group items with active state for the matching path', () => {
      const { container } = render(
        <SidebarProvider>
          <SidebarNav groups={groups} pathname="/reports" />
        </SidebarProvider>
      );
      expect(screen.getByText('Home')).toBeDefined();
      expect(screen.getByText('Reports')).toBeDefined();
      expect(screen.getByText('3')).toBeDefined();
      const active = container.querySelector('[data-active="true"]');
      expect(active).toBeDefined();
    });

    it('supports a custom link component', () => {
      const CustomLink = ({ children, ...props }: Record<string, unknown>) => (
        <span data-custom-link {...props}>
          {children as React.ReactNode}
        </span>
      );
      const { container } = render(
        <SidebarProvider>
          <SidebarNav groups={groups} LinkComponent={CustomLink} />
        </SidebarProvider>
      );
      expect(container.querySelector('[data-custom-link]')).toBeDefined();
    });
  });

  describe('SidebarUserStatus', () => {
    const options = [
      { value: 'available', label: 'Available', dotColor: 'bg-success' },
      { value: 'away', label: 'Away', dotColor: 'bg-warning' },
    ];

    it('renders user info and triggers status change', () => {
      const onStatusChange = vi.fn();
      render(
        <SidebarUserStatus
          name="Ada Lovelace"
          roleLabel="Analyst"
          status="available"
          statusLabel="Available"
          statusOptions={options}
          onStatusChange={onStatusChange}
        />
      );
      expect(screen.getByText('Ada Lovelace')).toBeDefined();
      fireEvent.click(screen.getByLabelText('User profile and status options'));
      fireEvent.click(screen.getByText('Away'));
      expect(onStatusChange).toHaveBeenCalledWith('away');
    });
  });
});