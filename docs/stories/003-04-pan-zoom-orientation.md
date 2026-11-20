# 003-04 — Pan/zoom kanvas, kontrol zoom, orientasi top-down & left-right

Status: review
PRD: `docs/prd/003-org-chart.md`
FR: `FR-006`, `FR-008`
Screens: `S-005.28`
Goal: Kanvas dapat di-pan dan di-zoom dengan batas wajar, kontrol zoom [−][%][+][reset] terjangkau keyboard, scroll halaman tidak terganggu, dan orientasi `top-down`/`left-right` dapat dipilih tanpa merusak konektor.

## Acceptance Criteria

### AC-01 — Zoom via kontrol, wheel modifier, dan keyboard

**Given** diagram dirender di kanvas dengan kontrol zoom mengambang [−][%][+][reset] (kanan-atas, wireframe §1)
**When** zoom in/out dilakukan via tombol, Ctrl/Cmd+wheel, atau tombol `+`/`-` saat kanvas fokus
**Then** level zoom berubah dalam batas default 0.5–2 step 0.25 (dapat diatur via `zoomRange`); indikator persen menampilkan level; `0`/reset mengembalikan 100% + posisi awal; zoom ekstrem dibatasi — diverifikasi test (FR-006, S-005.28)

### AC-02 — Pan drag & keyboard; scroll halaman aman

**Given** kanvas background fokus (`role="region"` dengan `aria-label`)
**When** user drag pointer atau menekan panah
**Then** konten bergerak via transform translate (panah = 40 px per tekan); wheel tanpa modifier **tidak** dicegat sehingga scroll halaman normal — diverifikasi test (FR-006, S-005.28)

### AC-03 — Dua mode fokus terpisah

**Given** diagram dengan kontrol zoom di toolbar kanvas dan node di dalam diagram
**When** user berpindah dengan Tab
**Then** kanvas (pan/zoom keyboard) dan node (navigasi `003-03`) adalah stop fokus terpisah; kontrol zoom terjangkau via Tab tanpa harus masuk ke node diagram; tombol persen `aria-live="polite"` saat level berubah (FR-006, FR-010 penguat, S-005.28)

### AC-04 — Orientasi top-down & left-right

**Given** `orientation` bernilai `top-down` (default) dan `left-right`
**When** masing-masing dirender
**Then** layout menukar sumbu (depth menjadi kolom pada LR) dan konektor elbow mirror arahnya; konektor tetap rapi sebelum & sesudah toggle; keduanya terverifikasi test tanpa merusak layout (FR-008, FR-004, S-005.28)

## Tasks

- [x] Kanvas wrapper `overflow-hidden` + `transform: translate() scale()`; state zoom/pan internal uncontrolled (design D5)
- [x] Kontrol zoom mengambang [−][%][+][reset]; tombol persen `aria-live="polite"`
- [x] Zoom: tombol, Ctrl/Cmd+wheel (wheel polos aman), keyboard mode kanvas; `zoomRange` default 0.5–2 step 0.25
- [x] Pan: drag pointer + panah 40 px; `0` = reset ke 100% + posisi awal
- [x] Orientasi `left-right`: swap sumbu layout + mirror konektor
- [x] Test co-located: batas zoom & reset, wheel polos tidak dicegat, pan keyboard, layout + konektor LR
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test`

## Dependencies

- Story/CR lain: `003-01` (wajib — layout + konektor menjadi dasar swap sumbu); disarankan dikerjakan setelah `003-03` agar kanvas menghosting node + navigasi final
- Package: tanpa dependency baru

## Notes

- Risiko: Ctrl/Cmd+wheel dicegat global bisa mengganggu gesture browser — mitigasi: hanya dicegat saat event terjadi di dalam kanvas (design D5, FR-006).
- Keputusan: zoom/pan uncontrolled di v1 tanpa prop terkontrol (design §2 aturan contract); virtualisasi eksplisit out of scope.
