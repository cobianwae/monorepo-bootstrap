import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Tour } from './tour';

const drive = vi.fn();
const setSteps = vi.fn();
const destroy = vi.fn();
const moveNext = vi.fn();
const movePrevious = vi.fn();
const mockDriver = vi.fn((_config?: unknown) => ({ drive, setSteps, destroy, moveNext, movePrevious }));

vi.mock('driver.js', () => ({
  driver: (config?: unknown) => mockDriver(config),
}));

function fiveSteps() {
  return [1, 2, 3, 4, 5].map((n) => ({
    id: `s${n}`,
    target: `#target-${n}`,
    title: `Langkah ${n}`,
    content: `Isi ${n}`,
  }));
}

function getPassedSteps() {
  return (setSteps.mock.calls[0] as unknown[])[0] as Array<{
    scrollIntoView?: unknown;
    popover?: Record<string, unknown>;
  }>;
}

function getDriverConfig() {
  return (mockDriver.mock.calls[0] as unknown[])[0] as Record<string, unknown>;
}

describe('Tour (017-01)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('empty: tidak memanggil drive saat steps kosong', () => {
    const { container } = render(<Tour steps={[]} open={true} />);
    expect(container.firstChild).toBeNull();
    expect(mockDriver).not.toHaveBeenCalled();
  });

  it('tertutup: tidak memanggil drive saat open=false', () => {
    const { container } = render(<Tour steps={fiveSteps()} open={false} />);
    expect(container.firstChild).toBeNull();
    expect(mockDriver).not.toHaveBeenCalled();
  });

  it('AC-01: 5 langkah dikirim ke driver + progress + microcopy Indonesia', () => {
    render(<Tour steps={fiveSteps()} open={true} />);
    expect(mockDriver).toHaveBeenCalledTimes(1);
    expect(setSteps).toHaveBeenCalledTimes(1);
    const passedSteps = getPassedSteps();
    expect(passedSteps).toHaveLength(5);
    expect(passedSteps[0].popover?.title).toBe('Langkah 1');
    expect(passedSteps[0].popover?.progressText).toBe('1 dari 5');
    expect(passedSteps[4].popover?.progressText).toBe('5 dari 5');
    expect(passedSteps[4].popover?.nextBtnText).toBe('Selesai');
    expect(passedSteps[0].popover?.nextBtnText).toBe('Lanjut');
    expect(passedSteps[0].popover?.prevBtnText).toBe('Kembali');
    expect(passedSteps[0].popover?.showProgress).toBe(true);
    expect(drive).toHaveBeenCalledWith(0);
    // Announcer SR menampilkan progress
    expect(screen.getByTestId('tour-announcer').textContent).toContain('Langkah 1 dari 5');
  });

  it('AC-01 coach tunggal: progress disembunyikan + primer Selesai', () => {
    render(
      <Tour steps={[{ id: 'solo', target: '#x', title: 'Solo', content: 'Satu' }]} open={true} />
    );
    const passedSteps = getPassedSteps();
    expect(passedSteps[0].popover?.showProgress).toBe(false);
    expect(passedSteps[0].popover?.nextBtnText).toBe('Selesai');
    expect(screen.getByTestId('tour-announcer').textContent).not.toContain('dari');
  });

  it('AC-02: Kembali disabled di langkah 1 + scroll + flip config', () => {
    render(<Tour steps={fiveSteps()} open={true} />);
    const passedSteps = getPassedSteps();
    expect(passedSteps[0].popover?.disableButtons).toContain('previous');
    expect(passedSteps[1].popover?.disableButtons).not.toContain('previous');
    // scrollIntoView per langkah + smoothScroll config (flip via side undefined = auto)
    expect(passedSteps[0].scrollIntoView).toBeTruthy();
    expect(getDriverConfig().smoothScroll).toBe(true);
  });

  it('AC-03: onFinish dipanggil tepat sekali dengan status lengkap', () => {
    const onFinish = vi.fn();
    render(<Tour steps={fiveSteps()} open={true} onFinish={onFinish} />);
    const passedSteps = getPassedSteps();
    const nextAt = (i: number) =>
      (passedSteps[i].popover?.onNextClick as (() => void) | undefined)?.bind(null);
    // Maju 1→4
    act(() => {
      nextAt(0)?.();
      nextAt(1)?.();
      nextAt(2)?.();
      nextAt(3)?.();
    });
    expect(onFinish).not.toHaveBeenCalled();
    // Selesai di langkah terakhir
    act(() => {
      nextAt(4)?.();
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
    const status = (onFinish.mock.calls[0] as unknown[])[0] as Array<{
      id: string;
      index: number;
      result: string;
    }>;
    expect(status).toHaveLength(5);
    expect(status.map((s) => s.id)).toEqual(['s1', 's2', 's3', 's4', 's5']);
    // Panggil ulang tidak ganda (exactly-once)
    act(() => {
      nextAt(4)?.();
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('AC-03: onSkip dipanggil tepat sekali dengan atIndex', () => {
    const onSkip = vi.fn();
    render(<Tour steps={fiveSteps()} open={true} onSkip={onSkip} />);
    const passedSteps = getPassedSteps();
    act(() => {
      (passedSteps[0].popover?.onNextClick as (() => void) | undefined)?.();
    });
    act(() => {
      (passedSteps[1].popover?.onCloseClick as (() => void) | undefined)?.();
    });
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect((onSkip.mock.calls[0] as unknown[])[1]).toBe(1);
    expect((onSkip.mock.calls[0] as unknown[])[0] as unknown[]).toHaveLength(5);
  });
});
