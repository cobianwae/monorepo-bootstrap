import { describe, it, expect } from 'vitest';
import {
  getContrastRatio,
  auditSemanticTokenPairs,
  hexToRgb,
  getRelativeLuminance,
} from './contrast';

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

  it('all semantic token pairs satisfy at least WCAG AA (>= 4.5:1)', () => {
    const audited = auditSemanticTokenPairs();
    for (const tokenPair of audited) {
      expect(
        tokenPair.compliance.ratio,
        `Token pair "${tokenPair.name}" has contrast ${tokenPair.compliance.ratioFormatted}, expected >= 4.5:1 (WCAG AA)`
      ).toBeGreaterThanOrEqual(4.5);
      expect(tokenPair.compliance.passAA).toBe(true);
    }
  });

  it('critical text pairs (Body text, Card content) satisfy WCAG AAA (>= 7.0:1)', () => {
    const audited = auditSemanticTokenPairs();
    const bodyTextLight = audited.find((p) => p.name === 'Default Body Text (Light)');
    const bodyTextDark = audited.find((p) => p.name === 'Default Body Text (Dark)');

    expect(bodyTextLight?.compliance.ratio).toBeGreaterThanOrEqual(7.0);
    expect(bodyTextDark?.compliance.ratio).toBeGreaterThanOrEqual(7.0);
  });
});
