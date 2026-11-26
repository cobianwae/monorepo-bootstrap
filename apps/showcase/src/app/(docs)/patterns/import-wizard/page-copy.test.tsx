/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeAll } from 'vitest';
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

async function next() {
  await waitFor(() => expect(screen.getByTestId('iw-next').getAttribute('aria-disabled')).toBe('false'));
  await act(async () => {
    fireEvent.click(screen.getByTestId('iw-next'));
  });
}

describe('Import Wizard — copy English dan kejujuran demo (CR-079)', () => {
  it('FileInput memakai copy English dan helper tidak menyiratkan hard limit', () => {
    const { container } = render(<ImportWizardPage />);
    expect(container.textContent).toContain('Click to upload');
    expect(container.textContent).toContain('or drag and drop');
    expect(container.textContent).toContain('Larger files are still processed.');
    expect(container.textContent).not.toContain('Klik untuk upload');
    expect(container.textContent).not.toContain('drag & drop');
  });

  it('format unsupported ditolak dengan recovery English', async () => {
    render(<ImportWizardPage />);
    fireEvent.click(screen.getByTestId('iw-demo-error'));
    const alert = await screen.findByTestId('iw-error');
    expect(alert.textContent).toContain('Only CSV files are supported');
    expect(alert.textContent).toContain('save the file as .csv');
    expect(screen.getByRole('button', { name: 'Remove members.xlsx' })).toBeTruthy();
    expect(screen.getByTestId('iw-next').getAttribute('aria-disabled')).toBe('true');
  });

  it('sukses disebut simulasi lokal dan hasil terakhir dilabel sebelumnya', async () => {
    render(<ImportWizardPage />);
    fireEvent.change(screen.getByTestId('iw-paste'), {
      target: { value: 'Full name,Email\nBudi,budi@example.com\n' },
    });
    fireEvent.click(screen.getByTestId('iw-paste-submit'));
    await next();
    await next();
    await next();
    expect(screen.getByTestId('iw-submit').textContent).toBe('Prepare import (1 row)');
    fireEvent.click(screen.getByTestId('iw-submit'));
    const success = await screen.findByTestId('iw-success');
    expect(success.textContent).toContain('Nothing was sent or saved.');
    expect(success.textContent).not.toContain('onComplete');
    fireEvent.click(screen.getByRole('button', { name: 'Start over' }));
    expect(screen.getByTestId('iw-demo-result').textContent).toBe(
      'Previous simulated result: 1 row, 0 skipped, 0 failed'
    );
  });

  it('sketsa integrasi tidak memakai export fiktif atau endpoint yang seolah tersedia', () => {
    expect(ONCOMPLETE_RECIPE).toContain('buildImportResult');
    expect(ONCOMPLETE_RECIPE).toContain('your application provides');
    expect(ONCOMPLETE_RECIPE).not.toContain('<ImportWizard');
    expect(ONCOMPLETE_RECIPE).not.toContain('/api/');
    expect(ONCOMPLETE_RECIPE).not.toContain('fetch(');
  });
});
