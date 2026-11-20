---
name: monorepo-ci
description: Verifikasi monorepo pnpm workspace — urutan typecheck/lint/test, filter per package, check-status-log, dan batasan baseline gagal
tags: [fullstack, monorepo, ci, verification, pnpm, workspace]
compatibility: [next, opencode, claude, cursor]
---

# Monorepo CI / Verification

## Kapan Pakai
WAJIB sebelum menyelesaikan perubahan apa pun yang menyentuh kode/docs: verifikasi targeted saat iterasi, full suite (`pnpm verify`) di akhir. Ini skill "gate terakhir" — dipanggil setelah skill domain (`ui-component`, `backend-nestjs`, `shared-types`, dll) selesai.

## Urutan Wajib

```bash
pnpm typecheck        # pnpm -r build:types
pnpm lint             # pnpm -r lint
pnpm test             # pnpm -r test
```

Tambahan sesuai scope:

```bash
pnpm test:tokens                  # perubahan token/kontras
pnpm -C apps/showcase build       # perubahan showcase/route
node scripts/check-status-log.mjs # wajib sebelum commit (kepatuhan CR-007)
```

Shortcut semua sekaligus: `pnpm verify`.

## Verifikasi Targeted per Package

Untuk iterasi cepat, filter ke package yang disentuh dulu:

| Scope | Command |
|---|---|
| `packages/shared-types` | `pnpm --filter @shared/types build:types && pnpm --filter @shared/types lint` |
| `packages/ui` | `pnpm --filter @ds/ui lint && pnpm --filter @ds/ui test && pnpm --filter @ds/ui build:types` |
| `packages/tokens` | `pnpm test:tokens` |
| `apps/api` | `pnpm --filter @app/api lint && pnpm --filter @app/api build:types && pnpm --filter @app/api test` |
| `apps/web` | `pnpm --filter @web/web lint && pnpm --filter @web/web build:types` |
| `apps/showcase` | `pnpm --filter @ds/showcase lint && pnpm --filter @ds/showcase build:types` |

Setelah targeted hijau, baru jalankan full suite. Perubahan tipe di `shared-types` SELALU butuh `pnpm typecheck` workspace (consumer lintas app).

## Aturan Baseline

- Jika `typecheck`/`lint`/`test` sudah gagal **sebelum** perubahan kamu: catat sebagai known issue di ringkasan, jangan perbaiki di luar scope.
- Bandingkan: jumlah/blok error harus tidak bertambah akibat perubahanmu.
- Gagal karena dependency/environment (mis. network install) → laporkan, jangan di-patch diam-diam.

## Sebelum Commit

1. Full suite hijau (atau baseline gagal tercatat).
2. `node scripts/check-status-log.mjs` — wajib, kepatuhan CR-007.
3. Commit message conventional + referensi: `type: deskripsi [NNN-MM]` / `[CR-NNN]` / `chore: ...` tanpa referensi bila tidak terikat artefak.
4. Satu story/CR = satu branch = satu PR.

## Anti-Patterns

- ✗ Commit tanpa menjalankan full suite
- ✗ Melompati `check-status-log.mjs` padahal ada artefak `done`
- ✗ Memperbaiki baseline lama di luar scope perubahan
- ✗ Hanya menjalankan targeted test lalu mengklaim selesai
- ✗ Menambah dependency/config CI baru tanpa konfirmasi

## Decision Points (ditentukan PRD/design — bukan di sini)

| Decision Point | Opsi umum | Kapan pilih mana |
|---|---|---|
| Granularitas verifikasi | per-package filter vs full suite | iterasi cepat vs pre-commit (invariant: full suite sebelum commit) |
| Jalur docs-only | skip build berat | perubahan murni `.md`/docs |
| Kebijakan baseline gagal | fix di luar scope vs catat known issue | invariant: selalu catat, fix butuh CR terpisah |
| Perluasan CI | job tambahan (build showcase, migration dry-run) | saat pola kebutuhan muncul 3x |

## Edge Cases Umum (kandidat AC story)

- [ ] Flaky test (pass/fail acak) → jangan ignore diam-diam; catat & perbaiki
- [ ] Typecheck hijau tapi runtime gagal → jalankan build app yang disentuh
- [ ] Lockfile/`pnpm` version mismatch antar kontributor
- [ ] Perubahan tipe `shared-types` tanpa verifikasi consumer lintas app
- [ ] Commit tanpa `check-status-log` saat ada artefak `done`

## Integration with Other Skills

- **Setelah semua skill domain**: ini langkah penutup.
- `shared-types` → wajib workspace typecheck. `ui-component` → ui lint/test/build:types lalu full. `backend-nestjs`/`api-testing`/`prisma-schema` → api test + full.

## Checklist

1. [ ] Targeted verification package yang disentuh hijau
2. [ ] `pnpm typecheck` + `pnpm lint` + `pnpm test` hijau
3. [ ] Scope tambahan dijalankan (tokens/showcase build) bila relevan
4. [ ] `node scripts/check-status-log.mjs` OK
5. [ ] Baseline gagal (bila ada) dicatat sebagai known issue
