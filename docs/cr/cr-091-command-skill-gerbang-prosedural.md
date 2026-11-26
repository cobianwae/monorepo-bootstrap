# CR-091 — Command dan skill workflow: port gerbang prosedural CRM

**Status:** approved (ditetapkan user 2026-11-26 atas rencana review config; "approve dulu semua, dan kerjakan")
**Sumber:** review config OpenCode — perbandingan dengan project sibling CRM (sesi 2026-11-26); lanjutan CR-090
**Ref:** `.opencode/commands/implement.md`, `start.md`, `design.md`, `story.md`, `improve-ui.md`, `polish-ui.md`, `design-language.md`; `.opencode/skills/{designer,prd-writer,story-writer,reviewer,ui-designer,visual-designer}/`

> Prioritas MoSCoW: **must** #1–#2; **should** #4–#5; #3 minor.
> Lingkup: `.opencode/commands` dan 6 skill bersama. Tidak menyentuh kode, token, komponen, dependency, atau skill design system lain.

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `.opencode/skills/{designer,prd-writer,story-writer,reviewer,ui-designer,visual-designer}/` | Bergaya taksonomi (Kapan Pakai/Boundaries/Anti-Patterns/Integration ≈ 30–40% boilerplate). Aturan prosedural CRM tidak ada: FR qualified + pemetaan FR→story, cek lintas-artefak, fase diskusi sebelum CR, audit kondisi nyata, protokol iterasi setelah approved, definisi selesai. | Tulis ulang dengan struktur prosedural CRM (aturan → langkah → gerbang → definisi selesai); pertahankan isi khusus design system; buang boilerplate. Frontmatter tetap. |
| 2 | major | `.opencode/commands/implement.md` | Tidak ada batas ukuran `STATUS.md`, rute CR besar → `/story`, dan blast radius hanya "bila relevan". | Port tiga aturan CRM. |
| 3 | minor | `.opencode/commands/start.md` | Tidak ada larangan keras memulai pekerjaan sebelum user memilih target. | Tambah "JANGAN mulai mengerjakan apa pun sebelum user memilih". |
| 4 | minor | `.opencode/commands/design.md`, `story.md` | Tidak mewajibkan identifikasi seluruh requirement dan screen; FR bisa tercecer. | Port aturan identifikasi FR/screen. |
| 5 | minor | `.opencode/commands/improve-ui.md`, `polish-ui.md`, `design-language.md` | Tidak ada fase diskusi sebelum CR, audit kondisi nyata, protokol iterasi, dan kewajiban memutakhirkan CR sebelum PR. | Port keempat gerbang. |
| 6 | — | dipertahankan | `agent: plan` pada `/start` dan `/review` (keputusan user 2026-11-26), `audit.md`, `ui-ux-auditor.md`, 16 skill design system, perintah verifikasi khusus proyek. | Tidak diubah. |

## Perubahan yang Diusulkan

- 6 skill: tulis ulang mengikuti struktur prosedural CRM; isi design system (lens DS, a11y sebagai blocker/major, light/dark parity, state loading/empty/error) tetap.
- 7 command: port gerbang dari CRM sesuai temuan #2–#5; `agent` frontmatter dan langkah verifikasi khusus proyek tetap.
- Tidak ada perubahan API publik komponen, token, atau dependency.

## Tasks (jalur small-fix)

- [x] Tulis ulang `designer`, `prd-writer`, `story-writer`, `reviewer`, `ui-designer`, `visual-designer`. — Selesai: 18,3 KB → 34,2 KB (boilerplate taksonomi dibuang, tetapi cek konkret, gerbang, dan definisi selesai CRM ditambahkan; dibanding skill CRM 27,9 KB). Skill dimuat saat dipakai, bukan tiap sesi.
- [x] Port gerbang ke `implement.md`, `start.md`, `design.md`, `story.md`, `improve-ui.md`, `polish-ui.md`, `design-language.md`. — Selesai: 5,6 KB → 9,4 KB.
- [x] Verifikasi: frontmatter command tidak berubah; rujukan skill/section valid; tidak ada perubahan kode; `node scripts/check-status-log.mjs` hijau. — Frontmatter 13 file identik terhadap HEAD (cek skrip); path dan skill yang dirujuk ada; audit kondisi nyata memakai `pnpm -C apps/showcase dev` (proyek ini tidak punya Playwright).
- [x] Perbarui `docs/BACKLOG.md`, `docs/STATUS.md`, `docs/STATUS-LOG.md`.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Skill ditulis ulang (bukan ditambah section) dan boilerplate dibuang. | Panjang skill = biaya tiap pemakaian; isi DS tetap. |
| 2 | `NNN.FR-NNN` dipakai untuk artefak baru; template lama tidak di-retrofit. | Ditetapkan user 2026-11-26 (CR-090 #2). |
| 3 | `/start` dan `/review` tetap `agent: plan`. | Ditetapkan user 2026-11-26. |
| 4 | Preset oh-my-opencode dan MCP `gh_grep` tidak dihidupkan kembali. | Dibalik user pada `949ae38`; tidak diminta. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik — tidak ada perubahan UI.
- [x] Kontras light dan dark: tidak ada nilai warna yang berubah.
- [x] Perilaku Radix/a11y tidak rusak — tidak ada perubahan komponen.
- [x] API `cva` dan export tidak berubah.
- [x] State loading, empty, dan error: tidak relevan.
- [x] Showcase/docs: tidak ada perubahan halaman.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` — tidak dijalankan penuh karena tidak ada perubahan kode (lihat Tasks).

## Eksekusi

Branch: `cr-091-command-skill-gerbang-prosedural`
Commit: `docs: port gerbang prosedural CRM ke command dan skill [CR-091]`

- [x] CR disetujui user (2026-11-26).
- [x] Branch dibuat (dari tip `cr-090-agents-ringkas-status-snapshot`, menumpuk di atas CR-090).
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan (frontmatter, rujukan, `check-status-log`).
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui (tetap `approved`; `done` hanya oleh user).
- [x] `docs/STATUS.md` diperbarui bila relevan (baris CR-089/090/091 sudah ada dari CR-090).
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
