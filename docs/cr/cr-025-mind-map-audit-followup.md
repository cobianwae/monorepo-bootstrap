# CR-025 — Mind Map: tindak lanjut audit halaman (target sentuh, grup aksi, pre keyboard, cakupan test)

**Status:** done

User menetapkan `done` dan mengizinkan push CR-022–028 serta merge/push `dev` (2026-11-22); penutupan bersama dicatat di branch CR-028.
**Sumber:** audit ui-ux-auditor `/audit` scope `apps/showcase/src/app/(docs)/patterns/mind-map/`
**Ref:** `docs/prd/012-mind-map.md` (FR-005/FR-009), `apps/showcase/src/app/(docs)/patterns/mind-map/page.tsx`, `apps/showcase/src/app/(docs)/patterns/mind-map/page.test.tsx`

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:143` | Tombol "Salin resep" hanya `h-9` (36px), di bawah standar sentuh 44px; satu-satunya tombol halaman tanpa `min-h-11`. | Tambah `className="min-h-11"` agar sejajar tombol demo lain. |
| 2 | minor | `page.tsx:110` | "Muat 50 node" (aksi pemuatan data) berada di grup `role="group" aria-label="Status demo"` dengan varian `ghost` identik toggle status; SR mengumumkan 7 opsi status padahal satu di antaranya aksi. | Pindahkan ke grup "Tampilan demo" dengan varian `outline`, atau beri `aria-label` eksplisit "Muat contoh 50 node". |
| 3 | minor | `page.tsx:142` | Blok resep `<pre>` `overflow-x-auto` tanpa `tabindex` — pengguna keyboard tidak bisa scroll horizontal di viewport sempit (WCAG 2.1.1). | Tambah `tabIndex={0}` + `aria-label="Contoh kode integrasi MindMap"`. |
| 4 | minor | `page.test.tsx:1-63` | Celah cakupan untuk CR-024: tidak ada assert placeholder, `aria-describedby`, daftar keyboard `<ul>`/`<kbd>`, `disabled` input saat Invalid/Loading, label "Peta mini", alur salin resep. | Tambah 2–3 test ringan (placeholder + `aria-describedby`; input disabled saat Invalid; feedback salin). |

## Perubahan yang Diusulkan

- Hanya `page.tsx` (3 baris area: tombol salin, grup "Muat 50 node", `<pre>` resep) + `page.test.tsx` (assert baru).
- Tanpa dependency, token, atau API publik baru. Label visual tidak berubah kecuali posisi/varian tombol.
- Komponen/route terpengaruh: route `/patterns/mind-map` (section demo, resep integrasi).

### Before / After (sketsa)

```tsx
// Sebelum
<Button variant="outline" onClick={...}>Salin resep</Button>
<pre className="... overflow-x-auto ..."><code>{RECIPE}</code></pre>

// Sesudah
<Button variant="outline" className="min-h-11" onClick={...}>Salin resep</Button>
<pre tabIndex={0} aria-label="Contoh kode integrasi MindMap" className="... overflow-x-auto ..."><code>{RECIPE}</code></pre>
```

## Tasks (jalur small-fix)

- [x] Tombol "Salin resep" `min-h-11` (temuan 1).
- [x] Regroup/relabel "Muat 50 node" (temuan 2).
- [x] `<pre>` resep focusable + label (temuan 3).
- [x] Tambah assert CR-024 + temuan ini di `page.test.tsx` (temuan 4).
- [ ] Verifikasi: `pnpm -C apps/showcase test mind-map`, lint, typecheck, build.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Approved user; branch dari cr-024. | Urutan eksekusi sesuai permintaan. |
| 2 | Temuan 2: tetap di grup status, tambah `aria-label="Muat contoh 50 node"` eksplisit (bukan pindah grup). | Pindah grup mengubah layout demo; label eksplisit cukup membedakan aksi vs toggle bagi SR dengan churn minimal. |
| 3 | Test `disabled` diubah menjadi assert unmount: input cari tidak dirender saat Loading/Invalid (early return `mind-map.tsx:1729,1760` tanpa `searchSlot`), hadir + enabled saat Berisi. | `disabled` tidak pernah terlihat karena input unmount — test assert perilaku aktual, bukan prop mati. Perilaku unmount itu sendiri di luar scope (komponen, bukan halaman). |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA.
- [ ] Perilaku Radix/a11y tidak rusak.
- [ ] API `cva` dan export tetap konsisten.
- [ ] State loading, empty, dan error relevan tersedia.
- [ ] Showcase/docs diperbarui bila perlu.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

- Cek light/dark: tombol salin, `<pre>` fokus ring di kedua mode.
- Cek state: salin sukses/gagal, input disabled Invalid/Loading.
- Cek test: `page.test.tsx` — assert baru hijau, 3 test lama tetap hijau.

## Eksekusi

Branch: `cr-025-mind-map-audit-followup`
Commit: `fix: tindak lanjut audit halaman mind map [CR-025]`

- [x] CR disetujui user.
- [x] Branch dibuat.
- [x] Perubahan diimplementasikan.
- [x] Verifikasi dijalankan.
- [x] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [x] `docs/STATUS.md` diperbarui bila relevan.
- [x] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
