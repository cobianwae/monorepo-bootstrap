# CR-014 — Org Chart Studio layak-pakai (tambah terlihat + garis kembali + tombol jelas)

**Status:** approved
**Sumber:** review 011 + keluhan user ("klik plus gak ngapa-ngapain, cuma geser kanvas, gak ada garis orgnya")
**Ref:** `docs/prd/011-org-chart-studio.md` (FR-004, FR-005), `docs/design/org-chart-studio.md` (D1, D5, D11), `docs/stories/011-02-tambah-inline-panel-detail.md`, `packages/ui/src/components/canvas/org-chart-studio.tsx`, `packages/ui/src/styles.css`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/canvas/org-chart-studio.tsx:598-630, 891-906` | Gagang `+` `opacity-0`, hanya muncul saat hover/fokus. Di sentuh dan geser kecil, tidak terlihat / klik ke-cancel jadi pan. Ikon `+` kartu vs `+` zoom di controls identik. Revisi pasca-push: selalu-terlihat justru bikin kanvas penuh pil + ("keluar-keluar") → final: muncul saat hover/fokus/kartu terpilih (ketuk kartu dulu di sentuh). | Gagang muncul saat hover/fokus/terpilih (prop `visible`) + `Tooltip` "Tambah bawahan / sejawat" + legenda di showcase langkah 2. Klik `+` pakai `nodrag` + `stopPropagation` pointer agar tidak jadi pan. |
| 2 | major | `packages/ui/src/components/canvas/org-chart-studio.tsx:1915-1934, 2196-2204` | Node baru (`spawnPending`) muncul di luar viewport 480px tanpa auto-pan; user merasa "gak ngapa-ngapain". | Setelah tambah, `setCenter`/`fitView` ke node baru + fokus input terlihat. |
| 3 | major | `packages/ui/src/styles.css:92-148` (tanpa `import '@xyflow/react/dist/style.css'`) | Base CSS xyflow tidak diimpor; hanya override warna. Edge `smoothstep` (`toStudioFlowEdges`, `org-chart-studio.tsx:541-566`) tidak ke-render → "gak ada garis orgnya". | Import base CSS xyflow, lalu timpa dengan token (jangan hapus mapping token). Verifikasi garis 1px `border` muncul light & dark. |
| 4 | major | `packages/ui/src/components/canvas/org-chart-studio.tsx:917-948` | Reset zoom (`setViewport x:0 y:0 zoom:1`) melempar ke sudut kosong; ikon Reset dan Fit view sama (`Maximize`); `aria-label` Inggris di UI Indonesia. | Bedakan ikon (mis. `RotateCcw` vs `Maximize`), Reset kembali ke viewport awal/fit, label Indonesia ("Perkecil / Perbesar / Atur ulang / Paskan"). |
| 5 | minor | `packages/ui/src/components/canvas/org-chart-studio.tsx:1057-1063` | Minimap `hidden md:block` tanpa toggle internal; toggle cuma di panel demo showcase. | Tambah tombol minimap on/off di toolbar/controls. |
| 6 | blocker | `packages/ui/src/components/canvas/org-chart-studio.tsx:632-909` (`StudioNode`), `541-566` (`toStudioFlowEdges`) | Node kustom `studioNode` tidak merender `<Handle>` React Flow sama sekali (cuma tombol `+` HTML). Edge `smoothstep` source→target tanpa handle → error `reactflow.dev/error#008`: `Couldn't create edge for source handle id: "null"` (mis. `fin-mgr-1>fin-2`). Garis tidak tersambung. | Tambah `<Handle type="source" position={Position.Bottom}>` + `<Handle type="target" position={Position.Top}>` tersembunyi/styled-token di tiap kartu (atau `sourcePosition`/`targetPosition` + handle id eksplisit di edge). Bukan ganti tombol `+` — handle untuk konektor, tombol untuk aksi. |
| 7 | major | `packages/ui/src/styles.css` (override `.xyflow__*` mati) + area kerja kanvas | Override token memakai prefix `.xyflow__*`, sedangkan @xyflow/react 13 merender `.react-flow__*` → seluruh override mati. Warna default (#fff / #141414 / #fefefe) bocor: belang di tengah area kerja + minimap/kontrol putih. | Tulis ulang override dengan prefix `.react-flow__*` + set variabel `--xy-*` (`background`, `node`, `minimap`, `controls`, `edge`) ke token di `:root` `.react-flow`. |

## Perubahan yang Diusulkan

- `packages/ui/src/components/canvas/org-chart-studio.tsx`: gagang `+` terlihat + `nodrag`, auto-center ke node baru, ikon/label controls Indonesia, toggle minimap.
- `packages/ui/src/styles.css` (atau import CSS): import base `@xyflow/react/dist/style.css` dulu, pertahankan override token.
- `apps/showcase/src/app/(docs)/patterns/org-chart-studio/`: legenda `+` di `ol` langkah 2 + catatan verifikasi.
- Tanpa perubahan API publik (props tetap); tanpa token/dependency baru.

## Tasks (jalur small-fix)

- [x] Import base CSS xyflow + verifikasi garis muncul (40-node contoh).
- [x] Tambah `<Handle>` source/target tersembunyi di tiap kartu; pastikan error `008` hilang dan edge tersambung.
- [x] Perbaiki prefix override `.react-flow__*` + variabel `--xy-*` → token (belang tengah kanvas hilang).
- [x] Gagang `+` terlihat + tooltip + anti-pan; klik menghasilkan input terlihat tanpa scroll manual.
- [x] Auto-center ke node baru setelah tambah.
- [x] Bedakan ikon Reset/Fit + label Indonesia; Reset tidak melempar ke kosong.
- [x] Toggle minimap internal.
- [x] Verifikasi: `pnpm --filter @ds/ui test` 486 hijau (48 file) · `test:tokens` 7 hijau · `showcase build` sukses · eslint file CR-014 bersih · `build:types` bersih kecuali 1 error pre-existing di `flow-editor.test.tsx` milik sesi lain (unused `useReactFlow`, bukan scope ini).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Fullscreen kanvas dipisah ke CR tersendiri | Menyentuh FR-004 + wireframe responsif; di luar small-fix ini. |
| 2 | User approve CR-014 + minta implementasi langsung ("langsung coba benerin approve cr nya implement") | Status → approved; implementasi dikerjakan di worktree tanpa git ops (repo sedang mid-merge sesi lain). |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-014-studio-layak-pakai`
Commit: `fix: studio tambah terlihat + garis + tombol jelas [CR-014]`

- [x] CR disetujui user.
- [ ] Branch dibuat (ditunda: repo `dev` sedang mid-merge sesi lain — branch `cr-014-studio-layak-pakai` sempat dibuat lalu worktree dikembalikan sesi lain; tanpa git ops agar tidak mengganggu).
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan (lihat Tasks; 1 error typecheck + 2 error lint pre-existing di file `flow-editor.*` milik sesi lain).
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui (BACKLOG sudah: CR-014 `approved`; `done` oleh user).
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
