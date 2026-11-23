# Status

## Milestone

Design System Foundation v1 — token, komponen inti, showcase, dan workflow kontribusi.

## Posisi Saat Ini

- **Branch kerja: `visual-polish`** (dari `dev` `e57f7ea`) — branch integrasi pekerjaan visual, diperlakukan seperti `dev`: CR/story visual berikutnya di-merge ke sini. `dev` tidak diubah; push/PR menunggu keputusan user.
- Struktur OpenCode terpasang (config root, docs-as-state, agents, commands, workflow skills, skill fullstack). `visual-language.md` kini auto-loaded lewat `opencode.json`.
- PRD 001–006, 010 (legacy), 011 `shipped` dan diarsipkan. Aktif: PRD 012–019 (`approved`); antrean story `approved`: 013-01–013-03, 015-03. Seri 012–018 yang sudah `done` (Mind Map, ImageCropper, wizard, product tour, dst.) dan CR-015–033 tercatat di `docs/STATUS-LOG.md` dan `docs/BACKLOG.md`.
- Mind Map CR-020–033 `done` atas approval user, ter-merge ke `dev` (`eeb7a6b`); status push tidak diverifikasi (terakhir tercatat belum di-push). Pembaca layar bersuara native belum diuji.
- CR sebelum 054 direkonsiliasi 2026-11-23: user menetapkan **CR-034/035/037/038/042/047/050–053 done**. Kini 34 dari 37 CR pada rentang CR-017–053 done; hanya **CR-017/018/036 tetap approved dan terbuka**. CR-036 menyisakan verifikasi hitung AA seluruh tone di browser; CR-017/018 belum cukup bukti penyelesaian. Detail commit dan batas verifikasi: `docs/reviews/cr-before-054-status-reconciliation.md`.

- Bukti historis visual: foundations diseragamkan dan SectionHeading disederhanakan; guard px diperluas ke seluruh src, heading diperluas ke docs, kontras Banner/Alert/eyebrow diperbaiki. CR-053: guard 5/5, showcase 79/79, tokens 10/10, ui 705/707 dengan dua timeout yang lulus 53/53 saat suite terkait dijalankan sendiri; lint/build:types hijau, build 76/76 dari salinan, typecheck tetap 12 error baseline FlowEditor. Ini bukan hasil verifikasi baru atau klaim semua state/palet patuh.

- CR-054 **done atas konfirmasi user pada 2026-11-23**; CR turunan CR-055–064 tetap **approved**. Audit 73 route selesai dalam cakupan kode/visual/triase; 146 dark/mobile dan 37 patterns full-document light dibaca, desktop light seluruh route setidaknya sebagian. Probe mengonfirmasi C16 Reveal home, C17 dua command palette, hydration RTE, empty-value form, reflow dan aksesibilitas kontrol; data-table error/retry/empty/clear serta akhir feed diverifikasi. Implementasi CR turunan belum dimulai; tidak ada perubahan UI. Batas state/zoom/palet/screen reader dan hasil keyboard yang belum terbukti dicatat di `docs/reviews/cr-054-final-audit.md`; ini bukan sertifikasi atau pengujian exhaustive.

## Next

Dokumen CR-054 sudah disinkronkan dengan cakupan final dan commit audit `edd5bea`; audit CR-054 done, CR-055–064 approved dan implementasi belum dimulai.

1. CR-055 **done atas konfirmasi user pada 2026-11-23**; kontras computed dan screenshot untuk delapan tema belum diukur (batas tercatat di CR-055). Lanjut CR-056–064 yang masih approved, satu CR per sesi. Prioritas: CR-062 (home tersembunyi), CR-059 (modal/dua palette), CR-060 (hydration), CR-056/061 (reflow), lalu kontras/form/semantik/state/konsistensi. Status done tetap hanya oleh user.
2. Sisa CR lama: CR-036 (verifikasi AA tone), CR-017/018 (implementasi/verifikasi Tour). CR lama lain sebelum 054 sudah done atas keputusan user; tidak dibuka ulang oleh antrean ini.
3. Jangan membuka ulang temuan yang sudah ditangani: eyebrow PageHeader CR-046 done, Directional Motion CR-048 done, deviasi h1/weight dipertahankan CR-051. Sisa teks kecil → CR-055; guard heading seluruh docs sudah diperluas di CR-052; flaky RTE tetap baseline.
4. Baseline baru pengganti CR-015 — verifikasi 12 error tipe FlowEditor + smoke RTE + timing worker (CR baru bila perlu).
5. Antrean implementasi satu per sesi: 013-01, 015-03. Sinkron sitemap S-005.30/S-005.31 `planned` → `implemented`; S-005.41 `in-design` (018).

## Known Issues

- Baseline: 12 error tipe `packages/ui/src/components/canvas/flow-editor.test.tsx:702–749` (typecheck workspace); smoke RichTextEditor `rte-link-save` gagal (baris ~543); test paralel default kena timing FlowEditor/OrgChartEditor/FileUpload — pakai `--maxWorkers=2 --testTimeout=30000` bila perlu (konfigurasi tidak diubah). `pnpm --filter @ds/showcase lint` dan `build:types` hijau.
- Graphify bersifat per-machine; graph tidak di-commit.
- `apps/web` dan `apps/api` masih tipis; integration test belum aktif.
- Scope tema bersarang diperbaiki di CR-033 (`--color-*`); `--font-*`/art direction bersarang punya jebakan serupa (di luar scope).
- `next build` showcase menimpa `.next` dev server (tanpa `distDir`); untuk verifikasi saat dev server aktif, build dari salinan sementara.

## Aturan Update

- Maksimal ~10 baris; detail masuk `docs/STATUS-LOG.md`.
- Update setelah story/CR selesai atau keputusan arah berubah.
- Jangan menyalin isi BACKLOG ke sini; cukup ringkasan posisi dan next.
