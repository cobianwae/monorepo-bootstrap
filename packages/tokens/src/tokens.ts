export interface ColorToken {
  name: string;
  variable: string;
  lightOklch: string;
  darkOklch: string;
  lightHex: string;
  darkHex: string;
  category: 'surface' | 'brand' | 'feedback' | 'border';
  description: string;
}

export const COLOR_TOKENS: ColorToken[] = [
  {
    name: 'Background / Foreground',
    variable: '--background',
    lightOklch: 'oklch(0.99 0.002 240)',
    darkOklch: 'oklch(0.13 0.015 260)',
    lightHex: '#FAFBFD',
    darkHex: '#0D0E15',
    category: 'surface',
    description: 'Default canvas background and high contrast text',
  },
  {
    name: 'Surface Sunken',
    variable: '--surface-sunken',
    lightOklch: 'oklch(0.96 0.005 260)',
    darkOklch: 'oklch(0.10 0.012 260)',
    lightHex: '#F3F4F8',
    darkHex: '#08090E',
    category: 'surface',
    description: 'Sunken canvas, sidebar backdrop, and recessed view containers',
  },
  {
    name: 'Card / Card Foreground',
    variable: '--card',
    lightOklch: 'oklch(1 0 0)',
    darkOklch: 'oklch(0.18 0.018 260)',
    lightHex: '#FFFFFF',
    darkHex: '#141620',
    category: 'surface',
    description: 'Card panels, dialog containers, and elevated surfaces',
  },
  {
    name: 'Surface Raised',
    variable: '--surface-raised',
    lightOklch: 'oklch(1 0 0)',
    darkOklch: 'oklch(0.22 0.020 260)',
    lightHex: '#FFFFFF',
    darkHex: '#1E202C',
    category: 'surface',
    description: 'Raised floating cards, hovering elements, and layered modals',
  },
  {
    name: 'Primary / Primary Foreground',
    variable: '--primary',
    lightOklch: 'oklch(0.45 0.18 265)',
    darkOklch: 'oklch(0.68 0.17 265)',
    lightHex: '#3D34B3',
    darkHex: '#8479FF',
    category: 'brand',
    description: 'Primary interactive actions, brand accents, and active states',
  },
  {
    name: 'Highlight / Highlight Foreground',
    variable: '--highlight',
    lightOklch: 'oklch(0.45 0.18 195)',
    darkOklch: 'oklch(0.82 0.16 175)',
    lightHex: '#067094',
    darkHex: '#2DD4BF',
    category: 'brand',
    description: 'Signature graphic accent, active indicators, badges, and glows',
  },
  {
    name: 'Secondary / Secondary Foreground',
    variable: '--secondary',
    lightOklch: 'oklch(0.94 0.015 260)',
    darkOklch: 'oklch(0.24 0.02 260)',
    lightHex: '#EAEBF2',
    darkHex: '#222533',
    category: 'surface',
    description: 'Secondary interactive actions and subtle button variants',
  },
  {
    name: 'Muted / Muted Foreground',
    variable: '--muted',
    lightOklch: 'oklch(0.95 0.008 260)',
    darkOklch: 'oklch(0.22 0.015 260)',
    lightHex: '#EFF0F4',
    darkHex: '#1E202C',
    category: 'surface',
    description: 'De-emphasized surfaces, placeholder text, and captions',
  },
  {
    name: 'Destructive / Destructive Foreground',
    variable: '--destructive',
    lightOklch: 'oklch(0.55 0.22 27)',
    darkOklch: 'oklch(0.62 0.22 25)',
    lightHex: '#DC2626',
    darkHex: '#F87171',
    category: 'feedback',
    description: 'Error states, destructive actions, and critical alerts',
  },
  {
    name: 'Success / Success Foreground',
    variable: '--success',
    lightOklch: 'oklch(0.46 0.15 150)',
    darkOklch: 'oklch(0.68 0.17 145)',
    lightHex: '#047857',
    darkHex: '#34D399',
    category: 'feedback',
    description: 'Positive confirmation, successful operations, and active indicators',
  },
  {
    name: 'Warning / Warning Foreground',
    variable: '--warning',
    lightOklch: 'oklch(0.60 0.16 75)',
    darkOklch: 'oklch(0.75 0.16 75)',
    lightHex: '#D97706',
    darkHex: '#FBBF24',
    category: 'feedback',
    description: 'Cautionary notes, pending status, and warning alerts',
  },
  {
    name: 'Info / Info Foreground',
    variable: '--info',
    lightOklch: 'oklch(0.52 0.16 235)',
    darkOklch: 'oklch(0.68 0.16 235)',
    lightHex: '#2563EB',
    darkHex: '#60A5FA',
    category: 'feedback',
    description: 'Informational notices, helper banners, and tips',
  },
  {
    name: 'Warning Text',
    variable: '--warning-text',
    lightOklch: 'oklch(0.53 0.12 60)',
    darkOklch: 'oklch(0.75 0.16 75)',
    lightHex: '#B45309',
    darkHex: '#FBBF24',
    category: 'feedback',
    description: 'Warning text on light/tinted surfaces (soft badges)',
  },
  {
    name: 'Destructive Text',
    variable: '--destructive-text',
    lightOklch: 'oklch(0.50 0.21 25)',
    darkOklch: 'oklch(0.62 0.22 25)',
    lightHex: '#B91C1C',
    darkHex: '#F87171',
    category: 'feedback',
    description: 'Destructive text on light/tinted surfaces (soft badges)',
  },
  {
    name: 'Border / Input',
    variable: '--border',
    lightOklch: 'oklch(0.88 0.01 260)',
    darkOklch: 'oklch(0.30 0.018 260)',
    lightHex: '#D5D7E1',
    darkHex: '#2E3245',
    category: 'border',
    description: 'Subtle boundaries for cards, dividers, and inputs',
  },
  {
    name: 'Border Strong',
    variable: '--border-strong',
    lightOklch: 'oklch(0.78 0.015 260)',
    darkOklch: 'oklch(0.42 0.022 260)',
    lightHex: '#B8BAC8',
    darkHex: '#4A5068',
    category: 'border',
    description: 'High-contrast boundaries, active borders, and prominent table dividers',
  },
  {
    name: 'Overlay Backdrop',
    variable: '--overlay',
    lightOklch: 'oklch(0 0 0 / 0.6)',
    darkOklch: 'oklch(0 0 0 / 0.7)',
    lightHex: '#000000',
    darkHex: '#000000',
    category: 'surface',
    description: 'Modal and drawer backdrop dimming layer',
  },
];

export const SPACING_SCALE = [
  { name: '1', value: '0.25rem', px: 4 },
  { name: '2', value: '0.5rem', px: 8 },
  { name: '3', value: '0.75rem', px: 12 },
  { name: '4', value: '1rem', px: 16 },
  { name: '6', value: '1.5rem', px: 24 },
  { name: '8', value: '2rem', px: 32 },
  { name: '12', value: '3rem', px: 48 },
  { name: '16', value: '4rem', px: 64 },
];

export const TYPOGRAPHY_SCALE = [
  { name: 'Display', size: '2.5rem', lineHeight: '1.15', weight: '700', tracking: '-0.03em' },
  { name: 'Heading 1', size: '2rem', lineHeight: '1.2', weight: '700', tracking: '-0.025em' },
  { name: 'Heading 2', size: '1.5rem', lineHeight: '1.25', weight: '600', tracking: '-0.02em' },
  { name: 'Heading 3', size: '1.25rem', lineHeight: '1.3', weight: '600', tracking: '-0.015em' },
  { name: 'Body Large', size: '1.125rem', lineHeight: '1.5', weight: '400', tracking: '0' },
  { name: 'Body Default', size: '1rem', lineHeight: '1.5', weight: '400', tracking: '0' },
  { name: 'Body Small', size: '0.875rem', lineHeight: '1.45', weight: '400', tracking: '0' },
  { name: 'Caption / Meta', size: '0.75rem', lineHeight: '1.4', weight: '500', tracking: '0.02em' },
];

export const RADII_SCALE = [
  { name: 'sm', value: '0.25rem', px: 4 },
  { name: 'md', value: '0.375rem', px: 6 },
  { name: 'lg', value: '0.5rem', px: 8 },
  { name: 'xl', value: '0.75rem', px: 12 },
  { name: '2xl', value: '1rem', px: 16 },
  { name: 'full', value: '9999px', px: 9999 },
];

export const MOTION_TOKENS = {
  durations: {
    fast: '150ms',
    normal: '250ms',
    slow: '400ms',
  },
  easings: {
    spring: 'cubic-bezier(0.16, 1, 0.3, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export const BREAKPOINT_TOKENS = [
  { name: 'sm', value: '640px', px: 640 },
  { name: 'md', value: '768px', px: 768 },
  { name: 'lg', value: '1024px', px: 1024 },
  { name: 'xl', value: '1280px', px: 1280 },
  { name: '2xl', value: '1536px', px: 1536 },
];

export const Z_INDEX_TOKENS = {
  hide: -1,
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
  max: 9999,
};

