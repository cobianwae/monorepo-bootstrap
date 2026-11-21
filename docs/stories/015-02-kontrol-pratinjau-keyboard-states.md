# 015-02 — Kontrol + pratinjau + keyboard + state matrix

Status: review
PRD: `docs/prd/015-image-cropper.md` (approved, gate 1)
Design: `docs/design/wireframes/image-cropper.md` (approved, gate 2, §2.2–§2.3, §3–§4) + `docs/design/flows/image-cropper.mmd` (diagram 2–3)
FR: `FR-003`, `FR-004`, `FR-006`, `FR-007`
Screens: `S-005.38`, `S-005.38.01`, `S-005.38.02`
Goal: Cropper bisa dipakai penuh tanpa mouse: rotasi preset + reset, pratinjau live lingkaran/persegi, keyboard setara pointer, dan state empty/loading/error/success di dalam komponen.

## Acceptance Criteria

### AC-01 — Rotasi preset + reset tanpa upload ulang

**Given** gambar termuat dengan crop/zoom/rotasi berubah
**When** user menekan Putar 90° (berulang) dan Atur ulang
**Then** rotasi kelipatan 90° dihitung ulang benar; reset kembali ke `crop 0,0 + zoom 1 + rotation 0` file ini; fokus tetap di tombol + live "Diaturn ulang" — diverifikasi test + audit (FR-003, S-005.38)

### AC-02 — Pratinjau live mengikuti area

**Given** area crop digeser/di-zoom/diputar pada scenario avatar dan cover
**When** `onCropComplete` terpicu (throttled)
**Then** pratinjau lingkaran (avatar) dan persegi (cover) diperbarui + label dimensi target ("512×512" / "1280×720"); bukan warna-saja — diverifikasi test + scenario (FR-004, S-005.38.01/.02)

### AC-03 — Keyboard penuh setara pointer

**Given** fokus di area crop dengan keyboard saja
**When** user memakai `←→↑↓` (Shift = 1px presisi), `+`/`-`, `R`/`Shift+R`, `0`, slider, dan tombol −/+ / Putar / Reset
**Then** semua operasi berhasil tanpa mouse; slider sinkron; kontrol berlabel ID ("Zoom", "Perbesar", "Putar 90 derajat", "Simpan hasil"); area `role=application` + deskripsi; live throttled 300 ms — diverifikasi audit keyboard + SR (FR-006, S-005.38)

### AC-04 — State matrix komponen teramati

**Given** komponen tanpa gambar, saat decode, dengan file rusak/raksasa, dan setelah `onComplete`
**When** dibuka di host uji/showcase draf
**Then** empty (`role=status` + CTA + batas 10 MB), loading (`aria-busy` + teks SR, kontrol disabled), error format (`role=alert` + penyebab + fokus ke alert), error besar (ukuran aktual disebut), success (pratinjau akhir + dimensi + CTA ulang) — diverifikasi test + scenario (FR-007, S-005.38)

### AC-05 — Fokus, motion, dan sentuh

**Given** komponen di light & dark dengan keyboard + sentuh
**When** dinavigasi penuh
**Then** fokus ring `primary` 2px offset 2 terlihat dua tema; `prefers-reduced-motion` mematikan transisi; gagang hit ≥44px, tombol ≥44px, slider ≥48px — diverifikasi audit (FR-006, S-005.38)

## Tasks

- [x] Tambah kontrol (§2.2): `slider` Zoom berlabel + tombol −/+ + Putar 90° (`R`) + Atur ulang (`0`), wiring ke state 015-01 tanpa duplikasi mesin crop
- [x] Tambah pratinjau (§2.3): mini canvas/img throttled + `avatar` lingkaran + label dimensi; `aria-live=polite` + `aria-label "Pratinjau hasil"`
- [x] Implementasi keyboard (§4): `role=application` + handler panah/`+-`/`R`/`0` + live region + `aria-describedby` dimensi target; semua teks Bahasa Indonesia
- [x] Implementasi state matrix (§3): empty/loading(`skeleton` + `aria-busy`)/error(`alert` + fokus)/success(`status` + fokus) di dalam komponen
- [x] Test co-located: rotasi/reset, pratinjau update, handler keyboard, tiap state + peran ARIA; `test:tokens` awal tanpa token baru

## Dependencies

- Story/CR lain: menunggu 015-01 (wrapper + output)
- Package: tanpa dependency baru (react-easy-crop dari 015-01)

## Notes

- Risiko: live region terlalu cerewet tiap frame — mitigasi throttle 300 ms + umumkan nilai bulat
- Keputusan: K4 inline v1; pratinjau render di `onCropComplete` bukan tiap frame; pesan selalu teks + ikon
