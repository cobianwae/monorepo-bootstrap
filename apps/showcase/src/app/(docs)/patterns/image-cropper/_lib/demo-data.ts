import type { CropOutputSize } from '@ds/ui';

export type CropScenario = 'avatar' | 'cover';

export type AspectPreset = 'square' | 'wide' | 'standard' | 'free';

export interface ScenarioConfig {
  aspect: number | 'free';
  cropShape: 'rect' | 'round';
  outputSize: CropOutputSize;
  label: string;
}

export const SCENARIOS: Record<CropScenario, ScenarioConfig> = {
  avatar: {
    aspect: 1,
    cropShape: 'round',
    outputSize: { width: 512, height: 512 },
    label: 'Avatar 1:1 · lingkaran · 512×512',
  },
  cover: {
    aspect: 16 / 9,
    cropShape: 'rect',
    outputSize: { width: 1280, height: 720 },
    label: 'Cover 16:9 · persegi · 1280×720',
  },
};

export const ASPECT_OPTIONS: { id: AspectPreset; label: string; aspect: number | 'free' }[] = [
  { id: 'square', label: '1:1', aspect: 1 },
  { id: 'wide', label: '16:9', aspect: 16 / 9 },
  { id: 'standard', label: '4:3', aspect: 4 / 3 },
  { id: 'free', label: 'Bebas', aspect: 'free' },
];

export const STEPS = [
  'Pilih foto avatar: area crop 1:1 muncul dengan pratinjau lingkaran.',
  'Geser area dengan drag atau panah keyboard, lalu ubah zoom dengan slider.',
  'Putar 90° dengan tombol, lalu atur ulang untuk kembali ke awal tanpa upload ulang.',
  'Cek pratinjau lingkaran berubah mengikuti area crop secara live.',
  'Simpan hasil: blob 512×512 diteruskan lewat onComplete.',
  'Ulangi untuk cover: pilih skenario Cover 16:9, hasil 1280×720.',
];

export const KEYBOARD = [
  'Panah: geser area crop 10px (Shift + panah = 1px presisi).',
  '+ / −: zoom dalam batas 100%–500%; slider ikut tersinkron.',
  'R: putar 90° (Shift + R putar balik); 0: atur ulang ke awal file.',
  'Tab: urutan Pilih foto → aspek → area → slider → tombol → pratinjau → Simpan.',
];

export interface DemoDataset {
  id: 'valid' | 'rusak' | 'raksasa';
  title: string;
  hint: string;
  accept?: string;
  maxBytes?: number;
}

export const DEMO_DATASETS: DemoDataset[] = [
  {
    id: 'valid',
    title: 'Valid — PNG/JPG/WebP ≤ 10 MB',
    hint: 'Unggah foto valid: area crop muncul, loading tampil sesaat saat decode.',
  },
  {
    id: 'rusak',
    title: 'Rusak — format tidak diterima',
    hint: 'Hanya PNG yang diterima: unggah JPG untuk memicu error format dengan penyebab.',
    accept: 'image/png',
  },
  {
    id: 'raksasa',
    title: 'Raksasa — melebihi batas ukuran',
    hint: 'Batas demo 1 KB (mock ukuran tercatat, bukan file besar): unggah file apa pun > 1 KB untuk memicu error ukuran.',
    maxBytes: 1024,
  },
];

export interface AuditPair {
  pair: string;
  kind: 'teks' | 'grafis';
  threshold: string;
}

export const AUDIT_PAIRS: AuditPair[] = [
  { pair: 'foreground di atas background', kind: 'teks', threshold: '≥ 4,5:1' },
  { pair: 'muted-foreground di atas background', kind: 'teks', threshold: '≥ 4,5:1' },
  { pair: 'primary (garis viewport, gagang, ring fokus)', kind: 'grafis', threshold: '≥ 3:1' },
  { pair: 'primary-foreground di atas primary (label tombol)', kind: 'teks', threshold: '≥ 4,5:1' },
  { pair: 'destructive di atas background (pesan error)', kind: 'teks', threshold: '≥ 4,5:1' },
  { pair: 'overlay background/80 di atas foto', kind: 'grafis', threshold: '≥ 3:1' },
];
