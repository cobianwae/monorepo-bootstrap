# CR-077 — Import Wizard: Kontras, Label, Fokus, dan Target Sentuh Lokal

**Status:** done (ditetapkan user 2026-11-25; implementasi di `cr-077-import-wizard-accessibility`, commit `5d592b3`; verifikasi kontras numerik, reflow browser, dan keyboard/screen reader belum dilakukan)  
**Sumber:** audit UI/UX `/improve-ui` Import Wizard, 2026-11-25 — cluster a11y lokal  
**Ref:** `docs/prd/014-import-wizard.md` (FR-008/009/011), `docs/design/import-wizard.md`, S-005.37.01–.04  
**Prioritas:** tinggi; shared Stepper/FileInput dipisahkan ke CR-078.

## Temuan

Lokasi relatif berada dalam `apps/showcase/src/app/(docs)/patterns/import-wizard/`.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `_components/validation-step.tsx:135,139` | Teks error text-xs destructive di latar destructive/10 terukur sekitar 3,32:1 light / 4,32:1 dark pada delapan tema. | Gunakan teks foreground yang mencapai ≥4,5:1 di permukaan aktual, dengan indikator error nonwarna. |
| 2 | major | `_components/upload-step.tsx:66` | htmlFor menunjuk div; native file input tidak memiliki label terkait (`labels.length = 0` di browser). | Pasangkan label/id input dan helper/error; nama dropzone juga harus bermakna. |
| 3 | major | `_components/mapping-step.tsx:59,98` | Select invalid tidak terhubung ke pesan penolakan. | Kaitkan kontrol dengan pesan error yang tepat. |
| 4 | major | `_components/confirm-step.tsx:59,114` | Summary menerima fokus tetapi menghapus outline tanpa pengganti; alasan submit tidak terhubung ke tombol. | Sediakan ring fokus terlihat dan hubungan alasan gate. |
| 5 | minor | `_components/upload-step.tsx:97,138`, `_components/validation-step.tsx:96,155`, `_components/demo-panel.tsx:55` | Banyak target aksi lokal tinggi32/36px; belum memenuhi target44px proyek. | Perbesar hit area dan jaga reflow mobile. |

## Perubahan yang Diusulkan

- **Sebelum → sesudah:** teks error kontras rendah → teks terbaca dengan ikon/label error; gunakan token existing, jangan mengganti token destructive global.
- Sambungkan label input, helper, dan pesan error dengan id stabil. Gunakan props native FileInput yang sudah tersedia; bila dropzone tidak bisa diberi nama secara benar tanpa perubahan shared, koordinasikan dengan CR-078.
- Pesan duplicate mapping menyebut kolom/target dan terhubung ke select yang ditolak. Fokus summary serta gate Next/Submit harus terlihat dan dapat dipahami tanpa warna.
- Perbesar target aksi lokal menjadi ≥44×44px; pagination dan toolbar wrap/stack tanpa kehilangan nama kontrol.
- Nonaktifkan animasi masuk route/panel saat reduced motion aktif; audit browser sebelumnya masih menemukan animation-name `enter` pada root ketika preferensi reduce aktif.
- Scope: page, empat step, panel demo, dan test lokal. Tidak mengubah default Button, Alert, FileInput, Stepper, atau token global.

## Acceptance Criteria

- Given delapan tema light/dark, when error validation ditampilkan, then pasangan teks/latar aktual mencapai ≥4,5:1 dan pesan bukan warna saja.
- Given penggunaan keyboard, when upload/mapping/gate/summary diakses, then nama aksesibel, deskripsi error, urutan fokus dan indikator fokus benar.
- Given viewport320/390 dan zoom200%, when toolbar/pagination dipakai, then target lokal ≥44px, tidak terpotong, dan tidak menimbulkan overflow tingkat halaman.
- Given prefers-reduced-motion, when route/step berubah, then animasi masuk nonesensial dimatikan.

## Tasks

- [ ] Perbaiki warna error lokal dan catat matriks kontras delapan tema × light/dark memakai validator token serta render aktual.
- [x] Hubungkan label/helper/error, ring summary, dan deskripsi gate; pertahankan handler aria-disabled yang menjelaskan alasan.
- [ ] Perbesar hit area lokal, uji reflow, dan hormati reduced motion.
- [x] Tambah test asosiasi label/error, fokus summary/gate (`accessibility.test.tsx`); keyboard walkthrough dan screen reader belum dilakukan.

## Keputusan

| # | Usulan | Alasan |
|---|---|---|
| 1 | Perbaiki pasangan warna pada caller, bukan token global. | Temuan terjadi pada teks kecil di atas tint tertentu. |
| 2 | Target44px adalah standar proyek; jangan mengklaim semua ukuran kecil otomatis melanggar WCAG2.1 AA. | Memisahkan quality bar proyek dari klaim kepatuhan formal. |

## Design System Checks

- [ ] Token semantik, tanpa hex/RGB hardcode; light/dark dan focus visible terverifikasi.
- [ ] Radix/keyboard, header tabel, live region serta loading/empty/error tidak regresi.
- [ ] Tidak ada perubahan API publik shared.
- [ ] Test targeted, lalu `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`; catat baseline dan hindari menimpa dev server.

## Eksekusi

Branch: `cr-077-import-wizard-accessibility`  
Commit: `fix: improve import wizard accessibility [CR-077]`

- [x] CR disetujui user dan branch dibuat.
- [ ] Implementasi/verifikasi selesai; checklist dan BACKLOG/STATUS diperbarui; hanya user menetapkan done.
- [ ] Append STATUS-LOG; `node scripts/check-status-log.mjs` hijau sebelum commit.
