# Project: Design System + Fullstack Monorepo

Monorepo ini adalah **design system + aplikasi konsumen**. UI/UX adalah identitas utama:
token, komponen, pattern, dan showcase harus konsisten, accessible, dan terdokumentasi.
Backend dan frontend konsumen melengkapi, bukan mendikte, arah design system.
Prinsip, stack, dan arah dependency ada di `docs/ARCHITECTURE.md` (auto-loaded).

```text
diskusi → PRD (gate 1) → design (gate 2) → stories (gate 3) → implementasi → review
```

## Docs Map

| File | Peran |
|---|---|
| `docs/STATUS.md` | Snapshot posisi proyek; dibaca di awal sesi |
| `docs/BACKLOG.md` | Indeks PRD, story, CR aktif |
| `docs/ARCHITECTURE.md`, `docs/CONVENTIONS.md`, `docs/design/visual-language.md` | Aturan kode dan visual (auto-loaded; tidak diulang di sini) |
| `docs/TESTING.md` | Strategi dan perintah verifikasi |
| `docs/prd/` | PRD `NNN-slug.md` |
| `docs/design/` | Object model, sitemap, flow, wireframe, visual language |
| `docs/stories/` | Story `NNN-MM-slug.md` |
| `docs/cr/` | CR `CR-NNN-slug.md` + `TEMPLATE.md` |
| `docs/graphify-setup.md` | Setup graph kode dan MCP |
| `docs/STATUS-LOG.md`, `docs/BACKLOG-ARCHIVE.md` | Riwayat; tidak dimuat penuh |

## Session Protocol

1. Baca `docs/STATUS.md`. Grep `docs/BACKLOG.md` hanya untuk baris aktif; bila tidak ada target, tawarkan item dari bagian **Next** di STATUS.
2. Keputusan stack dan arah di `ARCHITECTURE.md`/`CONVENTIONS.md` final — jangan menawarkan alternatif stack.
3. Pertanyaan struktural kode (dependensi, blast radius, relasi komponen) → **wajib** query MCP `graphify` lebih dulu; grep hanya untuk melengkapi. Panggil lewat `execute` tanpa `search()` — nama tool persis: `tools.graphify.get_node({label})` (satu simbol), `get_neighbors({label})` (caller/dependensi langsung), `shortest_path({source, target})` (jalur antar-simbol), `get_community({community_id})` (blast radius satu klaster), `query_graph({question})` (pertanyaan bebas); `token_budget` default 2000, kecilkan bila hanya butuh ringkasan. Bila graphify tidak connected atau tidak relevan, catat alasannya lalu lanjut dengan grep (setup: `docs/graphify-setup.md`).
4. Baca file secara targeted (`offset`/`limit`); jangan dump file >200 baris. Eksplorasi luas didelegasikan ke subagent `explore`.
5. Satu sesi = satu story atau satu CR. Bootstrap sesi lewat `/start`.

## Workflow & Gates

| Tahap | Artefak | Command | Gate |
|---|---|---|---|
| Diskusi | Ringkasan masalah, tujuan, non-goals | — | — |
| PRD | `docs/prd/NNN-slug.md` | `/prd` | **Gate 1**: PRD approved |
| Design | `docs/design/*` | `/design` | **Gate 2**: design approved |
| Story | `docs/stories/NNN-MM-slug.md` | `/story` | **Gate 3**: story approved |
| Implementasi | Kode + test + docs | `/implement` | Story `review` |
| Review | Temuan + CR bila perlu | `/review` | `done` oleh user |

Aturan:

- Tidak ada implementasi fitur tanpa story berstatus `todo` atau lebih. Baca story, PRD, dan design sebelum coding — story adalah source of truth.
- 1 story = 1 branch + 1 PR (branch `NNN-MM-slug`).
- Setelah tasks selesai: tick checkbox story → append `docs/STATUS-LOG.md` (format `YYYY-MM-DD — ringkasan — referensi`) → update `docs/BACKLOG.md` dan `docs/STATUS.md`. Urutan ini bagian dari definisi selesai; `node scripts/check-status-log.mjs` wajib hijau sebelum commit.
- Temuan pada artefak `approved`/`shipped` atau story `review`/`done` harus menjadi CR, bukan edit langsung. Artefak draft boleh diedit dengan konfirmasi user.
- **Hanya user** yang boleh menetapkan `approved` dan `done`.

### Lightweight Track

- **CR** langsung, tanpa PRD/story, untuk bug dan regresi, pelanggaran a11y, penyesuaian nilai token, perbaikan docs, varian kecil komponen, dan perbaikan microcopy.
- **Design spec singkat + 1 story** untuk komponen baru tanpa pattern baru.
- **PRD penuh** untuk fitur/pattern baru, area app baru, perubahan lintas package, atau dependency baru.
- Poles UI lewat `/improve-ui`, `/polish-ui`, `/design-language`, dan `/audit` (subagent `ui-ux-auditor`).

## Scope Discipline

- Kerjakan hanya acceptance criteria dan tasks story/CR. Kebutuhan di luar scope: **STOP** dan minta konfirmasi.
- Gunakan pola paling sederhana yang sesuai `CONVENTIONS.md`. Dependency baru, refactor besar, atau perubahan konvensi butuh konfirmasi.

## Token Discipline

- Verifikasi targeted saat iterasi; full suite di akhir.
- Simpan analisis ke file, bukan hanya di percakapan.

## ID Conventions

| Objek | Format | Contoh |
|---|---|---|
| PRD | `NNN` | `012` |
| Requirement di dalam file PRD-nya | `FR-NNN` | `FR-003` |
| Requirement di luar file PRD-nya (design, story, review) | `NNN.FR-NNN` | `012.FR-003` |
| Screen | `S-NNN` | `S-010` |
| Child panel/tab | `S-NNN.MM` | `S-003.01` |
| Modal | `M-NNN` | `M-001` |
| Story | `NNN-MM` | `012-01` |
| CR | `CR-NNN` | `CR-003` |

Komponen dirujuk dengan nama file/export, bukan ID terpisah. Aturan FR berlaku untuk artefak baru; artefak lama tidak di-retrofit.

## Aturan Teknis

Rincian kode dan visual ada di `ARCHITECTURE.md`, `CONVENTIONS.md`, dan `visual-language.md`. Gunakan skill yang sesuai sebelum memulai (daftar skill tersedia di sesi). Yang tidak tercantum di sana:

- Setiap file baru mengikuti pola existing di direktori yang sama; setiap package dan module NestJS punya `index.ts` (barrel).
- Backend `apps/api`: DTO `class-validator`, exception class kustom, filter terpusat, respons bertipe. Perubahan schema Prisma mengikuti pola `apps/api/prisma` dan migration yang benar.
- Setiap tabel/data grid menyediakan loading skeleton dan empty state yang komprehensif.
- Sebelum implementasi fitur, framing bisnis secukupnya: klasifikasi MoSCoW, user story, acceptance criteria Given/When/Then (skill `product-ux`) — jangan bertele-tele.

## Status Cycle

| Artefak | Alur |
|---|---|
| PRD | `draft` → `approved` → `shipped` |
| Design | `draft` → `approved` |
| Story | `todo` → `in-progress` → `review` → `done` |
| CR | `draft` → `approved` → `done` |

## Review Gates

- **Gate 1 (PRD)**: masalah jelas, goals terukur, non-goals eksplisit, requirement `FR-NNN` testable, open questions terjawab.
- **Gate 2 (Design)**: object model dan sitemap diperbarui, semua layar terdaftar, flow dan state matrix lengkap, setiap FR tercakup.
- **Gate 3 (Story)**: satu story = satu sesi, vertical slice, AC Given/When/Then dengan FR + screen ID, dependencies jelas.
- **Review**: temuan diberi severity (`blocker`/`major`/`minor`), lokasi `file:line`, dan rekomendasi.
