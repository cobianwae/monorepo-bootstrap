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

- CR-054, CR-055, CR-057, CR-058, CR-059, CR-060, CR-061 dan CR-062 done 2026-11-23. CR-058: label/error form terhubung (C05: `aria-invalid`/`htmlFor`/`aria-describedby`, C09: hit area password, C12: nama filter patients, C13: empty value Combobox/TreeSelect); di-merge ke `visual-polish`. CR-059: onboarding ke Dialog Radix, CommandPalette controlled (`open/enableGlobalHandlers`), lightbox return focus via trigger ref. CR-060: hydration RTE deterministik, statistik awal/reset tersinkron, badge 44 kata dan SVG demo lokal + fallback; di-merge dan di-push (`b35d0a2`). CR-061: reflow kontrol mobile — transfer-list `min-w-0`/`flex-col sm:row`, stepper `overflow-x-auto min-w-max`, virtualized-list header sticky dalam scroller, toolbar/appointments wrap, TabsList konsultasi/CRM AI `h-auto`, header clinic `min-w-0`, calendar/notifications/import-wizard scroller lokal; 320/390/1440 + zoom/keyboard/light-dark terjangkau. CR-062: `useReveal` menurunkan threshold ke 0 hanya bila target lebih tinggi dari viewport, sehingga katalog 9689px terungkap; test 5/5, showcase 84/84, browser 390×844 + reduced motion terverifikasi. Sisa CR-056,063–064 approved belum diimplementasikan. Audit 73 route probe (146 dark/mobile, 37-patterns light) dan batas state/zoom/palet/screen reader di `cr-054-final-audit.md`; bukan sertifikasi exhaustive.

## Next

Dokumen CR-054 disinkronkan `edd5bea`; CR-054/CR-055/CR-057/CR-058/CR-059/CR-060/CR-061/CR-062 done. Sisa CR-056/063–064 approved belum dimulai.

1. Implementasi CR-056 (banner reflow), lalu CR-063/064 (konsistensi/state), satu CR per sesi. Status done hanya oleh user.
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
