/**
 * @vitest-environment jsdom
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { SubmitPlan } from '../_lib/submit';
import { ConfirmStep } from './confirm-step';
import { UploadStep } from './upload-step';

function renderUpload() {
  const fileInputRef = React.createRef<HTMLInputElement>();
  render(
    <UploadStep
      files={[]}
      onFiles={vi.fn()}
      pasteText=""
      onPasteChange={vi.fn()}
      onProcessPaste={vi.fn()}
      pasteNotice={null}
      delimiter="auto"
      onDelimiterChange={vi.fn()}
      parsing={false}
      parsed={null}
      fileInputRef={fileInputRef}
      onDownloadTemplate={vi.fn()}
    />
  );
}

describe('Import Wizard — asosiasi aksesibilitas (CR-077)', () => {
  it('label "Berkas CSV" terhubung ke input file native', () => {
    renderUpload();
    const input = screen.getByLabelText('Berkas CSV');
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect((input as HTMLInputElement).type).toBe('file');
  });

  it('gate submit yang ditolak menunjuk alasan lewat aria-describedby', () => {
    const plan: SubmitPlan = {
      valid: 0,
      failedRows: 1,
      skipped: 0,
      canSubmit: false,
      reason: 'Masih ada 1 baris error. Perbaiki di langkah validasi atau pilih "Dilewati".',
    };
    render(
      <ConfirmStep
        plan={plan}
        policy="fail"
        onPolicyChange={vi.fn()}
        onSubmit={vi.fn()}
        rejection={null}
        summaryRef={React.createRef<HTMLDivElement>()}
        result={null}
        onRestart={vi.fn()}
      />
    );
    const submit = screen.getByTestId('iw-submit');
    const describedBy = submit.getAttribute('aria-describedby');
    expect(describedBy).toBe('iw-gate-reason');
    expect(document.getElementById('iw-gate-reason')?.textContent).toContain('baris error');
    expect(submit.getAttribute('aria-disabled')).toBe('true');
  });

  it('ringkasan menerima fokus programatik dan tampil ring saat focus-visible', () => {
    const plan: SubmitPlan = { valid: 2, failedRows: 0, skipped: 0, canSubmit: true };
    render(
      <ConfirmStep
        plan={plan}
        policy="skip"
        onPolicyChange={vi.fn()}
        onSubmit={vi.fn()}
        rejection={null}
        summaryRef={React.createRef<HTMLDivElement>()}
        result={null}
        onRestart={vi.fn()}
      />
    );
    const summary = screen.getByTestId('iw-summary');
    expect(summary.getAttribute('tabindex')).toBe('-1');
    expect(summary.className).toContain('focus-visible:ring-2');
  });
});
