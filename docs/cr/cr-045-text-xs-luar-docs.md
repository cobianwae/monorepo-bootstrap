# CR-045 — `text-[9/10/11px]` di luar `app/(docs)` ke `text-xs`

**Status:** draft
**Sumber:** audit halaman tidak koheren (2026-11-22), usulan urutan 3
**Ref:** `docs/design/visual-language.md` (Type Scale: dilarang `text-[Npx]`, teks terkecil `text-xs`), `docs/cr/cr-038-text-xs-docs-non-foundations.md` (cakupan docs)

## Temuan

Audit grep (2026-11-22) di `apps/showcase/src`: 154 pemakaian `text-[9px]`, `text-[10px]`, `text-[11px]` di 33 file, semuanya di luar `app/(docs)`. Guard sebelumnya hanya memindai `app/(docs)`, sehingga area ini tidak terjaga.

| # | Severity | Area | Jumlah | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `app/(clinic)/clinic/*` (appointments, consultations, patients, pos, registration, reports, treatments, page) | 58 | `text-xs` |
| 2 | minor | `app/(crm)/crm/*` (contact-center, leads) | 3 | `text-xs` |
| 3 | minor | `app/(landing)/landing/page.tsx` dan `components/landing/*` (contrast-widget, hero-canvas, landing-footer, oklch-ramp, pattern-gallery, scenario-preview, voice-stage) | 19 | `text-xs` |
| 4 | minor | `components/showcase-header.tsx`, `showcase-nav-content.tsx`, `showcase-sidebar.tsx` | 5 | `text-xs` |
| 5 | minor | `scenarios/clinic/components/*` (ai-coach-drawer, header, sidebar, patient-summary-card, weight-trajectory-chart) | 9 | `text-xs` |
| 6 | minor | `scenarios/crm/components/*` (deal-radar, executive-briefing, header, omnichannel-pulse, pipeline-funnel, revenue-story, sidebar) | 36 | `text-xs` |

Total 154 kemunculan di 33 file (sudah dicek ulang: 0 sisa di `apps/showcase/src` setelah perubahan).

## Perubahan

- Ganti 154 kemunculan di 33 file menjadi `text-xs`. Skrip `/tmp/vl-calc/cr045.mjs` menghitung dulu (harus 154 di 33 file) sebelum menulis; tidak ada perubahan selain kelas tersebut.
- Guard `apps/showcase/src/test/visual-language-guard.test.ts`: aturan `arbitrary-px-text` sekarang memindai seluruh `src` (non-test `.tsx`), bukan hanya `app/(docs)`. Tes "seluruh src tidak memakai text-[Npx]" menggantikan tes docs lama. Aturan heading/callout/segmented tetap hanya untuk foundations.

## Tasks

- [x] Ganti 154 kemunculan di 33 file ke `text-xs`.
- [x] `grep text-\[[0-9.]+px\]` di `apps/showcase/src` = 0.
- [x] Guard diperluas ke seluruh `src`; `visual-language-guard` hijau 4/4.
- [x] `pnpm --filter @ds/showcase lint` hijau (exit 0).
- [x] `pnpm --filter @ds/showcase build:types` hijau (exit 0).
- [x] Verifikasi visual sebagian: `clinic/patients` (dark, Atelier/Pulse). Regresi ditemukan: nilai berat di kolom Weight Trajectory dan BMI/Status terbungkus. Diperbaiki dengan `whitespace-nowrap` pada dua baris flex (`app/(clinic)/clinic/patients/page.tsx`, lihat Eksekusi).
- [ ] Verifikasi visual halaman lain di area ini (crm/leads terisi, clinic lainnya, landing, scenario), terutama badge `h-4`/`h-3.5`, tombol `h-6`, label grid sempit. **Belum diverifikasi.**
- [ ] `pnpm -C apps/showcase build` belum dijalankan di folder asli (dev server :4000 menimpa `.next`).

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Satu CR untuk semua area, dengan guard yang diperluas di commit yang sama | Aturannya sama di semua area; guard tidak boleh tertinggal dari perubahan. |
| 2 | Tidak mengubah ukuran selain 9/10/11px → 12px | Sesuai Type Scale; penyesuaian layout (mis. tinggi badge) dilakukan hanya bila screenshot menunjukkan masalah (CR lanjutan). |

## Catatan risiko

- Kenaikan 1–2px per teks bisa memotong label yang sempit atau mendorong baris. Tidak ada perubahan `h-*` atau `w-*`; bila ada pemotongan terlihat, perbaikannya CR terpisah.
- Teks `text-xs` di atas `text-highlight` (eyebrow/tint) belum diaudit di area ini; aturan kontras di `visual-language.md` berlaku.

## Design System Checks

- [x] Tidak ada hex/RGB hardcode.
- [x] Guard memindai seluruh `src`.
- [ ] Screenshot area clinic, crm, landing, dan scenarios belum dilakukan.

## Eksekusi

Branch: `visual-polish`
Commit: `refactor: text-xs di luar docs [CR-045]` (4969a01) dan `fix: cegah wrap nilai berat dan BMI di tabel patients [CR-045]` (perbaikan regresi visual, lihat Tasks).
