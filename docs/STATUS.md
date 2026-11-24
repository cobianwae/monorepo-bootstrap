# Status

## Milestone

Design System Foundation v1 — token, komponen inti, showcase, dan workflow kontribusi.

## Posisi Saat Ini

- **Branch kerja: `visual-polish`** (dari `dev` `e57f7ea`) — branch integrasi pekerjaan visual, diperlakukan seperti `dev`: CR/story visual berikutnya di-merge ke sini. `dev` tidak diubah; push/PR menunggu keputusan user.
- Struktur OpenCode terpasang (config root, docs-as-state, agents, commands, workflow skills, skill fullstack). `visual-language.md` kini auto-loaded lewat `opencode.json`.
- PRD 001–006, 010 (legacy), 011 `shipped` dan diarsipkan. Aktif: PRD 012–019 (`approved`); antrean story `approved`: 013-01–013-03, 015-03. Seri 012–018 yang sudah `done` (Mind Map, ImageCropper, wizard, product tour, dst.) dan CR-015–033 tercatat di `docs/STATUS-LOG.md` dan `docs/BACKLOG.md`.
- Mind Map CR-020–033 `done` atas approval user, ter-merge ke `dev` (`eeb7a6b`); status push tidak diverifikasi (terakhir tercatat belum di-push). Pembaca layar bersuara native belum diuji.
- CR sebelum 054 direkonsiliasi 2026-11-23: user menetapkan **CR-034/035/037/038/042/047/050–053 done**. CR-036 kemudian ditetapkan **done** setelah matriks AA di browser lulus 16/16. CR-018 ditetapkan **done** (varian §2.5 + responsif §5 + PRD 017 shipped), disusul CR-017 setelah verifikasi dialog di Chrome light/dark. Kini seluruh 37 CR pada rentang CR-017–053 **done**. Detail historis: `docs/reviews/cr-before-054-status-reconciliation.md`.

- Bukti historis visual: foundations diseragamkan dan SectionHeading disederhanakan; guard px diperluas ke seluruh src, heading diperluas ke docs, kontras Banner/Alert/eyebrow diperbaiki. CR-053: guard 5/5, showcase 79/79, tokens 10/10, ui 705/707 dengan dua timeout yang lulus 53/53 saat suite terkait dijalankan sendiri; lint/build:types hijau, build 76/76 dari salinan, typecheck tetap 12 error baseline FlowEditor. Ini bukan hasil verifikasi baru atau klaim semua state/palet patuh.

- CR-054–062 done 2026-11-23. CR-058: label/error form terhubung (C05: `aria-invalid`/`htmlFor`/`aria-describedby`, C09: hit area password, C12: nama filter patients, C13: empty value Combobox/TreeSelect); di-merge ke `visual-polish`. CR-059: onboarding ke Dialog Radix, CommandPalette controlled (`open/enableGlobalHandlers`), lightbox return focus via trigger ref. CR-060: hydration RTE deterministik, statistik awal/reset tersinkron, badge 44 kata dan SVG demo lokal + fallback; di-merge dan di-push (`b35d0a2`). CR-061: reflow kontrol mobile — transfer-list `min-w-0`/`flex-col sm:row`, stepper `overflow-x-auto min-w-max`, virtualized-list header sticky dalam scroller, toolbar/appointments wrap, TabsList konsultasi/CRM AI `h-auto`, header clinic `min-w-0`, calendar/notifications/import-wizard scroller lokal; 320/390/1440 + zoom/keyboard/light-dark terjangkau. CR-062: `useReveal` menurunkan threshold ke 0 hanya bila target lebih tinggi dari viewport, sehingga katalog 9689px terungkap; test 5/5, showcase 84/84, browser 390×844 + reduced motion terverifikasi. CR-056 (`e2e44ff`): wrap teks/CTA, dismiss 44×44 dan fokus; 17 instance showcase terverifikasi 320/390/1440 light/dark, caller web terblokir baseline CSS. Targeted 12/12, showcase 85/85, lint/build lulus pada branch CR; baseline tipe/timing tetap. CR-064 done (`cr-064-data-state-recovery`, di-merge dan di-push ke `visual-polish`): skeleton/error+retry/fokus pemulihan pada patients, treatments, leads; empty master-detail diberi clear search; showcase 94/94, build lulus. CR-065 (uplift halaman File Manager) done dan di-merge ke `visual-polish` (branch `cr-065-file-manager-page-uplift`). Audit CR-054 bukan sertifikasi exhaustive; detail bukti historis tetap di `cr-054-final-audit.md`.
- CR-065 done dan ter-merge ke `visual-polish`. CR-067 (uplift halaman Org Chart Studio) done dan di-merge ke `visual-polish` (branch `cr-067-org-chart-studio-page-uplift`). CR-066 (File Manager: demo, copy English, target sentuh segmented) `done` atas persetujuan user dan di-merge ke `visual-polish`.
- CR-070 `done` (CodeBlock syntax highlighting Shiki dual-theme light/dark, fallback flat, copy-failure state) dan di-merge ke `visual-polish`; ui 742/743 (1 gagal RTE tak terkait), lint ui + showcase build:types/guard hijau. Cek visual browser light/dark belum.
- CR-012 `done` (branch `cr-012-calendar-theme-docs-polish`, worktree `arah-cr`, dari `visual-polish` `355f01f`): agenda empty → EmptyState + CTA, min-height 18→24px, skeleton per-view, audit kontras AA berangka, blok week/day diperkuat (`border-l-4`, tint `/15`), demo 3 fieldset + tabel Pattern notes, copy showcase Inggris. Verifikasi: ui 737/737, tokens 10/10, lint/build hijau; baseline FlowEditor 12 error tidak berubah.
- CR-074 `done` atas persetujuan user 2026-11-24; diimplementasikan pada branch `cr-074-remove-org-chart-editor` (worktree `arah-prd`, dari `visual-polish`): komponen/route/nav OrgChartEditor dan spec hidupnya dihapus, PRD 010 + story historis diberi catatan superseded; OrgChart tetap `implemented`, OrgChartStudio tidak disentuh. Tiga komentar historis Studio dikecualikan dari pemeriksaan referensi aktif.

## Next

CR-013 `done` atas persetujuan user 2026-11-23, implementasi `d900985` dari `cr-013-popover-anchor-event-calendar` diintegrasikan ke `visual-polish`: anchor overflow persisten, agenda detail, dialog fallback, dan focus-return. Browser positioning/Enter/Space/light-dark belum diverifikasi.

CR-069 (copy English OrgChartStudio) done atas persetujuan user; dimerge ke `visual-polish`. Dokumen CR-054 disinkronkan `edd5bea`; CR-054–064 done. CR-068 done atas persetujuan user; diimplementasikan di branch `cr-068-org-chart-studio-demo-polish` (worktree `arah-story`).

CR-071 (Dynamic Form: layout/copy) **done** atas persetujuan user dan di-merge ke `visual-polish`; browser 320/390/1440 light/dark tanpa overflow. CR-072 **done** atas persetujuan user 2026-11-25, implementasi `6c85ab3` diintegrasikan ke `visual-polish`: autosave/restore/error storage, reset terkonfirmasi, submit simulasi; route 19/19, lint/tsc showcase/build hijau, browser keyboard/fokus/light-dark lulus. Tes branch dengan `NODE_OPTIONS=--no-experimental-webstorage`: tokens 10/10, ui 714/714, showcase 115/115; tanpa flag, baseline empat gagal FlowEditor (Web Storage Node). Setelah integrasi CR-075, typecheck dan lint workspace lulus. Push CR-072 diizinkan user. CR-073 diimplementasikan pada `cr-073-dynamic-form-fields-and-accessibility` (worktree `arah-story`, dari `visual-polish`): route 26/26; typecheck/lint/build hijau; suite dengan flag Web Storage + worker tunggal tokens 10/10, ui 714/714, showcase 122/122; browser keyboard/fokus/reflow/reduced-motion dan kontras 16/16 lulus. Tetap `approved`, menunggu review user; belum push/PR.

1. CR-063–064 done; antrean berikutnya 013-01/015-03 (butir 5). Batas CSS consumer/overflow non-Banner CR-056 tetap tercatat. Status done hanya oleh user.
2. CR-017 ditetapkan **done** oleh user setelah uji klik dan pemulihan fokus di Chrome light/dark. Audit visual dan pembaca layar belum. CR-018 dan CR-036 tetap **done**.
3. Jangan membuka ulang temuan yang sudah ditangani: eyebrow PageHeader CR-046 done, Directional Motion CR-048 done, deviasi h1/weight dipertahankan CR-051. Sisa teks kecil → CR-055; guard heading seluruh docs sudah diperluas di CR-052; flaky RTE tetap baseline.
4. CR-075 `done` atas persetujuan user 2026-11-24; implementasi `cc21e6c` di `cr-075-flow-editor-test-button-types` (worktree `arah-prd`, dari `visual-polish` `014d0f2`), merge dan push ke `visual-polish` diizinkan user. Enam query bertipe tombol menghilangkan 12 TS2339; typecheck/lint workspace hijau, FlowEditor 49/49, UI 714/714. Test showcase 92/96 (4 gagal baseline localStorage). Smoke RTE + timing worker tetap terpisah; cek visual CR-070 belum.
5. Antrean implementasi satu per sesi: 013-01, 015-03. 013-01 membuka S-005.36 (kini `in-design`); S-005.30/S-005.31 sudah `implemented`; S-005.41 tetap `in-design` sampai PRD 018 diimplementasi.
6. 015-03 `done` atas persetujuan user 2026-11-24 dan dimerge ke `visual-polish`: route `/patterns/image-cropper` final + audit kontras.
7. Audit UI/UX Import Wizard menghasilkan CR-076–081 (flow, a11y lokal, shared controls, English/kontrak demo, visual, data besar). User menetapkan **keenamnya `approved` pada 2026-11-25 tanpa memulai pengerjaan**; API aditif FileInput (CR-078) dan supersession keputusan bahasa (CR-079) ikut disetujui sebagaimana tertulis. Implementasi dimulai hanya atas instruksi baru, satu CR per sesi; prioritas usulan CR-076/077/078 → CR-079/080 → CR-081.

## Known Issues

- Baseline 12 error tipe test FlowEditor sudah hilang di branch CR-075; typecheck workspace hijau. `pnpm test` masih gagal 4 kasus showcase FlowEditor (`localStorage.getItem is not a function`, `theme-provider.tsx:27`); token 10/10 dan UI 714/714 lulus. Smoke RichTextEditor `rte-link-save` dan timing paralel tetap isu historis terpisah; tidak direproduksi pada run ini.
- Graphify bersifat per-machine; graph tidak di-commit.
- `apps/web` dan `apps/api` masih tipis; integration test belum aktif.
- Scope tema bersarang diperbaiki di CR-033 (`--color-*`); `--font-*`/art direction bersarang punya jebakan serupa (di luar scope).
- `next build` showcase menimpa `.next` dev server (tanpa `distDir`); untuk verifikasi saat dev server aktif, build dari salinan sementara.

## Aturan Update

- Maksimal ~10 baris; detail masuk `docs/STATUS-LOG.md`.
- Update setelah story/CR selesai atau keputusan arah berubah.
- Jangan menyalin isi BACKLOG ke sini; cukup ringkasan posisi dan next.
