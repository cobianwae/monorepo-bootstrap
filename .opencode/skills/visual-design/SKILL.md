---
name: visual-design
description: Prinsip visual untuk design system — visual hierarchy, typography scale, spacing rhythm, layout, dan dark mode parity berbasis tokens
tags: [design-system, visual, design, typography, hierarchy, spacing, dark-mode]
compatibility: [next, opencode, claude, cursor]
---

# Visual Design System

## Kapan Pakai
Saat membuat layout baru, halaman showcase, atau komponen yang menuntut estetika (marketing, landing, data-viz). Layer visual DI ATAS pola interaksi (`ux-patterns`) dan token (`design-tokens`).

## Sumber Style

Semua nilai visual datang dari tokens, bukan tebakan:
- **Warna**: token semantik di `@theme` — `bg-primary`, `text-muted-foreground`, `border-border`, `bg-card`, `bg-highlight`, `bg-highlight-soft`
- **Radius**: `--radius-xs` s/d `--radius-full` (0.125rem s/d 9999px)
- **Font**: `--font-display` (Space Grotesk) untuk heading, `--font-sans` (Inter) untuk body, `--font-mono` (JetBrains Mono) untuk code/angka
- **Easing/Duration**: `--ease-spring`, `--duration-fast/normal/slow`
- **Z-index**: token `--z-*`, jangan hardcode `z-9999`

## Visual Hierarchy

1. **Satu ide utama per screen** — heading paling dominan, sisanya mengecil
2. **Skala typographic**: display (heading besar) → body (teks utama) → caption (meta/helper). Ukuran relatif, konsisten di seluruh app
3. **Kontras sebagai alat**: teks terpenting pakai `foreground`, sekunder `muted-foreground`
4. **Spacing rhythm**: gunakan spacing scale konsisten (gap-4, space-y-4/6/8/10) — jangan nilai random
5. **Isolasi**: elemen yang paling penting dibuat berbeda (warna/ukuran), bukan semua menonjol

## Layout Principles

- Container: gunakan `layout/container.tsx` untuk max-width konsisten
- Page shell: `layout/page-shell.tsx` + `layout/page-header.tsx`
- Whitespace: beri ruang antar section (space-y-10 dsb), jangan padat berlebihan
- Grid: `grid-cols-1` mobile → `sm/lg` breakpoint scaling (lihat pola `page-skeleton.tsx`)
- Alignment & margin: konsisten — gunakan utility yang sudah ada, jangan inline style

## Dark Mode Parity

- Kedua mode WAJIB dicek secara visual
- Jangan hardcode warna "untuk dark mode" — semua lewat token yang sudah punya varian dark
- Uji kontras teks di dark mode (sering gagal di dark — periksa dengan `accessibility` skill)
- Test manual: toggle via `theme-provider`/`palette-switcher` di showcase untuk tiap tema

## Motion & Micro-interaction

- Durasi pakai token: `duration-150/250/400` (fast/normal/slow)
- Easing spring untuk playful, smooth untuk formal
- Motion WAJIB bisa dinonaktifkan (prefers-reduced-motion) — kurangi transisi jika diaktifkan
- Jangan animasi yang menggangu fokus/reading

## Data Visualization

- `chart.tsx` di `data-display` sudah pakai token chart (`--color-chart-1` s/d `chart-5`)
- Pastikan label, legend, dan value punya kontras cukup
- Sediakan `chart-a11y-table.tsx` untuk aksesibilitas data (audit dengan `accessibility`)

## Anti-Patterns

- ✗ Hex/hardcode warna — harus token
- ✗ Font size acak di luar skala
- ✗ Spacing tidak konsisten (margin manual random)
- ✗ Dark mode tidak diperiksa
- ✗ Motion tanpa prefers-reduced-motion
- ✗ Semua elemen menonjol (no hierarchy)

## Integration with Other Skills

### Batas dengan `visual-designer`

- `visual-design` adalah referensi prinsip visual: hierarchy, typography, spacing, color, motion.
- `visual-designer` memiliki alur arah visual (`/design-language`) dan uplift (`/polish-ui`), termasuk `docs/design/visual-language.md` dan CR per cluster.
- Gunakan `visual-design` saat butuh prinsip; gunakan `visual-designer` saat butuh keputusan dan eksekusi visual end-to-end.

- **Sebelum**: `product-ux` (brand & positioning), `design-tokens` (warna/typography)
- **Selama**: `ux-patterns` (states), `ui-component` (implementasi)
- **Setelah**: `accessibility` (kontras & focus), `ux-research` (visual validation)

## Checklist

1. [ ] Semua warna dari token
2. [ ] Skala typographic & spacing konsisten
3. [ ] Hierarchy jelas (1 ide utama)
4. [ ] Dark mode parity terverifikasi
5. [ ] Motion pakai token + reduced-motion
6. [ ] Chart/visualisasi punya alternatif teks/a11y