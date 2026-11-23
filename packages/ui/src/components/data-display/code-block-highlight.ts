import { codeToHtml } from 'shiki/bundle/web';
import type { ShikiTransformer } from 'shiki';

/**
 * Override warna syntax yang gagal WCAG AA (>= 4.5:1) terhadap permukaan `card`
 * seluruh tema (light: putih; dark: 8 varian `--card`). Nilai asli github-light/dark
 * di kiri, pengganti di kanan. Audit: `code-block-highlight.test.ts` (CR-070).
 */
const LIGHT_OVERRIDES: Record<string, string> = { '#e36209': '#b35400' };
const DARK_OVERRIDES: Record<string, string> = { '#6a737d': '#8b949e' };

const recolorTokens: ShikiTransformer = {
  name: 'ds-recolor-tokens',
  pre(node) {
    // Background & warna dasar dikendalikan CSS token (`.ds-code-block`), bukan inline style Shiki.
    delete node.properties.style;
    delete node.properties.tabindex;
  },
  span(node) {
    const style = node.properties.style;
    if (typeof style !== 'string') return;
    node.properties.style = style
      .replace(/--shiki-light:(#[0-9a-fA-F]{6})/, (_, c: string) => `--shiki-light:${LIGHT_OVERRIDES[c.toLowerCase()] ?? c}`)
      .replace(/--shiki-dark:(#[0-9a-fA-F]{6})/, (_, c: string) => `--shiki-dark:${DARK_OVERRIDES[c.toLowerCase()] ?? c}`);
  },
};

/**
 * Menghasilkan HTML ter-highlight (dua tema via variabel CSS `--shiki-light` / `--shiki-dark`).
 * Mengembalikan `null` untuk bahasa tidak dikenal sehingga pemanggil jatuh ke render flat.
 */
export async function highlightCode(code: string, language: string): Promise<string | null> {
  try {
    return await codeToHtml(code, {
      lang: language,
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
      transformers: [recolorTokens],
    });
  } catch {
    // Bahasa tidak dikenal Shiki: tampilkan kode flat tanpa highlight.
    return null;
  }
}
