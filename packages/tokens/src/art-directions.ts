import { type ThemeId, THEMES } from './themes';

export type ArtDirectionId = 'atelier' | 'aurora' | 'blueprint';

export interface ArtDirectionDefinition {
  id: ArtDirectionId;
  name: string;
  tagline: string;
  description: string;
  typography: {
    display: string;
    displayName: string;
    body: string;
    bodyName: string;
    mono: string;
    monoName: string;
    googleFont: string;
  };
  art: {
    background: 'glow' | 'gradient-mesh' | 'line-graphic';
    signature: string[];
  };
  tones: ThemeId[];
}

export const ART_DIRECTIONS: ArtDirectionDefinition[] = [
  {
    id: 'atelier',
    name: 'Atelier',
    tagline: 'Clean Craft Studio',
    description: 'Clean, modern studio aesthetic with subtle glow orbs, fine grid patterns, and mono-spaced labels. Premium and timeless.',
    typography: {
      display: 'var(--font-space-grotesk)',
      displayName: 'Space Grotesk',
      body: 'var(--font-inter)',
      bodyName: 'Inter',
      mono: 'var(--font-jetbrains)',
      monoName: 'JetBrains Mono',
      googleFont: 'Space Grotesk, Inter, JetBrains Mono',
    },
    art: {
      background: 'glow',
      signature: ['Subtle glow orbs', 'Fine grid pattern', 'Monospaced UI accents'],
    },
    tones: ['pulse', 'sunset', 'botanic', 'midnight'],
  },
  {
    id: 'aurora',
    name: 'Aurora',
    tagline: 'Gradient Mesh & Flow',
    description: 'Modern, gradient-forward direction featuring gradient washes, gradient borders, and gradient text on display headings.',
    typography: {
      display: 'var(--font-sora)',
      displayName: 'Sora',
      body: 'var(--font-inter)',
      bodyName: 'Inter',
      mono: 'var(--font-jetbrains)',
      monoName: 'JetBrains Mono',
      googleFont: 'Sora, Inter, JetBrains Mono',
    },
    art: {
      background: 'gradient-mesh',
      signature: ['Conic gradient washes', 'Gradient text headings', 'Gradient card borders'],
    },
    tones: ['nebula', 'lagoon'],
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    tagline: 'Technical & Line Graphic',
    description: 'Technical and architectural aesthetic with line-graphic backgrounds, contour lines, and precision engineering vibe.',
    typography: {
      display: 'var(--font-plex-mono)',
      displayName: 'IBM Plex Mono',
      body: 'var(--font-plex-sans)',
      bodyName: 'IBM Plex Sans',
      mono: 'var(--font-plex-mono)',
      monoName: 'IBM Plex Mono',
      googleFont: 'IBM Plex Mono, IBM Plex Sans',
    },
    art: {
      background: 'line-graphic',
      signature: ['Contour line SVGs', 'Gradient beam strokes', 'Technical borders'],
    },
    tones: ['ink', 'graphite'],
  }
];

export function getArtDirection(id: ArtDirectionId): ArtDirectionDefinition {
  return ART_DIRECTIONS.find((d) => d.id === id) || ART_DIRECTIONS[0];
}

export function getTonesForArtDirection(id: ArtDirectionId) {
  const direction = getArtDirection(id);
  return THEMES.filter(t => direction.tones.includes(t.id));
}
