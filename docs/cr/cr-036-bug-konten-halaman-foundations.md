# CR-036 — Bug konten halaman `foundations` (klaim, label, demo motion)

**Status:** done (hasil verifikasi diterima dan penutupan disetujui user)
**Sumber:** bug — ditemukan saat membandingkan `motion`, `typography`, `themes` dengan token (2026-11-22)
**Ref:** `apps/showcase/src/app/(docs)/foundations/{motion,themes,typography}/page.tsx`, `packages/tokens/src/tokens.ts:186-217`, `packages/tokens/src/contrast.ts:10-17`

> Prioritas MoSCoW: **should** (klaim yang salah di docs design system merusak kepercayaan). Dieksekusi atas instruksi eksplisit user; `approved`/`done` hak user.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `themes/page.tsx` (spotlight + badge matriks) | "100% WCAG AA Passing" dan "All Pairs ≥ 4.5:1" ditulis tangan padahal `activeAuditedPairs` tersedia. | Hitung dari `compliance.passAA`/`ratio`; tampilkan peringatan bila gagal. |
| 2 | major | `motion/page.tsx:29` | "4-step duration scale"; token hanya 3 (`fast`/`normal`/`slow`). | "3-step". |
| 3 | major | `motion/page.tsx` demo durasi | Tiga durasi memakai easing berbeda (`ease-out`, `ease-spring`, `ease-smooth`) sehingga durasi tidak bisa dibandingkan. | Satu easing (`ease-smooth`). |
| 4 | minor | `motion/page.tsx` | Demo memakai `duration-300`/`duration-500` yang bukan token (150/250/400). | `duration-250`/`duration-400`. |
| 5 | minor | `motion/page.tsx` | Label "Slide In (right)" tetapi elemen datang dari kiri. | "Slide In (from left)". |
| 6 | minor | `motion/page.tsx` Banner | Aksi "Play All" hanya scroll ke anchor, tidak memutar. | `onActionClick={triggerAnimation}` (prop sudah ada). |
| 7 | minor | `typography/page.tsx` | "8 Proportional Steps" ditulis tangan. | `TYPOGRAPHY_SCALE.length`. |
| 8 | major | `colors/page.tsx:135` | **Bug dark mode pra-ada** (ditemukan lewat screenshot, bukan dari perubahan CR-035): badge "Ratio" di Live Contrast Checker memakai `bg-foreground/15 text-foreground` di dalam kotak pratinjau berwarna `customBg`/`customFg`. Di dark mode `foreground` terang di atas latar contoh putih → "RATIO 8.97:1" nyaris tak terbaca; light mode normal. | Hapus `text-foreground` (mewarisi `customFg`), `bg-foreground/15` → `bg-current/10`. **Sudah diperbaiki.** |

## Perubahan yang Diusulkan

Hanya konten/klaim/demo di tiga halaman; tidak ada perubahan token, `@ds/ui`, atau dependency.

## Tasks (jalur small-fix)

- [x] Perbaiki temuan 1–8.
- [x] Lint dan `build:types` showcase hijau.
- [x] Verifikasi visual (screenshot Chrome headless, dark dan light, Atelier / Pulse): badge WCAG di `themes` tampil hijau (`success`) dari data; badge "Ratio" di `colors` terbaca di dark **dan** light setelah perbaikan temuan 8; Banner "Play All" tampil dengan aksi. Pemutaran animasi lewat tombol **tidak** diuji interaktif (screenshot statis); perilaku `onActionClick={triggerAnimation}` diverifikasi dari kode dan typecheck, bukan dijalankan di browser.
- [x] Hitung AA dari data: **16/16 kombinasi** (8 tone × light/dark) terverifikasi di Chrome headless lewat kontrol showcase `/foundations/themes`. Untuk tiap kombinasi, tabel tetap menampilkan 20 baris (10 per mode); pasangan token, nilai warna, rasio, dan level WCAG cocok dengan `auditThemeTokenPairs`. Semua tone menampilkan badge `success` “100% WCAG AA Passing (20 pairs)” dan “All Pairs ≥ 4.5:1”.

Rasio minimum per tone (light/dark, dibulatkan seperti di tabel): Pulse 4.64/5.65, Sunset 4.83/6.72, Botanic 4.83/6.60, Midnight 4.83/7.20, Nebula 4.70/6.87, Lagoon 4.83/6.45, Ink 4.83/5.98, Graphite 4.83/7.19. Bukti ini hanya mencakup pasangan dalam matriks dan badge saat semua pasangan lolos; kondisi gagal tidak disimulasikan dan ini bukan audit kontras seluruh antarmuka.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Klaim kepatuhan dihitung dari audit, bukan teks statis | `CONVENTIONS.md` bagian Visual; docs yang mengklaim kepatuhan harus bisa gagal. |
| 2 | Teks sampel kode di bagian Reduced Motion ikut memakai `duration-250` | Konsisten dengan token. |
| 3 | Tanpa uji unit baru | Perubahan presentasional; pagar guard dan typecheck cukup. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode baru.
- [x] Kontras: badge gagal memakai `destructive`, lolos memakai `success` (pasangan sudah ada).
- [x] `prefers-reduced-motion` tetap (`motion-reduce:transition-none`).
- [x] Tidak ada perubahan API.
- [x] `pnpm test` penuh: tokens 10, ui 707, showcase 77 — hijau (dijalankan sebelum perbaikan temuan 8; setelahnya dijalankan ulang guard 3/3, lint, dan `build:types` showcase, semuanya hijau).
- [x] Kontras badge Ratio: teks mewarisi `customFg` yang dipilih user dan latar `bg-current/10` mengikutinya, sehingga rasio badge ≈ rasio pasangan yang sedang diuji di kedua mode.

## Eksekusi

Branch: `visual-polish` (integrasi pekerjaan visual, dari `dev` `e57f7ea`).
Commit implementasi: `8294a05`, bersama CR-035, sudah tercakup dalam riwayat audit `edd5bea` yang di-push. Verifikasi browser yang masih terbuka setelah audit CR-054 diselesaikan terpisah di worktree `arah-ord`, branch `cr-036-bug-konten-halaman-foundations` dari `visual-polish` `80862a5`, tanpa perubahan kode.

Verifikasi workspace dari baseline bersih: `pnpm lint` lulus; `pnpm typecheck` gagal dengan 12 error `TS2339` di `flow-editor.test.tsx`; `pnpm test` mencatat tokens 10/10 dan UI 715/729 (14 gagal, 2 error worker Vitest), lalu berhenti sebelum showcase. Guard visual showcase dijalankan terpisah dan lulus 5/5. Kegagalan baseline tidak diperbaiki dalam CR ini.

- [x] CR disetujui user (instruksi 2026-11-22: "setuju semua CR kecuali CR-012 dan CR-013").
- [x] Perubahan diimplementasikan.
- [x] Verifikasi targeted dijalankan.
- [x] `docs/BACKLOG.md`, `docs/STATUS.md`, `docs/STATUS-LOG.md` diperbarui.
