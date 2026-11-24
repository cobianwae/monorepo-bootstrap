# Backlog

Backlog adalah indeks aktif. Detail artefak hidup di file masing-masing.
Item selesai dipindahkan ke `docs/BACKLOG-ARCHIVE.md`.

## Status

| Artefak | Alur |
|---|---|
| PRD | `draft` → `approved` → `shipped` |
| Design | `draft` → `approved` |
| Story | `todo` → `in-progress` → `review` → `done` |
| CR | `draft` → `approved` → `done` |

Hanya user yang boleh menetapkan `approved` dan `done`.

## PRD

| ID | Judul | Status | File |
|---|---|---|---|
| 012 | Mind map — turunan ringan kanvas org chart (roadmap RM-07) | approved | `docs/prd/012-mind-map.md` |
| 013 | Diff viewer — code review & audit (roadmap RM-12) | approved | `docs/prd/013-diff-viewer.md` |
| 014 | Import wizard CSV — column mapping + validasi (roadmap RM-13) | approved | `docs/prd/014-import-wizard.md` |
| 015 | Image cropper — avatar/cover flow (roadmap RM-14) | approved | `docs/prd/015-image-cropper.md` |
| 016 | Lightbox/gallery — melengkapi preview (roadmap RM-15) | approved | `docs/prd/016-lightbox-gallery.md` |
| 017 | Tour/coach marks — onboarding reusable (roadmap RM-16) | approved | `docs/prd/017-product-tour.md` |
| 018 | Permission/role matrix — grid role × resource (roadmap RM-17) | approved | `docs/prd/018-permission-matrix.md` |
| 019 | Signature pad — persetujuan & consent (roadmap RM-18) | approved | `docs/prd/019-signature-pad.md` |

## Specs (lightweight track)

Spec singkat + 1 story untuk komponen tanpa pattern baru; menggantikan PRD penuh.

| RM | Judul | Status | File |
|---|---|---|---|
| RM-02 | Transfer list | approved | `docs/design/spec-transfer-list.md` |
| RM-03 | Cascader & tree select | approved | `docs/design/spec-cascader-tree-select.md` |
| RM-10 | Mention input & emoji picker (compose chat) | approved | `docs/design/spec-mention-emoji.md` |

## Story ID Registry (lightweight track)

| Seri | RM | Artefak | Story |
|---|---|---|---|
| 007 | RM-02 | `docs/design/spec-transfer-list.md` | `007-01` |
| 008 | RM-03 | `docs/design/spec-cascader-tree-select.md` | `008-01`, `008-02` |
| 009 | RM-10 | `docs/design/spec-mention-emoji.md` | `009-01` |

## Stories

| ID | Judul | Status | File |
|---|---|---|---|
| 009-01 | Mention + emoji picker untuk chat + showcase | done | `docs/stories/009-01-mention-emoji.md` |
| 012-01 | Mind map fondasi dua sisi + pill + pan/zoom | done | `docs/stories/012-01-fondasi-dua-sisi-pill-panzoom.md` |
| 012-02 | Mind map tambah inline + hapus M-011 + undo/redo | done | `docs/stories/012-02-tambah-hapus-undo.md` |
| 012-03 | Mind map keyboard + cari + states + showcase audit | done | `docs/stories/012-03-keyboard-cari-showcase-audit.md` |
| 013-01 | Diff viewer parser + unified + header + states | approved | `docs/stories/013-01-parser-unified-header-states.md` |
| 013-02 | Diff viewer split + navigasi hunk + slot komentar | approved | `docs/stories/013-02-split-navigasi-komentar.md` |
| 013-03 | Diff viewer showcase + audit kontras + smoke | approved | `docs/stories/013-03-showcase-audit-smoke.md` |
| 014-01 | Import wizard util parse/mapping/validasi + template | done | `docs/stories/014-01-util-parse-mapping-validasi.md` |
| 014-02 | Import wizard shell stepper + upload + mapping | done | `docs/stories/014-02-shell-upload-mapping.md` |
| 014-03 | Import wizard validasi + konfirmasi + showcase final | done | `docs/stories/014-03-validasi-konfirmasi-showcase.md` |
| 015-01 | Image cropper fondasi wrapper + aspek + output blob | done | `docs/stories/015-01-fondasi-wrapper-output.md` |
| 015-02 | Image cropper kontrol + pratinjau + keyboard + states | done | `docs/stories/015-02-kontrol-pratinjau-keyboard-states.md` |
| 015-03 | Image cropper showcase avatar + cover + audit + smoke | done | `docs/stories/015-03-showcase-audit-smoke.md` |
| 016-01 | Lightbox fondasi wrapper + navigasi + counter | todo | `docs/stories/016-01-fondasi-wrapper-navigasi-counter.md` |
| 016-02 | Lightbox zoom + video + keyboard + states | todo | `docs/stories/016-02-zoom-video-keyboard-states.md` |
| 016-03 | Lightbox showcase + audit + smoke | todo | `docs/stories/016-03-showcase-audit-smoke.md` |
| 017-01 | Product tour fondasi wrapper + navigasi + callback | done | `docs/stories/017-01-fondasi-wrapper-navigasi-callback.md` |
| 017-02 | Product tour target hilang + keyboard + motion + states | done | `docs/stories/017-02-target-hilang-keyboard-motion-states.md` |
| 017-03 | Product tour showcase + audit + smoke | done | `docs/stories/017-03-showcase-audit-smoke.md` |
| 018-01 | Permission matrix fondasi grid + toggle + kunci | done | `docs/stories/018-01-fondasi-grid-toggle-kunci.md` |
| 018-02 | Permission matrix keyboard + banner + states | done | `docs/stories/018-02-keyboard-banner-states.md` |
| 018-03 | Permission matrix showcase + audit + smoke | done | `docs/stories/018-03-showcase-audit-smoke.md` |

## Change Requests

| ID | Judul | Status | File |
|---|---|---|---|
| CR-012 | Calendar polish tema & docs showcase | done | `docs/cr/cr-012-calendar-theme-docs-polish.md` |
| CR-013 | Anchor popover detail event EventCalendar (M-006) jatuh ke pojok kiri atas — diterima user; browser positioning/keyboard belum diverifikasi | done | `docs/cr/cr-013-popover-anchor-event-calendar.md` |
| CR-017 | Tour: perbaikan dialog teruji di Chrome light/dark | done | `docs/cr/cr-017-tour-dialog-backdrop.md` |
| CR-018 | Tour: varian cva + responsif di komponen + sinkron docs | done | `docs/cr/cr-018-tour-varian-responsif-docs.md` |
| CR-019 | Flow Editor inspector on-demand tidak mengunci + sesuai AC | done | `docs/cr/cr-019-flow-inspector-on-demand.md` |
| CR-020 | Mind Map: pointer, pemusatan edit/fokus, minimap mobile dipulihkan; tes/browser/build terverifikasi, disetujui user | done | `docs/cr/cr-020-mind-map-canvas-parity.md` |
| CR-021 | Flow Editor: kanvas rusak visual/layout (node 0×0, handle, toolbar, fitView, edge) | done | `docs/cr/cr-021-flow-editor-visual-rusak.md` |
| CR-022 | Mind Map: hierarki visual dan konsistensi komponen (root, badge, focus ring, tombol demo) | done | `docs/cr/cr-022-mind-map-hierarki-konsistensi.md` |
| CR-023 | Mind Map: warna semantik dan state feedback (edge, highlight, error, skeleton, minimap) | done | `docs/cr/cr-023-mind-map-warna-state.md` |
| CR-024 | Mind Map: microcopy, konten, dan a11y detail (istilah, deskripsi, hint, input, gagang mobile) | done | `docs/cr/cr-024-mind-map-microcopy-a11y.md` |
| CR-025 | Mind Map: tindak lanjut audit halaman (target sentuh salin resep, grup aksi, pre keyboard, cakupan test) | done | `docs/cr/cr-025-mind-map-audit-followup.md` |
| CR-026 | Mind Map: tata letak, hierarki, dan ikonografi halaman showcase (panel demo, pencarian, spacing, tipografi) | done | `docs/cr/cr-026-mind-map-showcase-layout.md` |
| CR-027 | Mind Map: polish halaman showcase (urutan demo, bingkai ganda, ikon status, resep salin) | done | `docs/cr/cr-027-mind-map-showcase-polish.md` |
| CR-028 | Mind Map: pencarian dan toolbar dalam satu baris (komponen `packages/ui`, urutan DOM) | done | `docs/cr/cr-028-mind-map-toolbar-search-row.md` |
| CR-029 | Mind Map: hierarki header dan judul section setara data-display (h2 display + ikon, badge header) | done | `docs/cr/cr-029-mind-map-hierarki-header-section.md` |
| CR-030 | Mind Map: panggung demo dalam Card, tema lokal hanya di kanvas, panel 2 baris | done | `docs/cr/cr-030-mind-map-panggung-demo-card.md` |
| CR-031 | Mind Map: pakai Kbd dan Timeline, restyle resep (logika salin dipertahankan) | done | `docs/cr/cr-031-mind-map-komponen-ds-kbd-timeline-resep.md` |
| CR-032 | Mind Map: section "Kapan dipakai" (opsional, konten baru) | done | `docs/cr/cr-032-mind-map-kapan-dipakai.md` |
| CR-033 | Token: scope tema bersarang tidak me-resolve ulang `--color-*` (dark mode kanvas mind-map; dikerjakan lebih dulu) | done | `docs/cr/cr-033-token-scope-tema-bersarang.md` |
| CR-034 | Aturan visual docs showcase (`visual-language.md`) + penyambungan ke AI (`instructions`, AGENTS, ARCHITECTURE, CONVENTIONS) + pagar guard | done | `docs/cr/cr-034-aturan-visual-dan-penyambungan-ai.md` |
| CR-035 | Seragamkan 7 halaman `foundations`: `SectionHeading`, teks mikro → `text-xs`, `primary` dekoratif → `highlight`, `SegmentedControl` | done | `docs/cr/cr-035-seragamkan-halaman-foundations.md` |
| CR-036 | Bug konten `foundations`: klaim WCAG dihitung, "3-step", demo durasi satu easing, label arah, "Play All", badge Ratio dark mode. Verifikasi AA matriks di browser 16/16. | done | `docs/cr/cr-036-bug-konten-halaman-foundations.md` |
| CR-037 | Sederhanakan `SectionHeading`: tanpa ikon, tanpa level sub (mengoreksi keputusan CR-034 #2; opsi A pilihan user) | done | `docs/cr/cr-037-sederhanakan-section-heading-tanpa-ikon.md` |
| CR-038 | Ganti `text-[9/10/11px]` → `text-xs` di `app/(docs)` non-foundations (99 pemakaian, 29 file); guard px diperluas ke seluruh docs | done | `docs/cr/cr-038-text-xs-docs-non-foundations.md` |
| CR-039 | Hapus ikon heading manual di `components/` dan `patterns/` (78 baris, 11 file) | done | `docs/cr/cr-039-ikon-heading-components-patterns.md` |
| CR-040 | Kontras teks varian `info` dan `warning` di `Banner` (`text-foreground` di atas tint); audit 8 tema | done | `docs/cr/cr-040-kontras-banner-info.md` |
| CR-041 | 44 `<h2>` manual sisa di docs non-foundations: diperiksa, tidak perlu perubahan tag (tidak ada section `h2` induk) | done | `docs/cr/cr-041-h2-manual-docs-non-foundations.md` |
| CR-042 | Kontras teks varian `destructive` pada Alert (dark 4,17–4,58:1); teks memakai `foreground` | done | `docs/cr/cr-042-kontras-alert-destructive-dark.md` |
| CR-043 | Heading section tanpa ikon di `overlays-menus` (11 h2) dan `text-xl` untuk h3 manual di `data-display` dan `layout-navigation` | done | `docs/cr/cr-043-heading-overlays-data-display-layout.md` |
| CR-044 | `primary` dekoratif ke `highlight` di halaman docs (ikon kartu, callout informatif, identitas; 25 kemunculan, 14 file); aksi dan state terpilih tidak diubah | done | `docs/cr/cr-044-primary-dekoratif-ke-highlight.md` |
| CR-045 | `text-[9/10/11px]` di luar `app/(docs)` ke `text-xs` (154 kemunculan, 33 file); guard memindai seluruh `src` | done | `docs/cr/cr-045-text-xs-luar-docs.md` |
| CR-046 | Kontras eyebrow `PageHeader` (`text-highlight` kecil di `packages/ui`); API publik, disetujui | done | `docs/cr/cr-046-eyebrow-pageheader-kontras.md` |
| CR-047 | State terpilih dan kotak ikon `bg-primary` (dekoratif) di halaman docs/scenario; pola interaksi, disetujui | done | `docs/cr/cr-047-state-terpilih-bg-primary.md` |
| CR-048 | Demo Directional Motion tampil kosong sebelum Play | done | `docs/cr/cr-048-directional-motion-kotak-kosong.md` |
| CR-049 | State terpilih dan ikon dekoratif `primary` di `clinic`, `crm`, `scenarios` (lanjutan CR-047); tautan dan nilai tetap primary | done | `docs/cr/cr-049-primary-state-dan-ikon-clinic-crm-scenarios.md` |
| CR-050 | Sisa `primary` dekoratif (onboarding, layout-navigation, consultations, reports, auth), guard solid fill, penutupan deviasi visual | done | `docs/cr/cr-050-sisa-primary-dan-deviasi-visual.md` |
| CR-051 | PageHeader: eyebrow sudah selesai (CR-046); deviasi h1 `text-3xl sm:text-4xl` dan weight dipertahankan sebagai keputusan; perubahan API publik butuh persetujuan | done | `docs/cr/cr-051-pageheader-deviasi.md` |
| CR-052 | Perluas guard `text-lg font-bold` sebagai heading ke seluruh `app/(docs)`; sisa di `guidelines` ke `SectionHeading` | done | `docs/cr/cr-052-perluas-guard-heading.md` |
| CR-053 | Audit visual `components/` dan `patterns/` (46 halaman): text-highlight pada teks kecil, primary dekoratif, h2/h3 manual, text-lg/text-2xl font-bold manual; cakupan palet selain Atelier/Pulse | done | `docs/cr/cr-053-audit-visual-components-patterns.md` |
| CR-054 | Audit 73 route selesai dengan batas bukti tercatat; done dikonfirmasi user 2026-11-23, perbaikan diteruskan ke CR-055–064 approved | done | `docs/cr/cr-054-audit-components-patterns.md` |
| CR-055 | Kontras teks kecil lintas tema (C01); done dikonfirmasi user 2026-11-23 | done | `docs/cr/cr-055-small-text-contrast.md` |
| CR-056 | Reflow Banner; 17 instance showcase terverifikasi, batas CSS consumer tercatat; done atas persetujuan user 2026-11-23 (C11/V02) | done | `docs/cr/cr-056-banner-reflow.md` |
| CR-057 | Semantik kontrol, keyboard dan tabel virtual (C02–04/C07/C10); done dan di-merge ke `visual-polish` | done | `docs/cr/cr-057-control-semantics.md` |
| CR-058 | Label/error, target password dan empty-value form (C05/C09/C12/C13); done dan di-merge ke `visual-polish` | done | `docs/cr/cr-058-form-accessibility.md` |
| CR-059 | Fokus onboarding dan kepemilikan command palette (C06/C17) | done | `docs/cr/cr-059-overlay-ownership.md` |
| CR-060 | Hydration RTE, statistik awal dan asset demo (C14/V01/V03); done dan di-merge ke `visual-polish` | done | `docs/cr/cr-060-rte-hydration.md` |
| CR-061 | Reflow kontrol/workspace mobile (C15/R01) | done | `docs/cr/cr-061-responsive-controls.md` |
| CR-062 | Reveal katalog home mobile tidak mencapai threshold (C16); diperbaiki di `useReveal` dan di-merge ke `visual-polish` | done | `docs/cr/cr-062-home-reveal.md` |
| CR-063 | Peran warna, heading, segmented dan literal palette (W01–03/W05–07) | done | `docs/cr/cr-063-visual-consistency.md` |
| CR-064 | State tabel konsumen dan pemulihan empty master-detail (W04/C08); done dan di-merge ke `visual-polish` | done | `docs/cr/cr-064-data-state-recovery.md` |
| CR-065 | Uplift halaman File Manager: segmented control, struktur demo/a11y, copy English; done dan di-merge ke `visual-polish` | done | `docs/cr/cr-065-file-manager-page-uplift.md` |
| CR-066 | File Manager: poles demo (preview dari grid/state, toast, kontrol quota/sidebar), copy English komponen, target sentuh segmented; 3 cluster A/B/C; done dan di-merge ke `visual-polish` | done | `docs/cr/cr-066-file-manager-polish-and-copy.md` |
| CR-067 | Uplift halaman Org Chart Studio: demo-first, segmented control, CodeBlock resep, copy English; done dan di-merge ke `visual-polish` | done | `docs/cr/cr-067-org-chart-studio-page-uplift.md` |
| CR-068 | Org Chart Studio: poles demo (search di state non-data, reset seed, klaim dari data, toast Loading) dan section keyboard (sub-heading, `<kbd>`); 2 cluster A/B | done | `docs/cr/cr-068-org-chart-studio-demo-polish.md` |
| CR-069 | OrgChartStudio: seluruh copy runtime (label, dialog, toast, live region, pesan validasi, default `emptyActionLabel`) ke English + update test; 4 cluster A–D | done | `docs/cr/cr-069-org-chart-studio-english-copy.md` |
| CR-070 | CodeBlock syntax highlighting (Shiki): dual-theme light/dark + audit kontras + fallback flat; done atas persetujuan user, visual browser belum diverifikasi | done | `docs/cr/cr-070-codeblock-shiki-highlighting.md` |
| CR-071 | Dynamic Form A: hierarki halaman, reflow 320 px, dan copy English yang sesuai perilaku demo; done atas persetujuan user, uji browser 320/390/1440 light/dark lulus (metrik layout) | done | `docs/cr/cr-071-dynamic-form-layout-and-copy.md` |
| CR-072 | Dynamic Form B: status autosave, pemulihan draft, reset terkonfirmasi, dan simulasi submit — disetujui user 2026-11-25 | done | `docs/cr/cr-072-dynamic-form-draft-lifecycle.md` |
| CR-073 | Dynamic Form C: role dan empty state anggota, ringkasan validasi, fokus keyboard, dan kontras | approved | `docs/cr/cr-073-dynamic-form-fields-and-accessibility.md` |
| CR-074 | OrgChartEditor legacy dihapus (komponen, test, export, route, nav); OrgChart dipulihkan, Studio tetap utuh; done atas persetujuan user 2026-11-24 | done | `docs/cr/cr-074-remove-org-chart-editor.md` |
| CR-075 | Perbaiki 12 error tipe tombol undo/redo pada test FlowEditor tanpa perubahan runtime/API; approved, implementasi ditunda atas permintaan user | approved | `docs/cr/cr-075-flow-editor-test-button-types.md` |

## Catatan

- Rekonsiliasi CR sebelum 054 (2026-11-23): `docs/reviews/cr-before-054-status-reconciliation.md`. User menetapkan CR-034/035/037/038/042/047/050–053 done. CR-017/018/036 masih terbuka pada rekonsiliasi tersebut dan kemudian ditetapkan done; lihat tabel untuk status terkini.

- Nomor PRD 007–009 **sengaja tidak dipakai** — sudah direservasi sebagai ID seri
  story lightweight track (007-01, 008-01/008-02, 009-01, lihat registry di bawah).
  ID artefak bersifat imutabel; lubang penomoran tidak diisi ulang.
- Jangan memuat `BACKLOG-ARCHIVE.md` secara penuh saat sesi; grep hanya baris aktif.
- Setiap story/CR yang selesai di-tick di file, lalu status di tabel ini diperbarui.
- Jika pekerjaan keluar dari scope story/CR, berhenti dan minta konfirmasi.
