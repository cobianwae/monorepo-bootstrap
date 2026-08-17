import type { ThemeId } from './themes';
import { THEMES } from './themes';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface WcagCompliance {
  ratio: number;
  ratioFormatted: string;
  passAA: boolean; // Normal text >= 4.5
  passAALarge: boolean; // Large text >= 3.0
  passAAA: boolean; // Normal text >= 7.0
  passAAALarge: boolean; // Large text >= 4.5
  level: 'AAA' | 'AA' | 'AA Large' | 'Fail';
}

export interface TokenContrastPair {
  name: string;
  themeId?: ThemeId;
  fgName: string;
  bgName: string;
  fgHex: string;
  bgHex: string;
  mode: 'light' | 'dark';
  compliance: WcagCompliance;
}

/**
 * Parses a hex string to RGB (supports #RGB, #RRGGBB)
 */
export function hexToRgb(hex: string): RGB {
  let cleaned = hex.replace('#', '').trim();
  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((c) => c + c)
      .join('');
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/**
 * Calculates relative luminance according to WCAG 2.1 specs
 * Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
 * where sRGB channels are linearized.
 */
export function getRelativeLuminance({ r, g, b }: RGB): number {
  const [rs, gs, bs] = [r / 255, g / 255, b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates WCAG 2.1 contrast ratio between two hex colors.
 * Contrast ratio is (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter color.
 */
export function getContrastRatio(colorA: string, colorB: string): number {
  const rgbA = hexToRgb(colorA);
  const rgbB = hexToRgb(colorB);
  const lumA = getRelativeLuminance(rgbA);
  const lumB = getRelativeLuminance(rgbB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Evaluates WCAG compliance levels
 */
export function checkWcagCompliance(ratio: number): WcagCompliance {
  const passAA = ratio >= 4.5;
  const passAALarge = ratio >= 3.0;
  const passAAA = ratio >= 7.0;
  const passAAALarge = ratio >= 4.5;

  let level: WcagCompliance['level'] = 'Fail';
  if (passAAA) level = 'AAA';
  else if (passAA) level = 'AA';
  else if (passAALarge) level = 'AA Large';

  return {
    ratio,
    ratioFormatted: `${ratio.toFixed(2)}:1`,
    passAA,
    passAALarge,
    passAAA,
    passAAALarge,
    level,
  };
}

/**
 * Audit token pairs for a specific theme or all themes
 */
export function auditThemeTokenPairs(themeId?: ThemeId): TokenContrastPair[] {
  const themesToAudit = themeId
    ? THEMES.filter((t) => t.id === themeId)
    : THEMES;

  const results: TokenContrastPair[] = [];

  for (const theme of themesToAudit) {
    for (const pair of theme.pairs) {
      const lightRatio = getContrastRatio(pair.lightFg, pair.lightBg);
      results.push({
        name: `[${theme.name}] ${pair.name} (Light)`,
        themeId: theme.id,
        fgName: pair.fgName,
        bgName: pair.bgName,
        fgHex: pair.lightFg,
        bgHex: pair.lightBg,
        mode: 'light',
        compliance: checkWcagCompliance(lightRatio),
      });

      const darkRatio = getContrastRatio(pair.darkFg, pair.darkBg);
      results.push({
        name: `[${theme.name}] ${pair.name} (Dark)`,
        themeId: theme.id,
        fgName: pair.fgName,
        bgName: pair.bgName,
        fgHex: pair.darkFg,
        bgHex: pair.darkBg,
        mode: 'dark',
        compliance: checkWcagCompliance(darkRatio),
      });
    }
  }

  return results;
}

/**
 * Audit standard semantic token pairs for default theme (Pulse)
 */
export function auditSemanticTokenPairs(): TokenContrastPair[] {
  return auditThemeTokenPairs('pulse');
}
