# CR-095 — Patterns: satu keluarga visual lintas art direction

**Status:** draft
**Sumber:** audit uplift + diskusi user 2026-11-26
**Ref:** `docs/design/visual-language.md`, CR-093 (matriks route), CR-094 (komposisi)

## Temuan

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx:94–95,120–124` | Judul area docs diperlakukan sebagai CardTitle text-sm; Studio memakai SectionHeading untuk area demo. Penekanan area setara berbeda. | Bedakan heading docs vs label internal demo; heading docs mengikuti SectionHeading/font-display. |
| 2 | major | `apps/showcase/src/app/(docs)/patterns/dashboard/page.tsx:168–188`, `rich-text-editor/page.tsx:144–154` (direktori sama) | Pilihan periode memakai radio buatan sendiri, mode editor memakai Button highlight/outline. State pilihan memiliki bahasa visual berbeda. | Gunakan kontrol DS yang sesuai, termasuk SegmentedControl untuk pilihan segmented; audit keyboard dan role. |
| 3 | minor | `apps/showcase/src/app/(docs)/patterns/settings/page.tsx:419–458`, `rich-text-editor/page.tsx:93–126` (direktori sama) | Permukaan/card membedakan isi dengan logika yang berbeda; metadata, instruksi, dan demo mudah terlihat setara. | Konsistenkan peran surface, border, radius, padding, dan penekanan tanpa membingkai setiap section. |

## Perubahan yang Diusulkan

- Evaluasi semua 37 route pada CR-093 setelah struktur CR-094 stabil; edit hanya delta yang terbukti.
- Enam dimensi: komposisi/density, hierarki/fokus, tipografi, warna, depth/material, detail craft. Catat sekarang → arah per route/klaster.
- Docs memakai ritme root `space-y-10`, section `space-y-4 scroll-mt-20`, heading `SectionHeading`; interior demo tetap memiliki density sesuai tugas.
- Permukaan docs terbuka; area demo dibedakan secukupnya melalui spacing/surface existing. Kartu untuk kelompok isi, bukan pembungkus wajib berlapis.
- Font display/body/mono, motif, tone mengikuti art direction aktif. Hierarki, peran warna, spacing, state, dan motion tetap sama antar Atelier/Aurora/Blueprint.
- `primary` untuk aksi; `highlight` untuk identitas/aksen; status memakai token status. Teks kecil tetap terbaca; jangan menerapkan gradient/dekorasi ke semua halaman demi “art direction”.
- Rapikan ukuran/alignment ikon, posisi helper/metadata, wrapping toolbar, truncation, focus/hover, serta reduced motion.
- **Perubahan perilaku eksplisit:** mengganti pilihan manual Dashboard/RTE dengan SegmentedControl dapat mengubah role dan keyboard interaction. Pastikan pilihan/nilai/callback tetap setara, gunakan kontrak keyboard komponen DS, dan uji accessible name/fokus. Approval CR harus mencakup penggantian ini.
- Tidak mengubah API publik/default shared component. Bila kebutuhan berada di `packages/ui` atau scope font bersarang yang tercatat di STATUS, berhenti pada temuan dan mintakan persetujuan scope terpisah.

```tsx
<SectionHeading title="Interactive demo" />
{/* Label/metadata kecil: text-sm atau text-xs text-muted-foreground */}
{/* Permukaan demo existing: border-border bg-card; hindari frame berlapis */}
```

## Tasks (jalur small-fix)

- [ ] Setelah CR-094, audit delta enam dimensi dan simpan before/after per kelompok route dalam CR ini.
- [ ] Selaraskan heading, density, surface, warna/state, dan detail craft berdasarkan arah approved.
- [ ] Ganti kontrol segmented manual yang telah disetujui; uji keyboard, accessible name, dan perubahan nilai.
- [ ] Preview pilot RTE, Dashboard, Settings, dan Studio bersama user sebelum meluas ke route lain.
- [ ] Catat semua 37 route sebagai diubah/sudah sesuai beserta bukti; mutakhirkan lokasi final sebelum PR.

### Audit test dan bukti visual

- `apps/showcase/src/test/visual-language-guard.test.ts`: aturan heading tertentu dan small-text-highlight sudah mencakup docs; beberapa aturan ikon/callout/segmented masih foundations. Baca cakupan aktual, jangan menyatakan Patterns sama sekali tidak dijaga.
- Inventaris test route/helper ada pada CR-093; khusus `dynamic-form/page.test.tsx` mengassert heading, reduced motion, dan target sentuh; `rich-text-editor/page.test.tsx` menjaga reset/counter; smoke FlowEditor/MindMap menjaga interaksi editor.
- Saat mengganti kontrol Dashboard/RTE, tambahkan atau sesuaikan test perilaku keyboard/pilihan yang bermakna. Jangan menambah snapshot class massal.
- Bukti awal: Settings telah dilihat sebagai screenshot Atelier/Pulse dark desktop dan light viewport lebih sempit. Browser mengonfirmasi h1 Space Grotesk/body Inter. Ini bukan bukti font rusak atau audit seluruh palet.
- Screenshot awal tersimpan sementara di direktori sesi `/private/var/folders/88/r6r62nl52qscq62k_d4vxm980000gn/T/opencode/`: `patterns-settings.png`, `settings-light-ready.png`. Capture ulang baseline saat implementasi; file sementara tidak dianggap arsip permanen.
- Verifikasi final: semua route diperiksa pada light/dark; pilot mewakili form, dashboard, editor, canvas dibandingkan pada Atelier/Aurora/Blueprint, desktop dan mobile. Catat kombinasi yang benar-benar diuji dan keterbatasannya.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Arah visual approved tidak diubah. | Uplift menerapkan bahasa visual bersama, bukan menetapkan art direction baru. |
| 2 | CR-093 → CR-094 → CR-095; satu CR/branch saat eksekusi. | Memisahkan keputusan editorial, komposisi, dan polish sehingga perubahan dapat direview. |
| 3 | CR-080/081 tidak diduplikasi; hasil uplift lama menjadi baseline. | Evaluasi delta terhadap kode aktual, bukan mengulang audit lama. |
| 4 | Draft ini belum mendapat approval eksekusi. | User baru menyetujui arah dan pembuatan CR. |

## Design System Checks

- [ ] Token-first; kontras light/dark AA untuk pasangan yang disentuh.
- [ ] Art direction hanya mengubah kulit; hierarki/spacing/state tetap koheren.
- [ ] Radix/a11y, focus/hover, reduced motion, dan loading/empty/error terjaga.
- [ ] API `cva`/export terjaga; English copy mengikuti CR-093.
- [ ] Guard visual dan `pnpm typecheck`, `pnpm lint`, `pnpm test` pass.

## Eksekusi

Branch: `cr-095-patterns-visual-family`
Commit: `fix: unify patterns visual presentation [CR-095]`

- [ ] CR disetujui user termasuk perubahan kontrol; CR-094 diintegrasikan.
- [ ] Branch dibuat; perubahan diimplementasikan.
- [ ] Preview via `pnpm -C apps/showcase dev`; screenshot before/after dibaca sebagai image dan iterasi bersama user.
- [ ] Verifikasi targeted lalu typecheck → lint → test; smoke build dari salinan sementara bila dev server aktif. Jangan menghentikan server user.
- [ ] CR dimutakhirkan sebelum PR; tick → append STATUS-LOG → update BACKLOG/STATUS; check-status-log hijau.
