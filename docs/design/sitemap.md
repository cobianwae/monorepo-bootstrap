# Sitemap

Inventaris layar showcase dan docs. Semua layar **wajib terdaftar di sini sebelum wireframe**.
Status: `planned`, `in-design`, `implemented`, `documented`.

## Konvensi ID

| Objek | Format | Contoh |
|---|---|---|
| Layar utama | `S-NNN` | `S-010` |
| Child panel / tab | `S-NNN.MM` | `S-003.01` |
| Modal | `M-NNN` | `M-001` |
| Pattern | `S-005.MM` | `S-005.08` |

## Screen Registry

| ID | Layar | Route | Status |
|---|---|---|---|
| S-001 | Docs Home | `/` | implemented |
| S-002 | Getting Started | `/getting-started` | implemented |
| S-003 | Foundations (shell) | `/foundations/*` | implemented |
| S-003.01 | Colors | `/foundations/colors` | implemented |
| S-003.02 | Themes | `/foundations/themes` | implemented |
| S-003.03 | Typography | `/foundations/typography` | implemented |
| S-003.04 | Spacing | `/foundations/spacing` | implemented |
| S-003.05 | Motion | `/foundations/motion` | implemented |
| S-003.06 | Breakpoints | `/foundations/breakpoints` | implemented |
| S-003.07 | Iconography | `/foundations/iconography` | implemented |
| S-004 | Components (shell) | `/components/*` | implemented |
| S-004.01 | Components Overview | `/components` | implemented |
| S-004.02 | Actions & Inputs | `/components/actions-inputs` | implemented |
| S-004.03 | Forms | `/components/forms` | implemented |
| S-004.04 | Data Display | `/components/data-display` | implemented |
| S-004.05 | States & Feedback | `/components/states-feedback` | implemented |
| S-004.06 | Layout & Navigation | `/components/layout-navigation` | implemented |
| S-004.07 | Overlays & Menus | `/components/overlays-menus` | implemented |
| S-004.08 | Marketing | `/components/marketing` | implemented |
| S-004.09 | Charts | `/components/charts` | implemented |
| S-005 | Patterns (shell) | `/patterns/*` | implemented |
| S-005.01 | Activity Feed | `/patterns/activity-feed` | implemented |
| S-005.02 | Auth | `/patterns/auth` | implemented |
| S-005.03 | Billing | `/patterns/billing` | implemented |
| S-005.04 | Calendar (shell — upgrade basis `event-calendar` reusable, PRD 004) | `/patterns/calendar` | in-design |
| S-005.04.01 | Calendar — Month view | `/patterns/calendar` (view=month) | in-design |
| S-005.04.02 | Calendar — Week view + all-day strip | `/patterns/calendar` (view=week) | in-design |
| S-005.04.03 | Calendar — Day view + agenda pendamping | `/patterns/calendar` (view=day) | in-design |
| S-005.04.04 | Calendar — Agenda view (could) | `/patterns/calendar` (view=agenda) | in-design |
| S-005.05 | Comments | `/patterns/comments` | implemented |
| S-005.06 | Command Palette | `/patterns/command-palette` | implemented |
| S-005.07 | Dashboard | `/patterns/dashboard` | implemented |
| S-005.08 | Data Table | `/patterns/data-table` | implemented |
| S-005.09 | Dynamic Form | `/patterns/dynamic-form` | implemented |
| S-005.10 | File Upload | `/patterns/file-upload` | implemented |
| S-005.11 | Global Search | `/patterns/global-search` | implemented |
| S-005.12 | Infinite Scroll | `/patterns/infinite-scroll` | implemented |
| S-005.13 | Kanban | `/patterns/kanban` | implemented |
| S-005.14 | Master Data | `/patterns/master-data` | implemented |
| S-005.15 | Master Detail | `/patterns/master-detail` | implemented |
| S-005.16 | Media Gallery | `/patterns/media-gallery` | implemented |
| S-005.17 | Notifications | `/patterns/notifications` | implemented |
| S-005.18 | Onboarding | `/patterns/onboarding` | implemented |
| S-005.19 | Optimistic Updates | `/patterns/optimistic-updates` | implemented |
| S-005.20 | Product Tour | `/patterns/product-tour` | implemented |
| S-005.21 | Results | `/patterns/results` | implemented |
| S-005.22 | Rich Text Editor (upgrade basis `form/rich-text-editor` reusable, PRD 006) | `/patterns/rich-text-editor` | in-design |
| S-005.23 | Settings | `/patterns/settings` | implemented |
| S-005.24 | Stepper | `/patterns/stepper` | implemented |
| S-005.25 | Virtualized List | `/patterns/virtualized-list` | implemented |
| S-005.26 | Workspace | `/patterns/workspace` | implemented |
| S-005.27 | File Manager | `/patterns/file-manager` | in-design |
| S-005.27.01 | File Manager — konten list/grid | `/patterns/file-manager` (panel konten) | in-design |
| S-005.27.02 | File Manager — panel konteks | `/patterns/file-manager` (panel upload/quota/detail) | in-design |
| S-005.28 | Org Chart (legacy, diganti 011) | `/patterns/org-chart` | deprecated |
| S-005.29 | Flow Editor | `/patterns/flow-editor` | in-design |
| S-005.29.01 | Flow Editor — palette node (panel kiri) | `/patterns/flow-editor` (panel kiri) | in-design |
| S-005.29.02 | Flow Editor — inspector properti (panel kanan/sheet) | `/patterns/flow-editor` (panel kanan) | in-design |
| S-005.30 | Transfer List | `/patterns/transfer-list` | planned |
| S-005.31 | Cascader & Tree Select | `/patterns/cascader-tree-select` | planned |
| S-005.32 | Mention & Emoji | `/patterns/mention-emoji` | planned |
| S-005.33 | Org Chart Editor (legacy, diganti 011) | `/patterns/org-chart-editor` | deprecated |
| S-005.34 | Org Chart Studio (PRD 011) | `/patterns/org-chart-studio` | implemented |
| S-005.34.01 | Org Chart Studio — panel detail (inspector + tab pohon SR) | `/patterns/org-chart-studio` (panel kanan) | implemented |
| S-006 | Guidelines | `/guidelines` | implemented |
| S-007 | Contribution | `/contribution` | implemented |
| S-008 | What's New | `/whats-new` | implemented |
| S-010 | CRM Dashboard | `/crm` | implemented |
| S-011 | CRM Leads | `/crm/leads` | implemented |
| S-012 | CRM Campaigns | `/crm/campaigns` | implemented |
| S-013 | CRM AI | `/crm/ai` | implemented |
| S-014 | CRM Contact Center | `/crm/contact-center` | implemented |
| S-020 | Clinic Dashboard | `/clinic` | implemented |
| S-021 | Clinic Patients | `/clinic/patients` | implemented |
| S-022 | Clinic Appointments | `/clinic/appointments` | implemented |
| S-023 | Clinic Consultations | `/clinic/consultations` | implemented |
| S-024 | Clinic Treatments | `/clinic/treatments` | implemented |
| S-025 | Clinic POS | `/clinic/pos` | implemented |
| S-026 | Clinic Reports | `/clinic/reports` | implemented |
| S-027 | Clinic Registration | `/clinic/registration` | implemented |
| S-030 | Landing | `/landing` | implemented |
| S-031 | Scratch (internal) | `/scratch` | implemented |

## Modal Registry

| ID | Modal | Dipakai di | Status |
|---|---|---|---|
| M-001 | File Preview (sheet di desktop, dialog full-screen di mobile) | S-005.27 | in-design |
| M-002 | Rename / Folder baru (dialog + validasi nama) | S-005.27 | in-design |
| M-003 | Konfirmasi hapus & pilih folder tujuan move | S-005.27 | in-design |
| M-004 | Konfirmasi hapus node org chart (reparent vs hapus subtree, legacy 010) | S-005.33 | deprecated |
| M-005 | Pilih atasan baru (dialog pindah + validasi siklus, legacy 010) | S-005.33 | deprecated |
| M-006 | Event detail (popover di desktop, dialog/sheet di mobile; edit/hapus milik konsumen via callback) | S-005.04 | in-design |
| M-007 | Pilih atasan baru Org Chart Studio (dialog pindah + validasi siklus + preview path) | S-005.34 | implemented |
| M-008 | Konfirmasi hapus Org Chart Studio (hitungan turunan + pilihan reparent/hapus subtree + proteksi root) | S-005.34 | implemented |
| M-009 | Link editor (popover di desktop, dialog/sheet di mobile; sisip/edit/hapus + validasi URL) | S-005.22 | in-design |
| M-010 | Sisip gambar via URL + alt text wajib (dialog; tanpa alt ditolak dengan pesan) | S-005.22 | in-design |

## Route Groups

| Group | Prefix | Catatan |
|---|---|---|
| Docs | `/(docs)` | Living documentation design system |
| CRM | `/(crm)/crm` | Scenario CRM |
| Clinic | `/(clinic)/clinic` | Scenario clinic |
| Landing | `/(landing)` | Landing dan scratch |

## Aturan

1. Layar baru harus mendapat ID sebelum wireframe dibuat.
2. Child panel/tab memakai `S-NNN.MM`; modal memakai `M-NNN`.
3. Status diperbarui setelah implementasi dan dokumentasi.
4. Route yang dihapus tetap dicatat sebagai `removed` selama satu siklus.
