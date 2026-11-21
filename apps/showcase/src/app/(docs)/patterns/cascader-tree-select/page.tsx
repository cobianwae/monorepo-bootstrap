'use client';

import * as React from 'react';
import { PageHeader, Cascader, TreeSelect, type CascaderNode, type TreeSelectNode } from '@ds/ui';

const ADDRESS: CascaderNode[] = [
  { id: 'id', parentId: null, label: 'ID' },
  { id: 'jabar', parentId: 'id', label: 'Jawa Barat' },
  { id: 'jatim', parentId: 'id', label: 'Jawa Timur' },
  { id: 'bdg', parentId: 'jabar', label: 'Bandung' },
  { id: 'bgr', parentId: 'jabar', label: 'Bogor' },
  { id: 'sby', parentId: 'jatim', label: 'Surabaya' },
  { id: 'mlg', parentId: 'jatim', label: 'Malang' },
  { id: 'coblong', parentId: 'bdg', label: 'Coblong', isLeaf: true },
  { id: 'sukajadi', parentId: 'bdg', label: 'Sukajadi', isLeaf: true },
  { id: 'bogor-sel', parentId: 'bgr', label: 'Bogor Selatan', isLeaf: true },
  { id: 'genteng', parentId: 'sby', label: 'Genteng', isLeaf: true },
  { id: 'klojen', parentId: 'mlg', label: 'Klojen', isLeaf: true },
];

const LAZY_ROOT: CascaderNode[] = [{ id: 'id', parentId: null, label: 'ID' }];

function fakeFetch(parentId: string | null): Promise<CascaderNode[]> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (parentId === null || parentId === 'id') {
        resolve([
          { id: 'jabar', parentId: 'id', label: 'Jawa Barat' },
          { id: 'jatim', parentId: 'id', label: 'Jawa Timur' },
        ]);
      } else if (parentId === 'jabar') {
        resolve([
          { id: 'bdg', parentId: 'jabar', label: 'Bandung' },
          { id: 'bgr', parentId: 'jabar', label: 'Bogor' },
        ]);
      } else if (parentId === 'bdg') {
        resolve([{ id: 'coblong', parentId: 'bdg', label: 'Coblong', isLeaf: true }]);
      } else {
        resolve([{ id: `${parentId}-leaf`, parentId, label: `${parentId} Kec.`, isLeaf: true }]);
      }
    }, 400);
  });
}

const CATEGORY: TreeSelectNode[] = [
  { id: 'el', parentId: null, label: 'Elektronik' },
  { id: 'hp', parentId: 'el', label: 'HP' },
  { id: 'android', parentId: 'hp', label: 'Android' },
  { id: 'ios', parentId: 'hp', label: 'iOS' },
  { id: 'laptop', parentId: 'el', label: 'Laptop' },
  { id: 'fashion', parentId: null, label: 'Fashion' },
  { id: 'pria', parentId: 'fashion', label: 'Pria' },
  { id: 'wanita', parentId: 'fashion', label: 'Wanita' },
];

export default function CascaderTreeSelectPatternPage() {
  const [value, setValue] = React.useState<string[]>(['id', 'jabar', 'bdg', 'coblong']);
  const [displayMode, setDisplayMode] = React.useState<'full' | 'last'>('full');
  const [lazyValue, setLazyValue] = React.useState<string[]>([]);
  const [single, setSingle] = React.useState<string | string[]>('');
  const [multi, setMulti] = React.useState<string | string[]>(['android', 'ios', 'laptop', 'pria', 'wanita']);

  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Cascader & Tree Select — Alamat/Kategori (S-005.31)"
        description="Dropdown kolom bertingkat 3 tingkat (provinsi → kota → kecamatan) dengan lazy load, pencarian, dan keyboard penuh. Tree Select membuka tree-view di popover: single menutup saat leaf dipilih, multiple maks. 3 tag + collapse. Coba light & dark via theme toggle."
      />

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Demo utama — alamat bertingkat</h2>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Display mode">
          {(['full', 'last'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setDisplayMode(m)}
              aria-pressed={displayMode === m}
              className={
                displayMode === m
                  ? 'rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground'
                  : 'rounded-md border border-border px-3 py-1.5 text-sm text-foreground'
              }
            >
              {m === 'full' ? 'Mode penuh' : 'Mode level-terakhir'}
            </button>
          ))}
        </div>
        <Cascader
          options={ADDRESS}
          value={value}
          onChange={setValue}
          displayMode={displayMode}
          label="Alamat domisili"
          placeholder="Pilih provinsi → kota → kecamatan"
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Nilai: {value.length === 0 ? '—' : value.join(' → ')}
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">Lazy load per kolom (tiruan fetch 400ms)</h2>
        <Cascader
          options={LAZY_ROOT}
          value={lazyValue}
          onChange={setLazyValue}
          loadChildren={fakeFetch}
          label="Alamat lazy"
          placeholder="Buka tiap kolom untuk memuat anak"
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Nilai lazy: {lazyValue.length === 0 ? '—' : lazyValue.join(' → ')}
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Clearable</h2>
          <Cascader options={ADDRESS} value={value} onChange={setValue} label="Bisa dihapus" />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Disabled</h2>
          <Cascader options={ADDRESS} value={value} onChange={setValue} disabled label="Nonaktif" />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Error</h2>
          <Cascader
            options={ADDRESS}
            value={[]}
            onChange={() => undefined}
            error="Wilayah wajib dipilih"
            label="Alamat wajib"
          />
        </div>
      </section>

      <ol className="flex flex-col gap-1 text-sm text-muted-foreground">
        <li>1. Pilih ID → provinsi → kota → kecamatan; kolom anak terbuka di sebelah tiap pilihan.</li>
        <li>2. Memilih kecamatan (leaf) menutup dropdown dan mengisi nilai path lengkap.</li>
        <li>3. Toggle mode penuh vs level-terakhir untuk dua tampilan nilai.</li>
        <li>4. Ketik di kolom pencarian untuk hasil flat; memilih hasil mengisi path lengkap.</li>
        <li>5. Keyboard: Tab ke trigger, Enter buka, panah navigasi antar kolom/opsi, Enter pilih, Escape tutup.</li>
        <li>6. Lazy: buka kolom untuk fetch tiruan dengan skeleton per kolom.</li>
      </ol>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Tree Select — kategori produk (single)
        </h2>
        <TreeSelect
          options={[...CATEGORY]}
          value={single}
          onChange={setSingle}
          label="Kategori utama"
          placeholder="Pilih kategori"
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Nilai: {single === '' ? '—' : String(single)}
        </p>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-semibold text-foreground">
          Tree Select — multiple maks. 3 tag + collapse
        </h2>
        <TreeSelect
          options={[...CATEGORY]}
          multiple
          value={multi}
          onChange={setMulti}
          label="Kategori favorit"
          placeholder="Pilih beberapa kategori"
        />
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Nilai: {Array.isArray(multi) && multi.length > 0 ? multi.join(', ') : '—'}
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Tree Select loading</h2>
          <TreeSelect options={[]} loading label="Memuat" />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Tree Select empty</h2>
          <TreeSelect options={[]} label="Kosong" emptyText="Belum ada kategori." />
        </div>
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Tree Select error</h2>
          <TreeSelect
            options={[...CATEGORY]}
            label="Gagal"
            error="Kategori gagal dimuat, coba lagi."
          />
        </div>
      </section>

      <ol className="flex flex-col gap-1 text-sm text-muted-foreground" start={7}>
        <li>7. Tree Select: buka popover berisi tree-view; klik leaf mengisi nilai dan menutup.</li>
        <li>8. Nilai awal dalam (mis. Android) otomatis men-expand ancestors saat popover dibuka.</li>
        <li>9. Multiple menampilkan maks. 3 tag + collapse +N; hapus via tombol × tiap tag.</li>
        <li>10. Keyboard: Tab ke trigger, Enter buka, panah/Enter/Space di tree, Escape tutup.</li>
      </ol>
    </div>
  );
}
