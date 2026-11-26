/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ImportWizardPage from './page';

const CSV_VALID = 'Nama Lengkap,Email\nBudi,budi@contoh.id\n';

beforeAll(() => {
  // Radix (RadioGroup) memakai ResizeObserver yang tidak tersedia di jsdom.
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

describe('ImportWizardPage', () => {
  it('memulai di langkah 1 dengan judul dan live region', () => {
    render(<ImportWizardPage />);
    expect(screen.getByRole('heading', { level: 2, name: 'Upload CSV file' })).toBeTruthy();
    expect(screen.getByTestId('iw-live').textContent).toBe('Step 1 of 4: Upload CSV file');
    expect(screen.getByTestId('iw-next').getAttribute('aria-disabled')).toBe('true');
  });

  it('Lanjut terkunci memindahkan fokus ke alasan gate', () => {
    render(<ImportWizardPage />);
    fireEvent.click(screen.getByTestId('iw-next'));
    expect(document.activeElement).toBe(screen.getByTestId('iw-gate-reason'));
  });

  it('tempel CSV valid membuka langkah mapping dengan fokus ke judul', async () => {
    render(<ImportWizardPage />);
    fireEvent.change(screen.getByTestId('iw-paste'), { target: { value: CSV_VALID } });
    fireEvent.click(screen.getByTestId('iw-paste-submit'));

    await waitFor(() =>
      expect(screen.getByTestId('iw-next').getAttribute('aria-disabled')).toBe('false')
    );

    await act(async () => {
      fireEvent.click(screen.getByTestId('iw-next'));
    });

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2, name: 'Map columns' })).toBeTruthy()
    );
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2, name: 'Map columns' }));
    expect(screen.getByTestId('iw-live').textContent).toBe('Step 2 of 4: Map columns');
    expect(screen.getByTestId('iw-mapping-row-Nama Lengkap')).toBeTruthy();
    expect(screen.queryByTestId('iw-missing')).toBeNull();
  });

  it('kembali dari mapping mempertahankan teks tempel', async () => {
    render(<ImportWizardPage />);
    fireEvent.change(screen.getByTestId('iw-paste'), { target: { value: CSV_VALID } });
    fireEvent.click(screen.getByTestId('iw-paste-submit'));
    await waitFor(() =>
      expect(screen.getByTestId('iw-next').getAttribute('aria-disabled')).toBe('false')
    );
    await act(async () => {
      fireEvent.click(screen.getByTestId('iw-next'));
    });
    await waitFor(() => expect(screen.getByTestId('iw-live').textContent).toContain('Step 2'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('iw-back'));
    });

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2, name: 'Upload CSV file' })).toBeTruthy()
    );
    expect((screen.getByTestId('iw-paste') as HTMLTextAreaElement).value).toBe(CSV_VALID);
  });
});
