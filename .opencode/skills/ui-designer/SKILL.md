---
name: ui-designer
description: Poles kode UI yang sudah terimplementasi di packages/ui dan apps/showcase — hierarki, spacing, warna semantik, konsistensi komponen, state, microcopy, dan a11y dasar. Gunakan saat /improve-ui.
tags: [design-system, ui, polish, components, showcase, cr]
compatibility: [next, opencode, claude, cursor]
---

# UI Designer

## Kapan Pakai

Saat `/improve-ui`, untuk memperbaiki tampilan yang **sudah ada**.
Bukan untuk membangun komponen baru dari nol dan bukan untuk menentukan arah visual global.

## Scope

- `packages/ui/src/components/**`
- `apps/showcase/src/**`
- `packages/tokens` hanya bila perbaikan visual membutuhkan token yang sudah ada.

Jangan mengubah `apps/web` atau `apps/api` tanpa scope eksplisit.

## Audit Dimensions

1. **Hierarki visual** — fokus utama jelas, tidak semua elemen bersaing.
2. **Spacing & tipografi** — skala konsisten, density wajar, line length nyaman.
3. **Warna semantik** — token yang benar, bukan hex/RGB, light/dark parity.
4. **Konsistensi komponen** — varian, radius, border, shadow, focus ring.
5. **State & feedback** — empty, loading, error, success, disabled, hover, focus.
6. **Microcopy** — bahasa Indonesia yang jelas, tidak generik.
7. **A11y dasar** — kontras, focus-visible, target 44px, label, error tidak hanya warna.

## Cara Menyajikan Temuan

Setiap temuan harus punya:

- lokasi `path:line`,
- dampak ke user,
- rekomendasi konkret,
- contoh perubahan JSX/Tailwind bila membantu.

Contoh:

```tsx
// Sebelum
<div className="text-gray-500">Tidak ada data</div>

// Sesudah
<EmptyState
  title="Belum ada data"
  description="Tambahkan data pertama untuk memulai."
  action={<Button>Tambah data</Button>}
/>
```

Jangan menulis ulang seluruh file; tunjukkan diff yang relevan.

## Diskusi Sebelum CR

1. Ringkas temuan per cluster.
2. Tanyakan prioritas dan batas scope.
3. Baru buat draft CR per cluster.
4. Index di `docs/BACKLOG.md`.
5. Jangan edit kode sebelum CR `approved`.

## CR Template

Ikuti `docs/cr/TEMPLATE.md`, dengan tambahan:

- daftar komponen/route yang terpengaruh,
- before/after,
- cek light/dark,
- cek state,
- cek test yang perlu diperbarui.

## Execution Protocol

Setelah CR approved:

1. Buat branch `cr-NNN-slug`.
2. Implement per cluster, bukan sekaligus.
3. Verifikasi:
   - `pnpm typecheck`
   - `pnpm lint`
   - `pnpm test`
   - `pnpm -C apps/showcase build` bila route/visual berubah.
4. Update CR, `docs/BACKLOG.md`, dan `docs/STATUS.md`.
5. Commit `type: deskripsi [CR-NNN]`.

## Boundaries

- **`ui-component`** — membangun komponen baru.
- **`ui-designer`** — memperbaiki tampilan komponen/halaman yang sudah ada.
- **`visual-designer`** — arah visual global dan uplift showcase.
- **`designer`** — spec desain sebelum implementasi.
- **`ui-ux-auditor`** — audit read-only, bukan perbaikan.

## Anti-Patterns

- ✗ Mengubah arah visual global di command ini.
- ✗ Menambah dependency untuk perbaikan kosmetik.
- ✗ Hardcode warna.
- ✗ Memperbaiki satu layar tanpa mengecek pola serupa.
- ✗ Edit sebelum CR approved.
- ✗ Mengabaikan light/dark.

## Integration

- **Sebelum**: `visual-design`, `design-tokens`, `ux-patterns`, `accessibility`.
- **Sesudah**: `reviewer`, `ui-ux-auditor`, `/polish-ui` bila butuh arah visual.
