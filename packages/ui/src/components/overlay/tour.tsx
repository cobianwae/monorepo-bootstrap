'use client';

import * as React from 'react';
import { driver as createDriver, type DriveStep } from 'driver.js';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../feedback/alert-dialog';
import type { TourProps, TourStepStatus, TourTarget } from './tour-types';

/** Durasi resolusi target antar-langkah; instan bila reduced-motion (K5). */
const TOUR_RESOLVE_MS = 200;

function resolveTarget(target: TourTarget): string | Element | undefined {
  if (typeof target === 'string') return target;
  return target.current ?? undefined;
}

/**
 * K4 — cek visibilitas target tiap navigasi (ref prioritas, selector fallback).
 * Hilang = tidak ada di DOM, `hidden`, atau `display/visibility` none/hidden.
 * `offsetParent` + rect digabung agar tidak rapuh: bila tanpa info layout
 * (jsdom), elemen yang tidak disembunyikan eksplisit dianggap terlihat.
 */
export function isTargetVisible(target: TourTarget): boolean {
  const el = typeof target === 'string' ? document.querySelector(target) : target.current;
  if (!el || !(el instanceof HTMLElement)) return false;
  if (el.hasAttribute('hidden')) return false;
  if (el.style.display === 'none' || el.style.visibility === 'hidden') return false;
  try {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') {
      return false;
    }
  } catch {
    /* jsdom parsial: abaikan, lanjut ke cek layout */
  }
  const rect = typeof el.getBoundingClientRect === 'function' ? el.getBoundingClientRect() : null;
  if (rect && (rect.width > 0 || rect.height > 0)) return true;
  if (el.offsetParent !== null) return true;
  // Tanpa info layout (jsdom): terlihat karena tidak disembunyikan eksplisit.
  return true;
}

function initialStatus(ids: string[]): TourStepStatus[] {
  return ids.map((id, index) => ({ id, index, result: 'shown' as const }));
}

/** Fokus ke judul popover driver.js tiap ganti langkah (§4); no-op bila tak ada. */
function focusPopoverTitle(): void {
  const title = document.querySelector<HTMLElement>('.driver-popover-title');
  if (!title) return;
  if (!title.hasAttribute('tabindex')) title.setAttribute('tabindex', '-1');
  title.focus({ preventScroll: true });
}

function setDriverButtonsDisabled(disabled: boolean): void {
  document.querySelectorAll('.driver-popover-footer button').forEach((btn) => {
    if (disabled) btn.setAttribute('disabled', '');
    else btn.removeAttribute('disabled');
  });
}

const LAYER_SELECTORS = [
  '.driver-popover',
  '#driver-overlay',
  '#driver-page-overlay',
  '[data-radix-portal]',
  '[data-tour-layer]',
];

function isTourLayer(el: Element): boolean {
  return LAYER_SELECTORS.some((sel) => el.matches(sel) || el.querySelector(sel) !== null);
}

/** Konten belakang `inert` + `aria-hidden` saat tur aktif (§4); kembalikan saat tutup. */
function setBackgroundInert(on: boolean): void {
  Array.from(document.body.children).forEach((child) => {
    if (!(child instanceof HTMLElement) || isTourLayer(child)) return;
    if (on) {
      child.setAttribute('inert', '');
      child.setAttribute('aria-hidden', 'true');
      child.dataset.tourInert = 'true';
    } else if (child.dataset.tourInert === 'true') {
      child.removeAttribute('inert');
      child.removeAttribute('aria-hidden');
      delete child.dataset.tourInert;
    }
  });
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Tour — wrapper driver.js token-first (K1).
 * Spotlight + popover + progress milik driver.js; gaya via `ds-tour` classes
 * (lihat `tour.css`); microcopy Bahasa Indonesia; tanpa persistence (K6).
 * Scope 017-02: FR-003 target hilang (K4), FR-005 keyboard + fokus + SR (K2),
 * FR-006 reduced-motion (K5), FR-007 state matrix.
 */
export function Tour({ steps, open, initialStep = 0, onFinish, onSkip, onStepChange }: TourProps) {
  const driverRef = React.useRef<ReturnType<typeof createDriver> | null>(null);
  const statusRef = React.useRef<TourStepStatus[]>([]);
  const settledRef = React.useRef(false);
  const activeIndexRef = React.useRef(initialStep);
  const seenRef = React.useRef<Set<number>>(new Set());
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const loadTimerRef = React.useRef<number | null>(null);
  const confirmOpenRef = React.useRef(false);
  const [active, setActive] = React.useState(initialStep);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [notice, setNotice] = React.useState<string | null>(null);
  const [seenCount, setSeenCount] = React.useState(0);
  const [errorAllMissing, setErrorAllMissing] = React.useState<{ total: number } | null>(null);
  const errorRef = React.useRef<{ total: number } | null>(null);
  const [ended, setEnded] = React.useState<'finished' | 'skipped' | null>(null);
  const alertRef = React.useRef<HTMLDivElement>(null);
  const callbacks = React.useRef({ onFinish, onSkip, onStepChange });

  React.useEffect(() => {
    callbacks.current = { onFinish, onSkip, onStepChange };
  }, [onFinish, onSkip, onStepChange]);

  React.useEffect(() => {
    confirmOpenRef.current = confirmOpen;
  }, [confirmOpen]);

  const stepCount = steps.length;
  const isSingle = stepCount === 1;

  const restoreFocus = React.useCallback(() => {
    const trigger = triggerRef.current;
    if (trigger && trigger.isConnected) trigger.focus({ preventScroll: true });
  }, []);

  const finishTour = React.useCallback(
    (status: TourStepStatus[]) => {
      if (settledRef.current) return;
      settledRef.current = true;
      setLoading(false);
      setDriverButtonsDisabled(false);
      driverRef.current?.destroy();
      setEnded('finished');
      restoreFocus();
      callbacks.current.onFinish?.(status);
    },
    [restoreFocus]
  );

  const skipTour = React.useCallback(
    (status: TourStepStatus[], atIndex: number) => {
      if (settledRef.current) return;
      settledRef.current = true;
      setLoading(false);
      setDriverButtonsDisabled(false);
      setConfirmOpen(false);
      driverRef.current?.destroy();
      setEnded('skipped');
      restoreFocus();
      callbacks.current.onSkip?.(status, atIndex);
    },
    [restoreFocus]
  );

  /** Alur lewati K2: dialog konfirmasi hanya bila progres > 1. */
  const requestSkip = React.useCallback(
    (atIndex: number) => {
      if (settledRef.current) return;
      if (seenRef.current.size > 1) {
        activeIndexRef.current = atIndex;
        setConfirmOpen(true);
      } else {
        skipTour(statusRef.current, atIndex);
      }
    },
    [skipTour]
  );

  const requestSkipRef = React.useRef(requestSkip);
  React.useEffect(() => {
    requestSkipRef.current = requestSkip;
  }, [requestSkip]);

  // Fokus ke alert error saat muncul (§3).
  React.useEffect(() => {
    if (errorAllMissing) alertRef.current?.focus({ preventScroll: true });
  }, [errorAllMissing]);

  // Simpan pemicu + inert belakang + Esc + Tab cycling (§4).
  React.useEffect(() => {
    if (!open || stepCount === 0) return;
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setBackgroundInert(true);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (confirmOpenRef.current) return; // Radix menutup dialog → kembali ke tur
        event.preventDefault();
        requestSkipRef.current(activeIndexRef.current);
        return;
      }
      if (event.key !== 'Tab') return;
      const popover = document.querySelector('.driver-popover');
      if (!popover || !(event.target instanceof HTMLElement) || !popover.contains(event.target)) return;
      const items = Array.from(
        popover.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      setBackgroundInert(false);
    };
  }, [open, stepCount]);

  // Drive utama: resolusi target tiap navigasi (K4) + reduced-motion (K5).
  React.useEffect(() => {
    if (!open || stepCount === 0) {
      driverRef.current?.destroy();
      driverRef.current = null;
      settledRef.current = false;
      return;
    }

    settledRef.current = false;
    seenRef.current = new Set();
    errorRef.current = null;
    setEnded(null);
    setErrorAllMissing(null);
    setNotice(null);

    const reduced = prefersReducedMotion();
    const visible = (index: number) => isTargetVisible(steps[index].target);

    // Semua target hilang → error state tanpa drive (FR-003, §3).
    const anyVisible = steps.some((_, i) => visible(i));
    if (!anyVisible) {
      statusRef.current = steps.map((s, index) => ({ id: s.id, index, result: 'skipped-missing' as const }));
      errorRef.current = { total: stepCount };
      setErrorAllMissing({ total: stepCount });
      return;
    }

    statusRef.current = initialStatus(steps.map((s) => s.id));
    let start = Math.min(Math.max(initialStep, 0), stepCount - 1);
    const skippedAtStart: number[] = [];
    while (start < stepCount && !visible(start)) {
      skippedAtStart.push(start);
      start += 1;
    }
    if (start >= stepCount) {
      start = stepCount - 1;
      while (start > 0 && !visible(start)) start -= 1;
    }
    if (skippedAtStart.length > 0) {
      statusRef.current = statusRef.current.map((entry) =>
        skippedAtStart.includes(entry.index) ? { ...entry, result: 'skipped-missing' as const } : entry
      );
      const label = skippedAtStart.map((i) => i + 1).join(', ');
      setNotice(`Langkah ${label} dilewati: target tidak ditemukan.`);
    }
    activeIndexRef.current = start;
    seenRef.current.add(start);
    setSeenCount(seenRef.current.size);
    setActive(start);

    const finishOnce = (status: TourStepStatus[]) => finishTour(status);

    const goTo = (index: number) => {
      activeIndexRef.current = index;
      seenRef.current.add(index);
      setSeenCount(seenRef.current.size);
      setActive(index);
      callbacks.current.onStepChange?.(index, statusRef.current);
      // Loading antar-langkah: aria-busy + kontrol disabled singkat (instan bila K5).
      setLoading(true);
      setDriverButtonsDisabled(true);
      if (loadTimerRef.current !== null) window.clearTimeout(loadTimerRef.current);
      loadTimerRef.current = window.setTimeout(
        () => {
          setLoading(false);
          setDriverButtonsDisabled(false);
          focusPopoverTitle();
        },
        reduced ? 0 : TOUR_RESOLVE_MS
      );
    };

    const driveSteps: DriveStep[] = steps.map((step, index) => {
      const element = resolveTarget(step.target);
      const last = index === stepCount - 1;
      return {
        element,
        scrollIntoView: { behavior: reduced ? 'auto' : 'smooth', block: 'center' },
        popover: {
          title: step.title,
          description: step.content,
          side: step.placement === 'auto' || step.placement === undefined ? undefined : step.placement,
          align: 'start',
          showProgress: !isSingle,
          progressText: `${index + 1} dari ${stepCount}`,
          nextBtnText: last ? 'Selesai' : 'Lanjut',
          prevBtnText: 'Kembali',
          doneBtnText: 'Selesai',
          closeBtnLabel: 'Lewati',
          popoverClass: 'ds-tour-popover',
          showButtons: ['next', 'previous', 'close'],
          disableButtons: index === 0 ? ['previous'] : [],
          onNextClick: () => {
            const status = statusRef.current.map((entry) =>
              entry.index === index ? { ...entry, result: 'completed' as const } : entry
            );
            statusRef.current = status;
            if (last) {
              finishOnce(status);
              return;
            }
            // Lewati target hilang anggun tiap navigasi (K4).
            let next = index + 1;
            const skipped: number[] = [];
            while (next < stepCount && !visible(next)) {
              skipped.push(next);
              next += 1;
            }
            if (skipped.length > 0) {
              statusRef.current = statusRef.current.map((entry) =>
                skipped.includes(entry.index) ? { ...entry, result: 'skipped-missing' as const } : entry
              );
              const label = skipped.map((i) => i + 1).join(', ');
              setNotice(`Langkah ${label} dilewati: target tidak ditemukan.`);
            }
            if (next >= stepCount) {
              // Sisa langkah hilang semua → error (flow 2: M–Q–ERR).
              driverRef.current?.destroy();
              errorRef.current = { total: stepCount };
              setErrorAllMissing({ total: stepCount });
              return;
            }
            goTo(next);
            if (next === index + 1) driverRef.current?.moveNext();
            else driverRef.current?.drive(next);
          },
          onPrevClick: () => {
            let prev = Math.max(index - 1, 0);
            while (prev > 0 && !visible(prev)) prev -= 1;
            // Target muncul kembali → tampil normal, status diperbarui (K4).
            statusRef.current = statusRef.current.map((entry) =>
              entry.index === prev && entry.result === 'skipped-missing'
                ? { ...entry, result: 'shown' as const }
                : entry
            );
            setNotice(null);
            goTo(prev);
            if (prev === index - 1) driverRef.current?.movePrevious();
            else driverRef.current?.drive(prev);
          },
          onCloseClick: () => {
            requestSkipRef.current(index);
          },
        },
      };
    });

    const d = createDriver({
      overlayColor: 'var(--background)',
      overlayOpacity: 0.8,
      stagePadding: 8,
      stageRadius: 8,
      popoverClass: 'ds-tour-popover',
      showProgress: !isSingle,
      progressText: `${start + 1} dari ${stepCount}`,
      nextBtnText: 'Lanjut',
      prevBtnText: 'Kembali',
      doneBtnText: 'Selesai',
      allowClose: false, // Esc + tutup via alur K2 milik DS, bukan driver.
      smoothScroll: !reduced,
      onDestroyStarted: () => {
        // Pengaman: destroy eksternal = alur lewati (K2 penuh via requestSkip).
        // Abaikan saat error semua-hilang (penutupan via [Tutup tur] milik DS).
        if (!errorRef.current) requestSkipRef.current(activeIndexRef.current);
      },
    });
    d.setSteps(driveSteps);
    driverRef.current = d;
    d.drive(start);
    callbacks.current.onStepChange?.(start, statusRef.current);
    focusPopoverTitle();

    return () => {
      if (loadTimerRef.current !== null) window.clearTimeout(loadTimerRef.current);
      d.destroy();
      if (driverRef.current === d) driverRef.current = null;
    };
  }, [open, stepCount, initialStep, steps, isSingle, finishTour, skipTour]);

  if (!open) return null;

  // Empty: langkah kosong — tidak dimulai (FR-007, §3).
  if (stepCount === 0) {
    return (
      <div data-tour-layer role="status" data-testid="tour-empty">
        Belum ada langkah tur.
        <button type="button" disabled>
          Mulai tur
        </button>
      </div>
    );
  }

  // Error: semua target hilang (FR-003, §3).
  if (errorAllMissing) {
    const closeError = () => {
      errorRef.current = null;
      setErrorAllMissing(null);
      skipTour(statusRef.current, activeIndexRef.current);
    };
    return (
      <div data-tour-layer>
        <div
          ref={alertRef}
          role="alert"
          tabIndex={-1}
          data-testid="tour-error"
          aria-label="Semua target tidak ditemukan"
        >
          <p>Semua target tidak ditemukan.</p>
          <p>
            {errorAllMissing.total} dari {errorAllMissing.total} target hilang — tur tidak dapat
            dimulai atau dilanjutkan.
          </p>
          <button type="button" onClick={closeError}>
            Tutup tur
          </button>
        </div>
        <div aria-live="polite" data-testid="tour-announcer" className="sr-only">
          Semua target tidak ditemukan.
        </div>
      </div>
    );
  }

  // Success: selesai / dilewati — konfirmasi ringan + fokus kembali (§3).
  if (ended) {
    return (
      <div data-tour-layer>
        <div role="status" data-testid="tour-success">
          {ended === 'finished' ? 'Tur selesai.' : 'Tur dilewati.'}
        </div>
        <div aria-live="polite" data-testid="tour-announcer" className="sr-only">
          {ended === 'finished' ? 'Tur selesai.' : 'Tur dilewati.'}
        </div>
      </div>
    );
  }

  const safeActive = Math.min(active, stepCount - 1);
  const current = steps[safeActive];

  return (
    <div data-tour-layer>
      <div
        aria-live="polite"
        aria-busy={loading || undefined}
        data-testid="tour-announcer"
        className="sr-only"
      >
        {loading
          ? 'Memuat langkah…'
          : isSingle
            ? `${current.title}: ${current.content}`
            : `Langkah ${safeActive + 1} dari ${stepCount}: ${current.title}${notice ? ` ${notice}` : ''}`}
      </div>
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent data-testid="tour-skip-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Lewati tur?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu sudah melihat {seenCount} dari {stepCount} langkah. Lewati sisa tur?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setConfirmOpen(false);
                focusPopoverTitle();
              }}
            >
              Lanjut tur
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => skipTour(statusRef.current, activeIndexRef.current)}>
              Ya, lewati
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
