# CR-056 — Reflow Banner bersama

**Status:** approved
**Sumber:** audit
**Ref:** CR-054 C11/V02; `docs/reviews/cr-054-code-audit.md:128`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| C11/V02 | major | `packages/ui/src/components/feedback/banner.tsx:85`–`:109`; `apps/showcase/src/app/(docs)/whats-new/page.tsx:32` | Konten flex tanpa batas minimum, CTA shrink-0 dan dismiss meluber. What's New root 1470/1440 desktop, 1012/390 mobile. | Tata konten/CTA/dismiss agar terjangkau tanpa root overflow. |

## Perubahan yang Diusulkan

- Perbaiki layout internal Banner dan audit seluruh 17 pemakaian yang diinventori CR-054.
- Pertahankan props, storage/dismiss dan tujuan aksi; perubahan perilaku truncation/wrap perlu disepakati sebelum coding.

## Tasks (jalur small-fix)

- [x] Reproduksi dengan teks panjang, tanpa/dengan ikon, CTA dan dismiss.
- [x] Perbaiki minimum flex/wrap; uji target dismiss dan keyboard.
- [x] Test ukuran 320/390/1440, light/dark; audit seluruh caller dan regression test (batas browser consumer web dicatat di bawah).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | V02 bukan defect kedua | Manifestasi akar Banner C11; jangan patch tiap halaman sebagai workaround. |
| 2 | Teks wrap penuh, termasuk string tanpa spasi; CTA boleh turun baris mengikuti lebar container | Disetujui user 2026-11-23 sebelum coding; pesan dan aksi tetap terbaca, bukan disembunyikan dengan clipping. |
| 3 | Dismiss tidak menyusut, target 44×44px, fokus CTA/dismiss terlihat | Menjaga akses keyboard dan keterjangkauan kontrol saat Banner bertambah tinggi. Props, export, callback, storage dan tujuan aksi dipertahankan. |

## Design System Checks

- [x] Token/kontras, a11y, API/export dan state tetap konsisten; tidak ada perubahan warna/token.
- [x] Seluruh caller showcase mewarisi perbaikan tanpa patch halaman; typecheck/lint/test dan build showcase diverifikasi dengan baseline dicatat.

## Hasil Implementasi dan Verifikasi (2026-11-23)

- `Banner`: minimum flex dibatasi, teks/label CTA wrap penuh termasuk string tanpa spasi, CTA dapat turun baris mengikuti container. Dismiss tidak menyusut (44×44px); CTA/dismiss memakai focus ring. Tidak memakai clipping sebagai workaround.
- Props/export, tujuan link, callback aksi/dismiss dan key `banner-dismissed-*` tidak berubah. Enam regression test co-located mencakup wrapping, ikon/tanpa ikon, rich children/ref/props, fallback CTA, callback dan persistensi dismiss.
- Reproduksi sebelum perubahan: What's New 390px memiliki root 1012px; CTA di x827–964 dan dismiss x988–1012 (24×24), di luar Banner 342px. Sesudah perubahan root 320/390/1440px sama dengan viewport; CTA/dismiss berada di dalam Banner, dismiss 44×44.

| Verifikasi | Hasil |
|---|---|
| Targeted Banner + ChatAndSupport | 12/12 lulus (6 test Banner baru) |
| `pnpm typecheck` sebelum/sesudah | 12 error TS2339 baseline FlowEditor yang sama, tidak bertambah |
| `pnpm lint` | Lulus seluruh workspace |
| `pnpm test` default | Token 10/10; UI 704/716, 12 kegagalan timing pada 7 file di luar Banner |
| UI `--maxWorkers=2 --testTimeout=30000` | 715/716; tersisa timeout stack undo OrgChartEditor; ulang file itu satu worker 38/38 lulus |
| Test app terpisah setelah workspace berhenti di UI | Showcase 85/85; API/web hanya script placeholder, bukan integration test |
| `build:types` showcase dan web | Lulus |
| Build showcase dari salinan sementara | Lulus, 76/76 halaman; tidak menimpa `.next` dev |
| Browser showcase | 11 route × 3 lebar × 2 mode = 66 probe, 102 pengukuran atas 17 instance; tidak ada Banner/CTA/dismiss meluber |
| Fixture browser | 48 kasus teks/CTA tanpa spasi, dengan/tanpa ikon dan kontrol, termasuk container 220px; tidak ada overflow konten |
| Keyboard What's New | Tab dari CTA ke dismiss, focus-visible/ring dan Enter dismiss lulus pada ketiga lebar × kedua mode |

### Inventaris caller dan batas bukti

- **17 instance showcase**: `/whats-new`, `/contribution`, `/components/actions-inputs`, `/components/data-display`, `/components/layout-navigation`, `/components/overlays-menus` (3), `/components/states-feedback` (5), `/foundations/breakpoints`, `/foundations/motion`, `/patterns/settings`, `/patterns/product-tour`.
- Settings diuji setelah mengubah nama profil. Loading Product Tour dipicu lewat kontrol demo; timer selesai 400ms ditahan hanya pada probe agar kedua mode dapat diukur, bukan perubahan kode produk.
- Ditemukan **1 caller tambahan** di `apps/web/src/app/page.tsx` (total 18). Props/tujuan aksi diperiksa, tetapi verifikasi layout browser consumer **terblokir baseline CSS**: `apps/web` tidak memiliki konfigurasi PostCSS; stylesheet yang disajikan masih berisi `@theme`/`@source` mentah, utility `.h-11` tidak ada dan dismiss tampil 24px. Tidak diklaim lulus; konfigurasi consumer memerlukan tindak lanjut terpisah, tidak diubah dalam CR ini.
- Overflow root non-Banner tetap terlihat: data-display 500px pada viewport 320/390; layout-navigation 353px dan states-feedback 348px pada 320; motion 407px pada 320/390. Root tetap selebar itu ketika seluruh Banner disembunyikan. Tidak dipatch dan tidak diklaim selesai oleh CR ini.
- Screenshot What's New light/dark ketiga lebar dan JSON probe tersimpan sementara di direktori sesi (`cr056-whats-new-*.png`, `cr056-browser-after.json`, `cr056-fixtures.json`, `cr056-keyboard.json`). Bukan audit seluruh palet, zoom atau pembaca layar bersuara; warna/token tidak diubah dan tidak ada klaim audit kontras baru.

## Eksekusi

Branch: `cr-056-banner-reflow`
Commit: `fix: contain banner content and actions [CR-056]`

- [x] Disetujui user (2026-11-23).
- [x] Branch dibuat; implementasi dan verifikasi dengan batas di atas.
- [x] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau (105 artefak done); status CR tetap approved menunggu user.
