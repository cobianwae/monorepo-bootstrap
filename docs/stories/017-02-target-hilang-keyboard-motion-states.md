# 017-02 — Target hilang + keyboard + motion + states

Status: approved
PRD: `docs/prd/017-product-tour.md` (approved, gate 1)
Design: `docs/design/wireframes/product-tour.md` (approved, gate 2, K2/K4/K5 + §2.3/§3/§4) + `docs/design/flows/product-tour.mmd` (diagram 2–3)
FR: `FR-003`, `FR-005`, `FR-006`, `FR-007`
Screens: `S-005.20`
Goal: Tur robust dan aksesibel tanpa showcase final: target hilang dilewati anggun, konfirmasi Lewati hanya progres > 1, keyboard penuh + Esc + fokus kembali + SR, reduced-motion, dan state matrix empty/loading/error/success di dalam komponen.

## Acceptance Criteria

### AC-01 — Target hilang dilewati anggun + error semua hilang

**Given** tur 5 langkah dengan langkah 3 disembunyikan kondisi UI, lalu varian semua target hilang
**When** user Lanjut melewati langkah 3, dan membuka varian semua-hilang
**Then** langkah 3 dilewati (`result="skipped-missing"`) + pemberitahuan teks di popover berikut, tur lanjut tanpa crash; semua-hilang menampilkan `alert` "Semua target tidak ditemukan" + penyebab + [Tutup tur] → `onSkip` semua `skipped-missing` — diverifikasi test (FR-003, S-005.20)

### AC-02 — Konfirmasi Lewati hanya progres > 1

**Given** tur aktif di langkah 1, lalu di langkah 3
**When** user menekan Lewati/Esc di kedua posisi
**Then** langkah 1 langsung lewati tanpa dialog; langkah 3 menampilkan `alert-dialog` "Lewati tur?" + [Lanjut tur][Ya, lewati]; Esc di dialog kembali ke tur; tanpa `M-NNN` baru (K2) — diverifikasi test (FR-005 parsial skip, S-005.20)

### AC-03 — Keyboard penuh + fokus kembali + SR

**Given** fokus di [Mulai tur] (pemicu tersimpan)
**When** user menjalankan tur penuh hanya keyboard: Tab cycling di footer popover, Enter aktivasi, Esc alur K2, Selesai/Tutup
**Then** tiap ganti langkah fokus ke judul popover + live "Langkah N dari total: <judul> (+ pemberitahuan lewati)"; selesai/lewati/tutup-error fokus kembali ke pemicu; konten belakang `inert` saat tur aktif — diverifikasi audit keyboard + SR (FR-005, S-005.20)

### AC-04 — Reduced-motion mematikan animasi

**Given** `prefers-reduced-motion: reduce` aktif
**When** tur berpindah langkah dan scroll ke target
**Then** animasi spotlight + transisi popover instan dan `scrollIntoView({behavior:"auto"})`; tanpa smooth scroll — diverifikasi test media query (FR-006, S-005.20)

### AC-05 — State matrix komponen teramati

**Given** komponen dengan `steps=[]`, saat resolusi target, dengan semua-hilang, dan setelah finish/skip
**When** dibuka di host uji
**Then** empty (`role=status` + [Mulai tur] disabled bila kosong + "Belum ada langkah"), loading antar-langkah (`aria-busy` + teks SR, kontrol disabled singkat), error (`role=alert` + fokus ke alert), success (`role=status` + fokus kembali) — diverifikasi test (FR-007, S-005.20)

## Tasks

- [ ] Implementasi resolusi target tiap navigasi (K4: `offsetParent` + `getBoundingClientRect` + `visibility`; ref prioritas, selector fallback) + status `skipped-missing` + pemberitahuan teks + error semua-hilang (`alert` + fokus)
- [ ] Implementasi alur lewati K2: progres > 1 → `feedback/alert-dialog` compose ("Lewati tur?" + [Lanjut tur][Ya, lewati]); langkah 1 langsung `onSkip`; wiring `onStepChange` status
- [ ] Implementasi keyboard + fokus (§4): simpan pemicu, fokus judul `tabindex=-1` tiap langkah, Tab cycling footer, Esc flow 3, `inert` + `aria-hidden` belakang, kembalikan fokus saat akhir; live region polite + `role=dialog` + progress `aria-label`
- [ ] Implementasi reduced-motion (K5): media query mematikan animasi/scroll-halus/transisi; tanpa prop tambahan
- [ ] Test co-located: lewati 1 hilang + semua hilang, dialog hanya progres > 1, keyboard penuh tanpa mouse, fokus kembali `activeElement`, reduced-motion, tiap state + peran ARIA; tanpa dependency/token baru

## Dependencies

- Story/CR lain: menunggu 017-01 (wrapper + navigasi + callback)
- Package: tanpa dependency baru (driver.js dari 017-01)

## Notes

- Risiko: cek visibilitas rapuh di jsdom — mitigasi helper `isTargetVisible` teruji + mock rect; live region cerewet — mitigasi umumkan per langkah saja, bukan per frame
- Keputusan: K2 konfirmasi progres > 1 + reuse alert-dialog; K4 cek tiap navigasi; K5 motion via media query; showcase penuh + audit kontras di 017-03
