/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import ImportWizardPage from './page';

const CSV_VALID = 'Nama Lengkap,Email\nBudi,budi@contoh.id\n';

beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

async function pasteAndGoTo(step: 'Map columns' | 'Validate data' | 'Confirm import') {
  fireEvent.change(screen.getByTestId('iw-paste'), { target: { value: CSV_VALID } });
  fireEvent.click(screen.getByTestId('iw-paste-submit'));
  await waitFor(() => expect(screen.getByTestId('iw-next').getAttribute('aria-disabled')).toBe('false'));
  const order = ['Map columns', 'Validate data', 'Confirm import'];
  for (let i = 0; i <= order.indexOf(step); i++) {
    await act(async () => {
      fireEvent.click(screen.getByTestId('iw-next'));
    });
    await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: order[i] })).toBeTruthy());
  }
}

describe('ImportWizardPage — alur 4 langkah', () => {
  it('langkah 3 menampilkan ringkasan validasi dan fokus ke judul', async () => {
    render(<ImportWizardPage />);
    await pasteAndGoTo('Validate data');
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2, name: 'Validate data' }));
    expect(screen.getByTestId('iw-validation-summary').textContent).toContain('1 valid');
    expect(screen.getByTestId('iw-validation-table')).toBeTruthy();
  });

  it('langkah 4 impor 1 baris valid menampilkan layar sukses', async () => {
    render(<ImportWizardPage />);
    await pasteAndGoTo('Confirm import');
    fireEvent.click(screen.getByTestId('iw-submit'));
    await waitFor(() => expect(screen.getByTestId('iw-success')).toBeTruthy());
    expect(screen.getByTestId('iw-success').textContent).toContain('1 row ready to import');
    expect(screen.getByRole('heading', { level: 2, name: 'Import ready' })).toBeTruthy();
  });

  it('panel demo dataset invalid: policy fail menolak submit dan fokus ke ringkasan', async () => {
    render(<ImportWizardPage />);
    fireEvent.click(screen.getByTestId('iw-demo-invalid'));
    await waitFor(() => expect(screen.getByTestId('iw-next').getAttribute('aria-disabled')).toBe('false'));
    for (const heading of ['Map columns', 'Validate data', 'Confirm import']) {
      await act(async () => {
        fireEvent.click(screen.getByTestId('iw-next'));
      });
      await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: heading })).toBeTruthy());
    }
    expect(screen.getByTestId('iw-summary').textContent).toContain('Skipped');
    fireEvent.click(screen.getByTestId('iw-policy-fail'));
    fireEvent.click(screen.getByTestId('iw-submit'));
    await waitFor(() => expect(screen.getByTestId('iw-reject')).toBeTruthy());
    expect(document.activeElement).toBe(screen.getByTestId('iw-summary'));
    expect(screen.queryByTestId('iw-success')).toBeNull();
  });

  it('setelah sukses, klik stepper tidak membuka form lama dan judul tetap selesai', async () => {
    render(<ImportWizardPage />);
    await pasteAndGoTo('Confirm import');
    fireEvent.click(screen.getByTestId('iw-submit'));
    await waitFor(() => expect(screen.getByTestId('iw-success')).toBeTruthy());

    const firstStep = screen.getByTestId('iw-stepper').querySelectorAll('button')[0];
    if (!firstStep) throw new Error('stepper tidak punya tombol');
    fireEvent.click(firstStep);

    expect(screen.getByTestId('iw-success')).toBeTruthy();
    expect(screen.queryByTestId('iw-paste')).toBeNull();
    expect(screen.queryByTestId('iw-mapping-row-Nama Lengkap')).toBeNull();
    expect(screen.getByRole('heading', { level: 2, name: 'Import ready' })).toBeTruthy();
  });

  it('setelah sukses, Mulai ulang kembali ke Upload tanpa hasil lama dan fokus ke judul', async () => {
    render(<ImportWizardPage />);
    await pasteAndGoTo('Confirm import');
    fireEvent.click(screen.getByTestId('iw-submit'));
    await waitFor(() => expect(screen.getByTestId('iw-success')).toBeTruthy());

    fireEvent.click(screen.getByRole('button', { name: 'Start over' }));

    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 2, name: 'Upload CSV file' })).toBeTruthy()
    );
    expect(screen.queryByTestId('iw-success')).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole('heading', { level: 2, name: 'Upload CSV file' }));
  });

  it('fail → skip: penolakan lama hilang dan ringkasan mengikuti policy baru', async () => {
    render(<ImportWizardPage />);
    fireEvent.click(screen.getByTestId('iw-demo-invalid'));
    await waitFor(() => expect(screen.getByTestId('iw-next').getAttribute('aria-disabled')).toBe('false'));
    for (const heading of ['Map columns', 'Validate data', 'Confirm import']) {
      await act(async () => {
        fireEvent.click(screen.getByTestId('iw-next'));
      });
      await waitFor(() => expect(screen.getByRole('heading', { level: 2, name: heading })).toBeTruthy());
    }
    fireEvent.click(screen.getByTestId('iw-policy-fail'));
    fireEvent.click(screen.getByTestId('iw-submit'));
    await waitFor(() => expect(screen.getByTestId('iw-reject')).toBeTruthy());

    fireEvent.click(screen.getByTestId('iw-policy-skip'));

    expect(screen.queryByTestId('iw-reject')).toBeNull();
    expect(screen.getByTestId('iw-summary').textContent).toContain('Skipped');
    expect(screen.getByTestId('iw-submit').getAttribute('aria-disabled')).toBe('false');
  });
});
