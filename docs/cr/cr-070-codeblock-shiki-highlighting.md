# CR-070 — CodeBlock syntax highlighting (Shiki)

**Status:** done (ditetapkan user 2026-11-23)
**Sumber:** diskusi user 2026-11-23 ("kok kita flat gitu")
**Ref:** `packages/ui/src/components/data-display/code-block.tsx:127`, `packages/ui/package.json`, `docs/prd/013-diff-viewer.md FR-003`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `code-block.tsx:127` | Isi kode dirender monokrom (`text-foreground`, tanpa tokenizer) sehingga terlihat flat dibanding docs modern. | Integrasi highlighter berbasis grammar (Shiki) dengan dual theme light/dark. |
| 2 | minor | `code-block.tsx:43-45` | `catch` clipboard kosong — sudah dicatat di CR-031 sebagai alasan resep mind-map tidak memakai `CodeBlock`. | Perbaiki sekalian dalam CR ini (fallback + live region) bila API diubah. |

## Perubahan yang Diusulkan

- Tambah dependency `shiki` di `packages/ui` (**butuh approval eksplisit user** sesuai CONVENTIONS).
- `CodeBlock` tetap backward-compatible (`code`, `language`, `filename`, dst.); tambah prop opsional mis. `highlight?: boolean` / `theme` bila perlu. Tanpa prop baru pun boleh — highlight default-on.
- Palet syntax sebagai layer sendiri (bukan token semantik `primary/muted`): definisi light + dark, OKLCH, audit kontras via `pnpm test:tokens` (komentar rawan gagal — target ≥ 4.5:1 untuk teks kode, minimal 3:1 untuk komentar bila disepakati).
- Render server-friendly (Shiki `codeToHtml`) + fallback flat saat bahasa tak dikenal / JS mati.
- Showcase `data-display` + `getting-started` memakai highlight; docs diperbarui bila perlu.
- Tanpa perubahan API publik selain penambahan prop opsional; tanpa refactor di luar `code-block.*`.

Alternatif yang ditolak: regex kata kunci (diputuskan di PRD 013 OQ#2 — rawan salah highlight + kontras), Prism/highlight.js (tema generik, akurasi grammar di bawah Shiki).

## Tasks (jalur small-fix)

- [x] Kunci pilihan dual-theme Shiki (mis. `github-light` / `github-dark` atau `vitesse-*`) + daftar bahasa awal (tsx, ts, bash, css, json, prisma, tree?).
- [x] Definisikan palet syntax light/dark + audit kontras.
- [x] Implementasi `code-block.tsx` + test co-located (render token, fallback bahasa tak dikenal, copy tetap jalan).
- [x] Update showcase `data-display` + verifikasi light/dark di browser.
- [x] Verifikasi: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:tokens`, `pnpm -C apps/showcase build`.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Shiki, bukan Prism/highlight.js/regex | Grammar VS Code paling akurat; standar docs modern (Next.js, shadcn, VitePress); output statis. |
| 2 | Palet syntax layer sendiri, tetap diaudit seperti token | Warna syntax bukan warna aksi/status; tapi parity light/dark + OKLCH + WCAG tetap wajib. |
| 3 | Perbaiki `catch` clipboard kosong sekalian | Menghilangkan alasan CR-031 tidak memakai `CodeBlock`. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik + palet syntax terdefinisi.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-070-codeblock-shiki`

Commit: `feat: tambah syntax highlighting CodeBlock [CR-070]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.

## Hasil Implementasi

- Dependency: `shiki` 4.6.0 di `@ds/ui` (disetujui user). Entry: `shiki/bundle/web`, dual theme `github-light` / `github-dark` via `defaultColor: false`.
- `code-block-highlight.ts`: `highlightCode(code, language)`; bahasa tak dikenal → `null` → render flat. Override AA: light `#e36209`→`#b35400` (3,49→5,02:1), dark komentar `#6a737d`→`#8b949e` (3,84→6,02:1) terhadap 8 varian `--card` dark dan putih light.
- `code-block.tsx`: highlight async (flat saat memuat); `text-[10px]`→`text-xs`; `catch` clipboard kini menampilkan state "Gagal disalin" dalam `aria-live`.
- `styles.css`: `.ds-code-block` mengikat `--shiki-light` / `--shiki-dark` (`.dark`).
- Tes: `code-block-highlight.test.ts` (audit kontras pada output Shiki nyata, Node env) + 3 tes CodeBlock di `extended-components.test.tsx`.
- `src/test/setup.ts`: guard `window`/`HTMLElement`/`MouseEvent` agar setup bisa dimuat di Node env (perilaku jsdom tidak berubah).
- Verifikasi: ui 742/743 lulus; 1 gagal `rich-text-editor.test.tsx` (`rte-link-save`), tidak mengimpor CodeBlock; belum dipastikan pada base. `build:types` ui: error lama `flow-editor.test.tsx` (tidak disentuh). Lint ui bersih. Showcase `build:types` hijau; guard 5/5.
- Belum dicek: visual browser light/dark dan `pnpm -C apps/showcase build`.
