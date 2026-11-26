import type { CropOutputSize } from '@ds/ui';

export type CropScenario = 'avatar' | 'cover';

export type AspectPreset = 'square' | 'wide' | 'standard' | 'free';

export type DemoState = 'valid' | 'unsupported' | 'size-limit';

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
  'Upload — choose a photo to open the crop area (circle for avatar, rectangle for cover).',
  'Adjust — drag the area or use arrow keys; zoom with the slider, rotate with R.',
  'Switch — set Scenario to Cover for a 1280×720 result without uploading again.',
  'Limit — set Aspect to Free and crop without a locked ratio.',
  'States — set State to Unsupported format or Size limit and upload a file to see the error.',
];

export const KEYBOARD = [
  'Arrow keys: move the crop area by 10px (Shift + arrow for 1px adjustments).',
  '+ / −: zoom between 100% and 500%; the slider stays in sync.',
  'R: rotate 90° (Shift + R reverses rotation); 0: reset the image.',
  'Tab: move through photo selection, aspect ratio, crop area, slider, controls, preview, and Save.',
];

export interface StateConfig {
  accept?: string;
  maxBytes?: number;
}

export const STATE_CONFIG: Record<DemoState, StateConfig> = {
  valid: {},
  unsupported: { accept: 'image/png' },
  'size-limit': { maxBytes: 1024 },
};
