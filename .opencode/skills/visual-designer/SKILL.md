---
name: visual-designer
description: Arah visual dan uplift showcase — menyusun docs/design/visual-language.md, audit gap, screenshot best-effort, CR per cluster, dan selector audit. Gunakan saat /design-language atau /polish-ui.
tags: [design-system, visual, direction, uplift, showcase, cr]
compatibility: [next, opencode, claude, cursor]
---

# Visual Designer (uplift tampilan)

Filosofi: menaikkan baseline visual showcase dan komponen. Acuan adalah **arah visual yang dituju** (`docs/design/visual-language.md`, approved user) — BUKAN precedent tampilan yang ada. Selera desain bekerja bebas dalam koridor arah itu; tetap bukan redesign tanpa batas: tanpa perilaku/fitur/dependency baru.

Pembedaan dengan skill lain: `ui-designer` menjaga higiene & konsistensi terhadap baseline yang ada; `designer` menyusun artefak design untuk fitur baru; `visual-design` memuat prinsip dan referensi visual. Skill ini justru MENGUBAH baseline — rumuskan arah visual baru, lalu naikkan halaman ke arah itu.

## Mode

1. **Mode direction** (`/design-language`) — menyusun/mutakhirkan `docs/design/visual-language.md` (lihat struktur di bawah). Input: preferensi/referensi user + baseline tampilan saat ini.
2. **Mode uplift** (`/polish-ui`) `<layar|komponen|global>` — satu halaman/panel/modal/komponen (route atau path file), atau `global` = satu klaster pola lintas halaman (mis. semua page header, semua tabel, shell showcase). Mengaudit gap "sekarang vs arah" lalu menaikkan ke arah itu.

## Aturan dasar

1. Komponen/halaman live (story `done`/`review`) → JANGAN langsung edit kode. CR dulu; eksekusi & iterasi di branch setelah CR `approved`.
2. Layout bebas direstrukturisasi (komposisi, kolom, kepadatan, shell) SELAMA tanpa perilaku/fitur baru. Temuan yang menyentuh perilaku atau API publik `@ds/ui` (props, nama export, varian) wajib ditandai eksplisit "perubahan perilaku" di CR.
3. Tidak menambah dependency/library apa pun. Token-first: setiap keputusan visual harus bisa dipetakan ke token — existing, atau token baru lewat skill `design-tokens` dengan audit kontras.
4. Peran warna (`Color Roles` di `visual-language.md`) tetap berlaku sebagai peta makna; arah visual mendefinisikan CARA pakai warna sebagai desain — bukan mengganti maknanya.
5. Light/dark parity wajib; hormati `prefers-reduced-motion`; jangan menetapkan arah yang hanya bekerja di satu scenario atau satu art direction. Art direction mengubah **kulit** (font, motif, tone), bukan **struktur** (hierarki, spacing, peran warna, state, motion).
6. Jaga test: audit test co-located (`*.test.tsx`) dan smoke test yang meng-assert teks/role/struktur area yang diubah; sesuaikan di CR yang sama. Pagar `apps/showcase/src/test/visual-language-guard.test.ts` tetap hijau.
7. Halaman yang sudah di-uplift menjadi precedent baru — konsistensi (`ui-designer`) selanjutnya menyelaraskan ke arah ini.

## Dimensi audit (visual, bukan higiene)

1. **Komposisi & density** — proporsi area, grid/alignment, kepadatan informasi vs breathing room, lebar & batas konten.
2. **Hierarki & fokus** — ke mana mata melihat pertama; kontras ukuran/bobot antar level; aksi utama menonjol, sekunder redup; informasi penting tidak terkubur.
3. **Tipografi sebagai desain** — type scale nyata antar level, rhythm baris, panjang baris baca, bobot sebagai alat fokus.
4. **Warna sebagai desain** — aksen terkendali, tone keseluruhan, warna sebagai alat fokus/struktur, bukan dekorasi.
5. **Depth & material** — konsistensi radius/shadow/border, layering permukaan (background vs surface), pemisah section tanpa garis berlebihan.
6. **Detail craft** — ikonografi & ukurannya, alignment angka, whitespace mikro, truncation, keadaan hover/focus yang hidup, motion yang mendukung pemahaman.

## Struktur `docs/design/visual-language.md`

Sesuai dokumen yang ada: Tujuan; Prinsip; Art Direction (variable vs invariant); Type Scale (sumber `TYPOGRAPHY_SCALE` di `packages/tokens/src/tokens.ts`); Section Heading & Callout; Spacing & Density; Layout Patterns; Surfaces & Depth; Color Roles; State terpilih; Component Styling Targets; Motion (`MOTION_TOKENS`); Pagar Otomatis; Status (`draft`/`approved`) + Changelog.

- Klaim kepatuhan (WCAG, jumlah langkah scale, rasio kontras) dihitung dari data token, bukan ditulis tangan.
- Section bertanda ✔ sudah diputuskan; ○ belum dikunci. Hanya user yang menetapkan `approved`.

## Standar usulan

- Setiap temuan menyertakan **before/after deskriptif per area** (bukan hanya `file:line`): kondisi sekarang vs kondisi dituju, plus snippet JSX/Tailwind kunci untuk perubahan representatif.
- Perubahan level layout digambarkan sebagai struktur blok sederhana (sketsa ASCII) bila menjelaskan dengan teks sulit.
- Screenshot bukan bukti tunggal — verifikasi ke kode; estetika tidak boleh mengorbankan a11y.

## Audit kondisi nyata

- Best-effort: screenshot showcase (`pnpm -C apps/showcase dev`, port 4000) — simpan file screenshot dan **baca sebagai image** untuk melihat kondisi nyata serta membandingkan before/after; cek light dan dark.
- Jangan mematikan dev server user diam-diam. `next build` menimpa `.next` milik dev server — jangan jalankan keduanya bersamaan. Bila server tak bisa menyala, audit dari kode + wireframe.

## Proses

### Mode direction

1. Baseline: baca shell showcase + halaman representatif lintas jenis (foundations, komponen, pattern, scenario); screenshot bila memungkinkan.
2. Rumuskan draft arah per bagian — setiap keputusan disertai contoh konkret (nilai token/snippet), bukan prosa kosong.
3. **Fase diskusi** per bagian dengan user sampai arah sepakat → tulis doc status `draft` → mintakan approval (gate user) → `approved`. Setelah ini mode uplift bisa dijalankan.
4. Mutakhirkan arah yang sudah `approved` = mode direction lagi; perubahan arah besar → catat kebutuhan CR untuk halaman yang sudah di-uplift.

### Mode uplift

1. Prasyarat: `docs/design/visual-language.md` status `approved`. Bila belum ada → hentikan, arahkan ke mode direction dulu.
2. Identifikasi target: route → file komponen/halaman; mode `global`: inventory klaster pola lintas `packages/ui` dan `apps/showcase`.
3. Audit kondisi nyata (lihat bagian audit).
4. Audit per dimensi visual terhadap arah → daftar gap: area, dimensi, before/after, snippet kunci.
5. **Fase diskusi**: presentasikan before/after per area → diskusikan & sesuaikan sampai sepakat. JANGAN menulis CR sebelum arah perbaikan disetujui.
6. Klasterkan temuan yang berhubungan → tulis draft CR RINGKAS per klaster di `docs/cr/cr-NNN-slug.md` (template: `docs/cr/TEMPLATE.md`) + index di `docs/BACKLOG.md` status `draft`; cantumkan test terdampak.
7. Mintakan approval user per CR.
8. Setelah `approved`: eksekusi via `/implement docs/cr/cr-NNN-slug.md` di branch `cr-NNN-slug`. **Protokol iterasi**: terapkan → user preview via `pnpm -C apps/showcase dev` → iterasi bolak-balik di branch sampai user puas → mutakhirkan CR ke kondisi final (ringkasan file & `file:line` yang berubah) sebelum PR.

## Definisi selesai

- Direction: doc lengkap sesuai struktur, setiap keputusan punya contoh konkret, status naik ke `approved` hanya via gate user.
- Uplift: setiap temuan punya dimensi, area, before/after, dan snippet kunci; fase diskusi terjadi sebelum CR; draft CR ter-index; test terdampak ter-audit dan tercantum di CR; kode layar live belum tersentuh sebelum CR `approved`.
