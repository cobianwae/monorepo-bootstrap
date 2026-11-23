# CR-062 — Reveal katalog beranda mobile

**Status:** done
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

- [x] Reproduksi cold-load mobile, masuk viewport dari atas/bawah.
- [x] Perbaiki trigger dan uji section pendek/panjang, resize dan reduced motion.
- [x] Screenshot seluruh katalog nyata terlihat; regression observer test dan verifikasi showcase.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Pisahkan dari timing hero landing | Home terbukti tidak mencapai threshold; landing akhirnya muncul. |
| 2 | Perbaiki di `useReveal` (threshold efektif), bukan sentinel atau per-kelompok | Rasio maksimum target selalu `tinggi viewport / tinggi target`; target lebih tinggi dari viewport tidak akan pernah mencapai threshold pecahan. Semua caller dinilai: katalog home (9689px) diperbaiki; landing/voice-stage/animated-stat/feature grid yang muat viewport tetap memakai threshold 0,15. Sentinel tidak dipakai karena tidak menyelesaikan akar masalah untuk section lain. |

## Design System Checks

- [x] Token/motion, kontras, a11y, API/export dan state konsisten; showcase diperbarui.
- [x] Typecheck/lint/test diverifikasi; baseline dicatat.

## Eksekusi

Branch: `cr-062-home-reveal`
Commit: `fix: reveal long home catalog on mobile [CR-062]`

- [x] Disetujui user (2026-11-23).
- [x] Branch dibuat; implementasi dan verifikasi.
- [x] BACKLOG/STATUS/STATUS-LOG diperbarui; `check-status-log` hijau.
- [x] Ditetapkan `done` oleh user dan di-merge ke `visual-polish` (2026-11-23).

### Catatan implementasi

- `resolveThreshold` di `use-reveal.ts`: threshold turun ke `0` hanya bila tinggi target > `window.innerHeight`; target normal tidak berubah.
- Regression test `apps/showcase/src/hooks/use-reveal.test.tsx` (5 test): target 9689px → threshold 0 dan terlihat pada rasio 0,08298; target 300px → threshold 0,15; tanpa `IntersectionObserver` langsung terlihat; delay `transitionDelay`; guard kelas reduced motion.
- Browser 390×844 (Chrome headless): sebelum scroll `data-visible=false`/opacity 0 (cold state), setelah masuk katalog `data-visible=true`/opacity 1, tinggi target 9689px, 46 tautan. Dengan `prefers-reduced-motion: reduce`, opacity 1 sejak awal tanpa menunggu observer.
- Verifikasi: `@ds/showcase` typecheck hijau, lint hijau, test 84/84 (79 baseline + 5 baru), `next build` hijau.
- Batas: screenshot tersimpan di temp sesi (tidak di-commit); perilaku resize setelah mount tidak menambah observer baru, tetapi threshold 0 membuat target tinggi tetap aman.
