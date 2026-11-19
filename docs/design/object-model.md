# Object Model

Model objek design system. Diperbarui **sebelum** menambah komponen, pattern, atau scenario baru.
Tujuannya agar tidak ada objek yatim: setiap komponen punya kategori, setiap pattern punya tujuan,
setiap scenario punya layar yang terdaftar di `sitemap.md`.

## 1. Token Model

| Layer | Peran | Contoh |
|---|---|---|
| Primitive | Nilai mentah OKLCH | `--primary`, `--background`, `--radius` |
| Semantic | Peran UI | `--color-primary`, `--color-muted-foreground`, `--color-destructive` |
| Component | Kebutuhan komponen | `--button-height`, `--dialog-radius` (bila ada) |

Aturan:

- Warna hanya OKLCH; nilai hidup di CSS variable light/dark.
- Komponen mengonsumsi token semantik, bukan primitive langsung bila ada padanan.
- Setiap foreground punya pasangan background yang lolos kontras.
- Token baru harus dicek duplikasinya di `tokens.css` dan `tokens.ts`.

## 2. Theme Model

Tema: `pulse`, `sunset`, `botanic`, `midnight`, `nebula`, `lagoon`, `ink`, `graphite`.

Setiap tema mendefinisikan:

- palet light dan dark,
- pasangan kontras (`pairs`) untuk audit,
- art direction bila relevan.

Tema baru wajib punya `ThemeDefinition` lengkap dan masuk ke `THEMES`.

## 3. Component Inventory

| Kategori | Tujuan | Komponen utama |
|---|---|---|
| `base` | Primitive visual dan kontrol dasar | button, badge, card, input, textarea, label, separator, skeleton, avatar, tabs, checkbox, switch, tooltip, progress, spinner, radio-group, slider, accordion, collapsible, kbd, toggle, aspect-ratio, scroll-area, palette-switcher, theme-provider |
| `form` | Input dan validasi | form, select, combobox, tag-input, date-picker, input-otp, number-input, time-picker, filter-builder, stepper, segmented-control, file-input, file-upload |
| `data-display` | Menampilkan data | table, data-table, stat-card, bulk-action-bar, timeline, description-list, chart, chart-a11y-table, code-block, rating, chat, metric-tiles-card |
| `feedback` | Status dan respons sistem | dialog, alert, alert-dialog, toast, toaster, empty-state, use-toast |
| `navigation` | Navigasi dan pencarian | dropdown-menu, breadcrumb, pagination, command-palette, context-menu, navigation-menu |
| `overlay` | Lapisan di atas konten | sheet, popover, hover-card |
| `layout` | Kerangka halaman | app-shell, page-header, page-shell, page-skeleton, container, section, prose, demo-section, resizable, skip-link |
| `marketing` | Blok presentasi | hero, hero-band, feature-grid, faq, logo-cloud, carousel, cta-band, statement-card, art-background, grid-pattern, dot-pattern, glow-orb, stats-band, section-number, pricing, testimonial, gradient-text |
| `dnd` | Drag and drop | sortable-list, tree-view, kanban |

## 4. Pattern Inventory

Pattern adalah resep komposisi komponen + state + aturan UX, bukan komponen baru.

| Pattern | Fokus |
|---|---|
| Activity Feed | Timeline aktivitas, loading, empty |
| Auth | Form login/register, error, redirect |
| Billing | Ringkasan biaya, invoice, state |
| Calendar | Event, navigasi tanggal, timezone |
| Comments | Thread, optimistic update, empty |
| Command Palette | Pencarian aksi, keyboard-first |
| Dashboard | Ringkasan metrik, grid responsif |
| Data Table | Sort, filter, pagination, bulk action |
| Dynamic Form | Schema-driven, validasi |
| File Upload | Upload queue: validasi batch per file, progres per item, cancel/retry, thumbnail; penyusun: file-upload (baru), file-input, progress, button, badge, alert |
| Global Search | Query, result grouping, empty |
| Infinite Scroll | Pagination berbasis viewport |
| Kanban | Kolom, drag, optimistic move |
| Master Data | CRUD tabel + form |
| Master Detail | List + panel detail |
| Media Gallery | Grid, lightbox, keyboard |
| Notifications | Toast/inbox, read state |
| Onboarding | Step, skip, progress |
| Optimistic Updates | Perubahan langsung + rollback |
| Product Tour | Highlight, step, dismiss |
| Results | Sukses/gagal, next action |
| Rich Text Editor | Toolbar, konten, a11y |
| Settings | Section, form, save state |
| Stepper | Multi-step, validasi per step |
| Virtualized List | Performa list besar |
| Workspace | Shell multi-panel |

## 5. Scenario Inventory

| Scenario | Layar |
|---|---|
| CRM | Dashboard, Leads, Campaigns, AI, Contact Center |
| Clinic | Dashboard, Patients, Appointments, Consultations, Treatments, POS, Reports, Registration |
| Landing | Landing, Scratch (internal) |

## Change Rules

1. Komponen baru → tambahkan kategori dan entri di inventory ini.
2. Pattern baru → tambahkan tujuan dan daftar komponen penyusun.
3. Scenario baru → daftarkan layar di `sitemap.md` sebelum wireframe.
4. Perubahan yang mengubah model → review gate design.
