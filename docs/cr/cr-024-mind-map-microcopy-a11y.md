# CR-024 — Mind Map: microcopy, konten, dan a11y detail

**Status:** done

User menetapkan `done` dan mengizinkan push CR-022–028 serta merge/push `dev` (2026-11-22); penutupan bersama dicatat di branch CR-028.
**Sumber:** audit ui-designer `/improve-ui` scope `patterns/mind-map` + masukan user (konten/deskripsi)
**Ref:** `docs/prd/012-mind-map.md` (FR-005/FR-009), `packages/ui/src/components/canvas/mind-map.tsx`, `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `mind-map.tsx:1807`, `:952-954`, `page.tsx:88` vs `EmptyState :1773-1779` | Istilah teknis bocor ke user: tombol `Tambah anak root`, hint `Root tidak bisa dihapus`, vs EmptyState yang sudah ramah (`Belum ada peta ide / ide pusat`). User non-teknis tidak memakai kata root/label. | Samakan ke bahasa user: `Tambah cabang ide pusat`, `Ide pusat tidak bisa dihapus — hapus cabangnya dulu`. Perbarui aria-label/testid terkait bila label berubah (jaga kompatibilitas test). |
| 2 | major | `page.tsx:117-122` | Status cari `X ide · cari berdasarkan label` memakai istilah dev `label` (nama prop). Juga placeholder/input tanpa contoh. | Ganti ke `X ide · cari berdasarkan nama ide`; tambah `placeholder="Cth: Riset pasar"` dan `aria-describedby` ke status hasil. |
| 3 | minor | `mind-map.tsx:1244-1254`, `page.tsx:111` | Toggle minimap berlabel `Minimap` (Inggris) + aria `Tampilkan minimap`. Tidak konsisten dengan UI Bahasa Indonesia lain. | Ganti label visual ke `Peta mini`, aria `Tampilkan/sembunyikan peta mini` mengikuti `aria-pressed`. |
| 4 | minor | `page.tsx:88`, `:127-128`, `mind-map.tsx:868-870` | Deskripsi halaman `Petakan ide, cari cabang, dan kelola hierarki tanpa meninggalkan kanvas` + section keyboard dua paragraf panjang + hint `Enter simpan · Esc batal` 11px. Deskripsi generik, dinding teks keyboard sulit dipindai, hint 11px berisiko kontras. | Tulis ulang deskripsi berorientasi tugas (mis. tambah 1-klik, lipat, cari, undo), pecah keyboard menjadi daftar `<ul>` ringkas, naikkan hint ke `text-xs` dan audit kontras `muted-foreground` di atas `bg-card`. |
| 5 | minor | `mind-map.tsx:804-838` | Input inline `h-7 text-[13px]` di dalam pill `h-12` (28px). Sentuh 44px tidak terpenuhi untuk target ketik, walau pill total 48px. | Naikkan input ke `h-9`/`min-h-11` dengan padding yang tetap muat di pill, atau buat pill editing auto-height; pastikan tidak merusak layout dua sisi. |
| 6 | minor | `mind-map.tsx:585-617` | Gagang `+` `opacity-0` hingga hover/fokus — di sentuh/mobile tidak ada hover sehingga tidak terdiscovery; hanya mengandalkan context menu. | Pertahankan hover-reveal di desktop, tetapi di `md:hidden`/coarse-pointer tampilkan gagang `Tambah anak` secara persisten (atau tombol inline di pill); pastikan `nodrag nopan` + 44px tetap. |

## Perubahan yang Diusulkan

- Hanya string/microcopy di `mind-map.tsx` + `page.tsx`, style hint/input, dan visibilitas gagang mobile.
- Tanpa dependency, token, atau API publik baru (kecuali testid yang mengikuti rename label — konfirmasi bila dianggap breaking).
- Komponen/route terpengaruh: `MindMap` (toolbar, dialog M-011, hint, input), `MindAccessibleTree`, route `/patterns/mind-map` (header, alur, keyboard, resep).

### Before / After (sketsa)

```tsx
// Sebelum
<Tambah anak root> / 'Root tidak bisa dihapus — hapus cabangnya dulu.'
`${data.length} ide · cari berdasarkan label`
<Button>Minimap</Button>

// Sesudah
<Tambah cabang ide pusat> / 'Ide pusat tidak bisa dihapus — hapus cabangnya dulu.'
`${data.length} ide · cari berdasarkan nama ide`
<Button>Peta mini</Button>
```

```tsx
// Sebelum
<p>Node: ←/→ saudara ... Input teks memakai shortcut edit native.</p>
<p>Kanvas: panah pan, +/− zoom ...</p>

// Sesudah
<ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
  <li><kbd>Enter</kbd>/<kbd>F2</kbd> edit · <kbd>Space</kbd> lipat · <kbd>Delete</kbd> hapus</li>
  <li><kbd>←</kbd>/<kbd>→</kbd> saudara · <kbd>↑</kbd> induk · <kbd>↓</kbd> anak pertama</li>
  <li>Kanvas: panah pan · <kbd>+</kbd>/<kbd>−</kbd> zoom · <kbd>0</kbd> reset · <kbd>F</kbd> fit</li>
</ul>
```

## Tasks (jalur small-fix)

- [x] Samakan istilah root→ide pusat (temuan 1).
- [x] Perbaiki status/placeholder pencarian (temuan 2).
- [x] Terjemahkan toggle Minimap (temuan 3).
- [x] Tulis ulang deskripsi + daftar keyboard + hint 11px→xs (temuan 4).
- [x] Perbesar target input inline (temuan 5).
- [x] Tampilkan gagang tambah di touch/mobile (temuan 6).
- [x] Update test yang assert string/testid lama.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Approved user (“approve aja dulu”); diimplementasikan berurutan setelah CR-023. | Scope disetujui sekaligus. |
| 2 | Gagang: `[@media(hover:none)]:opacity-100` (bukan `md:hidden` persisten). | Presisi: hanya perangkat tanpa hover yang selalu tampil; desktop hover-reveal tetap. |
| 3 | aria toggle peta mini dinamis mengikuti `aria-pressed`. | State terumumkan benar ke SR. |
| 4 | Keyboard section memakai grid `<ul>` + `<kbd>` ber-token, bukan list-disc polos. | Lebih mudah dipindai, konsisten token. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA (khusus hint `text-xs` baru).
- [x] Perilaku Radix/a11y tidak rusak.
- [x] API `cva` dan export tetap konsisten.
- [x] State loading, empty, dan error relevan tersedia.
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

- Cek light/dark: hint, badge, input di kedua mode.
- Cek state: editing (hint/error), empty, hasil cari kosong/berisi, dialog hapus.
- Cek test: `mind-map.test.tsx` (assert `Tambah anak*`, `Root tidak bisa`, hint), `mind-map.integration.test.tsx`, `page.test.tsx` (`mind-search-results`, placeholder) — perbarui string yang berubah.

## Eksekusi

Branch: `cr-024-mind-map-microcopy-a11y`
Commit: `fix: rapikan microcopy mind map [CR-024]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
