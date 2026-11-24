import { readFileSync } from 'node:fs';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Tour, isTargetVisible } from './tour';

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

/** Target DOM nyata agar lolos cek visibilitas K4; lewati id yang ingin disembunyikan. */
function renderTargets(ids: number[] = [1, 2, 3, 4, 5]) {
  render(
    <>
      {ids.map((n) => (
        <button key={n} id={`target-${n}`} type="button">
          Target {n}
        </button>
      ))}
    </>
  );
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

function nextAt(passedSteps: ReturnType<typeof getPassedSteps>, i: number) {
  return passedSteps[i].popover?.onNextClick as (() => void) | undefined;
}

function closeAt(passedSteps: ReturnType<typeof getPassedSteps>, i: number) {
  return passedSteps[i].popover?.onCloseClick as (() => void) | undefined;
}

const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 250)); });

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
}

/** CR-018: bedakan query responsif <md (§5) dari reduced-motion (K5). */
function mockMediaQuery(opts: { narrow?: boolean; reduced?: boolean } = {}) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes('767px') ? !!opts.narrow : !!opts.reduced,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
}

describe('Tour (017-01 fondasi)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  it('empty: status + Mulai tur disabled, tanpa drive', () => {
    render(<Tour steps={[]} open={true} />);
    expect(screen.getByTestId('tour-empty').getAttribute('role')).toBe('status');
    expect(screen.getByTestId('tour-empty').textContent).toContain('Belum ada langkah');
    expect(screen.getByText('Mulai tur').hasAttribute('disabled')).toBe(true);
    expect(mockDriver).not.toHaveBeenCalled();
  });

  it('tertutup: tidak memanggil drive saat open=false', () => {
    const { container } = render(<Tour steps={fiveSteps()} open={false} />);
    expect(container.firstChild).toBeNull();
    expect(mockDriver).not.toHaveBeenCalled();
  });

  it('AC-01: 5 langkah dikirim ke driver + progress + microcopy Indonesia', async () => {
    renderTargets();
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
    await settle();
    expect(screen.getByTestId('tour-announcer').textContent).toContain('Langkah 1 dari 5');
  });

  it('AC-01 coach tunggal: progress disembunyikan + primer Selesai', async () => {
    renderTargets([1]);
    render(
      <Tour steps={[{ id: 'solo', target: '#target-1', title: 'Solo', content: 'Satu' }]} open={true} />
    );
    const passedSteps = getPassedSteps();
    expect(passedSteps[0].popover?.showProgress).toBe(false);
    expect(passedSteps[0].popover?.nextBtnText).toBe('Selesai');
    await settle();
    expect(screen.getByTestId('tour-announcer').textContent).not.toContain('dari');
  });

  it('AC-02: Kembali disabled di langkah 1 + scroll + flip config', () => {
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} />);
    const passedSteps = getPassedSteps();
    expect(passedSteps[0].popover?.disableButtons).toContain('previous');
    expect(passedSteps[1].popover?.disableButtons).not.toContain('previous');
    expect(passedSteps[0].scrollIntoView).toBeTruthy();
    expect(getDriverConfig().smoothScroll).toBe(true);
  });

  it('AC-03 lama: onFinish dipanggil tepat sekali dengan status lengkap', async () => {
    const onFinish = vi.fn();
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} onFinish={onFinish} />);
    const passedSteps = getPassedSteps();
    act(() => {
      nextAt(passedSteps, 0)?.();
      nextAt(passedSteps, 1)?.();
      nextAt(passedSteps, 2)?.();
      nextAt(passedSteps, 3)?.();
    });
    expect(onFinish).not.toHaveBeenCalled();
    act(() => {
      nextAt(passedSteps, 4)?.();
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
    const status = (onFinish.mock.calls[0] as unknown[])[0] as Array<{
      id: string;
      index: number;
      result: string;
    }>;
    expect(status).toHaveLength(5);
    expect(status.map((s) => s.id)).toEqual(['s1', 's2', 's3', 's4', 's5']);
    act(() => {
      nextAt(passedSteps, 4)?.();
    });
    expect(onFinish).toHaveBeenCalledTimes(1);
    await settle();
  });
});

describe('Tour 017-02 (target hilang + keyboard + motion + states)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // @ts-expect-error kembalikan default jsdom
    delete window.matchMedia;
  });

  it('isTargetVisible: hilang, hidden, display-none vs terlihat', () => {
    renderTargets([1, 2]);
    expect(isTargetVisible('#tak-ada')).toBe(false);
    expect(isTargetVisible('#target-1')).toBe(true);
    const el = document.querySelector('#target-2') as HTMLElement;
    el.setAttribute('hidden', '');
    expect(isTargetVisible('#target-2')).toBe(false);
    el.removeAttribute('hidden');
    el.style.display = 'none';
    expect(isTargetVisible('#target-2')).toBe(false);
  });

  it('AC-01: satu target hilang dilewati anggun + pemberitahuan', async () => {
    const onStepChange = vi.fn();
    renderTargets([1, 2, 4, 5]); // target-3 hilang
    render(<Tour steps={fiveSteps()} open={true} onStepChange={onStepChange} />);
    const passedSteps = getPassedSteps();
    act(() => {
      nextAt(passedSteps, 1)?.(); // Lanjut dari langkah 2 → lewati 3
    });
    expect(drive).toHaveBeenCalledWith(3);
    await settle();
    expect(screen.getByTestId('tour-announcer').textContent).toContain('Langkah 4 dari 5');
    expect(screen.getByTestId('tour-announcer').textContent).toContain(
      'Langkah 3 dilewati: target tidak ditemukan.'
    );
    const lastStatus = (onStepChange.mock.calls.at(-1) as unknown[])[1] as Array<{ id: string; result: string }>;
    expect(lastStatus.find((s) => s.id === 's3')?.result).toBe('skipped-missing');
  });

  it('AC-01: semua target hilang → alert + fokus + Tutup tur', async () => {
    const onSkip = vi.fn();
    const { container } = render(<Tour steps={fiveSteps()} open={true} onSkip={onSkip} />);
    expect(mockDriver).not.toHaveBeenCalled();
    const alert = screen.getByTestId('tour-error');
    expect(alert.getAttribute('role')).toBe('alert');
    expect(alert.textContent).toContain('Semua target tidak ditemukan');
    expect(document.activeElement).toBe(alert);
    expect(container.textContent).toContain('5 dari 5 target hilang');
    act(() => {
      fireEvent.click(screen.getByText('Tutup tur'));
    });
    expect(onSkip).toHaveBeenCalledTimes(1);
    const status = (onSkip.mock.calls[0] as unknown[])[0] as Array<{ result: string }>;
    expect(status.every((s) => s.result === 'skipped-missing')).toBe(true);
    expect(screen.getByTestId('tour-success').getAttribute('role')).toBe('status');
  });

  it('AC-02: langkah 1 langsung lewati tanpa dialog', async () => {
    const onSkip = vi.fn();
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} onSkip={onSkip} />);
    const passedSteps = getPassedSteps();
    act(() => {
      closeAt(passedSteps, 0)?.();
    });
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect((onSkip.mock.calls[0] as unknown[])[1]).toBe(0);
    expect(screen.queryByTestId('tour-skip-dialog')).toBeNull();
    await settle();
  });

  it('AC-02: progres > 1 → dialog; Esc kembali; Ya lewati sekali', async () => {
    const onSkip = vi.fn();
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} onSkip={onSkip} />);
    const passedSteps = getPassedSteps();
    act(() => {
      nextAt(passedSteps, 0)?.();
      nextAt(passedSteps, 1)?.();
    });
    await settle();
    act(() => {
      closeAt(passedSteps, 2)?.();
    });
    expect(screen.getByTestId('tour-skip-dialog').textContent).toContain('Lewati tur?');
    expect(onSkip).not.toHaveBeenCalled();
    // Esc di dialog → kembali ke tur, tanpa lewati
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(onSkip).not.toHaveBeenCalled();
    expect(screen.queryByTestId('tour-skip-dialog')).toBeNull();
    // Minta lewati lagi → konfirmasi → Ya, lewati
    act(() => {
      closeAt(passedSteps, 2)?.();
    });
    act(() => {
      fireEvent.click(screen.getByText('Ya, lewati'));
    });
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect((onSkip.mock.calls[0] as unknown[])[1]).toBe(2);
    await settle();
  });

  it('AC-03: Esc di langkah 1 → lewati + fokus kembali ke pemicu + success', async () => {
    const onSkip = vi.fn();
    render(<button data-testid="trigger" type="button">Mulai tur</button>);
    renderTargets();
    (screen.getByTestId('trigger') as HTMLElement).focus();
    render(<Tour steps={fiveSteps()} open={true} onSkip={onSkip} />);
    act(() => {
      fireEvent.keyDown(document, { key: 'Escape' });
    });
    expect(onSkip).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(screen.getByTestId('trigger'));
    expect(screen.getByTestId('tour-success').textContent).toContain('Tur dilewati.');
    await settle();
  });

  it('AC-03: konten belakang inert saat tur aktif, pulih saat tutup', () => {
    render(<div data-testid="bg">latar</div>);
    renderTargets();
    const tour = render(<Tour steps={fiveSteps()} open={true} />);
    const bg = screen.getByTestId('bg').parentElement as HTMLElement;
    expect(bg.getAttribute('inert')).not.toBeNull();
    expect(bg.getAttribute('aria-hidden')).toBe('true');
    tour.unmount();
    expect(bg.getAttribute('inert')).toBeNull();
  });

  it('CR-017: saudara di dalam root app ikut inert; lapisan driver.js tidak inert', () => {
    document.body.insertAdjacentHTML('beforeend', '<div class="driver-layer" data-testid="drv"></div>');
    render(
      <div>
        <header data-testid="app-header">Header</header>
        <Tour steps={fiveSteps()} open={true} />
      </div>
    );
    renderTargets();
    expect(screen.getByTestId('app-header').getAttribute('inert')).not.toBeNull();
    expect(screen.getByTestId('app-header').getAttribute('aria-hidden')).toBe('true');
    expect(screen.getByTestId('drv').hasAttribute('inert')).toBe(false);
  });

  it('CR-017: dialog konfirmasi menyembunyikan lapisan driver selama terbuka', () => {
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} />);
    const passedSteps = getPassedSteps();
    act(() => {
      nextAt(passedSteps, 0)?.();
    });
    act(() => {
      nextAt(passedSteps, 1)?.();
    });
    act(() => {
      closeAt(passedSteps, 2)?.();
    });
    expect(screen.getByTestId('tour-skip-dialog').hasAttribute('data-tour-layer')).toBe(true);
    expect(document.body.dataset.tourConfirm).toBe('true');
    act(() => {
      fireEvent.click(screen.getByText('Lanjut tur'));
    });
    expect(document.body.dataset.tourConfirm).toBeUndefined();
  });

  it('CR-017: CSS backdrop tunggal dan ring fokus tombol popover', () => {
    const css = readFileSync(`${import.meta.dirname}/tour.css`, 'utf8');
    expect(css).not.toMatch(/\.driver-overlay\s*\{[^}]*background-color/);
    expect(css).toMatch(/\.driver-popover-footer button:focus-visible,[^{]*\.driver-popover-close-btn:focus-visible\s*\{[^}]*outline:\s*2px solid var\(--primary\)/);
    expect(css).toMatch(/>\s*\.driver-overlay,[^{]*>\s*\.ds-tour-popover\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(/\[data-tour-confirm-dialog\] button:not\(:disabled\)\s*\{[^}]*pointer-events:\s*auto/);
  });

  it('AC-03: Tab cycling di footer popover', async () => {
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} />);
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div class="driver-popover"><div class="driver-popover-footer">' +
        '<button id="pk" type="button">Kembali</button>' +
        '<button id="pl" type="button">Lewati</button>' +
        '<button id="pn" type="button">Lanjut</button></div></div>'
    );
    const first = document.querySelector('#pk') as HTMLElement;
    const last = document.querySelector('#pn') as HTMLElement;
    last.focus();
    act(() => {
      fireEvent.keyDown(last, { key: 'Tab' });
    });
    expect(document.activeElement).toBe(first);
    first.focus();
    act(() => {
      fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    });
    expect(document.activeElement).toBe(last);
    await settle();
  });

  it('AC-04: reduced-motion → scroll auto + tanpa smooth', () => {
    mockReducedMotion(true);
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} />);
    expect(getDriverConfig().smoothScroll).toBe(false);
    expect(getPassedSteps()[0].scrollIntoView).toEqual({ behavior: 'auto', block: 'center' });
  });

  it('AC-05: loading antar-langkah aria-busy + kontrol disabled singkat', async () => {
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} />);
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div class="driver-popover"><div class="driver-popover-footer">' +
        '<button id="qk" type="button">Kembali</button>' +
        '<button id="qn" type="button">Lanjut</button></div></div>'
    );
    const passedSteps = getPassedSteps();
    act(() => {
      nextAt(passedSteps, 0)?.();
    });
    const announcer = screen.getByTestId('tour-announcer');
    expect(announcer.getAttribute('aria-busy')).toBe('true');
    expect(announcer.textContent).toContain('Memuat langkah…');
    expect(document.querySelector('#qn')?.getAttribute('disabled')).not.toBeNull();
    await settle();
    expect(screen.getByTestId('tour-announcer').getAttribute('aria-busy')).toBeNull();
    expect(document.querySelector('#qn')?.getAttribute('disabled')).toBeNull();
  });
});

describe('Tour CR-018 (varian §2.5 + responsif §5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    mockMediaQuery();
  });

  it('varian default: stagePadding 8 + popoverClass ds-tour-popover (backward-compat)', () => {
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} />);
    expect(mockDriver).toHaveBeenCalledTimes(1);
    expect(getDriverConfig().stagePadding).toBe(8);
    expect(getDriverConfig().popoverClass).toBe('ds-tour-popover');
    expect(getPassedSteps()[0].popover?.popoverClass).toBe('ds-tour-popover');
  });

  it('varian spotlight tight: stagePadding 4', () => {
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} spotlight="tight" />);
    expect(getDriverConfig().stagePadding).toBe(4);
  });

  it('spotlight auto: viewport <md → tight', () => {
    mockMediaQuery({ narrow: true });
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} />);
    expect(getDriverConfig().stagePadding).toBe(4);
  });

  it('spotlight eksplisit default menang atas auto <md', () => {
    mockMediaQuery({ narrow: true });
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} spotlight="default" />);
    expect(getDriverConfig().stagePadding).toBe(8);
  });

  it('varian popover compact: class popover compact di config + tiap langkah', () => {
    renderTargets();
    render(<Tour steps={fiveSteps()} open={true} popover="compact" />);
    expect(getDriverConfig().popoverClass).toContain('ds-tour-popover-compact');
    expect(getPassedSteps()[0].popover?.popoverClass).toContain('ds-tour-popover-compact');
    expect(getPassedSteps()[4].popover?.popoverClass).toContain('ds-tour-popover-compact');
  });
});
