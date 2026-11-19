# 001 — Upload Queue

Status: approved
Owner: —
Tanggal: 2026-11-20

## Problem

`FileInput` hari ini hanya *mengumpulkan* file di sisi klien (`File[]` + validasi
ukuran/jumlah). Begitu file dipilih, aplikasi konsumen tidak punya cara standar untuk:

- menampilkan progres upload per file,
- membatalkan file yang sedang diunggah,
- mengulang hanya file yang gagal,
- menampilkan error spesifik per file (bukan satu pesan global),
- melihat pratinjau isi file sebelum upload selesai.

Bukti/konsekuensi saat ini:

- Setiap screen upload di app konsumen harus membangun queue, state, dan feedback
  sendiri → duplikasi logika dan risiko inkonsistensi antar layar.
- `form/file-input.tsx` hanya punya satu pesan error global (`localError`) dan berhenti
  memvalidasi batch begitu satu file melanggar (`validateAndAddFiles`, baris 68–74) —
  file valid setelahnya ikut tertolak tanpa alasan per file.
- Tidak ada state per item → user tidak tahu upload mana yang berhasil; cara ampuhnya
  hanya mengunggah ulang seluruh batch (risiko data ganda, waktu terbuang).

## Goals & Success Metrics

| Goal | Metrik | Target |
|---|---|---|
| Tim app tidak membangun queue upload sendiri | Screen upload memakai komponen ini tanpa wrapper khusus | ≥ 1 screen konsumen memakai langsung |
| Transparansi status upload | Semua status file terwakili di UI dan showcase scenario | 5 status (menunggu/proses/selesai/gagal/batal) teramati di scenario |
| Aksesibilitas setara standar DS | Audit WCAG 2.1 AA + operability keyboard penuh | Lolos audit, light & dark parity |
| Perilaku inti terlindungi test | Unit/component test queue (tambah, validasi, gagal, retry, cancel) | Test hijau di `pnpm test` |

## Non-goals

- Upload chunked/resumable (protokol tus atau sejenisnya).
- Integrasi langsung penyedia storage (S3 presign, dsb.) — transport tetap milik konsumen.
- Persist queue antar reload/navigasi halaman.
- File manager lengkap (folder tree, grid/list view, storage quota) — jalur terpisah RM-04.
- Preview panel penuh (image/PDF/video/audio + metadata) — jalur RM-05; di sini hanya thumbnail kecil.
- Implementasi server/API upload apa pun.

## User & Use Case

Persona (ringkas):

1. **Developer konsumen design system** — memasang form upload dokumen; butuh komponen
   dengan state lengkap sehingga tidak menulis queue manual per layar.
2. **End-user aplikasi** — mengunggah beberapa dokumen/foto sekaligus; butuh tahu mana
   yang berhasil dan bisa memperbaiki yang gagal tanpa mengulang semuanya.

JTBD:

- "When saya mengunggah banyak file sekaligus, I want melihat progres tiap file,
  so I can tahu upload masih jalan atau macet."
- "When beberapa file gagal karena jaringan, I want mengulang hanya file itu,
  so I can tidak mengunggah ulang seluruh batch."

Skenario utama:

1. Unggah 5 dokumen; 2 gagal di tengah jalan → retry per file, 3 lainnya tetap selesai.
2. Unggah foto produk → thumbnail muncul sebelum upload selesai; batal bila salah pilih.
3. Pilih batch campur file valid/invalid → file invalid ditolak dengan alasan spesifik,
   file valid tetap masuk queue.

## Requirements

| ID | Requirement | Priority | Acceptance signal |
|---|---|---|---|
| FR-001 | Setiap file di queue memiliki status siklus hidup yang terlihat: menunggu, mengunggah, selesai, gagal, dibatalkan. | must | Scenario showcase menampilkan kelima status; test memverifikasi transisi status. |
| FR-002 | Progres upload terlihat per file (0–100%) dan ringkasan keseluruhan (mis. "3/5 selesai"). | must | Nilai progres berubah saat upload simulasi berjalan; ringkasan konsisten dengan status item. |
| FR-003 | File yang sedang diunggah dapat dibatalkan per item; pembatalan menghentikan proses dan menandai item batal/dihapus. | must | Aksi batal pada item mengubah status dan callback pembatalan terpanggil (terverifikasi test). |
| FR-004 | File gagal dapat diulang per item tanpa mengulang item lain. | must | Aksi ulang mengembalikan item gagal ke proses; status item lain tidak berubah. |
| FR-005 | Error ditampilkan per file dengan alasan spesifik; kegagalan satu file tidak menggagalkan file lain. | must | Satu item gagal, item lain tetap sampai selesai; pesan error per item terbaca di test dan scenario. |
| FR-006 | Validasi tetap dijalankan saat file masuk queue (ukuran, jumlah, tipe); file invalid ditolak dengan alasan per file tanpa menolak file valid lain dalam batch yang sama. | must | Batch campur valid/invalid → hanya invalid tertolak; pesan menyebut nama file dan alasannya. |
| FR-007 | Komponen dapat dihubungkan ke mekanisme upload milik konsumen (komponen tidak memilih transport sendiri) dan menerima laporan progres dari konsumen. | must | Story demo memasang fungsi upload tiruan tanpa mengubah kode komponen. |
| FR-008 | Queue dapat dioperasikan penuh dengan keyboard dan terbaca screen reader (struktur list, status, progres diumumkan). | must | Tab/keyboard mencapai seluruh kontrol aksi; role/aria pada list & progres; lolos audit a11y. |
| FR-015 | Showcase scenario upload queue dengan state lengkap (empty, berjalan, gagal, selesai) dalam light & dark. | must | Route scenario showcase tersedia dan lolos smoke build. |
| FR-009 | Thumbnail pratinjau untuk image; ikon generik untuk tipe lain. | should | Scenario image menampilkan thumbnail; non-image menampilkan ikon. |
| FR-010 | Aksi kolektif: ulang semua yang gagal; batalkan semua yang sedang berjalan. | should | Satu aksi mengubah status seluruh item target; test memverifikasi. |
| FR-011 | Urutan item queue dapat diubah (drag-and-drop) dengan alternatif keyboard. | should | Reorder via pointer dan keyboard mengubah urutan list teramati. |
| FR-012 | Batas jumlah upload paralel dapat diatur konsumen; default aman ditetapkan di design. | should | Dengan batas 2 dan 5 file, hanya 2 item berstatus mengunggah bersamaan. |
| FR-013 | Auto-retry terbatas untuk kegagalan sementara, diaktifkan konsumen. | could | Item gagal mencoba ulang sesuai batas sebelum gagal permanen. |
| FR-014 | Mode tampilan ringkas (compact) yang menampilkan queue dalam ruang kecil. | could | Variant compact menampilkan queue tanpa melanggar kontras/target sentuh. |

## Design Refs

- Screen: `S-005.10` File Upload (`/patterns/file-upload`) — screen pattern sudah terdaftar
  dan implemented; upgrade terjadi di layar ini, plus demo komponen di S-004.03 Forms.
- Pattern/komponen terkait:
  - `packages/ui/src/components/form/file-input.tsx` — dropzone & validasi existing (basis compose).
  - `progress` sudah ada di kategori `base` (`packages/ui`) — dipakai ulang untuk progres per item.
  - Aksi per item memakai `Button` existing; ikon `lucide-react`.
- Dokumen design: `docs/design/` (object model, state matrix, flow) dibuat saat gate 2;
  analisis awal: `docs/discussions/2026-11-20-component-landscape.md` (RM-01),
  roadmap: `docs/discussions/component-roadmap.md`.

## Constraints & Dependencies

- Teknis: `FileInput` existing adalah controlled `File[]` dengan satu pesan error global;
  perubahan API publik komponen butuh persetujuan (CONVENTIONS) — keputusan "extend vs
  komponen baru" diselesaikan di gate ini (Open Question 1).
- Dependency package: **tanpa dependency baru**. Reorder (FR-011) memakai `@dnd-kit/*`
  yang sudah ada; thumbnail memakai object URL native.
- Batasan lingkungan: token-first (OKLCH), WCAG 2.1 AA, light/dark parity wajib
  (ARCHITECTURE); test Vitest + Testing Library co-located; alur gate sesuai AGENTS.md.

## Open Questions

| # | Pertanyaan | Status |
|---|---|---|
| 1 | Extend `FileInput` (mode upload baru) vs komponen terpisah `FileUpload` yang meng-compose `FileInput`? Menyentuh API publik — butuh keputusan di gate 1. | answered — komponen baru `FileUpload` compose `FileInput` (keputusan user, 2026-11-20) |
| 2 | Kontrak integrasi progres: callback konsumen (event progres) vs abstraksi transport? Arah kontrak disepakati di gate ini; detail teknis di gate 2. | answered — callback `UploadHandler` dengan `onProgress` + `AbortSignal` (design D2) |
| 3 | Default jumlah upload paralel, dan perilaku saat queue melewati `maxFiles` (tolak langsung vs antri). | answered — default `maxConcurrent` 3; melebihi `maxFiles` ditolak langsung dengan alasan per file (design D3) |
| 4 | Apakah reorder queue (FR-011) ikut v1 atau dipotong ke iterasi berikut? | answered — masuk v1 sebagai prop opsional `sortable` default `false`; dipotong bila story membengkak (design D4) |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-20 | Draft awal dari roadmap RM-01 |
| 2026-11-20 | **Approved (gate 1)**; OQ#1 dijawab: komponen baru `FileUpload` compose `FileInput` |
| 2026-11-20 | Design **approved (gate 2)** — `docs/design/upload-queue.md`; OQ#2–#4 dijawab |
