/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ImportWizardPage from './page';
import { ONCOMPLETE_RECIPE } from './_components/demo-panel';

beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

async function goToValidation() {
  fireEvent.change(screen.getByTestId('iw-paste'), {
    target: { value: 'Full name,Email\nBudi,budi@example.com\n' },
  });
  fireEvent.click(screen.getByTestId('iw-paste-submit'));
  for (const name of ['Map columns', 'Validate data']) {
    await waitFor(() => expect(screen.getByTestId('iw-next').getAttribute('aria-disabled')).toBe('false'));
    await act(async () => {
      fireEvent.click(screen.getByTestId('iw-next'));
    });
    await screen.findByRole('heading', { level: 3, name });
  }
}

function mockClipboard(writeText: () => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
}

describe('Import Wizard — hierarki, preview, dan recipe (CR-080)', () => {
  it('heading berurutan: h1, section h2, langkah h3', () => {
    const { container } = render(<ImportWizardPage />);
    const outline = [...container.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(
      (node) => `${node.tagName.toLowerCase()} ${node.textContent}`
    );
    expect(outline).toEqual([
      'h1 CSV Import Wizard',
      'h2 Import members',
      'h3 Upload CSV file',
      'h2 Demo panel',
      'h2 Integration sketch',
    ]);
  });

  it('preview berada dalam region yang bisa difokus; footer di luar scroller', async () => {
    render(<ImportWizardPage />);
    await goToValidation();
    const scroller = screen.getByRole('region', { name: 'Validation preview' });
    expect(scroller.getAttribute('tabindex')).toBe('0');
    expect(scroller.contains(screen.getByTestId('iw-validation-table'))).toBe(true);
    expect(scroller.contains(screen.getByTestId('iw-next'))).toBe(false);
  });

  it('filter tanpa hasil bisa dipulihkan dan fokus pindah ke filter All', async () => {
    render(<ImportWizardPage />);
    await goToValidation();
    fireEvent.click(screen.getByTestId('iw-filter-error'));
    expect(screen.getByTestId('iw-filter-empty').textContent).toContain('No rows with errors');
    fireEvent.click(screen.getByRole('button', { name: 'Show all rows' }));
    expect(screen.getByTestId('iw-validation-table')).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByTestId('iw-filter-all'));
  });

  it('recipe memberi feedback English saat clipboard berhasil', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    render(<ImportWizardPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(await screen.findByText('Copied')).toBeTruthy();
    expect(writeText).toHaveBeenCalledWith(ONCOMPLETE_RECIPE);
  });

  it('recipe memberi feedback English saat clipboard gagal', async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    const { container } = render(<ImportWizardPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Copy code' }));
    expect(await screen.findByText('Copy failed')).toBeTruthy();
    expect(container.textContent).not.toContain('Salin');
  });
});
