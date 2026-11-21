import { describe, it, expect } from 'vitest';
import {
  getContrastRatio,
  auditSemanticTokenPairs,
  auditThemeTokenPairs,
  hexToRgb,
  getRelativeLuminance,
} from './contrast';
import { THEMES } from './themes';

describe('WCAG 2.1 Contrast Calculation Engine', () => {
  it('converts hex strings to RGB accurately', () => {
    expect(hexToRgb('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
    expect(hexToRgb('#FFF')).toEqual({ r: 255, g: 255, b: 255 });
    expect(hexToRgb('#3D34B3')).toEqual({ r: 61, g: 52, b: 179 });
  });

  it('calculates relative luminance correctly', () => {
    expect(getRelativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1.0, 3);
    expect(getRelativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0.0, 3);
  });

  it('calculates pure black and white contrast as 21:1', () => {
    const ratio = getContrastRatio('#000000', '#FFFFFF');
    expect(ratio).toBeCloseTo(21.0, 1);
  });

  it('all semantic token pairs in default Pulse theme satisfy at least WCAG AA (>= 4.5:1)', () => {
    const audited = auditSemanticTokenPairs();
    for (const tokenPair of audited) {
      expect(
        tokenPair.compliance.ratio,
        `Token pair "${tokenPair.name}" has contrast ${tokenPair.compliance.ratioFormatted}, expected >= 4.5:1 (WCAG AA)`
      ).toBeGreaterThanOrEqual(4.5);
      expect(tokenPair.compliance.passAA).toBe(true);
    }
  });

  it('all themes satisfy WCAG AA (>= 4.5:1) across light and dark modes', () => {
    const allAudited = auditThemeTokenPairs();
    expect(allAudited.length).toBe(THEMES.length * 10 * 2); // all themes * 10 pairs * 2 modes
    for (const tokenPair of allAudited) {
      expect(
        tokenPair.compliance.ratio,
        `Theme token pair "${tokenPair.name}" has contrast ${tokenPair.compliance.ratioFormatted}, expected >= 4.5:1 (WCAG AA)`
      ).toBeGreaterThanOrEqual(4.5);
      expect(tokenPair.compliance.passAA).toBe(true);
    }
  });

  it('semantic text-on-surface tokens (soft badge text) satisfy WCAG AA (>= 4.5:1) on card surfaces', () => {
    const cases = [
      { name: 'Warning Text', fg: '#B45309', bg: '#FFFFFF' },
      { name: 'Destructive Text', fg: '#B91C1C', bg: '#FFFFFF' },
      { name: 'Warning Text', fg: '#FBBF24', bg: '#141620' },
      { name: 'Destructive Text', fg: '#F87171', bg: '#141620' },
      // Inverse surface is fixed across all 8 themes and both modes (CR-006)
      { name: 'Inverse Foreground', fg: '#F4F4F5', bg: '#09090B' },
    ];
    for (const c of cases) {
      const ratio = getContrastRatio(c.fg, c.bg);
      expect(
        ratio,
        `${c.name} (${c.fg} on ${c.bg}) has contrast ${ratio.toFixed(2)}:1, expected >= 4.5:1 (WCAG AA)`
      ).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('destructive text on tinted error cell (bg-destructive/10) satisfies WCAG AA (>= 4.5:1) and error graphic >= 3:1 in light & dark (014-03)', () => {
    const mix = (base: string, tint: string, t: number): string => {
      const a = hexToRgb(base);
      const b = hexToRgb(tint);
      const toHex = (v: number) => Math.round(v).toString(16).padStart(2, '0');
      return `#${toHex(a.r * (1 - t) + b.r * t)}${toHex(a.g * (1 - t) + b.g * t)}${toHex(a.b * (1 - t) + b.b * t)}`;
    };
    // Light: text-destructive (#B91C1C) on bg-destructive/10 over card (#FFFFFF)
    const lightCell = mix('#FFFFFF', '#DC2626', 0.1);
    expect(getContrastRatio('#B91C1C', lightCell)).toBeGreaterThanOrEqual(4.5);
    // Dark: text-destructive (#F87171) on bg-destructive/10 over card (#141620)
    const darkCell = mix('#141620', '#F87171', 0.1);
    expect(getContrastRatio('#F87171', darkCell)).toBeGreaterThanOrEqual(4.5);
    // Graphic (border/ikon error) >= 3:1 on surface
    expect(getContrastRatio('#DC2626', '#FFFFFF')).toBeGreaterThanOrEqual(3);
    expect(getContrastRatio('#F87171', '#141620')).toBeGreaterThanOrEqual(3);
  });

  it('critical text pairs satisfy WCAG AAA (>= 7.0:1) across all themes', () => {
    for (const theme of THEMES) {
      const themeAudited = auditThemeTokenPairs(theme.id);
      const bodyTextLight = themeAudited.find((p) => p.name.includes('Default Body Text (Light)'));
      const bodyTextDark = themeAudited.find((p) => p.name.includes('Default Body Text (Dark)'));

      expect(
        bodyTextLight?.compliance.ratio,
        `[${theme.name}] Light Body Text contrast ${bodyTextLight?.compliance.ratioFormatted} < 7.0:1`
      ).toBeGreaterThanOrEqual(7.0);
      expect(
        bodyTextDark?.compliance.ratio,
        `[${theme.name}] Dark Body Text contrast ${bodyTextDark?.compliance.ratioFormatted} < 7.0:1`
      ).toBeGreaterThanOrEqual(7.0);
    }
  });
});
