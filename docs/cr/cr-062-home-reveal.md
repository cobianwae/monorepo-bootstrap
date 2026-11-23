# CR-062 — Reveal katalog beranda mobile

**Status:** approved
**Sumber:** audit
**Ref:** CR-054 C16; `docs/reviews/cr-054-code-audit.md:308`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| C16 | major | `apps/showcase/src/app/(docs)/page.tsx:532`–`:591`; `apps/showcase/src/hooks/use-reveal.ts:16`, `:32`–`:41` | Target katalog 9689px, root observer 804px, ratio 0,08298 tidak mencapai threshold 0,15; opacity tetap 0 setelah scroll. | Pemicu yang dapat dicapai untuk section panjang. |

## Perubahan yang Diusulkan

- Pilih sentinel atau Reveal per kelompok; hindari perubahan animasi global tanpa menilai caller.
- Hormati reduced motion; konten jangan tergantung threshold yang mustahil.

## Tasks (jalur small-fix)

- [ ] Reproduksi cold-load mobile, masuk viewport dari atas/bawah.
- [ ] Perbaiki trigger dan uji section pendek/panjang, resize dan reduced motion.
- [ ] Screenshot seluruh katalog nyata terlihat; regression observer test dan verifikasi showcase.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Pisahkan dari timing hero landing | Home terbukti tidak mencapai threshold; landing akhirnya muncul. |

## Design System Checks

- [ ] Token/motion, kontras, a11y, API/export dan state konsisten; showcase diperbarui.
- [ ] Typecheck/lint/test diverifikasi; baseline dicatat.

## Eksekusi

Branch: `cr-062-home-reveal`
Commit: `fix: reveal long home catalog on mobile [CR-062]`

- [x] Disetujui user (2026-11-23).
- [ ] Branch dibuat; implementasi dan verifikasi.
- [ ] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
