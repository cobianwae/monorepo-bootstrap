# Spec Singkat — Mention Input & Emoji Picker untuk Chat (RM-10)

Status: approved
Tanggal: 2026-11-20
Screen: `S-005.32` Mention & Emoji (`/patterns/mention-emoji`)
Track: lightweight — spec singkat + 1 story (menggantikan PRD penuh)
Sumber: roadmap RM-10 (`docs/discussions/component-roadmap.md`)

## Masalah

`data-display/chat.tsx` sudah menjadi basis pesan (bubble, attachment, thread) tetapi
belum punya input kaya: **mention (@user)** dan **emoji picker** adalah fitur standar
aplikasi chat/komentar modern. Konsumen harus membangun popover daftar kandidat dan
emoji picker sendiri — biasanya dengan styling di luar token.

## Cakupan & Non-goals

Cakupan: memperkaya input `chat.tsx` dengan mention dan emoji picker (komposisi
komponen existing). Ekstensi ke editor teks kaya (PRD 006) hanya integration point,
tidak diimplementasi di sini.

Non-goals:

- Autocomplete mention ke server (kandidat dari callback konsumen; komponen tidak
  memanggil API).
- Emoji reaction pada bubble (tindakan pesan) — terpisah bila dibutuhkan.
- Skin-tone picker dan set emoji kustom.
- Slot pejabat (rezim permission) siapa boleh mention siapa — milik aplikasi.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Mengetik `@` membuka popover kandidat (data dari callback konsumen); mengetik lanjutan memfilter kandidat. | must | Popover terbuka dan terfilter saat mengetik (test + scenario). |
| FR-002 | Navigasi kandidat via panah + Enter memilih; klik/tap juga berfungsi; Escape menutup. | must | Semua jalur pemilihan terverifikasi test. |
| FR-003 | Mention tersimpan sebagai token terstruktur (id + label) dalam pesan dan ter-render sebagai chip/link di bubble. | must | Pesan bermention ter-render sebagai elemen khusus; payload memuat token (test). |
| FR-004 | Tombol emoji membuka popover picker dengan kategori dan pencarian. | must | Picker terbuka; memilih emoji menyisipkan karakter di posisi kursor. |
| FR-005 | Navigasi keyboard penuh pada kedua popover; ARIA combobox/listbox yang benar. | must | Audit a11y lolos; alur mention tanpa mouse. |
| FR-006 | State matrix: kandidat loading, kandidat kosong (tanpa hasil), error callback. | must | Tiga state teramati di scenario. |
| FR-007 | Emoji terakhir dipakai (recent) tersimpan lokal. | could | Recent muncul di bagian atas picker setelah dipakai. |
| FR-008 | Showcase scenario chat dengan mention + emoji (loading/kosong/berisi), light & dark. | must | Route scenario tersedia, lolos smoke build. |

## Basis Compose

- `data-display/chat.tsx` (basis), `overlay/popover.tsx` (kedua popover),
  `base/avatar.tsx` (kandidat), `base/input.tsx` (filter), `base/skeleton.tsx` +
  `feedback/empty-state.tsx` (state), `base/tooltip.tsx` (tombol),
  `navigation/command-palette.tsx` (referensi pola pencarian terpandu).

## Rencana Story

- 1 story: `009-01` — perluasan `chat.tsx` + test + scenario showcase.
- Nomor `009` dipakai sebagai seri lightweight track (tidak menunjuk PRD penuh); dicatat di `docs/BACKLOG.md`.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Perubahan API publik `chat.tsx` (menambah props/subkomponen) — konfirmasi user saat story dibuat, sesuai CONVENTIONS "Butuh Konfirmasi". | answered — setuju: tambah props opsional (`candidates`, `onMention`, emoji) tanpa breaking change |
| 2 | FR-007 (recent emoji) masuk v1? | answered — ditunda ke iterasi berikut (tetap `could`) |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft awal dari roadmap RM-10 |
| 2026-11-20 | **Approved** — screen S-005.32, story 009-01, API non-breaking, FR-007 ditunda |
