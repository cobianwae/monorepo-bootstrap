# Status

## Milestone

Design System Foundation v1 — token, komponen inti, showcase, dan workflow kontribusi.

## Posisi Saat Ini

- **Branch kerja: `visual-polish`** (dari `dev` `e57f7ea`) — branch integrasi pekerjaan visual, diperlakukan seperti `dev`: CR/story visual berikutnya di-merge ke sini. `dev` tidak diubah; push/PR menunggu keputusan user.
- Struktur OpenCode terpasang (config root, docs-as-state, agents, commands, workflow skills, skill fullstack). `visual-language.md` kini auto-loaded lewat `opencode.json`.
- PRD 001–006, 010 (legacy), 011 `shipped` dan diarsipkan. Aktif: PRD 012–019 (`approved`); antrean story `approved`: 013-01–013-03, 015-03. Seri 012–018 yang sudah `done` (Mind Map, ImageCropper, wizard, product tour, dst.) dan CR-015–033 tercatat di `docs/STATUS-LOG.md` dan `docs/BACKLOG.md`.
- Mind Map CR-020–033 `done` atas approval user, ter-merge ke `dev` (`eeb7a6b`); status push tidak diverifikasi (terakhir tercatat belum di-push). Pembaca layar bersuara native belum diuji.
- Visual docs showcase CR-034/035/036/037: `draft`, dieksekusi atas instruksi user (2026-11-22), di-commit di `visual-polish`. `SectionHeading` (h2 tanpa ikon, tanpa level sub — CR-037) + 7 halaman `foundations` diseragamkan; guard `visual-language-guard.test.ts`. Terverifikasi: lint, `pnpm test` penuh (tokens 10, ui 707, showcase 77), `next build` 76/76 dari salinan sementara (bukan `pnpm -C apps/showcase build` langsung), screenshot dark+light Atelier/Pulse ketujuh halaman, typography+motion di Aurora dan Blueprint. Belum: halaman lain di Aurora/Blueprint, palet selain Pulse, "Play All" interaktif.

- Visual CR-038..050 (`draft`, dieksekusi atas instruksi user 2026-11-22, di-commit di `visual-polish`, push ke origin): `text-[Npx]` hilang di seluruh `src` (guard); heading ikon dihapus di components/patterns (CR-039); kontras banner info/warning dan Alert destructive (CR-040/042); eyebrow PageHeader text-foreground (CR-046); state terpilih & primary dekoratif → highlight (CR-043..044, 047..050). Verifikasi terakhir CR-050: typecheck baseline 12 error FlowEditor, build produksi 76/76 (salinan), showcase test 78/78, guard 4/4. CR-051 approved (deviasi PageHeader dicatat); CR-053 approved (heading & teks kecil components/patterns dirapikan, dieksekusi; `done` belum ditetapkan). Verifikasi CR-053: guard 5/5, showcase test 79/79, lint & build:types hijau, build produksi 76/76 (salinan), typecheck 12 error baseline, screenshot Atelier/Pulse dan Aurora/Nebula dark, Blueprint/Ink light.

## Next

1. User menetapkan `approved`/`done` untuk CR-034..050 dan `visual-language.md` (bagian ○ layout, surfaces, component targets belum dikunci).
2. CR terpisah bila disetujui: kontras `text-highlight` pada teks kecil di light mode (eyebrow `PageHeader` di `@ds/ui`, themes hero, breakpoints), deviasi `PageHeader` h1 vs Heading 1, Directional Motion kosong sebelum Play.
3. Sisa terbuka: eyebrow PageHeader di `@ds/ui` (API publik, CR terpisah bila disetujui), tes flaky `rte-link-save` (baseline), perluas guard heading ke `components/` & `patterns/` bila user setuju.
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
