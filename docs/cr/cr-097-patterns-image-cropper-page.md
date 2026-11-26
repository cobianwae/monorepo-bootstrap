# CR-097 — Patterns: halaman Image Cropper

**Status:** done (ditetapkan user 2026-11-27)
**Sumber:** audit visual Patterns 2026-11-26 (screenshot 37 route) + `notes-pilot.md` + umpan balik user atas pilot CR-094
**Ref:** `docs/design/visual-language.md`, CR-094 (payung komposisi), CR-095 (payung visual), CR-093 (copy English), CR-096 (pola CR halaman pertama), `apps/showcase/src/app/(docs)/patterns/image-cropper/page.tsx`, `packages/ui/src/components/form/image-cropper.tsx`

## Temuan

Lokasi: `apps/showcase/src/app/(docs)/patterns/image-cropper/page.tsx`. Bukti visual: `~/Projects/monorepo-bootstrap-audit/patterns/audit/shots/patterns_image-cropper__*` (light 2 segmen, dark 1, mobile 2 segmen). Verifikasi ke kode 2026-11-26.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:120–141`, `page.tsx:172–184` | **D2.1, D6.7 Demo kosong.** Demo utama terbuka tanpa gambar; tiga kartu "Demo states" masing-masing me-render `ImageCropper` kosong. Total 4 dropzone putus-putus identik; cropper asli tidak terlihat sama sekali. | Satu demo tunggal + simulator State; preload gambar contoh menjadi CR komponen (komponen tak punya prop `defaultSrc`). |
| 2 | major | `page.tsx:66–75,146–164,166–185,187–224,226–246` | **D2.2, D2.3 Heading berlapis.** Setiap h2 `SectionHeading` dibungkus kartu berjudul lagi: Interactive demo → "Try it", Accessibility notes → "Keyboard and screen readers", Demo states → 3 judul kartu, Light and dark contrast → "Token pairs and thresholds", Implementation → "Controlled crop result". 5 h2 + 7 judul kartu untuk 5 kelompok isi. | Section docs memakai `SectionHeading` (h2) saja; semua `CardTitle` duplikat dihapus. |
| 3 | major | `page.tsx:77–81`, `page.tsx:187–224` | **D1.1, D1.4 Konten non-demo mendominasi.** Enam langkah instruksi mendahului kontrol dan demo; tabel audit token (isi foundations) + 3 kartu state kosong mendorong cropper keluar dari layar pertama. | Langkah pindah ke section Try it setelah demo; tabel audit diganti 1 kalimat + tautan ke foundations contrast matrix. |
| 4 | major | `page.tsx:83–118` | **D2.5, D6.2 Kontrol campur.** Dua `SegmentedControl` + tombol outline `aria-pressed` "Theme: light" dalam satu baris; baris status "Avatar 1:1 · circle · 512×512" (`:118`) tanpa label. Theme toggle menguji tema, bukan crop. | Kontrol simulasi = 3 `SegmentedControl` berlabel (Scenario, Aspect, State); toggle tema dihapus dari demo. |
| 5 | minor | `page.tsx:60–64` | **Eyebrow.** Masih `Pattern`; keputusan CR-094 #7: seluruh route Patterns memakai `UX Recipe Scenario`. | Ganti eyebrow. |
| 6 | minor | `page.tsx:233–244` | **D5.4 Resep.** `<pre>` manual + tombol copy buatan, berbeda dari `CodeBlock` di halaman lain (catatan input CR-094 untuk CR-095). | `CodeBlock` dari `@ds/ui`. |
| 7 | minor | `_lib/demo-data.ts:36–43` | **D1.5 Teks docs.** 6 langkah ±90–110 karakter/baris, semua instruksi rinci mendahului demo. | 5 langkah ringkas, `max-w-xl`, di section Try it. |
| 8 | minor | `page.tsx:137–141`, komponen `:327,336,358` | **Copy Indonesia dari `@ds/ui`.** "Belum ada gambar…", "Pilih foto", "Maks …", aria-label Indonesia; `formatMegabytes(1024)` me-render "Maks 0.0 MB" padahal hint bilang 1 KB. | Di luar scope halaman → CR komponen/copy (sudah terdaftar di diskusi). Halaman tidak menambal dari luar. |
| 9 | minor | `page.tsx:59,76,142,156,164` | **D1.3 Spacing.** `space-y-6` (konten kartu), `space-y-5`, `space-y-4`, `space-y-3` bercampur di satu halaman. | 40 antar-section, 16 dalam unit demo (pola CR-096). |

## Perubahan yang Diusulkan

Hanya tiga file: `image-cropper/page.tsx`, `image-cropper/page.test.tsx`, `image-cropper/_lib/demo-data.ts` (STEPS ringkas, `DEMO_DATASETS` → opsi simulator, `AUDIT_PAIRS` dihapus). Tidak ada perubahan `packages/ui`, API publik, token, atau dependency.

### Struktur tujuan

```text
PageHeader — eyebrow UX Recipe Scenario · h1 · pengantar (tetap, tanpa aksi)
  ↓ 40
Interactive demo — SectionHeading h2 + 1 kalimat, tanpa kartu, tanpa judul terlihat
  kontrol simulasi (satu baris, wrap per grup, pola DemoControl CR-096):
    Scenario [Avatar | Cover]
    Aspect [1:1 | 16:9 | 4:3 | Free]
    State [Valid | Unsupported format | Size limit]
  ImageCropper tunggal — key={scenario+demoState}, accept/maxBytes mengikuti State
  baris status role=status: "512×512 saved · blob 38 KB" / "No crop saved yet." (English, sudah ada)
  ↓ 40
Try it — SectionHeading h2, 5 langkah ringkas, max-w-xl, tanpa kartu
  ↓ 40
Implementation — SectionHeading h2, CodeBlock + meta ID (S-005.38) text-xs muted
  ↓ 40
Accessibility notes — SectionHeading h2, bullets keyboard + live region, max-w-xl
```

Section "Light and dark contrast" (tabel audit) dihapus dari halaman; diganti satu kalimat di Accessibility notes atau Implementation: "Token pairs used here are covered by the foundations contrast matrix." + tautan. Tabel audit adalah isi foundations, bukan demo halaman.

Level heading turun menjadi dua: h1 36px → h2 24px (`SectionHeading`). Judul 16px (`CardTitle`) dihapus. Di bawahnya hanya body 16px, label kontrol 14px, dan meta 12px.

### Snippet kunci

```tsx
<section aria-label="Interactive demo" className="space-y-4">
  <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
    <DemoControl label="Scenario" value={scenario} onValueChange={(next) => selectScenario(next as CropScenario)}
      options={[{ value: 'avatar', label: 'Avatar' }, { value: 'cover', label: 'Cover' }]} />
    <DemoControl label="Aspect" value={aspectPreset} onValueChange={(next) => setAspectPreset(next as AspectPreset)}
      options={ASPECT_OPTIONS.map((option) => ({ value: option.id, label: option.label }))} />
    <DemoControl label="State" value={demoState} onValueChange={(next) => setDemoState(next as DemoState)}
      options={[{ value: 'valid', label: 'Valid' }, { value: 'unsupported', label: 'Unsupported format' }, { value: 'size-limit', label: 'Size limit' }]} />
  </div>

  <ImageCropper
    key={`${scenario}-${demoState}`}
    aspect={aspect}
    cropShape={config.cropShape}
    outputSize={config.outputSize}
    accept={STATE_CONFIG[demoState].accept}
    maxBytes={STATE_CONFIG[demoState].maxBytes}
    onComplete={handleComplete}
  />

  <p role="status" className="text-sm text-muted-foreground" data-testid="ic-result">
    {result
      ? `${result.width}×${result.height} saved · blob ${Math.round(result.blob.size / 1024)} KB`
      : 'No crop saved yet.'}
  </p>
</section>
```

`DemoControl` = helper lokal yang sama dengan CR-096 (label `text-sm font-medium text-muted-foreground` + `SegmentedControl` + `overflow-x-auto`).

```tsx
<section id="try-it" aria-labelledby="try-it-heading" className="space-y-4 scroll-mt-20">
  <SectionHeading id="try-it-heading" title="Try it" />
  <ol className="max-w-xl list-decimal space-y-2 pl-5 text-base">
    <li><strong className="font-semibold">Upload</strong> — choose a photo to open the crop area (circle for avatar, rectangle for cover).</li>
    <li><strong className="font-semibold">Adjust</strong> — drag the area or use arrow keys; zoom with the slider, rotate with R.</li>
    <li><strong className="font-semibold">Switch</strong> — set Scenario to Cover for a 1280×720 result without uploading again.</li>
    <li><strong className="font-semibold">Limit</strong> — set Aspect to Free and crop without a locked ratio.</li>
    <li><strong className="font-semibold">States</strong> — set State to Unsupported format or Size limit and upload a file to see the error.</li>
  </ol>
</section>
```

```tsx
<section id="implementation" aria-labelledby="implementation-heading" className="space-y-4 scroll-mt-20">
  <SectionHeading id="implementation-heading" title="Implementation" />
  <CodeBlock filename="ImageCropperDemo.tsx" language="tsx" code={IMAGE_CROPPER_RECIPE} className="max-w-3xl" />
  <p className="text-xs text-muted-foreground">
    This page (S-005.38) shows the avatar (S-005.38.01) and cover (S-005.38.02) scenarios with state simulation.
    Token pairs used here are covered by the foundations contrast matrix.
  </p>
</section>
```

### Before / after per area

| Area | Prinsip | Sebelum | Sesudah |
|---|---|---|---|
| Urutan | D1.2 | 6 langkah + kontrol sebelum demo kosong | Demo langsung setelah pengantar; langkah di Try it |
| Hierarki | D2.1, D2.2 | 5 h2 + 7 judul kartu 16px | h1 → h2 `SectionHeading` → body → meta |
| Demo | D2.1, D6.7 | 4 dropzone kosong identik | 1 demo + simulator State (3 opsi); preload → CR komponen |
| Kontrol | D2.5, D6.2 | 2 segmented + tombol `aria-pressed` + status tanpa label | 3 `SegmentedControl` berlabel; 1 baris status ber-`role` |
| Tema | D4.1 | Toggle "Theme: light" di demo + tabel audit token | Dihapus; parity via mode halaman + 1 kalimat matrix |
| Kode | D5.4 | `<pre>` + tombol copy buatan | `CodeBlock` @ds/ui |
| Eyebrow | CR-094 K7 | `Pattern` | `UX Recipe Scenario` |
| Spacing | D1.3 | 40 / 24 / 20 / 16 / 12 bercampur | 40 antar-section; 16 dalam unit; 24 antar grup kontrol |
| Mobile | D6.6 | Kontrol menggerombol; 3 kartu state penuh | Grup kontrol menumpuk per grup; 1 demo |

### Model state

`demoState: 'valid' | 'unsupported' | 'size-limit'` menggabungkan tiga kartu `DEMO_DATASETS` menjadi satu simulator.

| demoState | accept | maxBytes | Efek |
|---|---|---|---|
| `valid` | default (png/jpeg/webp) | 10 MB | Jalur normal. |
| `unsupported` | `image/png` | 10 MB | Upload JPG → error format bawaan komponen. |
| `size-limit` | default | 1 KB | Upload file > 1 KB → error ukuran bawaan komponen. |

`key={scenario+demoState}` me-reset `ImageCropper` (dan `result`) setiap ganti opsi — sama seperti `key={scenario}` hari ini. `selectScenario` tetap me-reset `aspectPreset` (square/wide) seperti sekarang.

### Perubahan perilaku demo (perlu persetujuan eksplisit)

1. Tiga kartu Demo states (tiga instance `ImageCropper`) diganti satu simulator State pada demo tunggal. Error format/ukuran tetap diperagakan lewat opsi State, bukan tiga dropzone.
2. Toggle "Theme: light" dihapus dari demo; tidak ada lagi scope `ic-theme-scope` dan tabel audit token di halaman.
3. Enam langkah di dalam kartu demo menjadi lima langkah di section Try it (isi ringkas, bukan pindah mentah).
4. `page.test.tsx` ditulis ulang: 1 demo + 3 opsi State; Cover mengubah label; State size-limit mengubah batas; recipe lewat `CodeBlock` (hitungan baris disesuaikan).
5. Demo tetap empty-first pada scope halaman — preload gambar contoh dan copy Indonesia ("Belum ada gambar…", "Maks 0.0 MB") menjadi CR komponen/copy, bukan di sini.

### Di luar scope (input CR komponen/copy)

- Prop `defaultSrc`/`defaultImage` pada `ImageCropper` agar demo bisa terbuka berisi (API publik, butuh persetujuan).
- Copy Indonesia di `image-cropper.tsx:327,336,358`, aria-label "Pilih foto", pesan validasi `image-cropper-utils.ts:69,76`, `aria-roledescription`/`aria-label` `:370–371`.
- `formatMegabytes(1024)` → "0.0 MB"; butuh format KB (`image-cropper-utils.ts:50–53`).
- `SegmentedControl` terpotong bila lebih lebar dari kontainer (catatan umum seri Patterns).

## Revisi 2026-11-27 (umpan balik user)

User: demo dipertahankan; bagian di bawahnya dinilai "no personality", dengan acuan halaman Rich Text Editor (CR-096) di `:4001`. Bagian ini **menggantikan** "Struktur tujuan", snippet Try it/Implementation, dan Keputusan #1 untuk area di bawah demo.

| Section | Isi | Lokasi |
|---|---|---|
| The frame decides the file | 3 spesimen bingkai (avatar, cover, free) | `page.tsx:153` |
| Try to break it | format ditolak, batas ukuran, batas zoom | `page.tsx:177` |
| Keyboard & screen readers | tabel shortcut (`Kbd`) + catatan ARIA | `page.tsx:190` |
| Drop it in | kontrak prop + `CodeBlock`; ID screen dan tautan matrix | `page.tsx:220` |

`PageHeader` mendapat `eyebrowIcon={Crop}`. Demo (`page.tsx:107`) tidak berubah.

Klaim lama yang salah dan sudah dihapus dari halaman:

- Ganti Scenario **tidak** mempertahankan gambar (`key` me-remount komponen).
- Aspect `Free` mengikuti rasio asli foto, bukan crop tanpa rasio.
- Komponen tidak punya tombol "Try again"; saat error, dropzone tampil lagi.

Temuan di luar scope (input CR komponen):

- Demo mengirim `outputSize` dari Scenario, sehingga Aspect yang berbeda rasio menghasilkan gambar gepeng/melar (perilaku sudah ada sebelum CR ini).
- Gagang sudut hanya bisa dipakai dengan pointer; tidak ada resize lewat keyboard.
- Pengumuman reset salah ketik: "Diaturn ulang".

## Tasks (jalur small-fix)

- [x] Susun ulang `page.tsx` sesuai struktur tujuan; hapus Card/CardHeader/CardTitle/Table/`aria-pressed` Theme yang tak terpakai; eyebrow → `UX Recipe Scenario`.
- [x] Ganti tiga kartu state dengan `demoState` + `STATE_CONFIG`; `key={scenario+demoState}`; tulis `selectScenario` dan reset `result`.
- [x] Tulis ulang Try it (5 langkah), Implementation (`IMAGE_CROPPER_RECIPE` lewat `CodeBlock`), Accessibility notes; hapus section tabel audit, ganti 1 kalimat + tautan matrix.
- [x] Rampingkan `_lib/demo-data.ts`: STEPS 5 langkah ≤75 karakter/baris; `DEMO_DATASETS` → `STATE_CONFIG`; hapus `AUDIT_PAIRS`.
- [x] Tulis ulang `page.test.tsx`: h1 + Try it; Scenario Cover → label cover; State size-limit → batas 1 KB; hasil `ic-result`; recipe tetap sinkron dengan `RECIPE`.
- [x] Preview before/after light, dark, mobile (alat capture di `~/Projects/monorepo-bootstrap-audit/tools/shot2.mjs`), screenshot dibaca sebagai image. Iterasi lanjutan menunggu masukan user saat review.
- [x] Verifikasi targeted (`vitest run patterns/image-cropper`, eslint, `build:types`) lalu typecheck → lint → test; build dari salinan sementara.

### Test terdampak

- `apps/showcase/src/app/(docs)/patterns/image-cropper/page.test.tsx` — ditulis ulang (lihat Tasks).
- `apps/showcase/src/test/visual-language-guard.test.ts` — harus tetap hijau; heading section memakai `SectionHeading`.
- Test `packages/ui` (`image-cropper.test.tsx`, utils) tidak tersentuh.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Halaman = satu demo utama + tiga section docs (Try it, Implementation, Accessibility notes). | D2.1: satu fokus utama; bentuk section docs (CR-094) tanpa kartu pembungkus. |
| 2 | Demo tunggal tidak diberi judul terlihat; h1 dan pengantar langsung di atasnya. Section lain memakai `SectionHeading`. | Menghindari "satu informasi, heading berlapis" (koreksi user; pola CR-096). |
| 3 | Tiga kartu state menjadi satu simulator `State` lewat `SegmentedControl`. | D2.1/D6.7: empat dropzone kosong identik adalah kegagalan komposisi; state ≠ tiga demo. |
| 4 | Tabel audit token dan toggle tema keluar dari halaman. | Isi foundations dan pengujian tema bukan demo pattern; parity diuji via mode halaman. |
| 5 | Tidak mengubah `packages/ui`. Preload, copy Indonesia, dan format KB menjadi CR komponen/copy. | Satu masalah satu CR; API publik tidak berubah. |
| 6 | CR-094 dan CR-095 tetap payung; CR ini CR halaman kedua seri Patterns. | Keputusan 9 CR-094. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA pada pasangan yang disentuh.
- [x] Perilaku Radix/a11y tidak rusak: label grup kontrol, `role="status"` hasil, live region komponen tetap ada.
- [x] API `cva` dan export `@ds/ui` tetap konsisten (tidak ada perubahan).
- [x] State loading, empty, dan error relevan tersedia (empty, error format, error ukuran; dropzone tampil lagi setelah error).
- [x] Mobile: grup kontrol menumpuk tanpa terpotong; tanpa scroll horizontal.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass; smoke build dari salinan sementara.

## Eksekusi

Branch: `cr-097-patterns-image-cropper-page`
Commit: `fix: redesign patterns image cropper page [CR-097]`

- [x] CR disetujui user (termasuk 5 perubahan perilaku demo) — 2026-11-26.
- [x] Branch dibuat dari `pattern-polish`.
- [x] Perubahan diimplementasikan.
- [x] Preview before/after light/dark/mobile diambil dan dibaca; CR dimutakhirkan ke `file:line` final (lokasi final: lihat Revisi 2026-11-27; `STATE_CONFIG` `demo-data.ts:84`). Iterasi lanjutan menunggu masukan user saat review.
- [x] Verifikasi dijalankan (targeted 5/5, typecheck, lint, test 749/750 dengan 1 flaky pre-existing, build dari salinan sementara).
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
