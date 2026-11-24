# CR-079 — Import Wizard: Copy English dan Kejelasan Kontrak Demo

**Status:** approved (2026-11-25; supersession bahasa disetujui, implementasi belum dimulai)  
**Sumber:** audit UI/UX `/improve-ui` Import Wizard, 2026-11-25 — cluster copy/kejujuran demo  
**Ref:** `docs/prd/014-import-wizard.md` (FR-001/003/004/007/010/011), `docs/design/import-wizard.md` (D1/D2/D5 dan §2), S-005.37  
**Dependensi:** dukungan messages FileInput CR-078; selaraskan feedback dengan CR-076.

## Temuan

Lokasi relatif berada dalam `apps/showcase/src/app/(docs)/patterns/import-wizard/`.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:30–34,168,201`, `_components/`, `_lib/` | Copy Indonesia tersebar pada UI, ARIA/live region, gate, validator, template dan snippet; berbeda dari arah English yang diminta user. | Terjemahkan seluruh copy runtime milik demo, bukan hanya header. |
| 2 | major | `_components/confirm-step.tsx:39–46`, `_components/demo-panel.tsx:18–35,72` | Demo menyatakan hasil dikirim ke onComplete, tetapi handler hanya menyimpan state lokal; recipe memakai komponen ImportWizard yang tidak diekspor. | Nyatakan simulasi lokal; recipe menjelaskan wiring composed pattern, bukan API fiktif. |
| 3 | major | `_components/upload-step.tsx:76`, `_lib/parse-csv.ts:56–59,83–84` | Teks “maksimum” menyiratkan hard limit, padahal ukuran/jumlah baris hanya warning sesuai D2. | Jelaskan threshold rekomendasi dan bahwa pemrosesan tetap dilanjutkan. |
| 4 | minor | `_components/demo-panel.tsx:45–51` | Clipboard gagal tanpa feedback dan status copied tidak kembali netral. | Gunakan feedback CodeBlock existing lewat CR-080, tanpa implementasi clipboard kedua. |

## Perubahan yang Diusulkan

- **Sebelum → sesudah:** bahasa campuran → English konsisten untuk judul, langkah, instruksi, placeholder, pilihan delimiter, gate/error, label target, announcement, nama aksesibel, template demo dan snippet.
- Pertahankan normalisasi/sinonim header Indonesia+Inggris; jangan menerjemahkan CSV/nama file unggahan pengguna atau pesan custom validator yang diberikan konsumen.
- Hapus ketergantungan branch terhadap literal error Indonesia (misalnya `v1 CSV saja`) tanpa mengubah bentuk kontrak publik util secara sepihak; tambah test untuk recovery format.
- Sebut aksi akhir `Prepare import`/padanan jujur: hanya menyiapkan `ImportResult`, tidak mengirim ke server. Summary terakhir diberi label sebagai hasil simulasi sebelumnya bila dipertahankan.
- Recipe memakai handler dan wiring composed pattern yang benar-benar ada, atau secara eksplisit disebut pseudocode integrasi; tidak menyiratkan export `@ds/ui/ImportWizard`. Endpoint contoh ditandai milik aplikasi konsumen, bukan endpoint repo yang dijamin tersedia.
- Terjemahkan copy FileInput hanya lewat konfigurasi opt-in CR-078; jangan mengubah default bahasa caller lain.
- **Usulan supersession setelah approval:** kewajiban error Indonesia di PRD014 FR-003, D5 dan kontrak §2 “semua teks pengguna Bahasa Indonesia” digantikan English **untuk showcase Import Wizard dan pesan bawaan helper lokalnya**. Aturan teknis, dukungan header bilingual, serta pesan custom konsumen tetap. CR ini menjadi catatan perubahan; jangan edit langsung artefak approved.
- Non-goals: lokalisasi global, backend import, komponen reusable baru, atau penerjemahan halaman referensi.

## Acceptance Criteria

- Given seluruh state demo, when dibaca visual atau melalui nama aksesibel/live region, then copy bawaan konsisten English, termasuk error dan FileInput.
- Given CSV berheader Indonesia atau Inggris, when dipetakan, then suggest/validasi tetap bekerja tanpa mengubah data pengguna.
- Given file melewati threshold, when diproses, then warning tidak menyatakan pemblokiran; format unsupported tetap ditolak dengan recovery English.
- Given submit sukses atau recipe dibaca, then tidak ada klaim upload/persist/callback yang tidak dijalankan demo.

## Tasks

- [ ] Inventaris dan terjemahkan copy page, komponen, helper, field/template demo, announcement dan recipe; perbarui test relevan.
- [ ] Konfigurasi messages FileInput setelah CR-078; uji unsupported file, duplicate mapping, required/type/pattern/unique dan warning.
- [ ] Tambah test header bilingual serta data/custom error yang tidak diterjemahkan.
- [ ] Verifikasi semua state, last-result history, dan kejujuran recipe; koordinasikan rendering/copy-feedback dengan CR-080.

## Keputusan

| # | Usulan | Alasan |
|---|---|---|
| 1 | English dibatasi pada copy milik showcase/helper lokal; dokumen CR tetap Indonesia. | Memenuhi arah user tanpa memperluas lokalisasi monorepo. |
| 2 | Demo lokal tetap composed pattern. | Tidak menambah API/backend untuk membenarkan copy yang keliru. |

## Design System Checks

- [ ] Copy tidak terpotong di320/390/1440 light/dark; nama aksesibel/deskripsi tetap terhubung.
- [ ] Token/kontras, loading/empty/error/success dan gate tidak regresi.
- [ ] Tidak ada perubahan kontrak domain, dependency, atau default bahasa shared.
- [ ] Test targeted, lalu `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm -C apps/showcase build`; baseline dicatat terpisah.

## Eksekusi

Branch: `cr-079-import-wizard-english-copy`  
Commit: `fix: clarify import wizard demo and English copy [CR-079]`

- [ ] CR dan supersession bahasa disetujui user; branch dibuat.
- [ ] Implementasi/verifikasi selesai; checklist dan BACKLOG/STATUS diperbarui; hanya user menetapkan done.
- [ ] Append STATUS-LOG; `node scripts/check-status-log.mjs` hijau sebelum commit.
