# 003-05 — State matrix, highlight pencarian, scenario showcase final

Status: review
PRD: `docs/prd/003-org-chart.md`
FR: `FR-011`, `FR-009`, `FR-012` (penguat `FR-001`, `FR-007`, `FR-008`)
Screens: `S-005.28`
Goal: Menutup state matrix (loading/empty/error) pada komponen, menyediakan highlight pencarian (`highlightedIds` + util `getAncestors`), dan mengunci scenario showcase interaktif `S-005.28` sebagai bukti audit — data realistis, light & dark, smoke build.

## Acceptance Criteria

### AC-01 — State matrix lengkap teramati

**Given** kontrol demo pemicu loading, empty, error data invalid (siklus & parent hilang), dan error eksternal via prop `error`
**When** tiap state dipicu di scenario
**Then** loading → skeleton ±8 kotak node + garis konektor placeholder dengan `aria-busy="true"`; empty → `empty-state` "Belum ada data organisasi" + petunjuk format data + CTA terjangkau keyboard (`role="status"`); error invalid → panel di area kanvas dengan penyebab spesifik + id pelanggaran pertama (`role="alert"`, teks bukan hanya warna); error eksternal → alert di atas kanvas dengan diagram terakhir tetap tampil bila ada; success → diagram penuh aktif — semua teramati light & dark (FR-011, S-005.28)

### AC-02 — Highlight pencarian membuka path

**Given** input pencarian di toolbar demo memakai `highlightedIds` + util `getAncestors` (logika match milik konsumen, design D8)
**When** query cocok nama/jabatan
**Then** node target diberi ring `primary` + `data-highlighted` (bukan hanya warna); ancestor otomatis ter-expand sehingga target terlihat; hasil diumumkan via live region "N hasil" di luar kanvas — pola resep didokumentasikan di scenario (FR-009, FR-003, S-005.28)

### AC-03 — Scenario showcase final interaktif

**Given** halaman `/patterns/org-chart` dengan data contoh realistis ±40 orang, kedalaman 4 tingkat, 4 departemen beda aksen
**When** route dibuka di light dan dark
**Then** seluruh kontrol demo berfungsi (pemicu loading/empty/error, toggle orientasi top-down/left-right, `defaultCollapsedIds` cabang engineering, input pencarian, papan zoom/pan keyboard); catatan a11y ada di halaman; handler demo mock (log/toast) tanpa mengubah kode pattern; keempat elemen node kaya (avatar/title/subtitle/badge) teramati (FR-012, FR-002, FR-007, FR-008, S-005.28)

### AC-04 — Verifikasi penuh + docs state

**Given** seluruh story 003 selesai
**When** verifikasi dijalankan
**Then** `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm -C apps/showcase build` lolos; `docs/BACKLOG.md`, `docs/STATUS.md`, dan `docs/STATUS-LOG.md` diperbarui sesuai definisi selesai

## Tasks

- [x] State matrix komponen: loading skeleton (`aria-busy`), empty (`role="status"`), error data invalid (`role="alert"`, penyebab + id pertama), error eksternal prop (alert di atas kanvas) — wireframe §4
- [x] `highlightedIds` (ring + `data-highlighted`) + export util `getAncestors(flatNodes, id)` (design D8)
- [x] Showcase `/patterns/org-chart`: data ±40 orang / 4 tingkat / 4 departemen; toolbar demo (pencarian + live region, toggle orientasi, pemicu state, dataset invalid); papan zoom/pan keyboard; catatan a11y; light/dark
- [x] Update `docs/BACKLOG.md` + `docs/STATUS.md` + append `docs/STATUS-LOG.md`
- [x] Verifikasi: `pnpm typecheck` → `pnpm lint` → `pnpm test` → `pnpm -C apps/showcase build`

## Dependencies

- Story/CR lain: `003-01`, `003-02`, `003-03`, `003-04` (integrasi akhir seluruh lapisan)
- Package: compose `base/skeleton`, `feedback/empty-state` existing; tanpa dependency baru

## Notes

- Risiko: kontrol demo bisa bocor masuk kode pattern — mitigasi: semua kontrol demo hidup di panel demo di atas `DemoSection` (wireframe §1).
- Keputusan: pencarian tetap presentasional — komponen tidak memegang state pencarian (design D8); live region milik konsumen di luar komponen.
