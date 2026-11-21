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

export interface TourProps {
  steps: TourStep[];
  /** Controlled; `steps=[]` = empty, tur tidak dimulai (FR-007). */
  open: boolean;
  /** Default 0. */
  initialStep?: number;
  onFinish?: (status: TourStepStatus[]) => void;
  onSkip?: (status: TourStepStatus[], atIndex: number) => void;
  onStepChange?: (index: number, status: TourStepStatus[]) => void;
}
