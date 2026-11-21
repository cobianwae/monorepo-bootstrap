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
| `form` | Input dan validasi | form, select, combobox, tag-input, date-picker, input-otp, number-input, time-picker, filter-builder, stepper, segmented-control, file-input, file-upload, rich-text-editor (baru, PRD 006), image-cropper (baru, PRD 015) |
| `data-display` | Menampilkan data | table, data-table, stat-card, bulk-action-bar, timeline, description-list, chart, chart-a11y-table, code-block, rating, chat, metric-tiles-card, org-chart (legacy PRD 003, diganti 011), event-calendar (baru, PRD 004), diff-viewer (baru, PRD 013), permission-matrix (baru, PRD 018) |
| `feedback` | Status dan respons sistem | dialog, alert, alert-dialog, toast, toaster, empty-state, use-toast |
| `navigation` | Navigasi dan pencarian | dropdown-menu, breadcrumb, pagination, command-palette, context-menu, navigation-menu |
| `overlay` | Lapisan di atas konten | sheet, popover, hover-card, tour (baru, PRD 017), lightbox (baru, PRD 016) |
| `layout` | Kerangka halaman | app-shell, page-header, page-shell, page-skeleton, container, section, prose, demo-section, resizable, skip-link |
| `marketing` | Blok presentasi | hero, hero-band, feature-grid, faq, logo-cloud, carousel, cta-band, statement-card, art-background, grid-pattern, dot-pattern, glow-orb, stats-band, section-number, pricing, testimonial, gradient-text |
| `dnd` | Drag and drop | sortable-list, tree-view, kanban |
| `canvas` | Kanvas interaktif (xyflow, token-mapped) | org-chart-editor (legacy PRD 010, diganti 011), org-chart-studio (baru, PRD 011), flow-editor (baru, PRD 005), mind-map (baru, PRD 012) |

## 4. Pattern Inventory

Pattern adalah resep komposisi komponen + state + aturan UX, bukan komponen baru.

| Pattern | Fokus |
|---|---|
| Activity Feed | Timeline aktivitas, loading, empty |
| Auth | Form login/register, error, redirect |
| Billing | Ringkasan biaya, invoice, state |
| Calendar | Tampilan event bulan/minggu/hari + agenda, slot booking, navigasi periode (composed, kategori `data-display`); penyusun: event-calendar (baru), badge, popover, skeleton, empty-state, alert, button/segmented-control, dialog/sheet (milik konsumen via callback) |
| Comments | Thread, optimistic update, empty |
| Command Palette | Pencarian aksi, keyboard-first |
| Dashboard | Ringkasan metrik, grid responsif |
| Data Table | Sort, filter, pagination, bulk action |
| Diff Viewer | Review diff tambah/hapus: mode unified/split, header file + collapse hunk, navigasi hunk keyboard (composed, kategori `data-display`); penyusun: diff-viewer (baru), badge, segmented-control, collapsible, skeleton, empty-state, alert, button |
| Dynamic Form | Schema-driven, validasi |
| File Upload | Upload queue: validasi batch per file, progres per item, cancel/retry, thumbnail; penyusun: file-upload (baru), file-input, progress, button, badge, alert |
| File Manager | Hierarki folder + aksi file + quota + preview (composed, kategori `data-display`); penyusun: tree-view, data-table, breadcrumb, context-menu, bulk-action-bar, file-upload, dialog/sheet, progress, skeleton, empty-state |
| Flow Editor | Editor node/canvas: palette drag-and-drop, edge + handle, inspector, undo/redo, minimap (composed, kategori `canvas` xyflow token-mapped); penyusun: flow-editor (baru), sortable-list/`@dnd-kit/*`, sheet, form, badge, button, context-menu, tooltip, skeleton, empty-state, alert |
| Global Search | Query, result grouping, empty |
| Infinite Scroll | Pagination berbasis viewport |
| Kanban | Kolom, drag, optimistic move |
| Master Data | CRUD tabel + form |
| Master Detail | List + panel detail |
| Media Gallery | Grid, lightbox, keyboard (composed, upgrade basis `overlay/lightbox` reusable PRD 016); penyusun: lightbox (baru, wrapper yet-another-react-lightbox token-first), dialog (basis trap fokus), button, badge (counter), skeleton (loading item), empty-state, alert |
| Notifications | Toast/inbox, read state |
| Onboarding | Step, skip, progress |
| Import Wizard | Impor CSV 4 langkah: upload → mapping → validasi → konfirmasi; pratinjau error per sel, template contoh, hasil via callback (composed, kategori `form` + `data-display`, tanpa komponen baru v1); penyusun: stepper, file-input/file-upload (compose), select/combobox, data-table/table, alert, badge, progress, skeleton, empty-state, button |
| Image Cropper | Potong avatar/cover: aspek terkunci, zoom/geser/rotasi preset 90°, pratinjau live + lingkaran, output blob via callback (composed, kategori `form`); penyusun: image-cropper (baru, wrapper react-easy-crop token-first), file-input, slider, button, avatar, skeleton, empty-state, alert, dialog (varian milik konsumen via compose) |
| Optimistic Updates | Perubahan langsung + rollback |
| Org Chart | Diagram hierarki organisasi read-only (legacy PRD 003, diganti 011 — lihat Org Chart Studio) |
| Org Chart Editor | Editor hierarki organisasi v1 (legacy PRD 010, diganti 011 — lihat Org Chart Studio) |
| Org Chart Studio | Editor + visualisasi hierarki satu komponen: kartu lega inline-edit via gagang `+`, drag reparent + dialog setara, undo/redo 50, search + auto-expand, pohon SR internal, state matrix 6 demo (composed, kategori `canvas` xyflow token-mapped); penyusun: org-chart-studio (baru), sheet, context-menu, tooltip, form, input, badge, avatar, skeleton, empty-state, alert, button, toast |
| Mind Map | Peta ide radial ringan turunan org chart studio: root sentral + cabang dua sisi seimbang, tambah inline 1-klik, lipat cabang + hitungan tersembunyi (composed, kategori `canvas` xyflow token-mapped); penyusun: mind-map (baru), button, tooltip, skeleton, empty-state, alert, badge |
| Permission Matrix | Grid otorisasi role × resource: toggle massal baris/kolom + indeterminate, sel terkunci beralasan, dirty + ringkasan (composed, kategori `data-display`); penyusun: permission-matrix (baru), checkbox (`base`), badge, skeleton, empty-state, alert, button, tooltip |
| Product Tour | Panduan langkah interaktif: spotlight + popover + progress, lewati anggun saat target hilang, keyboard + SR + reduced-motion (composed, kategori `overlay`); penyusun: tour (baru, wrapper driver.js token-first), popover, button, progress, alert-dialog (konfirmasi lewati), skeleton, empty-state, alert |
| Results | Sukses/gagal, next action |
| Rich Text Editor | Toolbar format + konten Prose + link popover + counter (composed, kategori `form`); penyusun: rich-text-editor (baru), button, tooltip, popover, dialog, input, badge, skeleton, empty-state, alert, kbd |
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
