# CR-048 — Demo Directional Motion tampil kosong sebelum Play

**Status:** approved (disetujui user 2026-11-22; `done` menunggu user)
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

- [x] Opsi (a) dipilih: posisi awal terlihat.
- [x] `motion/page.tsx`: hapus `opacity-0` dari keadaan awal Slide In dan Slide Up; Scale Fade memakai `scale-90 opacity-60` sebagai awal. Slide Up `translate-y-8` → `translate-y-4` karena elemen terpotong di kotak `h-20`.
- [ ] Verifikasi Play berjalan di browser: belum diuji interaktif (hanya state awal yang di-screenshot).
- [x] Screenshot light Atelier/Pulse: tiga demo terlihat, tidak terpotong.
- [x] `pnpm --filter @ds/showcase lint` dan `build:types` hijau; `vitest src/test` 4/4 hijau.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Opsi (a): keadaan awal terlihat; animasi Play tetap | Kotak tidak lagi kosong; arah tetap terbaca dari posisi awal |
| 2 | Scale Fade awal `opacity-60` (bukan 0) dan Slide Up awal `translate-y-4` | Supaya contoh tetap terlihat dan tidak keluar kotak |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode (rencana).
- [ ] Motion tetap memakai token.

## Eksekusi

Belum dieksekusi. Status tetap `draft`.
