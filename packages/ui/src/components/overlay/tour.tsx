'use client';

import * as React from 'react';
import { driver as createDriver, type DriveStep } from 'driver.js';
import type { TourProps, TourStepStatus, TourTarget } from './tour-types';

function resolveTarget(target: TourTarget): string | Element | undefined {
  if (typeof target === 'string') return target;
  return target.current ?? undefined;
}

function targetExists(target: TourTarget): boolean {
  if (typeof target === 'string') {
    return document.querySelector(target) !== null;
  }
  return target.current !== null && target.current !== undefined;
}

function initialStatus(ids: string[]): TourStepStatus[] {
  return ids.map((id, index) => ({ id, index, result: 'shown' as const }));
}

/**
 * Tour — wrapper driver.js token-first (K1).
 * Spotlight + popover + progress milik driver.js; gaya via `ds-tour` classes
 * (lihat `tour.css`); microcopy Bahasa Indonesia; tanpa persistence (K6).
 * Scope 017-01: FR-001/002/004. Target-hilang penuh, keyboard/Esc,
 * reduced-motion penuh, dan state matrix di 017-02.
 */
export function Tour({ steps, open, initialStep = 0, onFinish, onSkip, onStepChange }: TourProps) {
  const driverRef = React.useRef<ReturnType<typeof createDriver> | null>(null);
  const statusRef = React.useRef<TourStepStatus[]>([]);
  const settledRef = React.useRef(false);
  const activeIndexRef = React.useRef(initialStep);
  const [active, setActive] = React.useState(initialStep);
  const callbacks = React.useRef({ onFinish, onSkip, onStepChange });

  React.useEffect(() => {
    callbacks.current = { onFinish, onSkip, onStepChange };
  }, [onFinish, onSkip, onStepChange]);

  const stepCount = steps.length;
  const isSingle = stepCount === 1;

  React.useEffect(() => {
    if (!open || stepCount === 0) {
      driverRef.current?.destroy();
      driverRef.current = null;
      settledRef.current = false;
      return;
    }

    settledRef.current = false;
    statusRef.current = initialStatus(steps.map((s) => s.id));
    const startIndex = Math.min(Math.max(initialStep, 0), stepCount - 1);
    activeIndexRef.current = startIndex;
    setActive(startIndex);

    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const finishOnce = (status: TourStepStatus[]) => {
      if (settledRef.current) return;
      settledRef.current = true;
      callbacks.current.onFinish?.(status);
    };

    const skipOnce = (status: TourStepStatus[], atIndex: number) => {
      if (settledRef.current) return;
      settledRef.current = true;
      callbacks.current.onSkip?.(status, atIndex);
    };

    const goTo = (index: number) => {
      activeIndexRef.current = index;
      setActive(index);
      callbacks.current.onStepChange?.(index, statusRef.current);
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
              driverRef.current?.destroy();
            } else {
              // Lewati target hilang anggun: tandai lalu lanjut (detail penuh 017-02).
              let next = index + 1;
              while (next < stepCount - 1 && !targetExists(steps[next].target)) {
                statusRef.current = statusRef.current.map((entry) =>
                  entry.index === next ? { ...entry, result: 'skipped-missing' as const } : entry
                );
                next += 1;
              }
              goTo(next);
              driverRef.current?.moveNext();
            }
          },
          onPrevClick: () => {
            const prev = Math.max(index - 1, 0);
            goTo(prev);
            driverRef.current?.movePrevious();
          },
          onCloseClick: () => {
            skipOnce(statusRef.current, index);
            driverRef.current?.destroy();
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
      progressText: `${startIndex + 1} dari ${stepCount}`,
      nextBtnText: 'Lanjut',
      prevBtnText: 'Kembali',
      doneBtnText: 'Selesai',
      allowClose: true,
      smoothScroll: !reduced,
      onDestroyStarted: () => {
        // Esc / klik overlay = alur lewati (konfirmasi K2 penuh di 017-02).
        skipOnce(statusRef.current, activeIndexRef.current);
      },
    });
    d.setSteps(driveSteps);
    driverRef.current = d;
    d.drive(startIndex);
    callbacks.current.onStepChange?.(startIndex, statusRef.current);

    return () => {
      d.destroy();
      if (driverRef.current === d) driverRef.current = null;
    };
  }, [open, stepCount, initialStep, steps, isSingle]);

  if (!open || stepCount === 0) return null;

  const safeActive = Math.min(active, stepCount - 1);
  const current = steps[safeActive];

  return (
    <div aria-live="polite" data-testid="tour-announcer" className="sr-only">
      {isSingle
        ? `${current.title}: ${current.content}`
        : `Langkah ${safeActive + 1} dari ${stepCount}: ${current.title}`}
    </div>
  );
}
