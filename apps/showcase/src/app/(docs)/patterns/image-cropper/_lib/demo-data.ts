import type { CropOutputSize } from '@ds/ui';

export type CropScenario = 'avatar' | 'cover';

export type AspectPreset = 'square' | 'wide' | 'standard' | 'free';

export interface ScenarioConfig {
  aspect: number | 'free';
  cropShape: 'rect' | 'round';
  outputSize: CropOutputSize;
  label: string;
}

export const SCENARIOS: Record<CropScenario, ScenarioConfig> = {
  avatar: {
    aspect: 1,
    cropShape: 'round',
    outputSize: { width: 512, height: 512 },
    label: 'Avatar 1:1 · circle · 512×512',
  },
  cover: {
    aspect: 16 / 9,
    cropShape: 'rect',
    outputSize: { width: 1280, height: 720 },
    label: 'Cover 16:9 · rectangle · 1280×720',
  },
};

export const ASPECT_OPTIONS: { id: AspectPreset; label: string; aspect: number | 'free' }[] = [
  { id: 'square', label: '1:1', aspect: 1 },
  { id: 'wide', label: '16:9', aspect: 16 / 9 },
  { id: 'standard', label: '4:3', aspect: 4 / 3 },
  { id: 'free', label: 'Free', aspect: 'free' },
];

export const STEPS = [
  'Choose an avatar photo to open a square crop area with a circular preview.',
  'Drag the crop area or use arrow keys, then adjust zoom with the slider.',
  'Rotate 90°, then reset to the original position without uploading again.',
  'Check that the circular preview updates as you adjust the crop.',
  'Save the result: onComplete receives a 512×512 blob.',
  'Try a cover: choose Cover 16:9 for a 1280×720 result.',
];

export const KEYBOARD = [
  'Arrow keys: move the crop area by 10px (Shift + arrow for 1px adjustments).',
  '+ / −: zoom between 100% and 500%; the slider stays in sync.',
  'R: rotate 90° (Shift + R reverses rotation); 0: reset the image.',
  'Tab: move through photo selection, aspect ratio, crop area, slider, controls, preview, and Save.',
];

export interface DemoDataset {
  id: 'valid' | 'rusak' | 'raksasa';
  title: string;
  hint: string;
  accept?: string;
  maxBytes?: number;
}

export const DEMO_DATASETS: DemoDataset[] = [
  {
    id: 'valid',
    title: 'Valid — PNG/JPG/WebP ≤ 10 MB',
    hint: 'Upload a supported photo. A loading state appears while the image decodes.',
  },
  {
    id: 'rusak',
    title: 'Unsupported format',
    hint: 'This demo accepts PNG only. Upload a JPG to see the format error.',
    accept: 'image/png',
  },
  {
    id: 'raksasa',
    title: 'File size limit',
    hint: 'This demo uses a 1 KB limit. Upload any file larger than 1 KB to see the size error.',
    maxBytes: 1024,
  },
];

export interface AuditPair {
  pair: string;
  kind: 'text' | 'graphics';
  threshold: string;
}

export const AUDIT_PAIRS: AuditPair[] = [
  { pair: 'foreground on background', kind: 'text', threshold: '≥ 4.5:1' },
  { pair: 'muted-foreground on background', kind: 'text', threshold: '≥ 4.5:1' },
  { pair: 'primary (viewport border, handles, focus ring)', kind: 'graphics', threshold: '≥ 3:1' },
  { pair: 'primary-foreground on primary (button labels)', kind: 'text', threshold: '≥ 4.5:1' },
  { pair: 'destructive on background (error messages)', kind: 'text', threshold: '≥ 4.5:1' },
  { pair: 'background/80 overlay on the photo', kind: 'graphics', threshold: '≥ 3:1' },
];
