---
name: visual-design
description: Prinsip desain visual, estetika artistik, ritme spasial 4px, hierarki visual, koreografi animasi, ikonografi, dan mode gelap berkualitas tinggi
tags: [design-system, design, visual, aesthetics, motion, dark-mode, typography]
compatibility: [next, opencode, claude, cursor]
---

# Visual Design & Artistic Craft

## Kapan Pakai
Saat merancang tampilan baru, mengatur layout, memilih tipografi, menerapkan micro-interactions, atau menyelaraskan estetika visual antar modul.

## Prinsip Desain Visual

### 1. Ritme Spasial (4px Baseline Grid)
- Seluruh ukuran margin, padding, tinggi baris, dan komponen dihitung berbasis kelipatan 4px: `4px`, `8px`, `12px`, `16px`, `24px`, `32px`, `48px`, `64px`.
- Konsistensi jarak internal kartu (`p-6` atau `p-4`) dan jarak antar elemen (`gap-4` atau `space-y-4`) menciptakan ketenangan visual.

### 2. Hierarki Visual (Weight over Color)
- Gunakan variasi ukuran font dan optical weight (`font-semibold`, `font-bold`) terlebih dahulu sebelum menambahkan warna aksen.
- Batasi jumlah warna saturasi tinggi dalam satu viewport; gunakan warna primer hanya untuk panggilan aksi utama (Primary CTA).
- Teks sekunder dan caption menggunakan token `--muted-foreground` untuk mengurangi kebisingan informasi.

### 3. Keahlian Mode Gelap (Dark Mode Craft)
- **Hindari Hitam Pekat (#000000)**: Gunakan charcoal bersaturasi lembut (`oklch(0.14 0.015 260)`) untuk kanvas latar agar mata tidak cepat lelah akibat glare.
- **Kedalaman via Lightness (Elevation)**: Pada mode gelap, bayangan drop-shadow kurang efektif. Gunakan permukaan yang sedikit lebih terang (`--card`, `--popover` dengan lightness 0.18) untuk menunjukkan elevasi lapisan.
- **Penyesuaian Saturasi**: Warna primer pada mode gelap menggunakan saturasi yang sedikit lebih rendah dan lightness yang lebih tinggi untuk keterbacaan optimal.

### 4. Koreografi Gerakan (Motion Choreography)
- Gunakan kurva pegas alami (*spring curves*): `cubic-bezier(0.16, 1, 0.3, 1)`.
- Skala durasi:
  - Micro-interactions (hover, active, toggle): `150ms`
  - Dropdown, popover, dialog: `250ms`
  - Transisi halaman dan drawer besar: `400ms`
- Hindari animasi yang bergerak berlebihan tanpa tujuan kontekstual.

### 5. Standar Ikonografi
- Gunakan ikon dengan ketebalan garis konsisten (**1.5px hingga 2px stroke**) pada ukuran bounding box standar 16px (`h-4 w-4`) atau 20px (`h-5 w-5`).
- Selalu selaraskan posisi vertikal ikon dengan baseline teks (`items-center gap-2`).

### 6. Komposisi Layout & App Shell
- **Responsive Container**: `mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8`.
- **Section Padding**: `py-8 md:py-12 lg:py-16` untuk ritme vertikal halaman yang konsisten.
- **App Shell (Sidebar + Main)**: Sidebar `w-64 shrink-0 border-r` berdampingan dengan `main className="flex-1 overflow-y-auto"`.
- **Card Grid**: `grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3` untuk kumpulan entity cards.
- **Form Spacing**: Antar field gunakan `space-y-4`, antar grup form gunakan `space-y-6`.

## Anti-Patterns Visual
- ✗ Menggunakan lebih dari 2 jenis font family dalam satu aplikasi.
- ✗ Mengandalkan warna merah/hijau semata untuk menandakan status tanpa ikon atau label teks.
- ✗ Menggunakan bayangan drop shadow pekat dan gelap tanpa blur bertingkat.
- ✗ Mengabaikan padding tepi pada tampilan mobile (< 640px).

## Checklist
1. [ ] Spacing konsisten dengan kelipatan 4px
2. [ ] Hierarki judul, subjudul, dan teks isi tampak jelas dalam 3 detik pertama
3. [ ] Mode gelap tampak proporsional tanpa kontras glare berlebih
4. [ ] Transisi terasa halus dan responsif
