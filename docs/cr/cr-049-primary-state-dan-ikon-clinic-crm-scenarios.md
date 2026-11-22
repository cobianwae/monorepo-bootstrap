# CR-049 — State terpilih dan ikon dekoratif `primary` di clinic, crm, dan scenarios

**Status:** done (ditetapkan user 2026-11-22)
**Sumber:** lanjutan CR-047 (cakupan `app/(docs)` saja; sisa `clinic`, `crm`, `scenarios` belum diubah), permintaan user "tuntaskan"
**Ref:** `docs/design/visual-language.md` (Color Roles: `primary` = aksi dan fokus; `highlight` = aksen dan identitas; state on segmented = `bg-background` + `shadow-xs`)

## Temuan dan keputusan

| # | Lokasi | Pola | Tindakan |
|---|---|---|---|
| 1 | `clinic/pos` (tender QRIS/Card/Cash; kartu produk terpilih) | State terpilih `bg-primary text-primary-foreground` | `bg-background text-foreground shadow-xs`; border terpilih `border-highlight` |
| 2 | `clinic/registration:452` (kartu terpilih), `clinic/page:267` (kartu aktif) | Fill/border `primary` untuk pilihan | `bg-highlight/5 border-highlight` (ring highlight) |
| 3 | `crm/leads:1276`, `crm/contact-center:370`, `crm-header`/`clinic-header` (notifikasi belum dibaca) | Item terpilih/unread `primary` | `highlight` (konsisten dengan CR-047 keputusan 4) |
| 4 | Ikon dekoratif (patients, registration, appointments, pos, clinic/page, crm/ai, campaigns, crm-omnichannel, clinic-ai-coach-drawer) | `text-primary` ikon/bullet | `text-highlight` / `bg-highlight` |
| 5 | `crm-stats-grid` (kartu statistik) | Border dan gradien `primary`, ikon kotak | `highlight` |

## Sengaja TIDAK diubah (tetap `primary`)

- Teks hover tautan/aksi (`hover:text-primary`) di leads, crm-*, showcase-sidebar: affordance tautan.
- Logo brand gradien `from-primary via-primary to-highlight` (header/sidebar scenarios).
- Nilai angka dan teks kecil `text-primary` (mis. total POS, kcal, nilai simulasi, `text-xs` di revenue-story): keputusan kontras, dicatat untuk CR terpisah bila perlu.
- `CheckCircle2` (status) dan spinner.
- Tombol `Button` dan `variant="default"`.

## Tasks

- [x] Ganti 25 kemunculan di 14 file (skrip memverifikasi jumlah sebelum menulis; `/tmp/vl-calc/cr049.mjs`).
- [x] `pnpm --filter @ds/showcase lint` hijau (exit 0).
- [x] `pnpm --filter @ds/showcase build:types` hijau (exit 0).
- [x] `next build` produksi lulus dari salinan sementara `apps/.showcase-build` (commit 987b257).
- [x] `visual-language-guard` hijau 4/4.
- [x] Screenshot `clinic/pos` dark (Atelier/Pulse): tender terpilih terbaca, tidak ada teks terpotong.
- [x] Verifikasi visual (Atelier/Pulse, 1440px, jeda 9 detik agar data termuat): `clinic/registration` light; `clinic/patients` light; `clinic` dark; `crm` dark dan light (chart tampil penuh); `crm/ai` light (tab terpilih memakai permukaan background + shadow). Semua rapi, tidak ada teks terpotong.
- [x] Tambahan: `clinic` light, `clinic/registration` dark, `crm/ai` dark, `clinic/patients` dark, `crm/leads` light (kanban terisi). Semua rapi.
- [x] Clinic AI drawer (light, Atelier/Pulse): dibuka lewat klik skrip; rapi, tombol dan badge terbaca.
- Catatan metode: jeda 3,5 detik membuat chart CRM kosong dan halaman dark tertangkap skeleton. Jeda 9 detik menyelesaikan keduanya; ini bukan regresi CR-049.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | State terpilih non-tombol memakai `bg-background` atau ring/border `highlight` | Konsisten dengan state on SegmentedControl dan CR-047 |
| 2 | Teks `primary` yang bersifat tautan dan nilai angka tidak diubah | Membedakan aksi dari dekorasi tanpa mengubah perilaku |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode.
- [x] Guard hijau.
- [ ] Kontras `highlight` pada teks kecil: tidak ada teks kecil yang diubah ke `text-highlight` di CR ini (hanya ikon, border, dan bg).

## Eksekusi

Branch: `visual-polish`
Commit: `refactor: state terpilih dan ikon dekoratif ke highlight di clinic, crm, scenarios [CR-049]` (e2d7711). Verifikasi visual: Atelier/Pulse dark dan light untuk 10 halaman/komponen, jeda 9 detik (b9ce041 dan commit berikut).
