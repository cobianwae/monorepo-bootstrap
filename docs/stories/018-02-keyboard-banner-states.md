# 018-02 — Keyboard + banner dirty + state matrix

Status: done
PRD: `docs/prd/018-permission-matrix.md` (approved, gate 1)
Design: `docs/design/wireframes/permission-matrix.md` (approved, gate 2) + `docs/design/flows/permission-matrix.mmd` (diagram 3–4) + sitemap `S-005.41`
FR: `FR-003`, `FR-005`, `FR-006`, `FR-007`
Screens: `S-005.41`
Goal: Grid bisa dipakai penuh tanpa mouse: navigasi roving + shortcut massal, banner dirty + daftar + reset, state matrix loading/empty/error, sticky + scroll responsif — semua teruji.

## Acceptance Criteria

### AC-01 — Keyboard grid penuh tanpa mouse

**Given** grid fokus via `Tab` (satu `tabIndex=0`, sisanya roving `-1`)
**When** panah/`Home`/`End` bergerak + `Space` toggle sel + `Enter/Space` toggle header + coba toggle sel terkunci
**Then** fokus berpindah tanpa jebakan; toggle mengumumkan "menyala/mati/N dipilih"; terkunci ditolak + alasan diumumkan; `Tab` keluar ke banner — diverifikasi test + audit manual (FR-006, S-005.41)

### AC-02 — Banner dirty + daftar + reset

**Given** `value` diubah 3 sel dari awal
**When** banner muncul lalu [Lihat daftar] dibuka + [Reset baris ini] / [Reset] ditekan + [Simpan] ditekan (mock konsumen)
**Then** banner `role="status"` + badge "3" + daftar "Role × Resource: dari → ke" hanya saat dirty > 0; reset mengembalikan awal + live "dibatalkan" + fokus ke grid; simpan memanggil `onValueChange` batch milik konsumen — diverifikasi test (FR-003, FR-005, S-005.41)

### AC-03 — State matrix loading/empty/error

**Given** pemicu `loading`, `value` kosong (tanpa role/resource), data invalid (role ganda), dan edge semua-terkunci
**When** dibuka via props
**Then** loading = skeleton 5×8 + `aria-busy` + teks SR; empty = `empty-state` + CTA contoh `role="status"`; error = `alert` + penyebab + CTA `role="alert"` + fokus ke alert; semua-terkunci = grid + info teks (bukan warna saja) — diverifikasi test (FR-007, S-005.41)

### AC-04 — Sticky + responsif tanpa kolom hilang

**Given** grid 20 kolom (uji batas K3) dibuka `≥md` dan `<md`
**When** scroll horizontal + fokus keyboard ke sel jauh
**Then** header kolom sticky atas + kolom resource sticky kiri tetap terlihat; scrollIntoView menjaga fokus; `<md` banner stacked + semua toggle/keyboard/states tetap — diverifikasi test + cek manual (K3, FR-001, S-005.41)

## Tasks

- [x] Tambah ke `permission-matrix.tsx`: roving tabindex + panah/`Home`/`End`/`Ctrl+Home/End` (§4), live region polite + assertive error, banner §2.4 (`badge` + collapsible daftar + Reset/Simpan slot konsumen), states §3 (`skeleton`, `empty-state`, `alert`), sticky CSS token (`muted/40` + `border`) + scroll-x + `density` compact/default
- [x] Token §6 (banner `warning/10` + `warning`, error `destructive` + teks, fokus ring `primary`); tanpa token baru; `prefers-reduced-motion` mematikan transisi banner/tooltip
- [x] Test co-located lanjutan: roving + toggle keyboard + tolak kunci, banner muncul/hilang + reset per-baris/penuh, 4 state + semua-terkunci, sticky class + scroll tanpa fokus hilang
- [x] Verifikasi `pnpm typecheck`, `pnpm lint`, `pnpm test` untuk perubahan (hasil dan batasan baseline di bawah)

## Dependencies

- Story/CR lain: menunggu 018-01 (fondasi grid/toggle/kunci); menjadi fondasi 018-03
- Package: tanpa dependency baru

## Notes

- Risiko: live region terlalu cerewet tiap toggle massal — mitigasi umumkan ringkas "N dipilih" + dirty "N perubahan", bukan per-sel
- Keputusan: K3 sticky + scroll (tanpa virtualisasi v1); K5 label "sebagian" dipakai ulang di live keyboard; showcase final + audit di 018-03

## Hasil implementasi dan verifikasi — 2026-11-21

- Branch `018-02-keyboard-banner-states` di worktree `arah-story`, dari `dev` lokal `773b5ed`; tanpa dependency atau token baru.
- Blast radius: komponen, tipe props opsional, dan test PermissionMatrix. Graphify tidak menemukan node komponen; referensi diperiksa lewat pencarian kode. Tidak mengubah showcase/sitemap; S-005.41 tetap `in-design` sampai 018-03.
- `initialValue` menentukan baseline; tanpa prop ini, nilai pertama saat grid siap disalin sebagai baseline. Konsumen tetap mengendalikan `value`, menerima satu batch `onValueChange(next, diff)` per aksi, dan memperbarui `initialValue` setelah persist berhasil. `onSave` hanya callback konsumen, bukan persist internal.
- Sel/header terkunci memakai `aria-disabled` dengan penolakan di handler, bukan native `disabled`, agar tetap dapat dicapai melalui panah dan alasan penolakan diumumkan. Tooltip melekat pada kontrol fokus. Satu Tab masuk grid; handler tidak mencegat Tab/Shift+Tab.
- Banner tampil di atas grid, tetapi urutan DOM interaktif tetap grid → banner. Reset per-item/penuh dan aksi simpan mengembalikan fokus ke grid. Target checkbox diperluas hingga 44px; tidak mengurangi opasitas teks kunci.

| Cakupan | Hasil |
|---|---|
| AC-01 | Test roving, batas panah, Home/End/Ctrl+Home/End, Space sel, Enter header, satu batch, sel terkunci, satu tab stop, Tab tidak dicegat |
| AC-02 | Test konsumen controlled: tiga perubahan, daftar, reset per-item/penuh, banner hilang, live pembatalan, fokus kembali, simpan + pembaruan baseline |
| AC-03 | Test 40 skeleton, busy grid, empty/error CTA, role status/alert, fokus error eksplisit/ID ganda, semua terkunci tetap dapat dinavigasi |
| AC-04 | Test 20 kolom/160 sel, kelas sticky atas/kiri, scroll container, fokus sel terakhir + `scrollIntoView` |
| `pnpm lint` | Lulus seluruh workspace |
| `pnpm typecheck` | Terblokir 12 error TS2339 baseline `flow-editor.test.tsx:702–749` (`HTMLElement.disabled`); tidak ada error PermissionMatrix |
| Typecheck konsumen | `@ds/showcase` dan `@web/app` lulus terpisah; runner root berhenti sebelum keduanya karena baseline UI |
| `pnpm test` | PermissionMatrix 15/15 lulus; runner paralel default timeout pada FlowEditor; pengulangan juga menemukan timeout OrgChartEditor dan `waitFor` FileUpload |
| `pnpm -r test --maxWorkers=2 --testTimeout=30000` | Lulus: 53 file/586 test UI + 7 test token; seluruh kegagalan timing di atas tidak terulang, tanpa mengubah konfigurasi |
| `pnpm test:tokens` | 7/7 lulus, termasuk pasangan semantik seluruh tema light/dark ≥ 4.5:1 |

### Batas audit sebelum `done`

- Audit kode/DOM meliputi role/label, live region, fokus, urutan DOM, sticky, token semantik, dan reduced motion.
- Browser automation tidak tersedia (tool browser serta Playwright/Puppeteer tidak terpasang). Walkthrough Tab nyata, screen reader, sticky saat scroll, tampilan mobile/light/dark dan kontras permukaan komposit belum diverifikasi secara visual; test jsdom bukan penggantinya. Cek manual AC-01/AC-04 tetap menjadi catatan review, selaras audit showcase final 018-03.
- User menyetujui dan menetapkan `done` pada 2026-11-21; keterbatasan audit manual di atas tetap dicatat untuk 018-03. Kegagalan baseline tidak diperbaiki di story ini.
