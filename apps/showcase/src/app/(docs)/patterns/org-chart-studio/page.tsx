'use client';

// Draf showcase OrgChartStudio (011-02): demonstrasi tambah 1-klik inline-edit
// + panel detail on-demand dengan state controlled milik konsumen.
// Scope penuh (langkah bernomor, search, state matrix) di 011-05.

import * as React from 'react';
import { Sparkles } from 'lucide-react';
import { Button, OrgChartStudio, PageHeader, type OrgStudioNodeFlat } from '@ds/ui';

const seedData: OrgStudioNodeFlat[] = [
  { id: 'ceo', parentId: null, title: 'Ratna Wijaya', subtitle: 'Chief Executive Officer', badge: 'Direksi', accent: 'primary' },
  { id: 'eng-head', parentId: 'ceo', title: 'Bima Prasetyo', subtitle: 'VP Engineering', badge: 'Engineering', accent: 'info' },
  { id: 'eng-fe', parentId: 'eng-head', title: 'Sari Dewi', subtitle: 'Engineering Manager Frontend', badge: 'Engineering', accent: 'info' },
  { id: 'eng-be', parentId: 'eng-head', title: 'Andi Kurniawan', subtitle: 'Engineering Manager Backend', badge: 'Engineering', accent: 'info' },
  { id: 'ops-head', parentId: 'ceo', title: 'Eko Santoso', subtitle: 'VP Operations', badge: 'Operations', accent: 'success' },
  { id: 'ops-mgr', parentId: 'ops-head', title: 'Nina Hartati', subtitle: 'Operations Manager', badge: 'Operations', accent: 'success' },
];

export default function OrgChartStudioPage() {
  const [data, setData] = React.useState<OrgStudioNodeFlat[]>(seedData);

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="Org Chart Studio / Studio Organisasi"
        description="Draf 011-02 (S-005.34): tambah bawahan/sejawat 1 klik via gagang + inline-edit tanpa membuka form, dan panel detail (S-005.34.01) sheet kanan yang hanya terbuka bila diminta — tombol [≡], double-click, klik avatar, atau Shift+Enter. Tiap commit memanggil onChange sekali; toast menyediakan Urungkan."
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={() => setData(seedData)}>
          Reset demo
        </Button>
        <p className="text-sm text-muted-foreground">
          Arahkan ke kartu untuk melihat gagang <span aria-hidden="true">+</span> bawah (bawahan) dan samping
          (sejawat); Enter simpan, Esc batal.
        </p>
      </div>

      <div className="space-y-2">
        <OrgChartStudio data={data} onChange={setData} ariaLabel="Org chart studio" />
        <p className="text-xs text-muted-foreground">
          Resep kontrol: pegang <code>data</code> di state, sambung <code>onChange</code> langsung ke{' '}
          <code>setData</code> (log demo mock).
        </p>
      </div>
    </div>
  );
}
