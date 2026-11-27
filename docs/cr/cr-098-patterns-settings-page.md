# CR-098 — Patterns: halaman Settings

**Status:** approved (ditetapkan user 2026-11-27)
**Sumber:** audit visual Patterns 2026-11-26 (screenshot 37 route) + `notes-pilot.md` + verifikasi kode 2026-11-27 + arah dari user 2026-11-27
**Ref:** `docs/design/visual-language.md`, CR-094 (payung komposisi), CR-095 (payung visual), CR-093 (copy English), `docs/discussions/2026-11-26-patterns-ui-per-page.md`, `apps/showcase/src/app/(docs)/patterns/settings/page.tsx` (S-005.23)

## Arah dari user

> "koheren itu bukan berarti sama. settings itu punya karakter sendiri, reference boleh dr tempat lain.. katakan bisa juga jadi kayak second sidebar (sidebar dalam content), bisa berkarya lah. cuma koheren di sini maksdnya adalah art direction typography stlyle component dll itu mengikutin design system"

Halaman ini tidak mengikuti susunan CR-096/CR-097. Yang harus sama dengan seluruh showcase adalah bahasa desain: art direction, type scale, token, dan komponen `@ds/ui`. Susunan mengikuti karakter Settings: tempat mencari satu hal, lalu mengubahnya.

## Temuan

Lokasi: `apps/showcase/src/app/(docs)/patterns/settings/page.tsx`. Bukti visual: `~/Projects/monorepo-bootstrap-audit/patterns/audit/shots/patterns_settings__*` (hanya tab Profile: light, dark, mobile). Tab lain dan temuan a11y diperiksa dari kode, belum diuji di browser.

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `:446`+`:460`, `:575`+`:579`, `:753`+`:758`, `:875`+`:879`, `:1092`+`:1096` | **D2.2 Heading berlapis.** h1 → h2 nama tab → judul kartu untuk satu kelompok isi. "Danger Zone" ditulis dua kali persis. | Satu judul per panel; judul kartu dihapus. |
| 2 | major | `:419`, `:820`, `:967–1041` | **D5.1 Kotak berlapis.** Nav dan konten adalah dua kartu sama berat; preview dan baris Security berupa kartu di dalam kartu. | Satu bingkai aplikasi; pengaturan berupa baris berpemisah. |
| 3 | major | `:155`, `:175` | **D2.1, D6.7 State inti tersembunyi.** Unsaved dan invalid baru terlihat bila pengunjung tahu cara memicunya. | Demo terbuka dengan satu perubahan belum disimpan. |
| 4 | major | `:401`, `:419` | **A11y keyboard.** Nav tampil vertikal tetapi `Tabs` tanpa `orientation="vertical"`; panah atas/bawah tidak berpindah item. | Nav berisi tombol dengan `aria-current`, dapat di-Tab. |
| 5 | major | `:517`, `:538`, `:903`, `:924`, `:944`, `:1072` | **A11y form.** Pesan error Profile, Password, dan OTP tidak terhubung ke input (`aria-describedby`). | Hubungkan pesan ke kontrolnya. Pola yang sudah benar: `:652`+`:681`. |
| 6 | major | `:431–436`, `:448–456` | **A11y status.** Status unsaved tidak diumumkan; titik di nav memakai `aria-label` pada `span` kosong. | Region `role="status"` yang selalu ada; titik didampingi teks `sr-only`. |
| 7 | minor | `:554`, `:632`, `:951` | **D6.1 Footer.** `CardFooter` bawaan `pt-0` ditambah `border-t`: tombol menempel garis. | Footer hilang bersama kartu; aksi simpan pindah ke save bar. |
| 8 | minor | `:404–417` | **D6.6 Mobile.** `Select` tidak menampilkan penanda unsaved. | Drill-in dengan penanda pada daftar section. |
| 9 | minor | `:454`, `:488`, `:494`, `:760`, `:806` | **Klaim tidak benar.** "before leaving" padahal tidak ada pencegahan; "JPG, PNG or GIF. Max 2MB" tidak divalidasi; tema disebut milik workspace padahal disimpan per browser; art direction disebut hanya mengubah aksen. | Copy disesuaikan; validasi avatar ditambahkan. |
| 10 | minor | `:594`, `:848–852` | **A11y label.** `Label` Workspace URL tidak terhubung ke apa pun; swatch warna memakai `aria-label` pada `div` tanpa role. | Teks biasa untuk URL; swatch diberi `role="img"`. |
| 11 | major | `:392–1205` | **Tidak ada penjelasan pattern.** Halaman berakhir setelah demo. | Dua section pendek di bawah demo. |

## Perubahan yang Diusulkan

Hanya di `apps/showcase/src/app/(docs)/patterns/settings/`. Tidak ada perubahan `packages/ui`, API publik, token, atau dependency.

File: `page.tsx` (dirombak), `_lib/` (data nav, indeks pencarian, resep), `_components/` (panel, baris pengaturan, save bar), `page.test.tsx` (baru; halaman ini belum punya test).

### Struktur tujuan

```text
PageHeader

┌───────────────────┬─────────────────────────────────────────────────┐
│ ⌕ Find a setting  │ Profile                          Saved on Save  │
│                   │─────────────────────────────────────────────────│
│ ACCOUNT           │ Photo           (AL)  Change avatar             │
│ ▌Profile        • │ JPG, PNG or GIF, 2 MB                           │
│  Security         │─────────────────────────────────────────────────│
│  Appearance       │ Full name       [ Ava Laurent               ]   │
│                   │─────────────────────────────────────────────────│
│ WORKSPACE         │ Email           [ ava@acme.io               ]   │
│  General          │─────────────────────────────────────────────────│
│  Members        3 │▌Job title       [ Design Lead               ]   │
│                   │                  was “Product Designer”         │
│  Danger zone      │                                                 │
│                   │ ┌─ 1 unsaved change ──────  Discard  [Save] ─┐  │
└───────────────────┴─────────────────────────────────────────────────┘

Track what changed          ← CodeBlock: saved, draft, save bar
Keyboard & screen readers   ← catatan pendek
```

### Sidebar kedua

- Di dalam bingkai demo, bukan menggantikan sidebar showcase.
- Kelompok **Account** (Profile, Security, Appearance) dan **Workspace** (General, Members); Danger zone terpisah di bawah.
- `<nav aria-label="Settings sections">` memakai `SidebarMenu`/`SidebarMenuButton`; item aktif `aria-current="page"`.
- Members menampilkan jumlah anggota; item dengan perubahan belum disimpan diberi titik `highlight` + teks `sr-only`.

### Panel

| Panel | Cara simpan (tertulis di kepala panel) | Isi |
|---|---|---|
| Profile | Saved on Save | Photo, Full name, Email, Job title |
| Security | Per kelompok: "Password" (tombol Update password) dan "Sign-in protection" (berlaku langsung; 2FA minta kode) | dua label kecil |
| Appearance | Applies instantly | Color scheme, Art direction, preview |
| General | Saved on Save | Workspace name, Workspace URL, Timezone, Default language |
| Members | Applies instantly | undang, daftar, ubah role, hapus, empty state |
| Danger zone | Asks for confirmation | Transfer ownership, Delete workspace |

- Judul panel: satu `h2`, `text-xl font-bold font-display`. Label kelompok Security: `h3` `text-sm font-medium`.
- Baris pengaturan: label + penjelasan di kiri, kontrol di kanan, dipisah `border-border`; di mobile menumpuk. Tanpa kartu dan tanpa ikon dekoratif.
- Preview Appearance tetap satu area berbingkai, karena memang contoh tampilan.

### Perubahan terlihat di tempatnya

- Berlaku untuk Profile dan General.
- Baris yang berubah: penanda tepi `highlight` + "was “nilai lama”" (`text-xs text-muted-foreground`; untuk foto: "New photo selected").
- Save bar di dasar bingkai (sticky) hanya saat ada perubahan: jumlah perubahan, Discard, Save changes.
- Validasi saat Save: error inline di barisnya, fokus pindah ke field invalid pertama.
- Berpindah panel tidak membuang draft.

### Pencarian

- `SearchInput` dengan `shortcut=""` (⌘K sudah dipakai pencarian showcase) dan `aria-label="Find a setting"`.
- Mencocokkan nama, penjelasan, dan kata kunci pengaturan lintas panel.
- Saat ada query, daftar section diganti daftar hasil (nama pengaturan + nama panel). Memilih hasil membuka panelnya dan memfokuskan kontrolnya.
- Jumlah hasil diumumkan lewat `role="status"`; tanpa hasil tampil empty state; Clear atau Escape mengembalikan nav.

### Mobile (< `lg`)

Drill-in: daftar section (dengan pencarian dan titik unsaved) → ketuk → panel dengan tombol "All settings". Fokus pindah ke judul panel saat masuk dan kembali ke item asal saat keluar. `Select` dihapus.

### Di bawah demo

1. **Track what changed** (`SectionHeading` + `CodeBlock`): pola saved/draft, daftar perubahan, Discard, Save.
2. **Keyboard & screen readers** (`SectionHeading`): navigasi, pencarian, error, status unsaved, dialog.

### Copy

- Deskripsi `PageHeader`: "Find a setting, change it, and see what still needs saving. Account and workspace settings are kept apart." ("multi-tab" tidak lagi benar).
- Appearance: tema berlaku untuk browser ini; art direction mengubah font, motif, dan tone.
- "Require re-login every 7 days": penjelasan memakai cakupan akun ("Sign in again once a week."), bukan "Members must…".

### Perubahan perilaku demo (perlu persetujuan eksplisit)

1. Demo terbuka dengan Job title belum disimpan (saved "Product Designer", draft "Design Lead").
2. Skeleton halaman otomatis 600ms dihapus; state loading yang tersisa hanya pada tombol Save/Update.
3. Workspace General melacak perubahan seperti Profile; nama workspace kosong ditolak saat Save.
4. Upload avatar menolak selain JPG/PNG/GIF atau lebih dari 2 MB, dengan error inline.
5. Fitur baru: pencarian pengaturan.
6. `Tabs` diganti nav tombol; Workspace dipecah menjadi General dan Members; Appearance masuk kelompok Account.

### Di luar scope

- Transfer ownership tetap menyebut `sarah@acme.io` walau Sarah sudah dihapus dari daftar member.
- Pencegahan keluar halaman saat ada perubahan belum disimpan.
- `patterns/billing/page.tsx:780` punya pola footer yang sama dengan temuan 7 → dicatat untuk CR Billing.
- Menjadikan baris pengaturan atau save bar komponen `@ds/ui` (aturan 3x belum terpenuhi).
- Edit Dashboard yang belum di-commit di working tree: tidak ikut commit CR ini.

## Tasks (jalur small-fix)

- [x] Pindahkan data nav, indeks pencarian, dan resep ke `_lib/`.
- [x] Bangun bingkai: sidebar kedua, panel, baris pengaturan; hapus `Tabs`, `Card`, `Banner`, `Skeleton`, `Select` navigasi yang tak terpakai.
- [x] Dirty-state Profile dan General: penanda baris, nilai lama, save bar, status diumumkan.
- [x] Validasi avatar dan nama workspace; hubungkan semua pesan error ke kontrolnya.
- [x] Pencarian + empty state.
- [x] Drill-in mobile dengan pengelolaan fokus.
- [x] Dua section di bawah demo; perbarui copy.
- [x] Tulis `page.test.tsx`: draft awal + save bar; Discard; Save invalid; navigasi `aria-current`; pencarian (hasil dan kosong); undang member duplikat; konfirmasi `DELETE`.
- [x] Preview before/after light, dark, mobile untuk keenam panel (`~/Projects/monorepo-bootstrap-audit/tools/shot2.mjs`), screenshot dibaca sebagai image.
- [x] Cek keyboard di browser: nav, pencarian, drill-in, dialog.
- [x] Verifikasi targeted (`vitest run patterns/settings`, eslint), lalu typecheck → lint → test; build dari salinan sementara.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Koheren = art direction, type scale, token, komponen `@ds/ui`; susunan mengikuti karakter halaman. | Arahan user 2026-11-27. |
| 2 | Satu bingkai dengan sidebar kedua, menggantikan dua kartu + `Tabs`. | Menyelesaikan temuan 1, 2, 4 sekaligus. |
| 3 | Pengelompokan Account vs Workspace; Appearance masuk Account. | Tema dan art direction disimpan per browser (`theme-provider.tsx`), bukan per workspace. |
| 4 | Cara simpan ditulis di kepala panel, bukan section penjelasan terpisah. | Informasi dekat dengan tindakannya (D2.7). |
| 5 | Judul panel memakai `h2` `text-xl` manual, bukan `SectionHeading`. | Judul UI demo, bukan section docs; ukuran 24px akan bersaing dengan h1 (D2.4). |
| 6 | Tanpa simulator State. | Draft awal sudah memperlihatkan state inti; kontrol simulasi menambah lapisan di luar aplikasi. |
| 7 | Tidak mengubah `packages/ui`. | Satu CR satu halaman; API publik tetap. |

## Design System Checks

- [x] Tidak ada hex/RGB hardcode; memakai token semantik.
- [x] Kontras light dan dark lolos WCAG AA, termasuk penanda `highlight` (non-teks, ≥3:1).
- [x] Perilaku Radix/a11y tidak rusak; fokus terlihat pada nav, hasil pencarian, dan save bar.
- [x] API `cva` dan export tetap konsisten (tidak ada perubahan).
- [x] State loading, empty, dan error relevan tersedia.
- [x] Mobile tanpa scroll horizontal; target sentuh memadai.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-098-patterns-settings-page` (dari `pattern-polish`)
Commit: `fix: redesign patterns settings page [CR-098]`

- [x] CR disetujui user (termasuk 6 perubahan perilaku demo) — 2026-11-27.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.

## Hasil implementasi (2026-11-27)

Disetujui user sebelum kode ditulis ("setuju jalankan sesuai rekomendasi"):

- Perubahan perilaku ke-7: tombol "Verify & enable" selalu aktif, sehingga error OTP dapat muncul.
- `InputOTP` tidak meneruskan `aria-describedby`; atributnya dipasang ke tiap input lewat `ref` dari halaman, tanpa mengubah `packages/ui`.
- Save bar hanya untuk panel yang sedang dibuka; draft panel lain ditandai titik di nav.

Penyesuaian kecil yang ditemukan saat implementasi, semuanya di folder halaman ini:

- Menutup dialog 2FA mengembalikan fokus ke switch (sebelumnya jatuh ke `body`).
- Field terfokus yang tertutup save bar digulir ke tengah.
- Setelah Save/Discard, fokus pindah ke judul panel.
- Update password yang invalid memfokuskan field pertama yang salah.
- Mengeklik pilihan Color scheme yang sudah aktif tidak lagi mengosongkan tema.
- Dialog hapus memakai nama workspace tersimpan, bukan teks tetap.

Verifikasi:

- Test halaman 15/15; guard visual-language 5/5; typecheck dan lint hijau (4 warning lama di `lightbox.test.tsx`).
- Suite penuh: showcase 168/168, tokens 10/10, ui 750/750. Satu run ulang gagal 749/750 pada smoke RTE 006-05 AC-01 (flaky lama), lalu lolos 750/750.
- `next build` dari salinan sementara hijau; setelah itu hanya satu class target sentuh pada tombol Invite yang berubah (dicek ulang dengan test, typecheck, eslint).
- Browser (Chrome headless): keyboard pada nav, pencarian, drill-in, dan dialog di 1440×900, 1440×600, 390×700; tanpa scroll horizontal; kontras `highlight` terhadap `card` minimum 4,06:1 di semua tema dan art direction.
- Belum diuji: pembaca layar native dan perangkat sentuh nyata. Input dan select memakai tinggi bawaan design system (36px).
- Screenshot: `~/Projects/monorepo-bootstrap-audit/patterns/audit/shots-cr098-before/` dan `shots-cr098-after/`.

Temuan di luar scope:

- Menghapus member membuat fokus jatuh ke `body`.
- `InputOTP` (`@ds/ui`) perlu meneruskan `aria-describedby`/`aria-invalid` ke input (bahan CR komponen).
