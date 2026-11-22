'use client';

import * as React from 'react';
import { PageHeader } from '@ds/ui';
import { TransferList, type TransferItem } from '@ds/ui';

const ROLE_MEMBERS: TransferItem[] = [
  { id: 'u-01', label: 'Alice — Frontend' },
  { id: 'u-02', label: 'Bob — Backend' },
  { id: 'u-03', label: 'Carol — QA' },
  { id: 'u-04', label: 'Dave — PM' },
  { id: 'u-05', label: 'Erin — Frontend' },
  { id: 'u-06', label: 'Frank — QA' },
  { id: 'u-07', label: 'Grace — Designer' },
  { id: 'u-08', label: 'Hank — Backend' },
  { id: 'u-09', label: 'Ivy — DevOps' },
  { id: 'u-10', label: 'Jack — Frontend' },
  { id: 'u-11', label: 'Kim — QA' },
  { id: 'u-12', label: 'Leo — Support' },
  { id: 'u-13', label: 'Maya — PM' },
  { id: 'u-14', label: 'Noah — Backend' },
  { id: 'u-15', label: 'Olivia — Designer' },
];

type DemoState = 'success' | 'loading' | 'empty' | 'error';

export default function TransferListPatternPage() {
  const [value, setValue] = React.useState<string[]>(['u-13', 'u-14', 'u-15']);
  const [demoState, setDemoState] = React.useState<DemoState>('success');

  const isLoading = demoState === 'loading';
  const isEmpty = demoState === 'empty';
  const demoError = demoState === 'error' ? 'Failed to load members. Try again.' : null;
  const demoItems = isEmpty ? [] : ROLE_MEMBERS;
  const demoValue = isEmpty ? [] : value;

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Transfer List — Assign Role (S-005.30)"
        description="Dual-listbox controlled untuk assign role/anggota: pindah tiga cara, filter per panel, keyboard penuh. Coba light & dark via theme toggle."
      />
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Demo state">
        {(['success', 'loading', 'empty', 'error'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setDemoState(s)}
            aria-pressed={demoState === s}
            className={
              demoState === s
                ? 'rounded-md bg-highlight/10 ring-1 ring-highlight px-3 py-1.5 text-sm text-foreground'
                : 'rounded-md border border-border px-3 py-1.5 text-sm text-foreground'
            }
          >
            {s}
          </button>
        ))}
      </div>
      <TransferList
        items={demoItems}
        value={demoValue}
        onChange={isEmpty ? () => undefined : setValue}
        loading={isLoading}
        error={demoError}
        availableLabel="Available members"
        selectedLabel="Role members"
      />
      <ol className="flex flex-col gap-1 text-sm text-muted-foreground">
        <li>1. Pilih item di panel kiri (klik, Ctrl+klik multi, Shift+klik rentang).</li>
        <li>2. Pindah via tombol (→), double-click, atau pindah-semua yang tampil.</li>
        <li>3. Filter tiap panel tanpa mengubah nilai terkontrol.</li>
        <li>4. Keyboard: Tab ke listbox, panah navigasi, Space/Enter seleksi, Tab ke tombol pindah.</li>
        <li>5. Fokus berpindah logis ke panel tujuan setelah aksi pindah.</li>
        <li>6. State loading (skeleton), empty per panel, dan error tersedia di toggle di atas.</li>
      </ol>
    </div>
  );
}
