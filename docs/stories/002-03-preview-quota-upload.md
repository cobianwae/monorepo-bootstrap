# 002-03 — Preview media + quota + upload compose

Status: review
PRD: `docs/prd/002-file-manager.md`
FR: `FR-006`, `FR-007`, `FR-008`
Screens: `S-005.27`, `S-005.27.02`, `M-001`
Goal: Panel konteks `S-005.27.02` (upload queue + quota + detail item) dan preview `M-001` (sheet desktop / dialog full-screen mobile) untuk 4 tipe media beserta metadata dan fallback — lalu lengkapi scenario showcase dengan kontrol demo quota dan pembuka preview per tipe.

## Acceptance Criteria

### AC-01 — Upload compose di folder aktif

**Given** pattern dipasang dengan `uploadHandler` diteruskan ke `file-upload` PRD 001 dan folder aktif A
**When** user mengupload 3 dokumen lewat panel konteks
**Then** queue `file-upload` tampil di panel (state diwarisi PRD 001: queue kosong + helper, error per file + Ulang); file sukses masuk ke folder aktif dan konten diperbarui tanpa reload halaman (FR-006, S-005.27.02)

### AC-02 — Preview 4 tipe + metadata + fallback

**Given** item image, PDF, video, audio, dan satu tipe tak didukung (`other`)
**When** user membuka preview via aksi preview/menu/Enter
**Then** `M-001` tampil sebagai sheet di desktop dan dialog full-screen di mobile; media dirender native (`img`/`video`/`audio`, PDF via `object`/`iframe` dengan `sandbox` tanpa script + tautan unduh); metadata nama, tipe, ukuran, tanggal, dimensi/durasi (bila tersedia) terbaca; tipe tak didukung jatuh ke fallback generik + tombol unduh (FR-007, M-001)
**And** fokus terjebak di dalam sheet/dialog saat terbuka, Esc menutup, fokus kembali ke item pemicu; media punya label (`alt`/judul) dan kontrol native terjangkau

### AC-03 — Quota tiga level via token

**Given** `quota` normal, mendekati penuh, dan penuh (atau `quota` absen)
**When** scenario quota dibuka
**Then** indikator menampilkan total, terpakai, sisa (angka + progress bar): normal → `primary`, warning → token `warning` + pesan, penuh → token `destructive` + pesan; status tidak hanya warna (selalu ada teks/pesan); bila `quota` absen indikator disembunyikan (FR-008, S-005.27.02)
**And** light & dark parity teramati; pasangan kontras tercakup audit `packages/tokens`

### AC-04 — Detail item + state panel + verifikasi

**Given** satu item terpilih dan kontrol demo state panel
**When** user memilih item / memicu loading/error quota
**Then** panel detail menampilkan nama, tipe, ukuran, tanggal, dimensi/durasi; quota loading memakai skeleton bar, error quota menampilkan pesan ringan tanpa memblokir konten (FR-009 parsial panel, S-005.27.02)
**And** `pnpm typecheck` + `pnpm lint` + `pnpm test` lolos; test mencakup upload menambah item folder aktif, preview per tipe + fallback, quota tiga level

## Tasks

- [x] Panel konteks `S-005.27.02`: compose `file-upload` (teruskan `uploadHandler`) + quota basis `progress` + detail item terpilih
- [x] Preview `M-001`: sheet desktop / dialog full-screen mobile; elemen native + `sandbox` PDF + fallback generik + tombol unduh; focus trap + Esc + fokus kembali
- [x] Quota 3 level (`normal`/`warning`/`full`) via token `primary`/`warning`/`destructive` + pesan teks
- [x] State panel sesuai §6 (upload mengikuti PRD 001; quota skeleton/error ringan; preview skeleton/fallback)
- [x] Test co-located: upload selesai → item baru di folder aktif; 4 tipe preview + fallback; quota warna + pesan; preview focus trap
- [x] Showcase: kontrol demo quota normal/warning/penuh, pembuka preview per tipe media, panel upload + detail
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: bergantung pada `002-01` (shell + panel slot); melengkapi `002-02` (preview dipicu dari konten); `002-04` memoles a11y panel/preview
- Package: tanpa dependency baru; menyusun `file-upload` (PRD 001), `dialog`, `sheet`, `progress`, `skeleton` existing; elemen media native saja (D5)

## Notes

- Risiko: PDF `iframe` tanpa `sandbox` menimbulkan risiko script — mitigasi dengan `sandbox` tanpa script + tautan unduh (constraints PRD).
- Keputusan: mengikuti D2 (sheet/dialog) dan D5 (native + fallback); tidak ada token baru (D6).
