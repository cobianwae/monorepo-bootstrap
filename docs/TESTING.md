# Testing

## Prinsip

- Test mengikuti risiko: token dan a11y lebih penting daripada snapshot visual.
- Test co-located dengan kode yang diuji.
- Jangan mengejar coverage angka; kejar perilaku yang bisa rusak.
- Test yang gagal karena baseline harus dicatat, bukan dihapus.

## Layer

| Layer | Yang diuji | Lokasi | Tool |
|---|---|---|---|
| Unit token | konversi warna, rasio kontras, compliance | `packages/tokens/src/*.test.ts` | Vitest |
| Unit util | format, helper, logika murni | `packages/ui/src/lib/*.test.ts` | Vitest |
| Component | render, varian, interaksi, a11y dasar | co-located `*.test.tsx` | Vitest + Testing Library |
| Integration API | endpoint, validasi DTO, error filter | `apps/api` | Vitest/Supertest (saat aktif) |
| Showcase smoke | build dan render route utama | `apps/showcase` | `next build` |

## Commands

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:tokens
pnpm -C apps/showcase build
```

Gunakan `pnpm test:tokens` untuk perubahan warna/kontras.
Gunakan `pnpm -C apps/showcase build` untuk perubahan route, layout, atau scenario.

## A11y & Token Checks

- Kontras teks normal ≥ 4.5:1; large text ≥ 3.0:1.
- Light dan dark mode sama-sama dicek.
- Fokus keyboard terlihat (`focus-visible`), tidak ada keyboard trap.
- Elemen interaktif memakai elemen semantik atau Radix, bukan `div` dengan `onClick`.
- Form: label terhubung, error memakai `aria-describedby`, error bukan hanya warna.
- Touch target minimal 44px.
- `prefers-reduced-motion` dihormati.
- Overlay: focus management, Esc, dan restore focus benar.

## Definition of Done

- Acceptance criteria story/CR terpenuhi.
- `pnpm typecheck`, `pnpm lint`, dan `pnpm test` pass.
- Perubahan token disertai audit kontras light/dark.
- Perubahan UI disertai state loading, empty, dan error yang relevan.
- Showcase dan docs diperbarui bila perilaku/API berubah.
- Tidak ada `any` baru, hex/RGB hardcode, atau duplikasi komponen.
