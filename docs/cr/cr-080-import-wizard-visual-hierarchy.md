# CR-080 — Import Wizard: Hierarki, Density Preview, dan Konsistensi Showcase

**Status:** approved (2026-11-25; diimplementasi 2026-11-26, menunggu review user)  
**Sumber:** audit UI/UX `/improve-ui` Import Wizard, 2026-11-25 — cluster visual  
**Ref:** `docs/design/visual-language.md`, `docs/design/import-wizard.md`, S-005.37, halaman referensi `patterns/overlays-menus` dan `patterns/data-display`  
**Urutan usulan:** setelah CR-076/077; koordinasikan copy dengan CR-079.

## Temuan

Lokasi relatif berada dalam `apps/showcase/src/app/(docs)/patterns/import-wizard/`.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | minor | `page.tsx:206,222`, `_components/demo-panel.tsx:55` | Urutan heading h1→h3→h2; heading langkah dan panel demo berbeda hierarki/type family dari docs. | Susun heading semantik berurutan; pakai SectionHeading untuk section docs. |
| 2 | minor | `_components/demo-panel.tsx:80,85` | Recipe memakai pre dan clipboard custom. | Gunakan CodeBlock existing beserta feedback copy success/error. |
| 3 | minor | `_components/validation-step.tsx:108,155` | Preview25 baris sangat tinggi sehingga navigasi jauh dari konteks; filter tanpa hasil hanya paragraf. | Batasi tinggi area preview dengan scroller aksesibel dan sediakan empty state beraksi. |
| 4 | minor | `_components/confirm-step.tsx:60`; `packages/ui/src/components/data-display/stat-card.tsx:64` | Ikon default StatCard menggunakan primary dekoratif; deskripsi berpotensi terpotong. | Gunakan ringkasan lokal berbasis komponen existing tanpa ikon dekoratif primary; jangan restyle StatCard global. |

## Perubahan yang Diusulkan

- **Sebelum → sesudah:** card title/step heading bertabrakan tingkat → section demo berheading h2 melalui SectionHeading dan heading langkah internal h3 bertipografi display yang sesuai. Pertahankan ref/fokus heading dan perbarui test level heading.
- Jaga root `space-y-10`, section `space-y-4`, tipe minimal text-xs, dan lebar demo/docs yang koheren; jangan menambah chrome atau arah visual baru.
- Recipe menggunakan CodeBlock; hapus state clipboard custom yang redundan dan gunakan feedback existing termasuk kegagalan. Copy isi milik CR-079.
- Preview tabel memiliki tinggi maksimum responsif memakai skala/token existing, horizontal scroll lokal tetap ada, header mudah dilacak dan scroller bisa digunakan keyboard. Footer berada di luar scroller; tidak otomatis menambah sticky footer halaman.
- Empty filter menjelaskan tidak ada baris yang cocok dan menyediakan aksi kembali ke seluruh baris. Bedakan dari sumber belum dipilih dan CSV header-only.
- Summary menggunakan markup lokal/komponen DS existing dengan label yang tidak terpotong; dekorasi highlight, status success/destructive hanya untuk status bermakna. Tidak mengubah API atau warna default StatCard.
- Non-goals: mengubah halaman referensi, visual language approved, default Card/DemoSection/CodeBlock atau art direction global.

## Acceptance Criteria

- Given halaman/keempat langkah, when heading diperiksa, then hierarchy berurutan dan fokus perpindahan langkah tetap terlihat.
- Given preview25 baris pada mobile/desktop, when tabel dinavigasi keyboard, then seluruh baris dan footer dapat dicapai tanpa overflow dokumen atau keyboard trap.
- Given filter tanpa hasil, when aksi pemulihan dipilih, then seluruh baris kembali terlihat.
- Given recipe disalin, when clipboard berhasil/gagal, then feedback sesuai tersedia melalui CodeBlock tanpa state custom yang bertentangan.

## Tasks

- [x] Rapikan struktur heading/section dan alignment demo vs panel pendukung; pertahankan anatomy DS.
- [x] Migrasi snippet ke CodeBlock dan hapus clipboard custom; sinkronkan copy CR-079.
- [x] Terapkan preview scroller aksesibel, empty-filter recovery dan summary tanpa dekorasi primary/truncation.
- [x] Perbarui test heading/filter/recipe; tinjau screenshot320/390/1440 light/dark pada ketiga art direction dan reduced motion.

## Keputusan

| # | Usulan | Alasan |
|---|---|---|
| 1 | SectionHeading untuk section docs, bukan setiap heading internal wizard. | Menjaga hierarki tanpa memaksakan anatomy docs ke seluruh UI demo. |
| 2 | Gunakan ringkasan lokal, bukan perubahan shared StatCard. | Batas scope satu halaman dan menghindari perubahan API yang tidak diperlukan. |
| 3 | Perluasan scope disetujui user 2026-11-26 ("harus inggris"): `CodeBlock` mendapat prop opsional `copyLabels` (+ tipe `CodeBlockCopyLabels`); default Indonesia tidak berubah. Halaman ini mengisinya dalam English. | Copy halaman wajib English (CR-079); perubahan aditif. Label collapse/expand belum bisa diganti (tidak dipakai di sini). |

## Design System Checks

- [x] Token-first, peran warna benar, tidak ada text-[Npx]; guard visual-language hijau.
- [ ] Light/dark, kontras teks ≥4,5:1, keyboard/fokus dan state relevan terjaga.
- [x] API/export shared tetap kecuali tambahan opsional di Keputusan #3; tidak menambah dependency.
- [x] Test targeted, lalu `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`; gunakan salinan jika dev server aktif.

Catatan verifikasi 2026-11-26:

- Chrome headless, 18 kombinasi (3 art direction × light/dark × 320/390/1440, reduced motion): tanpa overflow dokumen, End mencapai baris terakhir, header menempel, Tab keluar ke pagination. Screenshot ditinjau secara sampel, tidak seluruhnya.
- Kontras numerik halaman ini **belum** diukur (memakai pasangan token yang ada); checkbox kontras dibiarkan terbuka.
- `pnpm test` penuh tidak stabil: `rich-text-editor` smoke AC-01 gagal intermiten juga pada baseline `visual-polish` bersih; `file-upload` retry gagal sekali pada satu run.

## Eksekusi

Branch: `cr-080-import-wizard-visual-hierarchy`  
Commit: `fix: polish import wizard hierarchy and preview [CR-080]`

- [x] CR disetujui user dan branch dibuat.
- [x] Implementasi/verifikasi selesai; checklist dan BACKLOG/STATUS diperbarui; hanya user menetapkan done.
- [x] Append STATUS-LOG; `node scripts/check-status-log.mjs` hijau sebelum commit.
