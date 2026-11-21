# Conventions

## Naming

| Objek | Aturan | Contoh |
|---|---|---|
| File/folder | kebab-case | `data-table.tsx`, `empty-state.tsx` |
| Komponen | PascalCase | `DataTable`, `EmptyState` |
| Hook | camelCase, prefix `use` | `useToast` |
| Variabel/fungsi | camelCase | `isOpen`, `formatDate` |
| Tipe/interface | PascalCase | `DataTableProps` |
| Token CSS | kebab-case semantik | `--color-muted-foreground` |
| Varian `cva` | kebab-case | `variant: 'destructive'` |
| Branch | kebab-case | `012-01-data-table`, `cr-003-focus-ring` |
| File docs | kebab-case | `object-model.md`, `cr-003-focus-ring.md` |

## Struktur Komponen

```text
packages/ui/src/components/<kategori>/<nama>.tsx
packages/ui/src/components/<kategori>/<nama>.test.tsx
```

Kategori: `base`, `form`, `data-display`, `feedback`, `navigation`, `overlay`, `layout`, `marketing`, `dnd`.

Aturan:

- Named export; tidak memakai default export.
- Props di-destructure di parameter.
- Tidak ada `any`; gunakan `unknown` lalu narrow atau generic.
- Test co-located untuk perilaku penting.
- Export lewat `packages/ui/src/index.ts`.
- Ikuti pola file existing di kategori yang sama.

## Token

- Hanya OKLCH untuk warna; nilai warna hidup di CSS variable light/dark.
- Nama token semantik, bukan literal: `primary`, `muted`, `destructive`, `success`, `warning`, `info`.
- Setiap foreground wajib punya pasangan background yang lolos kontras.
- Jangan menambah token duplikat; cek `tokens.css` dan `tokens.ts` lebih dulu.
- Perubahan token wajib disertai audit kontras light dan dark.

## Visual (halaman docs showcase)

Rujukan: `docs/design/visual-language.md`.

- Dilarang `text-[Npx]`; teks terkecil `text-xs`.
- Heading section lewat `SectionHeading` (`apps/showcase/src/components/section-heading.tsx`), bukan class manual.
- `primary` hanya untuk aksi; aksen dekoratif dan callout memakai `highlight`.
- Segmented/toggle memakai `SegmentedControl` dari `@ds/ui`; jangan menulis ulang dengan `<button>`.
- Klaim kepatuhan (WCAG, jumlah langkah scale) dihitung dari data token, bukan ditulis tangan.

## Commit

Format:

```text
type: deskripsi [NNN-MM]
type: deskripsi [CR-NNN]
```

Tipe: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`.

Contoh:

```text
feat: tambah varian compact pada data table [012-01]
fix: perbaiki focus ring dialog [CR-003]
chore: tambah config opencode
```

## Verifikasi

Urutan wajib:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

Tambahan sesuai scope:

```bash
pnpm test:tokens                  # perubahan token/kontras
pnpm -C apps/showcase build       # perubahan showcase/route
```

Jika baseline sudah gagal sebelum perubahan, catat sebagai known issue; jangan perbaiki di luar scope.

## Butuh Konfirmasi

Jangan lakukan tanpa persetujuan eksplisit:

- Menambah dependency baru.
- Mengubah API publik komponen (`props`, nama export, perilaku varian).
- Menghapus atau mengganti nama token.
- Mengubah arah dependency antar-package.
- Mengubah konfigurasi build, lint, atau TypeScript root.
- Format massal di luar file yang disentuh.
- Menghapus artefak docs yang sudah approved/shipped.

## Bahasa

- Dokumen, PRD, story, CR, dan komentar produk: Bahasa Indonesia.
- Identifier, nama file, nama komponen, tipe, dan commit: Bahasa Inggris.
