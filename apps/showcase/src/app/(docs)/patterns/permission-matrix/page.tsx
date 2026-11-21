'use client';

import * as React from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, PageHeader, PermissionMatrix } from '@ds/ui';
import type { PermissionValue } from '@ds/ui';
import {
  DEMO_RESOURCES,
  DEMO_ROLES,
  WIDE_ROLES,
  applyDirtyDemo,
  buildDemoValue,
  buildWideValue,
  demoLocked,
} from './_lib/demo-data';
import { PERMISSION_MATRIX_RECIPE } from './_lib/recipe';

type Scenario = 'demo' | 'dirty' | 'empty' | 'invalid' | 'loading' | 'error';

const SCENARIOS: { id: Scenario; label: string }[] = [
  { id: 'demo', label: 'Dataset 5×8 (kunci aktif)' },
  { id: 'dirty', label: 'Dirty 3 sel' },
  { id: 'empty', label: 'Kosong' },
  { id: 'invalid', label: 'Invalid (role ganda)' },
  { id: 'loading', label: 'Loading' },
  { id: 'error', label: 'Error' },
];

const STEPS = [
  'Buka halaman: matriks 5×8 tampil dengan sel awal dan kunci "Viewer × Hapus".',
  'Klik header kolom "Editor": semua sel Editor yang tidak terkunci menyala.',
  'Coba ubah sel "Viewer × Hapus": ditolak, dan alasan kunci diumumkan.',
  'Ubah tiga sel lain: banner perubahan muncul dengan jumlah perubahan.',
  'Tinjau banner: buka "Lihat daftar", lalu Reset atau Simpan.',
];

const KEYBOARD = [
  'Panah: pindah antar sel dan header.',
  'Space pada sel: ubah nilai; Enter atau Space pada header: toggle massal baris, kolom, atau semua.',
  'Home / End: awal atau akhir baris; Ctrl+Home / Ctrl+End: sudut grid.',
];

export default function PermissionMatrixPage() {
  const [scenario, setScenario] = React.useState<Scenario>('demo');
  const [wide, setWide] = React.useState(false);
  const [dark, setDark] = React.useState(false);
  const [value, setValue] = React.useState<PermissionValue>(buildDemoValue);
  const [saved, setSaved] = React.useState<PermissionValue>(buildDemoValue);
  const [notice, setNotice] = React.useState('');
  const [copyStatus, setCopyStatus] = React.useState('');

  const loadDataset = (next: Scenario, nextWide: boolean) => {
    const base = nextWide ? buildWideValue() : buildDemoValue();
    const start = next === 'dirty' && !nextWide ? applyDirtyDemo(base) : base;
    setScenario(next);
    setWide(nextWide);
    setSaved(base);
    setValue(start);
    setNotice('');
  };

  const selectScenario = (next: Scenario) => {
    const keepWide = next !== 'demo' && next !== 'dirty' && wide;
    loadDataset(next, keepWide);
  };

  const roles = scenario === 'empty'
    ? []
    : scenario === 'invalid'
      ? [...DEMO_ROLES, DEMO_ROLES[0]]
      : wide
        ? WIDE_ROLES
        : DEMO_ROLES;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PERMISSION_MATRIX_RECIPE);
      setCopyStatus('Resep tersalin.');
    } catch {
      setCopyStatus('Gagal menyalin; salin manual dari blok di atas.');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Pattern"
        title="Permission Matrix"
        description="Grid otorisasi role × resource: toggle massal dengan indeterminate, sel terkunci beralasan, banner perubahan, dan state loading, empty, serta error."
      />

      <Card className="mx-auto max-w-5xl">
        <CardHeader>
          <CardTitle>Skenario 5 langkah</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              aria-pressed={dark}
              onClick={() => setDark((current) => !current)}
            >
              {dark ? 'Tema: gelap' : 'Tema: terang'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              aria-pressed={wide}
              onClick={() => loadDataset('demo', !wide)}
            >
              Uji 20 kolom
            </Button>
          </div>

          <div
            data-testid="pm-theme-scope"
            className={
              dark
                ? 'dark space-y-4 rounded-lg border border-border bg-background p-4 text-foreground'
                : 'space-y-4 rounded-lg border border-border bg-background p-4 text-foreground'
            }
          >
            <PermissionMatrix
              roles={roles}
              resources={DEMO_RESOURCES}
              value={value}
              initialValue={saved}
              onValueChange={setValue}
              onSave={() => {
                setSaved(value);
                setNotice('Perubahan disimpan (demo).');
              }}
              onCancel={() => {
                setValue(saved);
                setNotice('Perubahan dibatalkan.');
              }}
              onLoadExample={() => loadDataset('demo', false)}
              onEmptyAction={() => loadDataset('demo', false)}
              loading={scenario === 'loading'}
              error={scenario === 'error' ? 'Sumber data tidak tersedia' : null}
              locked={demoLocked}
            />
          </div>

          <p role="status" className="text-sm text-muted-foreground" data-testid="pm-notice">
            {notice}
          </p>
        </CardContent>
      </Card>

      <Card className="mx-auto max-w-5xl">
        <CardHeader>
          <CardTitle>Navigasi keyboard</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
            {KEYBOARD.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="mx-auto max-w-5xl">
        <CardHeader>
          <CardTitle>Panel demo state</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {SCENARIOS.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                size="sm"
                aria-pressed={scenario === item.id}
                onClick={() => selectScenario(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Kunci &quot;Viewer × Hapus&quot; selalu aktif pada dataset 5×8. Dirty 3 sel mengubah tiga sel dari baseline.
          </p>
        </CardContent>
      </Card>

      <Card className="mx-auto max-w-5xl">
        <CardHeader>
          <CardTitle>Resep controlled</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">
            <code>{PERMISSION_MATRIX_RECIPE}</code>
          </pre>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              Salin resep
            </Button>
            <p role="status" className="text-sm text-muted-foreground">
              {copyStatus}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
