# CR-027 — Mind Map: polish halaman showcase (urutan, bingkai, ikon, resep)

**Status:** approved
**Sumber:** audit `/improve-ui` pasca CR-026 (cluster A dan C), berbasis kode; belum ada pengecekan visual di browser
**Ref:** `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx`, `_components/mind-map-demo-panel.tsx`, `_components/mind-map-recipe.tsx`, `docs/cr/cr-026-mind-map-showcase-layout.md`

> Catatan jujur: A1 adalah penyimpangan implementasi CR-026 dari desainnya sendiri. CR-026 menulis demo di atas langkah, tetapi kode menaruh langkah lebih dulu.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| A1 | major | `page.tsx:92-105` vs `:107-137` | Langkah brainstorming (blok teks) muncul sebelum demo, padahal demo adalah tujuan halaman. | Urutan baru: header → demo interaktif → alur brainstorming → papan keyboard → resep. |
| A2 | major | `page.tsx:107-137` + `mind-map-demo-panel.tsx:30` | Card di dalam card: section demo (`border bg-background p-4`) membungkus panel (`border bg-card p-4`) lalu kanvas. Tiga tingkat bingkai. | Section demo tetap jadi "panggung" tema (perlu untuk preview dark). Panel kehilangan card sendiri dan menjadi baris datar dengan `divide-y divide-border`. |
| A3 | minor | `page.tsx:110-115`, `mind-map-shortcuts.tsx`, `mind-map-recipe.tsx` | Hanya section demo yang punya deskripsi di bawah h2; ritme heading tidak konsisten. | Tambah satu kalimat deskripsi `text-sm text-muted-foreground` pada alur, keyboard, dan resep. |
| C1 | minor | `mind-map-demo-panel.tsx:44-55`, `page.tsx:92-105` | Enam tombol status masih teks polos; langkah tampil sebagai daftar bernomor polos. | Ikon `lucide-react` per status; langkah memakai lencana nomor bundar. Heading section tetap tanpa ikon, konsisten dengan org-chart-studio. |
| C2 | minor | `mind-map-demo-panel.tsx:70` | Ikon `Upload` pada "Muat 50 node" keliru secara makna (tidak ada unggahan). | Ganti ke ikon yang bermakna kumpulan node (mis. `Boxes`). |
| C3 | minor | `mind-map-recipe.tsx` | Ikon `Check` tidak kembali ke `Copy` setelah salin; `<p role="status">` kosong tetap menambah celah `space-y-2`. | Reset status salin setelah 2 detik (dengan cleanup timeout). Live region tetap ter-mount; saat kosong `sr-only`, saat terisi tampil `mt-2`. |

## Perubahan yang Diusulkan

- Hanya `apps/showcase` (route mind-map + `_components/`). Tanpa dependency baru (`lucide-react` sudah dipakai).
- Tanpa perubahan `packages/ui`, token, atau API publik.
- Ikon status (nama harus dicek ada di versi lucide terpasang): `Berisi` → `ListTree`, `Contoh Q1` → `Sparkles`, `Loading` → `Loader`, `Empty` → `Inbox`, `Invalid` → `TriangleAlert`, `Error eksternal` → `WifiOff`. Semua `aria-hidden`.
- Test `page.test.tsx` (6 test) harus tetap hijau; query tidak bergantung urutan section atau nama ikon.

### Before / After (sketsa)

```tsx
// Sebelum: header → langkah → [stage > card panel > kanvas] → keyboard → resep
// Sesudah: header → [stage > baris panel (divide-y) > kanvas] → langkah → keyboard → resep
<div role="group" aria-label="Panel demo" className="divide-y divide-border rounded-md border border-border">
  {/* baris Status data / Aksi / Tampilan, masing-masing py-3 px-4 */}
</div>
```

## Tasks (jalur small-fix)

- [x] Urutan section (A1).
- [x] Panel datar `divide-y` tanpa card ganda (A2).
- [x] Deskripsi satu kalimat per section (A3).
- [x] Ikon status + lencana nomor langkah (C1).
- [x] Ikon "Muat 50 node" diganti (C2).
- [x] Reset status salin + live region stabil (C3).
- [x] Verifikasi: test showcase mind-map, eslint, tsc, `pnpm -C apps/showcase build`, cek visual light/dark di browser (hasil dan batasan di bawah).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | CR-027 disetujui user; branch dari CR-026. | Instruksi user: "approve kemudian kerjakan cr 27 branching dari cr 26". CR-028 tetap draft dan tidak diimplementasikan. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA (sampel perubahan lolos pada tema selaras; kombinasi tema campuran masih bermasalah, lihat catatan).
- [x] Perilaku Radix/a11y tidak rusak (tes regresi lulus; SR bersuara native belum diuji).
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia.
- [x] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

- Cek light/dark: panel `divide-y`, lencana nomor, tombol status aktif.
- Cek state: enam status demo terjangkau; salin sukses lalu ikon kembali ke `Copy`; viewport sempit.
- Cek test: `page.test.tsx` 7/7, test resep 2/2 (reset 2 detik, cleanup saat unmount, live region stabil, gagal clipboard tetap terlihat).

### Hasil verifikasi — 2026-11-22

- `pnpm typecheck`: terblokir 12 error baseline `flow-editor.test.tsx:706–753` (`HTMLElement.disabled`); file tersebut tidak diubah.
- `pnpm -C apps/showcase build:types`, `pnpm lint`, dan build showcase hijau. Suite penuh run awal hijau: 706 UI, 74 showcase, 8 token.
- Verifikasi final setelah penambahan tes salin berulang: showcase 74/74 (termasuk 9 MindMap/resep), lint/tsc showcase/build hijau. `pnpm test` ulang: 704/706 UI, baseline timeout FlowEditor AC-02 dan RTE `rte-link-save` muncul kembali; dengan `pnpm -r test --maxWorkers=2 --testTimeout=30000`: 705/706 UI, hanya baseline RTE gagal. Runner rekursif berhenti sebelum showcase sehingga showcase dijalankan terpisah. Tidak ada file UI yang diubah; baseline tidak diperbaiki di luar scope.
- Chrome headless pada production build: urutan demo → alur → keyboard → resep sesuai; panel dan tombol membungkus pada 390px. Lebar dokumen sama dengan viewport pada 1440px/390px (tanpa overflow horizontal halaman).
- Screenshot ditinjau pada tema global/local selaras light/light dan dark/dark; sampel teks panel/deskripsi berkontras minimum 7,54:1. Ini bukan audit a11y menyeluruh.
- Bukti lokal (tidak di-commit): direktori `/private/var/folders/88/r6r62nl52qscq62k_d4vxm980000gn/T/opencode/`, berkas `cr027-light-desktop-verified.png`, `cr027-light-mobile-verified.png`, `cr027-dark-desktop.png`, `cr027-dark-mobile.png`, `cr027-guide-mobile.png`.
- Temuan lanjutan di luar scope: preview lokal `light` di bawah ancestor global `dark` menghasilkan warna campuran (terlihat pada root pill dan tombol). Struktur tema tersebut sudah ada sebelum CR-027; tidak diubah di sini. Perlu diskusi/CR tersendiri, bukan klaim parity penuh.
- Toolbar/pencarian tetap mengikuti implementasi lama; perbaikannya hanya berada di draft CR-028.

## Eksekusi

Branch: `cr-027-mind-map-showcase-polish`
Commit: `fix: polish halaman showcase mind map [CR-027]`

- [x] CR disetujui user.
- [x] Branch dibuat dari `cr-026-mind-map-showcase-layout` (`7e8bc71`).
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui (tetap `approved`, menunggu review user).
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
