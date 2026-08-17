import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { EmptyState } from './empty-state';
import { Skeleton } from '../base/skeleton';
import { Spinner } from '../base/spinner';

describe('Feedback Components', () => {
  describe('Alert', () => {
    it('renders title and description with alert role', () => {
      render(
        <Alert>
          <AlertTriangle />
          <AlertTitle>Heads up</AlertTitle>
          <AlertDescription>Something needs attention.</AlertDescription>
        </Alert>
      );
      expect(screen.getByRole('alert')).toBeDefined();
      expect(screen.getByText('Heads up')).toBeDefined();
      expect(screen.getByText('Something needs attention.')).toBeDefined();
    });
  });

  describe('EmptyState', () => {
    it('renders title, description and action button', () => {
      const onAction = vi.fn();
      render(
        <EmptyState
          icon={AlertTriangle}
          title="No results"
          description="Try a different filter."
          actionLabel="Reset"
          onAction={onAction}
        />
      );
      expect(screen.getByText('No results')).toBeDefined();
      expect(screen.getByText('Try a different filter.')).toBeDefined();
      fireEvent.click(screen.getByText('Reset'));
      expect(onAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('Skeleton', () => {
    it('renders a pulsing placeholder div', () => {
      const { container } = render(<Skeleton data-testid="skeleton" />);
      expect(container.querySelector('[data-testid="skeleton"]')).toBeDefined();
    });
  });

  describe('Spinner', () => {
    it('announces loading state with label', () => {
      render(<Spinner label="Saving changes" />);
      const status = screen.getByRole('status');
      expect(status.getAttribute('aria-busy')).toBe('true');
      expect(status.getAttribute('aria-label')).toBe('Saving changes');
    });

    it('shows default label when none provided', () => {
      render(<Spinner />);
      expect(screen.getByRole('status').getAttribute('aria-label')).toBe('Loading...');
    });
  });
});