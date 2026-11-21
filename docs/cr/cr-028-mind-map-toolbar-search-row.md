# CR-028 — Mind Map: pencarian dan toolbar dalam satu baris (komponen)

**Status:** approved
**Sumber:** audit `/improve-ui` pasca CR-026 (cluster B) + keluhan user "susunan layout button tab pencarian itu gak jelas"
**Ref:** `packages/ui/src/components/canvas/mind-map.tsx:1822-1864`, `packages/ui/src/components/canvas/mind-map.test.tsx:199-208`, `docs/stories/012-03-keyboard-cari-showcase-audit.md` (AC urutan DOM, status done), wireframe `docs/design/wireframes/mind-map.md` §1

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| B1 | major | `mind-map.tsx:1824` + `:1864`, `page.tsx` (`searchSlot`) | Toolbar komponen (`Tambah cabang ide pusat`, `Urungkan`, `Ulangi`) rata kanan (`justify-end`), lalu `searchSlot` rata kiri di baris berikutnya. Dua baris kontrol berlawanan arah; CR-026 hanya merapikan isi pencarian, bukan posisinya karena posisi ditentukan komponen. | Render toolbar dan `searchSlot` dalam satu baris `flex flex-wrap items-end justify-between gap-2`. |

## Keputusan yang dibutuhkan dari user

Urutan DOM saat ini `toolbar → searchSlot → kanvas` ditetapkan story 012-03 dan di-assert test. Satu baris yang pencariannya di kiri dan aksi di kanan (sesuai wireframe "toolbar kanan") menuntut pilih salah satu:

| Opsi | DOM | Visual | Konsekuensi |
|---|---|---|---|
| **D (disarankan)** | `searchSlot → toolbar → kanvas` | pencarian kiri, aksi kanan | Visual = urutan fokus (tidak ada mismatch WCAG 2.4.3). Mengubah AC urutan DOM story 012-03 dan test `mind-map.test.tsx:199` (urutan yang di-assert dibalik). |
| K | `toolbar → searchSlot → kanvas` | aksi kiri, pencarian kanan | Urutan DOM story tetap, test tidak berubah. Menyimpang dari wireframe ("toolbar kanan") dan terasa terbalik karena pencarian biasanya di awal baris. |
| V | tetap, urutan visual dibalik via CSS `order`/`flex-row-reverse` | pencarian kiri, aksi kanan | **Tidak disarankan:** fokus keyboard lompat berlawanan dengan tampilan (melanggar 2.4.3). |

Tanpa jawaban, saya akan memakai **D**.

## Perubahan yang Diusulkan

- `mind-map.tsx` `MindMap` (return utama): bungkus `searchSlot` dan grup tombol toolbar dalam satu baris; sembunyikan wrapper pencarian bila `searchSlot` tidak diberikan agar tampilan tanpa slot tidak berubah (toolbar tetap rata kanan via `ml-auto`).
- Tidak ada prop baru; `searchSlot` tetap `React.ReactNode`. Early return loading/error/empty tidak tersentuh.
- Update `mind-map.test.tsx:199` sesuai opsi terpilih; story 012-03 dicatat di bagian Keputusan CR ini (artefak done tidak diedit langsung).
- Komponen/route terpengaruh: `MindMap`, `/patterns/mind-map` (`page.tsx` `searchSlot` memakai `mb-3`, perlu disesuaikan agar tidak ada celah ganda).

### Before / After (sketsa)

```tsx
// Sebelum
<div className="mb-2 flex flex-wrap items-center justify-end gap-2">…tombol…</div>
{searchSlot}

// Sesudah (opsi D)
<div className="mb-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
  {searchSlot ? <div className="min-w-0 flex-1">{searchSlot}</div> : null}
  <div className="ml-auto flex flex-wrap items-center gap-2">…tombol…</div>
</div>
```

## Tasks (jalur small-fix)

- [x] Gunakan opsi D default sesuai permintaan lanjut user.
- [x] Ubah baris toolbar + slot di `mind-map.tsx`.
- [x] Sesuaikan margin `searchSlot` di `page.tsx`.
- [x] Perbarui test urutan DOM (`mind-map.test.tsx:199`) dan jalankan seluruh test MindMap + integrasi (49).
- [x] Verifikasi test, lint, tsc, build showcase, cek visual light/dark + viewport sempit (wrap); pengecualian baseline tsc dicatat di bawah.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Opsi D: pencarian → toolbar → kanvas | User meminta lanjut CR-028 dari CR-027 (2026-11-22); memakai default D yang direkomendasikan. CR ini menggantikan urutan DOM AC-01 story 012-03, tanpa mengedit artefak done. |
| 2 | Slot `min-w-0 basis-80 flex-1`, aksi `ml-auto max-w-full flex-wrap` | Basis pencarian memungkinkan aksi turun saat ruang sempit, bukan memaksa slot menyusut hingga overflow; tanpa slot tidak ada wrapper kosong. Isi pencarian memakai basis-64/min-w-0 agar tetap muat pada 320px. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [x] Perilaku Radix/a11y tidak rusak (urutan fokus = urutan visual).
- [x] API `cva` dan export tetap konsisten (tanpa prop baru).
- [x] State loading, empty, dan error relevan tersedia.
- [x] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-028-mind-map-toolbar-search-row`
Commit: `fix: sejajarkan pencarian dan toolbar mind map [CR-028]`

- [x] CR disetujui user.
- [x] Branch dibuat dari CR-027 `742667d`.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau (67 artefak done).

## Hasil Verifikasi

- `pnpm --filter @ds/ui exec vitest run mind-map --maxWorkers=2 --testTimeout=30000`: **49/49** (46 unit + 3 integrasi). Regresi urutan DOM, satu wrapper responsif, tanpa slot, dan integrasi pencarian teruji.
- `pnpm typecheck`: **12 error baseline** `flow-editor.test.tsx:706–753` (`HTMLElement.disabled`), tanpa error baru. Build showcase juga memeriksa tipe consumer.
- `pnpm lint`: hijau.
- `pnpm test`: hijau **707 UI + 74 showcase + 8 token**; baseline RTE/timeout tidak muncul pada run ini, riwayatnya tetap berlaku. API/web masih script placeholder, bukan pengujian integrasi.
- `pnpm -C apps/showcase build`: hijau, 76 route.
- Chrome headless production: tema global/lokal selaras light/light dan dark/dark, lebar **1440, 768, 390, 320px**. Pencarian kiri/aksi kanan satu baris pada 1440px; membungkus di bawahnya tanpa overflow halaman. Tab nyata dari pencarian menuju tambah; urutan DOM searah visual. Tombol aksi tetap 44px. Screenshot desktop/mobile ditinjau.
- Bukti lokal (tidak di-commit): `cr028-browser.mjs` dan `cr028-{light,dark}-{1440,390}.png` di direktori temp OpenCode sesi.
- Tidak mengubah warna/token. Audit Pulse co-located lulus; checklist kontras menyeluruh tetap terbuka karena isu tema global dark/lokal light dari CR-027 belum ditangani. SR bersuara native tidak diuji.
- Tetap `approved` menunggu review user; tidak push/merge atau menetapkan `done`. Perubahan nav showcase existing tidak disentuh/disertakan.
