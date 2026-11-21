import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const css = readFileSync(`${import.meta.dirname}/tokens.css`, 'utf8');

type ColorMapping = { name: string; source: string };

function readColorMappings(block: string): ColorMapping[] {
  return [...block.matchAll(/--color-([a-z0-9-]+):\s*var\(--([a-z0-9-]+)\)/g)].map(
    ([, name, source]) => ({ name, source }),
  );
}

function readBlock(pattern: RegExp): string {
  const match = css.match(pattern);
  if (!match) throw new Error(`Blok CSS tidak ditemukan: ${pattern}`);
  return match[1];
}

const themeMappings = readColorMappings(readBlock(/@theme\s*\{([\s\S]*?)\n\}/));
const scopeMappings = readColorMappings(readBlock(/\[data-theme\],\s*\.dark\s*\{([\s\S]*?)\n\}/));

describe('tokens.css — scope tema bersarang (CR-033)', () => {
  it('@theme memetakan --color-X ke var(--X) untuk setiap warna', () => {
    expect(themeMappings.length).toBeGreaterThan(0);
    for (const { name, source } of themeMappings) {
      expect(source, `--color-${name}`).toBe(name);
    }
  });

  it('blok scope [data-theme], .dark memetakan ulang semua --color-* dari @theme, dengan urutan dan nilai sama', () => {
    expect(scopeMappings).toEqual(themeMappings);
  });
});
