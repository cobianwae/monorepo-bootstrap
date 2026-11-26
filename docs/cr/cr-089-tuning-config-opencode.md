# CR-089 — Tuning config OpenCode hemat token: provider `nim-coder`, proteksi DCP, batas output

**Status:** draft
**Sumber:** review config OpenCode — perbandingan dengan project sibling CRM (sesi 2026-11-26)
**Ref:** `opencode.json:8,12,28-33`, `.opencode/agents/explore.md:4`, `.opencode/dcp.jsonc` (baru), commit `1f4e55d` (blok provider dihapus), `AGENTS.md` Session Protocol #7

> Prioritas MoSCoW: **must** #1–#2; **should** #3–#5.
> Lingkup: konfigurasi OpenCode saja. Tidak menyentuh kode, token, komponen, atau dependency.
> Lanjutan (CR terpisah): CR-090 `AGENTS.md` + `STATUS.md`, CR-091 command + skill.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | blocker | `.opencode/agents/explore.md:4` | `model: nim-coder/nim-coder` menunjuk provider yang dihapus di `1f4e55d` (2026-11-24). Terkonfirmasi 2026-11-26: pemanggilan subagent `explore` gagal dengan `Model unavailable: nim-coder/nim-coder`, tanpa fallback ke model lain. Session Protocol #7 `AGENTS.md` (delegasi eksplorasi ke `explore`) tidak bisa dijalankan. | Tambahkan kembali provider `nim-coder` di `opencode.json` (bentuk V2 `providers`). |
| 2 | major | `.opencode/dcp.jsonc` (belum ada) | Isi story/CR yang dibaca lewat `read`/`edit` dapat ter-compress di tengah sesi, padahal story/CR adalah source of truth lingkup kerja. CRM memproteksinya sejak `9e55daf1`. | Buat `.opencode/dcp.jsonc` dengan `protectedFilePatterns` untuk `docs/stories/**` dan `docs/cr/**`. |
| 3 | minor | `opencode.json:12` | `tool_output.max_bytes` 12288 — setengah dari CRM (24576). Output tool lebih sering terpotong sehingga memicu baca ulang. | Naikkan ke 24576. |
| 4 | minor | `opencode.json:28-33` | Belum ada `compaction.buffer`; jarak aman sebelum compaction otomatis mengikuti default. | Tambah `"25%"` (nilai CRM). |
| 5 | minor | `opencode.json:8` | `snapshots: false` — tidak ada snapshot filesystem untuk undo/revert. | `true` (nilai CRM). |

## Perubahan yang Diusulkan

- `opencode.json`:
  - `providers.nim-coder`: `name` "Nim Coder", `package` `@opencode/ai/providers/openai-compatible`, `settings` `{ baseURL: http://localhost:4101/v1, apiKey: unused }`, `models.nim-coder` `{ name: Nim Coder }` — bentuk V2 sesuai panduan providers. Bila model tidak terdaftar setelah restart, pakai bentuk lama (`provider` + `npm` + `options`) seperti CRM, tanpa key legacy `reasoning` (diabaikan normalisasi).
  - `agents.general.model`: `"nim-coder/nim-coder"`.
  - `tool_output.max_bytes`: `12288` → `24576`.
  - `compaction.buffer`: `"25%"`.
  - `snapshots`: `false` → `true`.
- `.opencode/dcp.jsonc` (baru): `protectedFilePatterns: ["**/docs/stories/**", "**/docs/cr/**"]`. Digabung (union) dengan pola global; `maxContextLimit: 80000` dan setelan DCP global tetap berlaku.
- Tidak diubah: `instructions`, `watcher.ignore` (termasuk `**/*.tsbuildinfo`), `mcp.servers.graphify`, `experimental.location_idle_timeout`, dan `.opencode/agents/explore.md` (pin model tetap; kini valid).
- Tidak ada perubahan API publik komponen, token, atau dependency.

## Tasks (jalur small-fix)

- [ ] Terapkan lima perubahan `opencode.json`.
- [ ] Buat `.opencode/dcp.jsonc`.
- [ ] Restart OpenCode (plugin DCP tidak hot-reload), lalu smoke test: `nim-coder/nim-coder` muncul di daftar model; subagent `explore` merespons; log baru bebas `Model unavailable`.
- [ ] Verifikasi: tidak ada perubahan kode → `pnpm typecheck`/`lint`/`test` tidak diperlukan; `node scripts/check-status-log.mjs` hijau.
- [ ] Perbarui `docs/BACKLOG.md`, `docs/STATUS.md`, `docs/STATUS-LOG.md`.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Hanya provider `nim-coder` yang ditambahkan kembali; `nim-thinker`, `vertex-garden`, dan `vertexai-global` tidak. | Ditetapkan user 2026-11-26. Port 4101 aktif; port 4100 dan 4099 tidak merespons; `vertexai-global` memakai path keyfile Linux. |
| 2 | `agents.general.model` = `nim-coder/nim-coder`. | Mengikuti CRM `9e55daf1`: subagent `general` memakai model murah. |
| 3 | Risiko diterima: bila proxy `localhost:4101` mati, agent `explore` dan `general` gagal tanpa fallback. | Perilaku terkonfirmasi lewat tes 2026-11-26; satu agent hanya punya satu model. |
| 4 | `/start` dan `/review` tetap `agent: plan`. | Ditetapkan user 2026-11-26; tidak berubah di CR ini. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik — tidak ada perubahan UI.
- [x] Kontras light dan dark: tidak ada nilai warna yang berubah.
- [x] Perilaku Radix/a11y tidak rusak — tidak ada perubahan komponen.
- [x] API `cva` dan export tidak berubah.
- [x] State loading, empty, dan error: tidak relevan.
- [x] Showcase/docs: tidak ada perubahan halaman.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` — tidak dijalankan penuh karena tidak ada perubahan kode (lihat Tasks).

## Eksekusi

Branch: `cr-089-tuning-config-opencode`
Commit: `chore: tuning config opencode hemat token [CR-089]`

- [ ] CR disetujui user.
- [ ] Branch dibuat.
- [ ] Perubahan diimplementasikan.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
