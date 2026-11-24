# CR-075 — Perbaiki tipe tombol pada test FlowEditor

**Status:** approved (implementasi selesai; menunggu review dan penetapan done oleh user)
**Sumber:** baseline typecheck; permintaan user 2026-11-24
**Ref:** `packages/ui/src/components/canvas/flow-editor.test.tsx:706–753`, `docs/STATUS.md` (Known Issues)

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `packages/ui/src/components/canvas/flow-editor.test.tsx:706–753` | Dua belas error TS2339: hasil `screen.getByTestId` bertipe `HTMLElement`, sedangkan assertion mengakses properti `.disabled` milik `HTMLButtonElement`. Typecheck package UI gagal. | Beri tipe `HTMLButtonElement` pada query tombol undo/redo terkait tanpa mengurangi assertion. |

### Bukti baseline

Direproduksi 2026-11-24 dengan `pnpm --filter @ds/ui build:types` (`tsc --noEmit`, exit code 2).
Seluruh diagnostik berbunyi `Property 'disabled' does not exist on type 'HTMLElement'`,
pada baris 706, 707, 720, 725, 732, 733, 738, 739, 745, 746, 752, dan 753.
Nomor baris ini memperbarui rentang historis 702–749 di STATUS; bukan error baru.

## Perubahan yang Diusulkan

- Gunakan query bertipe `HTMLButtonElement` pada tombol undo/redo yang dibaca properti `.disabled`-nya.
- Pertahankan seluruh assertion disabled, batas stack, percabangan redo, undo/redo, keyboard, dan live region.
- File kode utama hanya `packages/ui/src/components/canvas/flow-editor.test.tsx`; tidak ada perubahan API publik, runtime, token, dependency, atau konfigurasi TypeScript.
- Perbarui BACKLOG, STATUS, dan STATUS-LOG sesuai hasil verifikasi saat implementasi.

**Di luar scope:** smoke RichTextEditor, timing worker/test flaky, masalah `localStorage` pada test showcase, dan pemeriksaan visual Shiki. Error lain yang ditemukan dicatat terpisah; jangan memperluas perbaikan tanpa konfirmasi.

## Acceptance Criteria

- Given baseline 12 error TS2339, when query tombol diberi tipe yang sesuai, then seluruh 12 error hilang dan `pnpm --filter @ds/ui build:types` lulus.
- Given test undo/redo yang ada, when suite FlowEditor dijalankan, then seluruh test tetap lulus tanpa menghapus atau melemahkan assertion.
- Given verifikasi workspace, when `pnpm typecheck` dijalankan, then lulus; bila muncul error lain setelah hambatan UI hilang, catat diagnostik dan minta keputusan terpisah.
- Given perbaikan selesai, when diff ditinjau, then tidak ada `any`, `@ts-ignore`, `@ts-nocheck`, perubahan konfigurasi, atau perubahan kode produksi untuk membungkam error.

## Tasks (jalur small-fix)

- [x] Setelah approval, buat branch `cr-075-flow-editor-test-button-types`.
- [x] Perbaiki tipe query tombol undo/redo terkait di test FlowEditor.
- [x] Jalankan `pnpm --filter @ds/ui build:types`.
- [x] Jalankan `pnpm --filter @ds/ui test -- src/components/canvas/flow-editor.test.tsx`.
- [x] Jalankan berurutan `pnpm typecheck`, `pnpm lint`, `pnpm test`; catat hasil dan kegagalan di luar scope.
- [x] Tick tasks, perbarui BACKLOG dan STATUS berdasarkan bukti baru, append STATUS-LOG, lalu jalankan `node scripts/check-status-log.mjs`.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Perbaikan terbatas pada tipe query test | Diagnostik berada pada akses properti DOM di test; tidak memerlukan perubahan perilaku FlowEditor. |
| 2 | Tidak menghapus assertion atau mengecualikan test dari typecheck | Pertahankan cakupan regresi dan integritas pemeriksaan tipe. |
| 3 | RTE, timing, dan baseline showcase ditangani terpisah | Satu CR berfokus pada satu masalah yang terukur. |

## Design System Checks

- [x] Token/kontras: tidak relevan; tidak ada perubahan warna atau visual.
- [x] Radix/a11y: tidak ada perubahan runtime; assertion keyboard dan live region dipertahankan.
- [x] API `cva` dan export tidak berubah.
- [x] State loading, empty, dan error tidak berubah.
- [x] Docs pelacakan diperbarui; showcase tidak perlu diubah.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` dijalankan; hasil dan baseline lain dicatat.

## Eksekusi

Branch rencana: `cr-075-flow-editor-test-button-types`
Commit rencana: `fix: correct FlowEditor test button types [CR-075]`

- [x] CR disetujui user (2026-11-24); penundaan dicabut dengan approval rencana implementasi pada sesi ini.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.

### Hasil implementasi dan verifikasi

- Worktree `arah-prd`, branch dari `visual-polish` `014d0f2`; enam query diberi generic `HTMLButtonElement`. Seluruh assertion tetap utuh.
- Blast radius terbatas pada tipe test, tanpa relasi produksi/API berubah; graphify tidak relevan untuk perubahan ini. PRD 005 FR-007 dan design FlowEditor D8 tetap dipertahankan.
- Baseline direproduksi sebelum perubahan: tepat 12 TS2339. Sesudah perubahan, `pnpm --filter @ds/ui build:types` dan `pnpm typecheck` workspace lulus.
- Perintah test UI pada task di atas ternyata menjalankan seluruh suite: 714/714 lulus. Verifikasi targeted tambahan via `pnpm --filter @ds/ui exec vitest run src/components/canvas/flow-editor.test.tsx`: 49/49 lulus.
- `pnpm lint` lulus. `pnpm test`: token 10/10, UI 714/714; showcase 92/96, empat kasus `patterns/flow-editor/page.test.tsx` gagal `localStorage.getItem is not a function` di `theme-provider.tsx:27`. Ini baseline terdokumentasi, tidak diperbaiki dalam CR ini.
- Tidak ada perubahan token/showcase; audit token tambahan dan build showcase tidak diperlukan. Tidak ada dependency, konfigurasi, kode produksi, atau suppression TypeScript yang diubah.
