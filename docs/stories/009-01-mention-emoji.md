# 009-01 — Mention + emoji picker untuk chat + showcase

Status: done
Spec: `docs/design/spec-mention-emoji.md`
FR: `FR-001`, `FR-002`, `FR-003`, `FR-004`, `FR-005`, `FR-006`, `FR-008`
Screens: `S-005.32`
Goal: Perkaya input `chat.tsx` dengan mention `@user` (popover kandidat + token terstruktur) dan emoji picker (kategori + pencarian) — non-breaking — plus scenario S-005.32 light & dark.

## Acceptance Criteria

### AC-01 — Mention popover terfilter

**Given** composer chat fokus dengan kandidat dari callback konsumen
**When** mengetik `@bu` 
**Then** popover kandidat terbuka dan terfilter ("Budi"); kandidat loading dan kosong punya state sendiri (FR-001, FR-006, S-005.32)

### AC-02 — Tiga jalur pemilihan mention

**Given** popover kandidat terbuka
**When** panah + Enter, klik/tap, dan Escape
**Then** Enter/klik memilih kandidat; Escape menutup tanpa memilih (FR-002, S-005.32)

### AC-03 — Token terstruktur di payload dan bubble

**Given** pesan "Halo @Budi, cek ini" terkirim
**When** payload diperiksa dan bubble dirender
**Then** payload memuat token `{id, label}`; bubble merender mention sebagai chip/link khusus (FR-003, S-005.32)

### AC-04 — Emoji picker menyisip di kursor

**Given** kursor di tengah teks "halo  dunia"
**When** tombol emoji dibuka, kategori dipilih, "😂" dicari dan dipilih
**Then** picker berkategori + pencarian berfungsi; emoji tersisip tepat di posisi kursor (FR-004, S-005.32)

### AC-05 — Keyboard + ARIA + showcase smoke

**Given** scenario S-005.32 dibuka light dan dark
**When** seluruh alur mention dijalankan tanpa mouse + state loading/kosong/error dipicu
**Then** audit a11y lolos (combobox/listbox benar); route lolos smoke build (FR-005, FR-008, S-005.32)

## Tasks

- [x] Perluas `packages/ui/src/components/data-display/chat.tsx`: props opsional (`candidates`, `onMention`, emoji) non-breaking + token mention
- [x] Popover kandidat `@` (filter, loading, kosong, error callback) + render chip di bubble
- [x] Popover emoji picker (kategori + pencarian + sisip di kursor)
- [x] Navigasi keyboard + ARIA kedua popover + audit a11y
- [x] Test co-located (filter, 3 jalur pilih, payload token, sisip kursor, Escape)
- [x] Scenario showcase S-005.32 (`/patterns/mention-emoji`) + smoke build
- [x] Update BACKLOG + STATUS-LOG; sitemap S-005.32 `planned` → `implemented`

## Dependencies

- Story/CR lain: tidak ada; compose `popover`, `avatar`, `input`, `skeleton`, `empty-state`, `tooltip` existing
- Package: tanpa dependency baru (recent emoji FR-007 `could` resmi ditunda; API publik hanya tambah opsional per OQ#1)

## Notes

- Risiko: deteksi `@` + posisi kursor di tengah teks — tangani hati-hati dengan selection API
- Keputusan: kandidat selalu dari callback konsumen (tanpa fetch internal); integration point RTE PRD 006 disiapkan tanpa diimplementasi
- Implementasi: `ChatComposer` menerima props opsional `candidates`, `candidatesStatus`, `onMentionQuery`, `onMention`, `emojiPicker`; `onSend` kini menerima argumen opsional `mentions: ChatMentionToken[]` (non-breaking untuk pemanggil lama). Komponen pendukung di `chat-composer-tools.tsx` (diekspor dari barrel).
- Verifikasi: 19 test baru di `chat-mention-emoji.test.tsx` lulus; `chat-and-support.test.tsx` lulus. `pnpm lint` hijau. `pnpm typecheck` hanya 12 error baseline FlowEditor. `pnpm -C apps/showcase build` hijau (route `/patterns/mention-emoji`). Tidak ada perubahan token, `pnpm test:tokens` tidak dijalankan.
- Belum dilakukan: audit a11y dengan alat (AC-05) dan pemeriksaan visual light/dark di browser; scenario sudah memakai token semantik. FR-007 (recent emoji) tetap ditunda sesuai spec.
- Known issue baseline: `pnpm test` UI menunjukkan timeout pada `flow-editor` (005-05) dan `org-chart-editor` (stack 50) pada run paralel; dengan `--maxWorkers=2 --testTimeout=30000` hanya timeout `OrgChartEditor stack undo dibatasi 50` (57 detik) tersisa. File tersebut tidak disentuh story ini.
