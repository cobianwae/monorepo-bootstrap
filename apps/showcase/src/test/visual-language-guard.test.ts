import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Pagar docs/design/visual-language.md untuk halaman docs showcase.
 * - Aturan `arbitrary-px-text` berlaku untuk seluruh app/(docs) (CR-038).
 * - Aturan heading/callout/segmented hanya berlaku di app/(docs)/foundations.
 *   Perluas ke components/ dan patterns/ setelah halamannya dirapikan (CR-039).
 */
const SRC = fileURLToPath(new URL('..', import.meta.url));
const DOCS = join(SRC, 'app', '(docs)');
const FOUNDATIONS = join(DOCS, 'foundations');

interface Rule {
  id: string;
  pattern: RegExp;
  hint: string;
  /** Akar yang dipindai; default foundations. */
  root?: string;
}

const RULES: Rule[] = [
  {
    id: 'arbitrary-px-text',
    pattern: /text-\[\d+px\]/,
    hint: 'Teks terkecil adalah text-xs (Caption/Meta). Dilarang text-[Npx].',
    root: SRC,
  },
  {
    id: 'manual-heading-lg-bold',
    pattern: /<h[23] className="text-lg font-bold/,
    hint: 'text-lg bukan heading. Pakai <SectionHeading /> (Heading 2/3).',
    root: DOCS,
  },
  {
    id: 'manual-section-heading',
    pattern: /<h2 className="text-2xl font-bold/,
    hint: 'Heading section ditulis lewat <SectionHeading />, bukan class manual.',
  },
  {
    id: 'manual-heading-with-icon',
    pattern: /<h2 className="[^"]*flex items-center/,
    hint: 'Heading section tanpa ikon dan tanpa class manual. Pakai <SectionHeading />.',
  },
  {
    id: 'decorative-primary-callout',
    pattern: /border-primary\/30 bg-primary\/5/,
    hint: 'primary hanya untuk aksi. Panel/callout memakai border-highlight/30 bg-highlight/5.',
  },
  {
    id: 'handmade-segmented-selected',
    pattern: /\? 'bg-primary text-primary-foreground shadow-xs'/,
    hint: 'Segmented/toggle wajib memakai SegmentedControl dari @ds/ui.',
  },
  {
    id: 'solid-primary-fill',
    pattern: /\bbg-primary text-primary-foreground\b/,
    hint: 'Fill solid primary hanya untuk tombol aksi (Button). Ikon/state memakai highlight atau bg-background + ring (CR-047, CR-050).',
    root: SRC,
  },
];

function collectPages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return collectPages(full);
    return name === 'page.tsx' ? [full] : [];
  });
}

function collectSources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return collectSources(full);
    return name.endsWith('.tsx') && !name.endsWith('.test.tsx') ? [full] : [];
  });
}

function findViolations(files: string[], rules: Rule[]): string[] {
  const violations: string[] = [];
  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
      for (const rule of rules) {
        if (rule.pattern.test(line)) {
          violations.push(`${relative(SRC, file)}:${index + 1} [${rule.id}] ${rule.hint}`);
        }
      }
    });
  }
  return violations;
}

const foundationFiles = collectPages(FOUNDATIONS);
const docsFiles = collectPages(DOCS);
const sourceFiles = collectSources(SRC);
const foundationRules = RULES.filter((rule) => rule.root === undefined);
const docsRules = RULES.filter((rule) => rule.root === DOCS);
const sourceRules = RULES.filter((rule) => rule.root === SRC);

describe('visual-language guard — halaman docs', () => {
  it('menemukan halaman yang dipindai', () => {
    expect(foundationFiles.length).toBeGreaterThanOrEqual(7);
    expect(docsFiles.length).toBeGreaterThanOrEqual(foundationFiles.length);
  });

  it('foundations tidak melanggar aturan visual-language', () => {
    expect(findViolations(foundationFiles, foundationRules)).toEqual([]);
  });

  it('seluruh app/(docs) tidak memakai text-lg font-bold sebagai heading (CR-051)', () => {
    expect(findViolations(docsFiles, docsRules)).toEqual([]);
  });

  it('seluruh src (non-test .tsx) tidak memakai text-[Npx] (CR-045)', () => {
    expect(sourceFiles.length).toBeGreaterThan(docsFiles.length);
    expect(findViolations(sourceFiles, sourceRules)).toEqual([]);
  });

  it('SectionHeading dipakai di halaman yang punya heading section', () => {
    const files = foundationFiles;
    const missing = files
      .filter((file) => /<SectionHeading\b/.test(readFileSync(file, 'utf8')) === false)
      .filter((file) => /<section\b[^>]*id=/.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SRC, file));
    expect(missing).toEqual([]);
  });
});
