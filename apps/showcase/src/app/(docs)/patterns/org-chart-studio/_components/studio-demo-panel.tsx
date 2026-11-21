'use client';

import { Button, useTheme } from '@ds/ui';
import type { StudioInvalidKind } from './studio-demo-data';

export type StudioDemoKind = 'success' | 'contoh' | 'loading' | 'empty' | 'invalid' | 'eksternal';

const DEMO_KINDS: Array<{ id: StudioDemoKind; label: string; hint: string }> = [
  { id: 'success', label: 'Berisi', hint: 'kanvas + controls + minimap aktif' },
  { id: 'contoh', label: 'Contoh 40', hint: '40 orang / 4 tingkat / 4 departemen' },
  { id: 'loading', label: 'Memuat', hint: 'skeleton 8 kartu + teks SR + aria-busy' },
  { id: 'empty', label: 'Kosong', hint: 'role=status + CTA Buat root' },
  { id: 'invalid', label: 'Invalid', hint: 'role=alert + penyebab + id + salin' },
  { id: 'eksternal', label: 'Eksternal', hint: 'alert di atas diagram terakhir' },
];

const INVALID_KINDS: Array<{ id: StudioInvalidKind; label: string }> = [
  { id: 'duplikat', label: 'ID duplikat' },
  { id: 'parent-hilang', label: 'Parent hilang' },
  { id: 'siklus', label: 'Siklus' },
];

interface StudioDemoPanelProps {
  kind: StudioDemoKind;
  onKindChange: (kind: StudioDemoKind) => void;
  invalidKind: StudioInvalidKind;
  onInvalidKindChange: (kind: StudioInvalidKind) => void;
  minimap: boolean;
  onMinimapChange: (value: boolean) => void;
  onLoadExample: () => void;
  onReset: () => void;
}

export function StudioDemoPanel({
  kind,
  onKindChange,
  invalidKind,
  onInvalidKindChange,
  minimap,
  onMinimapChange,
  onLoadExample,
  onReset,
}: StudioDemoPanelProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = (resolvedTheme ?? theme) === 'dark';

  return (
    <section aria-labelledby="org-studio-demo-panel" className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="org-studio-demo-panel" className="text-base font-semibold text-foreground">
          Panel demo — 6 state matrix (FR-012)
        </h2>
        <p className="text-xs text-muted-foreground">Pemicu di luar komponen; state dikelola page (controlled).</p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Pemicu state demo">
        {DEMO_KINDS.map((option) => (
          <Button
            key={option.id}
            type="button"
            size="sm"
            variant={kind === option.id ? 'default' : 'outline'}
            onClick={() => onKindChange(option.id)}
            title={option.hint}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {kind === 'invalid' ? (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Jenis dataset invalid">
          <span className="text-xs font-medium text-muted-foreground">Dataset invalid:</span>
          {INVALID_KINDS.map((option) => (
            <Button
              key={option.id}
              type="button"
              size="sm"
              variant={invalidKind === option.id ? 'secondary' : 'ghost'}
              onClick={() => onInvalidKindChange(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <label className="inline-flex cursor-pointer items-center gap-2 text-foreground">
          <input
            type="checkbox"
            checked={minimap}
            onChange={(event) => onMinimapChange(event.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Minimap
        </label>
        <label className="inline-flex cursor-pointer items-center gap-2 text-foreground">
          <input
            type="checkbox"
            checked={isDark}
            onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
            className="h-4 w-4 accent-primary"
          />
          Mode gelap
        </label>
        <span className="text-xs text-muted-foreground" role="status">
          {DEMO_KINDS.find((option) => option.id === kind)?.hint}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={onLoadExample}>
          Muat contoh 40 orang/4 tingkat/4 departemen
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onReset}>
          Reset demo
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Eksternal memakai banner <code>role=&quot;alert&quot;</code> milik page di atas kanvas agar diagram terakhir
        tetap tampil; invalid memakai validasi terstruktur komponen (penyebab + id pertama + Salin detail).
      </p>
    </section>
  );
}
