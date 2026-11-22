# CR-048 — Demo Directional Motion tampil kosong sebelum Play

**Status:** draft
**Sumber:** temuan CR-035 (di luar scope saat itu), dikonfirmasi screenshot 2026-11-22
**Ref:** `docs/design/visual-language.md` (Motion: token `MOTION_TOKENS` 150/250/400ms, `ease-smooth`, hormati `prefers-reduced-motion`), `apps/showcase/src/app/(docs)/foundations/motion/page.tsx`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `foundations/motion/page.tsx` (bagian Directional Motion) | Tiga kotak arah tampil kosong (state awal `opacity-0`) sampai tombol Play ditekan. Pengguna tidak melihat contoh sebelum berinteraksi. | Tampilkan state awal yang terlihat (mis. posisi awal dengan opacity penuh) lalu animasi saat Play; atau beri label "Tekan Play" yang jelas di area kosong. |

## Perubahan (usulan)

- Pilih salah satu: (a) posisi awal terlihat (tanpa `opacity-0` untuk kotak demo), atau (b) tetap tersembunyi tetapi dengan teks petunjuk.
- Pastikan animasi tetap memakai token durasi dan `prefers-reduced-motion` dihormati (`motion-reduce:transition-none`).

## Tasks

- [ ] Pilih opsi (a) atau (b) (rekomendasi: a, agar kotak selalu terlihat).
- [ ] Ubah `motion/page.tsx` pada bagian Directional Motion.
- [ ] Verifikasi Play tetap berjalan (interaksi di browser; belum diuji otomatis).
- [ ] Screenshot dark & light.
- [ ] `pnpm --filter @ds/showcase lint`, `build:types`, guard test.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Belum dieksekusi; rekomendasi opsi (a) | Perubahan kecil di docs; menunggu persetujuan user agar tidak mengubah demo tanpa dasar |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode (rencana).
- [ ] Motion tetap memakai token.

## Eksekusi

Belum dieksekusi. Status tetap `draft`.
