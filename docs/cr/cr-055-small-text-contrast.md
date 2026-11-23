# CR-055 — Kontras teks kecil lintas tema

**Status:** approved
**Sumber:** audit
**Ref:** CR-054 C01; `docs/reviews/cr-054-code-audit.md:23`, `docs/design/visual-language.md`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| C01 | major | `apps/showcase/src/app/(docs)/components/forms/page.tsx:469`; daftar lengkap pada laporan kode | Teks kecil memakai highlight; model token light gagal 4,5:1 pada lima dari delapan tema. | Ukur pasangan computed foreground/background, gunakan peran teks yang kontras. |

## Perubahan yang Diusulkan

- Perbaiki seluruh lokasi C01 termasuk inherited eyebrow, badge, hover, landing dan scenario; jangan mengganti semua string highlight secara buta.
- Tidak mengubah nilai/nama token atau API publik tanpa persetujuan terpisah.

## Tasks (jalur small-fix)

- [x] Reproduksi lokasi C01 dari daftar audit CR-054 dan periksa setiap baris sebelum diubah. Belum dilakukan: pengukuran kontras computed pasangan foreground/background aktual delapan tema light/dark, termasuk tint/hover (hanya model token dari audit yang tersedia).
- [x] Perbaiki kelas teks: `text-highlight` pada teks kecil diganti `text-foreground` (atau `text-primary` untuk link aksi); ikon, border, dan tint `highlight` dipertahankan. Hover (`hover:`/`group-hover:text-highlight`) tidak diubah.
- [x] Tambah regression guard (`apps/showcase/src/test/visual-language-guard.test.ts`, aturan `small-text-highlight`). Screenshot belum dibuat.

## Catatan Implementasi

- Berkas yang diubah: `apps/showcase/src/app/(docs)/{components/forms,components/layout-navigation,components/data-display,patterns/data-table,patterns/billing,patterns/comments,foundations/breakpoints,foundations/themes,foundations/colors}/page.tsx`, `apps/showcase/src/app/(landing)/landing/page.tsx`, `apps/showcase/src/app/(clinic)/clinic/{consultations,reports}/page.tsx`, `apps/showcase/src/app/(crm)/crm/leads/page.tsx`, `packages/ui/src/components/marketing/{hero,hero-band}.tsx`, `packages/ui/src/components/layout/section.tsx`.
- Tidak ada perubahan props, nama export, varian, atau token.
- Guard hanya menangkap `text-highlight` dan `text-xs`/`text-sm` pada baris yang sama. Teks yang mewarisi ukuran dari parent tidak tertangkap.
- Di luar daftar audit, masih ada pola serupa (tidak diubah, perlu keputusan lingkup): `packages/ui/src/components/marketing/cta-band.tsx:64`, `section-number.tsx:19`, `navigation/footer.tsx:112`, `navigation/toc.tsx:85`, `navigation/bottom-nav.tsx:62`, `showcase/src/components/landing/contrast-widget.tsx:79`.
- Verifikasi (2026-11-23): typecheck — 12 error baseline di `flow-editor.test.tsx` (tidak berubah); lint hijau; test `packages/tokens` 10/10; `packages/ui` 706/707 — satu gagal `rte-link-save` (baseline); showcase 79/79; `pnpm -C apps/showcase build` 76/76.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Tidak mengubah token global | Masalah pemakaian peran warna; model token bukan bukti semua background aktual. |

## Design System Checks

- [ ] Token semantik dan kontras AA light/dark terukur.
- [ ] Perilaku/a11y, API/export dan state tetap konsisten; showcase diperbarui.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` dijalankan; baseline dipisahkan.

## Eksekusi

Branch: `cr-055-small-text-contrast`
Commit: `fix: correct small text contrast [CR-055]`

- [x] Disetujui user (2026-11-23).
- [ ] Branch dibuat; perubahan diimplementasikan.
- [ ] Verifikasi dan update BACKLOG/STATUS/STATUS-LOG; `check-status-log` hijau.
