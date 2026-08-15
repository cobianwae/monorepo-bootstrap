---
name: design-tokens
description: Mendefinisikan dan memelihara design tokens - OKLCH color system, kontras WCAG AA/AAA, skala tipografi, spacing, radius, dan motion
tags: [design-system, tokens, css, colors, oklch, wcag]
compatibility: [next, opencode, claude, cursor]
---

# Design Tokens

## Kapan Pakai
Saat membuat, mengubah, atau memperluas design tokens (warna, kontras, tipografi, spacing, radii, bayangan, atau transisi) di `packages/tokens`.

## Aturan Utama
1. **Gunakan OKLCH untuk Warna**: Warna didefinisikan dalam format `oklch(lightness chroma hue)` untuk konsistensi persepsi visual.
2. **WCAG 2.1 Contrast Guarantee**:
   - Teks normal vs background: Rasio kontras $\ge 4.5:1$ (Level AA), target $\ge 7.0:1$ (Level AAA).
   - Elemen UI, border, dan teks besar: Rasio kontras $\ge 3.0:1$ (Level AA Large).
   - Jangan pernah hardcode warna hex langsung di komponen UI — selalu gunakan semantic token (`--primary`, `--background`, `--card`, `--muted`, dll).
3. **Dual-Theme Parity**: Setiap token warna di `:root` (light) WAJIB memiliki pasangan yang sesuai di `.dark` dengan rasio kontras yang diaudit.
4. **4px Spacing Rhythm**: Spacing scale mengikuti kelipatan 4px (`0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`, dll).
5. **Automated Contrast Audit**: Jalankan `pnpm test:tokens` setiap kali ada penambahan atau perubahan warna untuk memastikan tidak ada regresi kontras.

## Struktur File
```
packages/tokens/
  src/
    tokens.css      # Definisi CSS @theme & CSS Variables (:root dan .dark)
    tokens.ts       # Mirror TypeScript untuk konstanta & tipe
    contrast.ts     # Formula kalkulasi relative luminance & WCAG ratio
    contrast.test.ts # Vitest suite pengujian rasio kontras
    index.ts        # Barrel export
```

## Checklist
1. [ ] Token warna baru memiliki nilai untuk light dan dark mode
2. [ ] Rasio kontras foreground/background $\ge 4.5:1$
3. [ ] Didaftarkan di `COLOR_TOKENS` pada `tokens.ts`
4. [ ] Ditambahkan ke test case `auditSemanticTokenPairs()` di `contrast.ts`
5. [ ] `pnpm test:tokens` lolos tanpa error
