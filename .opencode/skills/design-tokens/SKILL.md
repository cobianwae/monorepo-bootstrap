---
name: design-tokens
description: Design tokens di packages/tokens — OKLCH color space, CSS @theme directives, contrast ratio validator, light & dark mode parity, dan penambahan token baru
tags: [design-system, tokens, oklch, color, contrast, wcag, themes, css]
compatibility: [next, opencode, claude, cursor]
---

# Design Tokens & Theming

## Kapan Pakai
Sebelum menambah/mengubah warna, radius, font, spacing, atau tema di design system. Wajib dipanggil untuk setiap audit kontras dan pembuatan tema baru.

## Lokasi & Struktur

`packages/tokens/src/` berisi:

| File | Peran |
|------|-------|
| `tokens.css` | `@theme` directive — seluruh design tokens (warna, radius, font, easing, duration, z-index) |
| `tokens.ts` | Ekspor token sebagai data TypeScript |
| `themes.ts` | Definisi tema (`pulse`, `sunset`, `botanic`, `midnight`, `nebula`, `lagoon`, `ink`, `graphite`) + pasangan kontras per tema |
| `art-directions.ts` | Art direction per tema |
| `contrast.ts` | Validator rasio kontras WCAG (`hexToRgb`, `contrastRatio`, `checkCompliance`) |
| `contrast.test.ts` | Unit test validator kontras |

Semua di-barrel via `src/index.ts`.

## Aturan Warna (WAJIB)

1. **OKLCH hanya via theme variable** — token di `@theme` memetakan ke CSS var (`--color-primary: var(--primary)`). Nilai sebenarnya hidup di variable CSS (light & dark).
2. **Dilarang hex/RGB langsung di komponen** — konsumsi hanya via token: `bg-primary`, `text-muted-foreground`, `border-border`, `text-destructive`, dll.
3. **Skema semantik**, bukan warna literal:
   - `primary` / `primary-foreground` — aksi utama
   - `muted` / `muted-foreground` — teks sekunder, disabled
   - `destructive` / `destructive-foreground` / `destructive-text` — error
   - `success`, `warning` (+`warning-text`), `info` — status
   - `highlight` / `highlight-soft` — aksen khusus
   - `background`, `foreground`, `card`, `popover`, `border`, `input`, `ring`, `overlay`
4. **Setiap warna foreground WAJIB punya pasangan background yang lolos kontras** (lihat validator).
5. **Light & dark mode parity** — kedua mode harus didefinisikan dan kontras dicek keduanya.

## Kontras WCAG (Audit Wajib)

Rasio minimum:
- **Normal text: AA ≥ 4.5:1**, AAA ≥ 7.0
- **Large text (≥18px / 14px bold): AA ≥ 3.0**, AAA ≥ 4.5
- UI component boundary (non-text): ≥ 3.0

Validator tersedia — pakai langsung:

```ts
import { contrastRatio, checkCompliance } from '@ds/tokens';

const ratio = contrastRatio('#ffffff', '#0a0a0a'); // number
const result = checkCompliance(foregroundHex, backgroundHex); // WcagCompliance
// result.passAA, result.passAALarge, result.passAAA, result.level
```

Untuk audit semua pasangan token, gunakan struktur `pairs` di `themes.ts` dan pastikan `passAA` untuk keduanya mode light & dark.

## Menambahkan Token Baru

1. Buka `tokens.css`, tambahkan di dalam `@theme { ... }` mengikuti pola existing
2. Tambahkan variable CSS light/dark di section tema (kalau warna)
3. Update `tokens.ts` bila token di konsumsi sebagai data
4. Untuk tema baru: tambahkan `ThemeDefinition` di `themes.ts` + masukkan ke `THEMES`, lengkap dengan `pairs` kontras
5. Update barrel bila menambah file baru
6. Tambahkan/update test di `contrast.test.ts` bila validator berubah

## Verification Commands

```bash
pnpm test:tokens                 # unit test validator kontras
pnpm --filter @ds/tokens lint
pnpm --filter @ds/tokens build:types
```

## Anti-Patterns

- ✗ Hex/rgb hardcode di komponen UI
- ✗ Nama warna literal (red, blue) — pakai skema semantik
- ✗ Menambah token tanpa audit kontras
- ✗ Light/dark hanya satu mode yang didefinisikan
- ✗ Duplikasi token yang sudah ada di `@theme`

## Integration with Other Skills

### Batas dengan `designer`

- `design-tokens` adalah panduan implementasi token dan audit kontras.
- `designer` menentukan kebutuhan token/desain sebelum implementasi (object model, state, theme).
- Perubahan nilai token kecil boleh lewat CR; penambahan/penghapusan token atau perubahan kontrak tema butuh konfirmasi.

- **Selama**: `ui-component` (konsumsi token di komponen), `visual-design` (typography/spacing scale)
- **Audit**: `accessibility` (checklist kontras menyeluruh)
- **Setelah**: `ux-research` (verifikasi preferensi dark mode users)

## Checklist

1. [ ] Warna OKLCH via CSS variable + @theme mapping
2. [ ] Setiap foreground punya pasangan background lolos AA (4.5:1) di light & dark
3. [ ] Skema semantik, bukan literal
4. [ ] Token diekspor di barrel
5. [ ] `pnpm test:tokens` hijau