# Visual Language

Status: **draft** — arah visual belum dikunci. Isi lewat command `/design-language`.
Dokumen ini menjadi acuan untuk `/polish-ui` dan audit visual.

## Tujuan

Mendefinisikan bahasa visual showcase dan komponen: hierarki, tipografi, spacing, permukaan,
warna, motion, dan target styling komponen. Bukan pengganti design token; ini lapisan arah.

## Prinsip

- Token-driven: semua keputusan visual harus bisa dipetakan ke token.
- Light dan dark parity: tidak ada arah yang hanya bekerja di satu mode.
- Hierarki jelas: satu fokus utama per layar.
- Density terkendali: showcase boleh padat, tapi tidak boleh sesak.
- Gerak halus: animasi mendukung pemahaman, bukan dekorasi.

## Type Scale

| Peran | Ukuran | Weight | Catatan |
|---|---|---|---|
| Display | — | — | Belum ditentukan |
| Heading 1 | — | — | — |
| Heading 2 | — | — | — |
| Body | — | — | — |
| Caption | — | — | — |

## Spacing & Density

- Skala spacing mengikuti token existing.
- Section padding, gap grid, dan density tabel belum dikunci.
- Showcase scenario boleh memakai density lebih tinggi daripada docs.

## Layout Patterns

- Docs: shell dengan sidebar, konten maksimal, contoh interaktif.
- Scenario: app shell dengan header, sidebar, dan area kerja.
- Landing: hero, fitur, bukti sosial, CTA.

## Surfaces & Depth

- Permukaan: background, card, popover, overlay.
- Bayangan dan border mengikuti token; hindari nilai ad-hoc.
- Elevation harus konsisten antara dialog, sheet, dan popover.

## Color Roles

- `primary` — aksi utama.
- `muted` — sekunder dan disabled.
- `destructive` — error dan aksi berbahaya.
- `success`, `warning`, `info` — status.
- `highlight` — aksen khusus.

## Component Styling Targets

| Komponen | Target |
|---|---|
| Button | Hierarki primary/secondary/ghost, focus ring jelas |
| Card | Permukaan tenang, border tipis, radius konsisten |
| Data Table | Header jelas, row hover, empty/loading state |
| Dialog/Sheet | Elevation, focus trap, close affordance |
| Form | Label, helper, error yang terbaca |

## Motion

- Duration dan easing memakai token.
- Hormati `prefers-reduced-motion`.
- Hindari animasi yang menunda aksi utama.

## Changelog

| Tanggal | Perubahan | Status |
|---|---|---|
| 2026-11-19 | Dokumen dibuat sebagai draft | draft |
