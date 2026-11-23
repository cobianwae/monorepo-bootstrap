import type { RefObject } from 'react';

/** Target langkah tur: ref React prioritas, string = selector fallback via driver.js (K4). */
export type TourTarget = RefObject<HTMLElement | null> | string;

export interface TourStep {
  id: string;
  target: TourTarget;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
}

export type TourStepResult = 'shown' | 'skipped-missing' | 'completed';

export interface TourStepStatus {
  id: string;
  index: number;
  result: TourStepResult;
}

/** Varian spotlight (§2.5): padding lubang 8px (`default`) vs 4px (`tight`, target padat). */
export type TourSpotlightVariant = 'default' | 'tight';

/** Varian popover (§2.5): lebar maks 320px (`default`) vs 260px (`compact`, target padat/mobile). */
export type TourPopoverVariant = 'default' | 'compact';

export interface TourProps {
  steps: TourStep[];
  /** Controlled; `steps=[]` = empty, tur tidak dimulai (FR-007). */
  open: boolean;
  /** Default 0. */
  initialStep?: number;
  /**
   * Varian spotlight (§2.5). Bila tidak diisi, otomatis: `tight` pada viewport
   * `<md` (§5, target kecil), `default` di atasnya.
   */
  spotlight?: TourSpotlightVariant;
  /** Varian popover (§2.5). Default `default`. */
  popover?: TourPopoverVariant;
  onFinish?: (status: TourStepStatus[]) => void;
  onSkip?: (status: TourStepStatus[], atIndex: number) => void;
  onStepChange?: (index: number, status: TourStepStatus[]) => void;
}
