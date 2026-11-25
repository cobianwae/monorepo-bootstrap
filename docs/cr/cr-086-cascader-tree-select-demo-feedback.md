# CR-086 — Cascader & Tree Select: kemandirian demo, umpan balik nilai, dan microcopy halaman

**Status:** done (ditetapkan user 2026-11-25; diimplementasikan 2026-11-25 di branch `cr-086-cascader-tree-select-demo-feedback`, di-merge ke `visual-polish` dan di-push atas izin eksplisit)
**Sumber:** audit `/improve-ui` (skill `ui-designer`), 2026-11-25
**Ref:** `apps/showcase/src/app/(docs)/patterns/cascader-tree-select/page.tsx:56-204`
**Ketergantungan:** dilaksanakan setelah CR-085 (struktur halaman) agar tidak mengedit wilayah JSX yang sama dua kali.

## Komponen/Route yang Terpengaruh

- Route: `/patterns/cascader-tree-select` — hanya state dan copy di file halaman.
- Tidak ada perubahan `packages/ui`, API publik, atau dependency. Default copy komponen diatur CR-088.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:57,120,124` | Demo “Clearable” dan “Disabled” berbagi `value`/`setValue` yang sama dengan demo utama. Menghapus/mengubah satu demo mengubah demo lain; demo tidak mandiri dan menyesatkan saat membandingkan state. | Beri state sendiri per demo state (clearable, disabled), atau jadikan disabled statis tanpa berbagi setter; nilai awal tetap merepresentasikan statenya. |
| 2 | major | `page.tsx:97-99,112-114,158-160,175-177` | Umpan balik “Nilai:” menampilkan id internal (`id → jabar → bdg → coblong`, `android, ios, …`), bukan label yang dilihat user di dropdown. Pembaca harus menerjemahkan id sendiri; untuk `displayMode="last"` umpan balik juga tidak menunjukkan perbedaan mode. | Petakan id → label dari data `ADDRESS`/`CATEGORY` sebelum dirender; tampilkan path label, dan pada mode `last` tampilkan label terakhir sesuai perilaku komponen. |
| 3 | minor | `page.tsx:66-67` | Judul memuat ID screen `(S-005.31)` dan description satu paragraf panjang berisi jargon implementasi (“tree-view di popover”, “maks. 3 tag + collapse”). Beban kognitif tinggi untuk paragraf pembuka. | Persingkat description menjadi manfaat + cara mencoba; ID screen dipertahankan hanya bila konvensi halaman pembanding memuatnya (cek CR-082: description dipersingkat dengan cara yang sama). |
| 4 | minor | `page.tsx:109,120,124,133,182-195` | Label demo adalah nama state, bukan label field realistis: “Alamat lazy”, “Bisa dihapus”, “Nonaktif”, “Memuat”, “Kosong”, “Gagal”. Pembaca tidak melihat contoh label produksi dan error Tree Select “Gagal” tidak menjelaskan field-nya. | Pakai label field yang realistis per demo (mis. alamat/kategori beserta konteks state di judul kartu), biarkan judul kartu yang menyebut state; pesan error tetap spesifik. |
| 5 | minor | `page.tsx:131` | Demo error Cascader memakai `onChange={() => undefined}` dan nilai `[]` tetap: user tidak bisa memulihkan error dengan memilih nilai, sehingga state error terlihat macet, berbeda dari perilaku form nyata. | Hubungkan demo error ke state sendiri sehingga memilih leaf membersihkan konteks error demo (tanpa mengubah kontrak `error` komponen). |
| 6 | minor | `page.tsx:103,109-110` | Placeholder “Buka tiap kolom untuk memuat anak” dan judul “(tiruan fetch 400ms)” membocorkan detail implementasi ke copy user. | Judul kartu boleh menyebut lazy load; copy field fokus ke tindakan user (“Pilih wilayah — daftar dimuat bertahap”), detail 400ms pindah ke petunjuk cara mencoba (CR-085). |

## Perubahan yang Diusulkan

- State demo per kartu dibuat mandiri; umpan balik nilai dirender dari label, bukan id.
- Penajaman microcopy halaman (judul/description/label/petunjuk) dalam **English**, mengikuti keputusan bahasa user 2026-11-25 yang juga dicatat di CR-088.
- Tidak mengubah data `ADDRESS`/`CATEGORY` selain pemetaan label untuk tampilan.

## Tasks (jalur small-fix)

- [x] Pisahkan state demo clearable/disabled/error dari demo utama.
- [x] Render umpan balik nilai dari label (path lengkap / label terakhir sesuai mode).
- [x] Persingkat description `PageHeader`; selaraskan label demo menjadi label field realistis.
- [x] Buat demo error dapat pulih lewat pilihan user.
- [x] Verifikasi: test showcase terkait, `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`.
- [ ] Cek light/dark dan keyboard pada demo yang statenya berubah (belum — tool browser tidak tersedia di environment ini).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Umpan balik memakai label, bukan id. | Halaman pola adalah dokumentasi perilaku yang terlihat user; id adalah detail data. |
| 2 | Bahasa copy halaman: **English**. | Ditetapkan user 2026-11-25 (keputusan yang sama dengan CR-088 Keputusan #1). |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA (tidak ada pasangan warna baru).
- [x] Perilaku Radix/a11y tidak rusak; `aria-live` pada umpan balik dipertahankan.
- [x] API `cva` dan export tetap konsisten (tanpa perubahan `@ds/ui`).
- [x] State loading, empty, dan error relevan tersedia dan kini dapat dibandingkan secara mandiri.
- [x] Showcase/docs diperbarui bila perlu.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass (test `@ds/ui` 733/734 — 1 gagal baseline `rte-link-save` pada environment worktree ini, terbukti gagal identik tanpa perubahan CR-086 dan lulus di workspace utama).

## Eksekusi

Branch: `cr-086-cascader-tree-select-demo-feedback`
Commit: `fix: demo dan umpan balik cascader tree select [CR-086]`

- [x] CR disetujui user (2026-11-25; implementasi ditunda atas instruksi user — “gak usah dikerjain”).
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
