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

export const BREAK_CASES = [
  {
    input: '.jpg',
    action: 'Set State to Unsupported format, then drag a JPG onto the dropzone.',
    outcome: 'An alert says why. The dropzone stays, ready for another file.',
  },
  {
    input: '> 1 KB',
    action: 'Set State to Size limit, then pick any photo.',
    outcome: 'The file is rejected before it is decoded.',
  },
  {
    input: '500%',
    action: 'Load a photo, focus the crop area, and keep pressing +.',
    outcome: 'Zoom stops at 500%. The slider stays in sync.',
  },
];

export const SHORTCUTS = [
  { label: 'Move 10px', keys: ['← ↑ ↓ →'] },
  { label: 'Move 1px', keys: ['Shift', '← ↑ ↓ →'] },
  { label: 'Zoom', keys: ['+', '−'] },
  { label: 'Rotate 90°', keys: ['R'] },
  { label: 'Rotate back', keys: ['Shift', 'R'] },
  { label: 'Reset', keys: ['0'] },
];

export const ARIA_NOTES = [
  { term: 'aria-live', meaning: 'Position, zoom, and rotation changes are announced.' },
  { term: 'role="alert"', meaning: 'Rejected files are explained in text, and focus moves to the message.' },
  { term: 'aria-busy', meaning: 'Set on the crop area while the photo loads.' },
  { term: 'Focus', meaning: 'After Save, focus moves to the confirmation.' },
  { term: 'Pointer only', meaning: 'Corner handles resize by dragging; there is no keyboard resize yet.' },
];

export const CONTRACT = [
  { term: 'onComplete', meaning: 'Hands you a blob, a data URL, and the final width and height.' },
  { term: 'outputSize', meaning: 'Pixel size of the result. Keep its ratio equal to aspect, or the image stretches.' },
  { term: 'accept / maxBytes', meaning: 'Type is checked first, then size, before the file is decoded.' },
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
