# CR-090 — `AGENTS.md` ringkas tanpa duplikasi + `STATUS.md` snapshot ringkas

**Status:** approved (ditetapkan user 2026-11-26 atas rencana review config; "approve dulu semua, dan kerjakan")
**Sumber:** review config OpenCode — perbandingan dengan project sibling CRM (sesi 2026-11-26); lanjutan CR-089
**Ref:** `AGENTS.md` (195 baris/10,0 KB), `docs/STATUS.md` (68 baris/15,3 KB), `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, CRM `AGENTS.md` Protokol #3–#4

> Prioritas MoSCoW: **must** #1, #4; **should** #2–#3; **could** #5.
> Lingkup: dokumen operasional (`AGENTS.md`, `docs/STATUS.md`). Tidak menyentuh `ARCHITECTURE.md`, `CONVENTIONS.md`, `visual-language.md`, kode, token, atau dependency.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `AGENTS.md` (seluruh file) | Selalu dimuat di awal sesi: 10,0 KB (total auto-loaded 27,9 KB vs CRM 14,6 KB). Sekitar 40% mengulang tempat lain: Stack & Structure = `ARCHITECTURE.md`; Conventions = `CONVENTIONS.md`; Rules #2–#14 = isi skill/ARCHITECTURE/CONVENTIONS; aturan graphify 3× (Session Protocol #4–#5, Token Discipline #3); "hanya user menetapkan approved/done" 3×; Session Protocol #6–#7 = Token Discipline #1–#2. | Satu pernyataan per aturan; rujuk dokumen/skill sumber. Tidak ada aturan yang hilang. |
| 2 | minor | `AGENTS.md` Session Protocol #4 | Aturan graphify tidak menyebut nama tool dan bentuk panggilannya (`execute`, tanpa `search()`), sehingga mudah gagal lalu jatuh ke grep. | Port sintaks persis CRM Protokol #4. |
| 3 | minor | `AGENTS.md` (tidak ada) | Tidak ada aturan "keputusan stack di docs final — jangan menawarkan alternatif" (CRM Protokol #3). | Tambahkan. |
| 4 | major | `docs/STATUS.md:7-31` | 15,3 KB/68 baris dan melanggar aturannya sendiri ("maksimal ~10 baris; detail masuk `STATUS-LOG.md`"). Dibaca penuh tiap awal sesi. | Susun ulang jadi snapshot ringkas; detail sejarah tetap di `STATUS-LOG.md`/`BACKLOG.md`. |
| 5 | minor | `AGENTS.md` tabel ID | `NNN.FR-NNN` hanya didefinisikan sebagai "requirement lintas PRD"; skill memakai `FR-NNN` polos. | Perjelas: di luar file PRD, requirement ditulis `NNN.FR-NNN`. Artefak baru saja. |

## Perubahan yang Diusulkan

- `AGENTS.md`: rapikan (target ±6 KB) tanpa menghapus aturan — hapus duplikasi, satukan aturan graphify, port Protokol #3–#4 CRM, perbarui tabel ID.
- `docs/STATUS.md`: snapshot ringkas (milestone, posisi, next, known issue); rincian sejarah tetap terbaca di `docs/STATUS-LOG.md` dan `docs/BACKLOG.md`.
- Tidak ada perubahan API publik komponen, token, dependency, atau dokumen ber-gate.

## Tasks (jalur small-fix)

- [ ] Susun ulang `AGENTS.md`: satu pernyataan per aturan; cek silang setiap aturan lama punya padanan.
- [ ] Port sintaks panggilan graphify dan aturan "keputusan final, jangan tawarkan alternatif stack".
- [ ] Perbarui tabel ID (`NNN.FR-NNN` untuk requirement di luar file PRD; artefak baru saja).
- [ ] Susun ulang `docs/STATUS.md` jadi snapshot ringkas.
- [ ] Verifikasi: cek silang aturan lama; tidak ada perubahan kode → `pnpm typecheck`/`lint`/`test` tidak diperlukan; `node scripts/check-status-log.mjs` hijau.
- [ ] Perbarui `docs/BACKLOG.md`, `docs/STATUS.md`, `docs/STATUS-LOG.md`.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | `AGENTS.md` dirapikan, bukan diganti; aturan khusus design system tetap. | Hemat token tanpa kehilangan aturan. |
| 2 | `NNN.FR-NNN` berlaku untuk artefak baru; artefak lama tidak di-retrofit. | Ditetapkan user 2026-11-26. |
| 3 | `docs/design/visual-language.md` tidak disentuh. | Artefak `approved`; tidak diminta user. |
| 4 | Rincian yang dikeluarkan dari `STATUS.md` wajib sudah tercatat di `STATUS-LOG.md`/`BACKLOG.md`; bila belum, tetap diringkas di `STATUS.md`. | Tidak ada informasi yang hilang. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik — tidak ada perubahan UI.
- [x] Kontras light dan dark: tidak ada nilai warna yang berubah.
- [x] Perilaku Radix/a11y tidak rusak — tidak ada perubahan komponen.
- [x] API `cva` dan export tidak berubah.
- [x] State loading, empty, dan error: tidak relevan.
- [x] Showcase/docs: tidak ada perubahan halaman.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` — tidak dijalankan penuh karena tidak ada perubahan kode (lihat Tasks).

## Eksekusi

Branch: `cr-090-agents-ringkas-status-snapshot`
Commit: `docs: rapikan AGENTS.md dan snapshot STATUS.md [CR-090]`

- [x] CR disetujui user (2026-11-26).
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
