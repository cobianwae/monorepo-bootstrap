---
name: ui-component
description: Konvensi pembuatan komponen UI di packages/ui berbasis Tailwind v4, Radix UI primitives, cva variants, dan barrel exports
tags: [design-system, ui, components, radix, cva, tailwind]
compatibility: [next, opencode, claude, cursor]
---

# UI Component

## Kapan Pakai
Saat membuat komponen UI baru atau memodifikasi komponen yang ada di `packages/ui/src/components/ui/`.

## Aturan Utama
1. **Radix Primitives**: Gunakan `@radix-ui/react-*` untuk komponen interaktif kompleks (Dialog, Popover, Select, DropdownMenu, Tooltip, Tabs) guna menjamin a11y keyboard dan ARIA semantics.
2. **Class Variance Authority (`cva`)**: Semua variasi visual (variant, size, state) dikelola menggunakan `cva` dan digabungkan melalui utility helper `cn(...)`.
3. **Polymorphism via `Slot` (`asChild`)**: Untuk tombol atau link, dukung prop `asChild?: boolean` menggunakan `@radix-ui/react-slot`.
4. **ForwardRef Support**: Semua komponen DOM-level WAJIB dibungkus `React.forwardRef` dengan `displayName` yang jelas.
5. **Colocation & Barrel Exports**: Setiap komponen diekspor secara rapi di `packages/ui/src/index.ts`.
6. **Zero Hardcoded Colors**: Gunakan utility Tailwind yang terhubung ke token (`bg-primary text-primary-foreground`, `border-border`, dll).

## Pola Dasar Komponen

```tsx
import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:opacity-95',
        outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 px-3 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
```

## Katalog Komponen Fondasi (Minimum Viable Set)

| Komponen | Direktori | Variants / Sizes | Catatan Implementasi |
|----------|-----------|------------------|----------------------|
| **Button** | `ui/button/` | default, secondary, destructive, outline, ghost, link; sm/default/lg/icon | Wajib loading state + `asChild` |
| **Input** | `ui/input/` | default, error | Support start/end adornment |
| **Textarea** | `ui/textarea/` | default, error | Native forwardRef, auto-resize opsional |
| **Select** | `ui/select/` | default, error | `@radix-ui/react-select` |
| **Checkbox** | `ui/checkbox/` | default | `@radix-ui/react-checkbox` |
| **Dialog** | `ui/dialog/` | default | `@radix-ui/react-dialog`, trap focus, close Esc |
| **Toast** | `ui/toast/` | default, destructive, success | Stackable, auto-dismiss, action support |
| **Badge** | `ui/badge/` | default, secondary, destructive, outline | Inline status visual |
| **Card** | `ui/card/` | default | Sub-komponen: Header, Title, Description, Content, Footer |
| **Skeleton** | `ui/skeleton/` | default | Pulse animation untuk loading layout |
| **Spinner** | `ui/spinner/` | sm, md, lg | SVG spinner + `aria-busy="true"` |
| **Avatar** | `ui/avatar/` | sm, md, lg | `@radix-ui/react-avatar` (Image + Fallback) |
| **Dropdown Menu** | `ui/dropdown-menu/` | default | `@radix-ui/react-dropdown-menu` |
| **Tabs** | `ui/tabs/` | default | `@radix-ui/react-tabs` |
| **Switch** | `ui/switch/` | default | `@radix-ui/react-switch` |

## Checklist
1. [ ] Komponen menggunakan `React.forwardRef`
2. [ ] Varian didefinisikan dengan `cva`
3. [ ] Menggunakan helper `cn()` untuk penggabungan kelas
4. [ ] Keyboard navigation dan focus rings terlihat jelas
5. [ ] Diekspor di `packages/ui/src/index.ts`
