// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { highlightCode } from './code-block-highlight';

// Permukaan `--card` dari packages/tokens/src/tokens.css (light: oklch(1 0 0) = #ffffff;
// dark: 8 varian tema, dikonversi ke sRGB).
const LIGHT_CARD = '#ffffff';
const DARK_CARDS = ['#0d121a', '#1c110c', '#0a140c', '#080a14', '#0f0b16', '#040f17', '#080d16', '#090b0f'];

const SAMPLE = `const greet = (name: string) => { // comment
  return \`hi \${name}\`;
}
export function add(a: number, b = 2) { return a + b; }`;

const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

const collectVar = (html: string, name: string): string[] =>
  [...html.matchAll(new RegExp(`--${name}:(#[0-9a-fA-F]{6})`, 'g'))].map((m) => m[1].toLowerCase());

describe('highlightCode', () => {
  it('emits dual-theme token variables for a known language', async () => {
    const html = await highlightCode(SAMPLE, 'tsx');
    expect(html).not.toBeNull();
    expect(html).toContain('--shiki-light:');
    expect(html).toContain('--shiki-dark:');
    expect(html).not.toContain('background-color');
  });

  it('returns null for an unknown language so callers fall back to flat code', async () => {
    expect(await highlightCode('x', 'not-a-real-lang')).toBeNull();
  });

  it('applies the AA palette overrides (no original low-contrast colors remain)', async () => {
    const html = (await highlightCode(SAMPLE, 'tsx')) ?? '';
    expect(html).not.toContain('#e36209');
    expect(collectVar(html, 'shiki-dark')).not.toContain('#6a737d');
  });

  it('keeps every token color at WCAG AA (>= 4.5:1) on light and dark card surfaces', async () => {
    const html = (await highlightCode(SAMPLE, 'tsx')) ?? '';
    const light = [...new Set(collectVar(html, 'shiki-light'))];
    const dark = [...new Set(collectVar(html, 'shiki-dark'))];
    expect(light.length).toBeGreaterThan(0);
    expect(dark.length).toBeGreaterThan(0);
    for (const c of light) expect(contrast(c, LIGHT_CARD)).toBeGreaterThanOrEqual(4.5);
    for (const c of dark) {
      for (const card of DARK_CARDS) expect(contrast(c, card)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
