---
name: ui-component
description: Implementasi komponen UI di packages/ui — pola shadcn/ui (Radix + cva + cn), struktur folder, barrel export, co-located test, dan verification commands
tags: [design-system, ui, component, radix, cva, implementation, packages]
compatibility: [next, opencode, claude, cursor]
---

# UI Component Implementation

## Kapan Pakai
WAJIB sebelum membuat atau mengubah komponen di `packages/ui`. Panggil setelah `product-ux` (framing BA) dan `ux-patterns` (pola interaksi). Gunakan bersama `design-tokens` (warna/spacing) dan `accessibility` (a11y).

## Lokasi & Struktur

Komponen tinggal di `packages/ui/src/components/<category>/`. Kategori yang ada:

| Kategori | Isi | Contoh file |
|----------|-----|-------------|
| `base` | Primitif & atom | `button.tsx`, `input.tsx`, `badge.tsx`, `skeleton.tsx`, `switch.tsx`, `tabs.tsx`, `tooltip.tsx` |
| `form` | Input kompleks | `select.tsx`, `combobox.tsx`, `date-picker.tsx`, `tag-input.tsx`, `filter-builder.tsx`, `stepper.tsx` |
| `overlay` | Popover/sheet/hover-card | `sheet.tsx`, `popover.tsx`, `hover-card.tsx` |
| `navigation` | Nav & menu | `navbar.tsx`, `sidebar.tsx`, `breadcrumb.tsx`, `pagination.tsx`, `command-palette.tsx` |
| `data-display` | Table/chart/stat | `table.tsx`, `data-table.tsx`, `chart.tsx`, `stat-card.tsx`, `timeline.tsx` |
| `feedback` | Alert/dialog/toast/empty | `empty-state.tsx`, `error-page.tsx`, `toaster.tsx`, `banner.tsx` |
| `layout` | Shell & structure | `page-shell.tsx`, `page-skeleton.tsx`, `container.tsx`, `skip-link.tsx` |
| `dnd` | Drag & drop | komponen berbasis `@dnd-kit` |
| `marketing` | Landing/marketing | hero, feature sections |

**Aturan folder:**
- Kebab-case filename: `filter-builder.tsx`
- Test co-located: `filter-builder.test.tsx` di folder yang sama (bukan folder `__tests__`)
- Komponen dan test diekspor? **Tidak** — test cukup ada sebagai file, jangan di-barrel

## Pola Kode (WAJIB Ikuti)

Pola dasar shadcn/ui — tiru `button.tsx`:

```tsx
import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva('...base classes...', {
  variants: { variant: {...}, size: {...} },
  defaultVariants: { variant: 'default', size: 'default' },
});

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
```

**Checklist kode:**
- [ ] Menggunakan Radix primitive untuk a11y (kalau komponennya non-trivial) — cek dulu package tersedia di `packages/ui/package.json`; kalau belum, tambahkan dependency
- [ ] Varian visual pakai `cva`, bukan string ternary bersarang
- [ ] Class merging pakai `cn()` dari `../../lib/utils` — jangan pakai template string manual
- [ ] Props di-destructure **di parameter**, bukan di body function
- [ ] Pindahkan teks/ikon ke props dengan default yang masuk akal (testable + reusable)
- [ ] Loading state: `Loader2` + `animate-spin`, nonaktifkan interaksi saat loading (`disabled`)
- [ ] Focus ring selalu ada: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`
- [ ] No `any` — gunakan `unknown` + narrowing, atau generic
- [ ] Ikon pakai `lucide-react` (sudah dipakai repo)

## Token & Styling

- Warna WAJIB dari token: `bg-primary text-primary-foreground`, `border-border`, `bg-card`, dll — **dilarang** hex langsung
- Radius dari scale: `rounded-md`, `rounded-lg`, `rounded-full`
- Motion dari token: `duration-200`, `transition-all`, `ease-*`
- Jangan tambah spacing/kontras manual di luar scale tokens
- Gunakan `@source "./components"` di styles.css sudah mencakup folder components

## Barrel Export

`packages/ui/src/index.ts` adalah satu-satunya entry point publik. Setiap komponen baru WAJIB ditambahkan:

```ts
export * from './components/<category>/<component>';
```

Urutan di barrel mengikuti pola existing (grouping per kategori sudah ada — ikuti posisinya).

## Test (Vitest + Testing Library)

- Setiap komponen baru WAJIB punya test co-located
- Pola yang dipakai repo: render + assert behavior (lih. `button.test.tsx`, `combobox.test.tsx`)
- Fokus: props/variant render, event handler, disabled/loading state
- Kalau komponen pakai Radix context, pakai helper render dari `src/test/setup.ts`

## Verification Commands

Jalankan SEMUA sebelum selesai:

```bash
pnpm --filter @ds/ui lint
pnpm --filter @ds/ui test
pnpm --filter @ds/ui build:types
```

## Anti-Patterns

- ✗ Komponen tanpa test
- ✗ Styling hardcode warna/hex (harus token)
- ✗ Props tidak di-destructure di parameter
- ✗ Bikin ulang primitif Radix (accordion, dialog, dll) padahal sudah ada di package.json
- ✗ Duplikasi komponen yang sudah ada (cek dulu di folder kategori)
- ✗ Pakai `any` / `@ts-ignore`

## Integration with Other Skills

### Batas dengan `ui-designer`

- `ui-component` dipakai untuk membangun komponen baru atau mengubah kontrak komponen.
- `ui-designer` dipakai untuk poles UI yang sudah terimplementasi (hierarchy, spacing, warna semantik, state, microcopy) tanpa mengubah API publik.
- Jika poles menyentuh API publik, naikkan ke `ui-component` dan minta konfirmasi.

- **Sebelum**: `product-ux` (framing fitur), `ux-patterns` (pola interaksi & states)
- **Selama**: `design-tokens` (warna/spacing), `accessibility` (a11y), `visual-design` (hierarchy)
- **Setelah**: `accessibility` (audit), `ux-research` (validasi kalau perlu)

## Checklist

1. [ ] Kategori folder tepat & kebab-case
2. [ ] Radix + cva + cn + props di parameter
3. [ ] Token untuk semua styling
4. [ ] Loading/disabled state ada
5. [ ] Focus ring & a11y ok
6. [ ] Test co-located
7. [ ] Barrel export ditambahkan
8. [ ] `lint`, `test`, `build:types` hijau