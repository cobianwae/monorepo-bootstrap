# CR-056 — Reflow Banner bersama

**Status:** draft
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

- [ ] Reproduksi dengan teks panjang, tanpa/dengan ikon, CTA dan dismiss.
- [ ] Perbaiki minimum flex/wrap; uji target dismiss dan keyboard.
- [ ] Test ukuran 320/390/1440, light/dark; audit seluruh caller dan regression test.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | V02 bukan defect kedua | Manifestasi akar Banner C11; jangan patch tiap halaman sebagai workaround. |

## Design System Checks

- [ ] Token/kontras, a11y, API/export dan state tetap konsisten.
- [ ] Showcase diperbarui; typecheck/lint/test dan build showcase diverifikasi dengan baseline dicatat.

## Eksekusi

Branch: `cr-056-banner-reflow`
Commit: `fix: contain banner content and actions [CR-056]`

- [ ] Disetujui user; branch dibuat; implementasi dan verifikasi.
- [ ] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
