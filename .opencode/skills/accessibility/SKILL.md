---
name: accessibility
description: Panduan aksesibilitas WCAG 2.1 AA/AAA - keyboard navigation, focus management, screen reader ARIA semantics, dan reduced motion
tags: [design-system, a11y, accessibility, wcag, aria, keyboard]
compatibility: [next, opencode, claude, cursor]
---

# Accessibility (a11y)

## Kapan Pakai
Saat mengaudit atau mengimplementasikan komponen, layout, form, dan navigasi untuk memastikan kepatuhan aksesibilitas WCAG 2.1 Level AA/AAA.

## Aturan Inti

### 1. Rasio Kontras Warna
- **Teks Normal (< 18pt / < 14pt bold)**: Minimal rasio kontras **4.5:1** terhadap background (WCAG AA). Target **7.0:1** (WCAG AAA).
- **Teks Besar / Heading**: Minimal rasio kontras **3.0:1** terhadap background.
- **Komponen UI & Border Fokus**: Minimal rasio kontras **3.0:1** terhadap warna sekelilingnya.

### 2. Navigasi Keyboard Penuh
- Semua elemen interaktif (`button`, `a`, `input`, `select`, modal triggers) WAJIB dapat diakses melalui tombol `Tab` / `Shift+Tab`.
- Komponen overlay (Dialog, Sheet, DropdownMenu) WAJIB dapat ditutup dengan tombol `Escape` dan melakukan focus trap saat terbuka.
- Tombol `Enter` atau `Space` harus memicu aksi pada elemen button/checkbox/switch.

### 3. Indikator Fokus Visual
- JANGAN PERNAH menyetel `outline: none` tanpa menyediakan ring fokus pengganti yang terlihat jelas:
  ```css
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
  ```

### 4. Semantik ARIA & Label
- Setiap input WAJIB memiliki elemen `<label>` yang terhubung via `htmlFor`/`id` atau `aria-label`.
- Ikon tombol tanpa teks (icon-only button) WAJIB memiliki elemen `<span className="sr-only">Deskripsi</span>` atau `aria-label`.
- Elemen status dinamis (alert, notifikasi toast) menggunakan `role="alert"` atau `aria-live="polite"`.

### 5. Reduced Motion
- Hormati preferensi sistem `prefers-reduced-motion` untuk animasi dan transisi berat:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

## Checklist
1. [ ] Seluruh kontrol interaktif dapat dioperasikan tanpa mouse
2. [ ] Ring fokus tampak jelas pada mode keyboard navigation
3. [ ] Gambar dan ikon memiliki teks alternatif / sr-only description
4. [ ] Kontras warna memenuhi batas ambang WCAG AA
