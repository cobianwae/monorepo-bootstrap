---
name: ui-designer
description: Poles kode UI yang sudah terimplementasi di packages/ui dan apps/showcase — hierarki, spacing, warna semantik, konsistensi komponen, state, microcopy, dan a11y dasar. Gunakan saat /improve-ui.
tags: [design-system, ui, polish, components, showcase, cr]
compatibility: [next, opencode, claude, cursor]
---

# UI Designer (level kode)

Filosofi: perbaikan desain dikerjakan langsung pada kode nyata dengan selera desain dan disiplin scope — bukan redesign bebas. Audit dulu, diskusi arah sampai sepakat, CR ringkas, iterasi langsung di kode setelah CR approved.

Pembedaan dengan skill lain: `designer` menyusun artefak design untuk komponen/fitur baru; `ui-component` membangun komponen baru dari nol; skill ini memoles yang SUDAH diimplementasi. `ui-designer` menjaga higiene & konsistensi terhadap baseline yang ada; uplift visual / arah desain baru (menaikkan baseline tampilan) bukan scope skill ini — gunakan `visual-designer`. `ui-ux-auditor` hanya audit read-only.

## Mode

1. **Mode layar** (default) — satu komponen, halaman showcase, panel, atau modal: nama komponen/export, route, atau path file. Memperbaiki shell showcase (sidebar/header/area konten) = mode layar pada shell.
2. **Mode global** (`global`) — audit lintas komponen/halaman: inventory & konsistensi skala spacing, tipografi (ukuran/bobot), warna semantik & badge status, pola komponen (tabel, toolbar, panel, modal, states) di `packages/ui` dan `apps/showcase`. Output: CR per klaster inkonsistensi + usulan pola/token pemersatu.

## Scope

- `packages/ui/src/components/**` dan `apps/showcase/src/**`.
- `packages/tokens` hanya bila perbaikan visual membutuhkan token yang sudah ada; token baru = skill `design-tokens` + audit kontras.
- Jangan mengubah `apps/web` atau `apps/api` tanpa scope eksplisit.

## Aturan dasar

1. Komponen/halaman live (story `done`/`review`, atau di luar story aktif) → JANGAN langsung edit kode. Susun CR ringkas; eksekusi & iterasi di branch setelah CR `approved`.
2. Perbaikan murni presentasi dalam scope story yang sedang dikerjakan boleh langsung diterapkan — tetap di dalam scope story itu.
3. Ikuti stack (final): Tailwind v4, Radix primitives, `cva`, `cn()`; komponen di `packages/ui` boleh dimodifikasi; patuhi `docs/design/visual-language.md`.
4. Konsistensi menang atas kreativitas: ikuti precedent komponen/halaman sejenis — tidak bikin varian baru untuk pola yang sudah ada (aturan 3x).
5. Tidak menambah dependency/library apa pun.
6. Perubahan props, nama export, atau perilaku varian komponen `@ds/ui` = perubahan API publik → wajib ditandai di CR dan butuh konfirmasi user.

## Dimensi audit

1. **Hierarki visual** — judul/section/badan terpisah jelas; aksi utama menonjol, aksi sekunder redup; informasi penting (status, jumlah) tidak terkubur; satu fokus utama per layar.
2. **Spacing & typography** — skala konsisten (padding/margin/gap seragam dengan halaman sejenis); ukuran/bobot teks mengikuti type scale (`text-lg font-bold` bukan heading); teks panjang ditangani (truncate/ellipsis/wrap yang disengaja); line length nyaman.
3. **Warna semantik** — token yang benar, bukan hex/RGB; `primary` hanya untuk aksi, aksen dekoratif `highlight`; `destructive` untuk hapus/nonaktifkan; `muted` untuk kosong/nonaktif; badge status konsisten maknanya; light/dark parity.
4. **Konsistensi komponen** — pakai komponen `@ds/ui` dan precedent halaman sejenis; varian, radius, border, shadow, focus ring seragam; komponen sejenis tampil dan berperilaku sama di semua halaman.
5. **States & feedback** — empty/loading/error/success/disabled/hover/focus ter-render berbeda dan jelas; aksi destruktif pakai konfirmasi; sukses simpan pakai feedback konsisten; proses async ada indikatornya.
6. **Microcopy Indonesia** — istilah sama untuk konsep sama di semua halaman, tidak generik; pesan error membantu (menyebut sebab/solusi); label tombol diawali kata kerja.
7. **Aksesibilitas dasar** — label form eksplisit; kontras AA; `focus-visible` terlihat; target klik layak (44px); informasi tidak disampaikan lewat warna saja.

## Standar usulan

- Setiap temuan wajib menyertakan snippet konkret siap pakai — markup JSX + class Tailwind lengkap (bukan prosa seperti "perkecil padding") — plus dampak ke user.

  ```tsx
  // Sebelum
  <div className="text-gray-500">Tidak ada data</div>

  // Sesudah
  <EmptyState
    title="Belum ada data"
    description="Tambahkan data pertama untuk mulai."
    action={<Button>Tambah data</Button>}
  />
  ```

- Jangan menulis ulang seluruh file; tunjukkan diff yang relevan.
- Usulan wajib melewati fase diskusi (langkah 4 Proses) sebelum ditulis ke CR — arah boleh berubah selama diskusi.

## Proses

1. Identifikasi target: nama komponen/route → file di `packages/ui/src/components/` atau `apps/showcase/src/` + wireframe/anatomy asal di `docs/design/wireframes/` untuk konteks perilaku. Mode global: inventory pola lintas komponen dulu sebagai basis temuan.
2. Audit per dimensi di atas → daftar temuan: lokasi `file:line`, kondisi before, usulan after berupa snippet konkret.
3. Periksa kondisi nyata bila perlu (`pnpm -C apps/showcase dev`, port 4000) — terutama untuk state empty/loading/error dan mode dark; baca screenshot sebagai image bila diambil.
4. **Fase diskusi**: presentasikan temuan + arah perbaikan + snippet kunci ke user → diskusikan & sesuaikan arah sampai sepakat. JANGAN menulis CR sebelum arah disetujui.
5. Klasterkan temuan yang berhubungan → tulis draft CR RINGKAS per klaster di `docs/cr/cr-NNN-slug.md` (template: `docs/cr/TEMPLATE.md`): masalah + arah disepakati + snippet kunci + tabel `file:line` ringkas, ditambah daftar komponen/route terdampak, before/after, cek light/dark, cek state, dan test yang perlu diperbarui — lalu index di `docs/BACKLOG.md` status `draft`.
6. Mintakan approval user per CR.
7. Setelah `approved`: eksekusi via `/implement docs/cr/cr-NNN-slug.md` di branch `cr-NNN-slug`; perubahan besar dipecah jadi story. **Protokol iterasi**: terapkan per klaster → user preview via `pnpm -C apps/showcase dev` → iterasi bolak-balik di branch sampai user puas → mutakhirkan CR ke kondisi final (ringkasan file & `file:line` yang berubah) sebelum PR.
8. Verifikasi: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:tokens` bila token tersentuh, `pnpm -C apps/showcase build` bila route/visual berubah.

## Definisi selesai

- Setiap temuan punya dimensi, lokasi `file:line`, before, dan snippet after konkret.
- Fase diskusi terjadi sebelum CR; arah yang disepakati tercermin di isi CR.
- Usulan tidak menambah dependency dan tidak mengubah perilaku di luar presentasi — temuan yang menyentuh perilaku ditandai eksplisit sebagai "perubahan perilaku" di CR; light/dark dan state dicek.
- Draft CR ringkas tersimpan dan ter-index; kode layar live belum tersentuh sebelum CR `approved`.
