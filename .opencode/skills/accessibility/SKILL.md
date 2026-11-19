---
name: accessibility
description: Audit dan implementasi aksesibilitas — WCAG 2.1 AA, keyboard navigation, focus management, ARIA via Radix, touch targets, dan contrast compliance
tags: [design-system, a11y, accessibility, wcag, keyboard, aria, inclusive]
compatibility: [next, opencode, claude, cursor]
---

# Accessibility (WCAG 2.1 AA)

## Kapan Pakai
Setiap pembuatan/editing komponen UI dan setiap kali melakukan audit. Wajib di akhir setiap task UI/UX. Juga dipakai saat mengaudit halaman/flow di showcase atau web.

## Prinsip Utama

A11y bukan trade-off — ini baseline. Baik untuk semua user. Auditing ada di: kontras, keyboard, focus, semantic HTML, ARIA, motion, dan touch target.

## Checklist WCAG 2.1 AA

### 1. Kontras (1.4.3, 1.4.11)
- Normal text: **≥ 4.5:1** (AA), large text: **≥ 3.0**
- UI component boundary / non-text: **≥ 3.0**
- Gunakan validator di `packages/tokens/src/contrast.ts`:
  ```ts
  import { checkCompliance } from '@ds/tokens';
  const c = checkCompliance('#fff', '#0a0a0a');
  c.passAA; // normal text
  c.passAALarge;
  ```
- Cek light & dark mode keduanya. Cek juga disabled state (masih harus minimal terbaca).

### 2. Keyboard (2.1)
- Semua interaktif dapat diakses keyboard: Tab/Shift+Tab, Enter/Space untuk activate
- Tidak ada keyboard trap
- Focus order logis (DOM order)
- Shortcut (kalau ada) harus bisa dimatikan atau punya alternatif

### 3. Focus Visible (2.4.7)
- Focus indicator jelas: `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- JANGAN hapus outline tanpa mengganti ring yang jelas
- Component with interactive children (accordion, tabs, combobox) harus kelola focus dengan benar

### 4. Semantic HTML & ARIA (4.1.2, 1.3.1)
- Elemen semantik: `<button>` untuk aksi, `<a>` untuk navigasi, heading berurutan
- Jangan pakai `div` dengan onClick — pakai `button` (atau Radix `Slot`/`asChild`)
- ARIA via Radix primitive otomatis (dialog, combobox, tabs, menu) — JANGAN tulis ARIA manual di atas primitif
- Ikon dekoratif: `aria-hidden="true"`; ikon informatif: `aria-label`

### 5. Forms (3.3.2, 3.3.1, 3.3.3)
- Label terkait input (`Label` dari `base/label.tsx` + `id`/`htmlFor`)
- Error message terkait (aria-describedby), dekat field, warna `text-destructive`
- Placeholder bukan pengganti label
- Error bukan hanya warna — sertakan teks/ikon

### 6. Touch Target (2.5.8 / WCAG guidance)
- Minimum **44×44px** untuk touch
- Cek `size: sm` variant (h-8 = 32px) — pastikan ada padding/coba perbesar atau beri jarak
- Dropdown/menu items pastikan target cukup besar

### 7. Motion (2.3.3)
- Kurangi animasi jika `prefers-reduced-motion` — bungkus transisi/animasi
- Semua motion dari token duration, tapi tetap hormati reduced-motion

### 8. Structure & Reading (1.3, 2.4)
- Heading hierarchy (h1 → h2 → h3) benar
- `SkipLink` (`layout/skip-link.tsx`) ada di app shell
- Data table: `aria-sort` / th scope, `chart-a11y-table` untuk chart

## Prosedur Audit (langkah demi langkah)

1. **Kontras**: jalankan script/validator `@ds/tokens` untuk semua pasangan foreground/background di `themes.ts` → pastikan `passAA` light & dark
2. **Keyboard walkthrough**: tab melalui seluruh komponen → semua reachable, focus terlihat, no trap
3. **Screen-reader check** (bila memungkinkan): dialog, combobox, menu via Radix — verifikasi announcement
4. **Reduced motion**: aktifkan prefers-reduced-motion → tidak ada animasi besar
5. **Zoom/scale**: perbesar viewport/zoom → layout tidak rusak (1.4.4, 1.4.10)
6. **Semantic check**: inspect heading order, button vs div, form labels

## Komponen yang Sering Bermasalah

| Komponen | Risiko | Cek |
|----------|--------|-----|
| Combobox | Kontrol listbox, filter | Keyboard nav, aria-expanded, focus |
| Dialog/Sheet | Focus trap | Focus awal, close on Esc, return focus |
| Date picker | Kalender kompleks | Keyboard nav tanggal, announcements |
| Tabs | Tab vs Tablist | Arrow keys, aria-selected |
| Table sortable | Header button | aria-sort, keyboard activate |
| Toast | Announcement | Live region, dismiss keyboard |
| Form error | Validation | aria-describedby, focus ke error |

## Anti-Patterns

- ✗ `outline: none` tanpa focus ring pengganti
- ✗ `div` onclick untuk aksi
- ✗ ARIA manual di atas Radix primitif
- ✗ Warna sebagai satu-satunya penanda (error/status)
- ✗ Placeholder jadi label
- ✗ Fokus tidak kembali ke trigger setelah dialog/overlay ditutup

## Integration with Other Skills

### Batas dengan `ui-ux-auditor`

- `accessibility` adalah panduan implementasi dan perbaikan a11y.
- `ui-ux-auditor` adalah audit read-only kode (via `/audit`) yang menghasilkan temuan `critical`/`warning` dengan `file:line`.
- Temuan audit yang disetujui dieksekusi lewat CR, bukan edit langsung.

- **Selama**: `ui-component` (implementasi), `design-tokens` (kontras)
- **Setelah**: `decision-framework` (kalau konflik visual vs a11y → a11y menang), `ux-research` (validate dengan user)

## Checklist

1. [ ] Kontras AA semua pasangan teks (light & dark)
2. [ ] Full keyboard access, no trap, focus visible
3. [ ] Semantic HTML benar, ARIA via Radix
4. [ ] Form: label, error linked & tidak hanya warna
5. [ ] Touch target ≥ 44px
6. [ ] prefers-reduced-motion dihormati
7. [ ] Focus management overlay benar