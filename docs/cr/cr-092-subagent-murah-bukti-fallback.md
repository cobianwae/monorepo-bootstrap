# CR-092 — Subagent murah berbasis bukti: lepas pin `general`, fallback `explore`, catat hasil CR-089

**Status:** approved (ditetapkan user 2026-11-26 atas rencana review config — "approve dulu semua, dan kerjakan"; rencana CR ini dilanjutkan user dengan "lanjutkan")
**Sumber:** review CR-089 (sesi 2026-11-26) — uji pin `general` dan verifikasi proteksi DCP
**Ref:** `opencode.json:50-54`, `AGENTS.md:32`, `.opencode/agents/explore.md:4`, `docs/cr/cr-089-tuning-config-opencode.md:38,47-48`

> Prioritas MoSCoW: **must** #1, #3; **should** #2.
> Lingkup: konfigurasi OpenCode dan dokumen operasional (`AGENTS.md`, `docs/STATUS.md`). Tidak menyentuh kode, token, komponen, skill, command, atau dependency.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `opencode.json:52` | Pin `general` ke `nim-coder/nim-coder` mengikuti CRM tanpa uji (Keputusan #2 CR-089). Uji 2026-11-26: 2–3× lebih lambat dari model sesi dan satu dari tiga run tidak akurat (tabel di bawah). `nim-coder` juga bukan satu model — proxy mencoba 6 model berurutan dan memakai yang pertama menjawab. | Lepas pin `general`; `general` memakai model sesi. |
| 2 | minor | `AGENTS.md:32` | Delegasi ke `explore` tidak punya fallback. Bila proxy `localhost:4101` mati atau NIM membalas 429, `explore` gagal dan agent tidak punya instruksi berikutnya (risiko pada Keputusan #3 CR-089). | Satu kalimat fallback: telusuri sendiri dengan grep, jangan ulangi panggilan yang gagal; sebut cara menjalankan proxy. |
| 3 | minor | `docs/cr/cr-089-tuning-config-opencode.md:38`, `docs/BACKLOG.md:153` | Judul CR-089 "hemat token" tidak menggambarkan hasil, dan task restart/cek proteksi DCP belum ditick meski sudah terverifikasi. | Catat hasil per perubahan di CR-089, `STATUS-LOG.md`, dan baris `BACKLOG.md`. |

### Bukti uji `general` (2026-11-26)

Delapan pertanyaan eksplorasi; skor = jawaban benar dengan bukti `path:line` valid. Tiga run `nim-coder` dijalankan bersamaan dengan satu kunci NIM, kontrol sendirian, jadi waktu `nim-coder` bisa lebih besar daripada bila dijalankan sendirian.

| Run | Waktu | Skor | Token dibaca | Ukuran jawaban |
|---|---|---|---|---|
| Model sesi `glm-5.4` (kontrol) | 111 s | 8/8 | 123K | ±3 KB |
| `nim-coder` 1 | 315 s | 8/8 | 175K | ±5 KB |
| `nim-coder` 2 | 256 s | 8/8 | 125K | ±5 KB |
| `nim-coder` 3 | 226 s | 7,5/8 | 178K | ±1 KB |

Pada run 3, satu nilai status CR kosong dan satu kutipan bukti tidak relevan. `cost` di log = 0 untuk semua run, jadi penghematan biaya tidak terukur.

## Perubahan yang Diusulkan

- `opencode.json`: hapus blok `agents` (`agents.general.model`). `general` memakai model sesi lagi. Pin `explore` di `.opencode/agents/explore.md` tidak diubah.
- `AGENTS.md` Session Protocol #4: satu kalimat fallback — bila `explore` gagal (proxy mati atau 429), telusuri sendiri dengan grep dan jangan ulangi panggilan yang gagal; proxy dijalankan manual dari `~/Documents/proxy` (`node nim-coder-proxy.mjs`).
- `docs/cr/cr-089-tuning-config-opencode.md`: tick task proteksi DCP dan tambah bagian Hasil.
- `docs/BACKLOG.md`, `docs/STATUS.md`, `docs/STATUS-LOG.md`.
- Tidak ada perubahan API publik komponen, token, dependency, skill, atau command.

## Tasks (jalur small-fix)

- [x] Hapus pin `general` di `opencode.json` (`e16d99e`).
- [x] Tambah fallback `explore` di `AGENTS.md` Session Protocol #4 (`e16d99e`).
- [x] Catat hasil CR-089: tick task proteksi DCP dan tambah bagian Hasil.
- [x] Verifikasi: `opencode.json` valid dan tanpa key `agents`; proxy `localhost:4101` merespons `200` (pin `explore` tetap valid); perubahan `AGENTS.md` teramati hot-reload di sesi. Tidak ada perubahan kode → `pnpm typecheck`/`lint`/`test` tidak diperlukan.
- [x] Perbarui `docs/BACKLOG.md`, `docs/STATUS.md`, `docs/STATUS-LOG.md`.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Pin `general` dilepas; pin `explore` tetap. | `general` mengerjakan jalur utama, jadi latensi dan akurasi langsung terasa. `explore` hanya eksplorasi read-only; 2 dari 3 run uji menjawab 8/8 dan latensinya tidak menahan jalur kerja utama. |
| 2 | Fallback ditulis di `AGENTS.md`, bukan di file agent. | File agent tidak dibaca saat panggilannya gagal; `AGENTS.md` selalu dimuat. |
| 3 | Agent tidak wajib menyalakan proxy; `AGENTS.md` hanya menyebut cara menjalankannya. | Proxy adalah proses berumur panjang yang dijalankan user dari terminal. |
| 4 | Judul CR-089 tidak diubah. | CR-089 sudah `approved`; hasil per perubahan dicatat di bagian Hasil CR-089, `STATUS-LOG.md`, dan baris `BACKLOG.md`. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik — tidak ada perubahan UI.
- [x] Kontras light dan dark: tidak ada nilai warna yang berubah.
- [x] Perilaku Radix/a11y tidak rusak — tidak ada perubahan komponen.
- [x] API `cva` dan export tidak berubah.
- [x] State loading, empty, dan error: tidak relevan.
- [x] Showcase/docs: tidak ada perubahan halaman.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` — tidak dijalankan penuh karena tidak ada perubahan kode (lihat Tasks).

## Eksekusi

Branch: `cr-092-subagent-murah-bukti-fallback`
Commit: `chore: lepas pin general dan tambah fallback explore [CR-092]`, `docs: implementasi CR-092 dan catat hasil CR-089 [CR-092]`

- [x] CR disetujui user (2026-11-26).
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui (tetap `approved` sampai user menetapkan `done`).
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
