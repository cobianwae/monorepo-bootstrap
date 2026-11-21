# Spec Desain — Rich Text Editor

Status: approved (gate 2 — 2026-11-21)
PRD: `docs/prd/006-rich-text-editor.md` (approved gate 1 — 2026-11-20)
Layar: `S-005.22` Rich Text Editor (`/patterns/rich-text-editor`) + demo komponen di `S-004.03` Forms · Modal: `M-009` link editor, `M-010` gambar via URL
Flow: `docs/design/flows/rich-text-editor.mmd` · Wireframe: `docs/design/wireframes/rich-text-editor.md`
Tanggal: 2026-11-21

## 1. Keputusan Desain

| # | Keputusan | Alasan |
|---|---|---|
| D1 | Komponen baru `RichTextEditor` di `packages/ui/src/components/form/rich-text-editor.tsx` (kategori `form`), wrapper di atas **TipTap 3.30.1** yang dipromosikan dari `apps/showcase` ke `packages/ui` (keputusan gate 1, bukan dependency baru). Set extension terkunci v1: `StarterKit` (heading 1–3, bullet/ordered 1 tingkat, blockquote, code, undo/redo) + `Underline` + `Link` + `Placeholder`. `Highlight` baseline S-005.22 **keluar v1** (tidak ada di FR) agar scope tetap. | FR-001, FR-002, FR-010; OQ#1 answered; constraint token-first + tanpa dependency baru di luar D8. |
| D2 | Kontrak controlled HTML-string: `value: string` + `onChange(html)` + `onTextChange?` (teks polos untuk counter). Round-trip HTML via serialize↔parse bawaan TipTap; `immediatelyRender:false` agar SSR-safe (pelajaran S-005.22). Komponen tidak fetch/persist/sanitize sendiri — sanitasi milik konsumen/showcase (catatan strip bawah). | FR-005; konsisten pola controlled `tree-view`/`event-calendar`/`flow-editor`. |
| D3 | Toolbar milik komponen (bukan showcase): `role=toolbar` + grup inline/blok/sisip/undo + `tooltip` per tombol + `aria-pressed` live mengikuti seleksi. Tombol = `base/button` ghost icon; pemisah = `separator` vertikal; sticky + wrap (tanpa menu "..." v1). | FR-001, FR-002, FR-006; baseline S-005.22 diangkat jadi API (bukan gaya ad-hoc `ToolButton`). |
| D4 | Link via **M-009 popover** (desktop anchor seleksi; mobile dialog/sheet), bukan `window.prompt` baseline. Validasi: `https?://` atau path `/`; invalid → `aria-invalid` + pesan, Simpan disabled. `openOnClick:false` — klik link di editor membuka M-009 (edit/buka/hapus), bukan navigasi langsung. Shortcut `Ctrl/Cmd+K`. | FR-003; a11y FR-006 (prompt tidak fokus-terkelola). |
| D5 | Markdown shortcut = inputRules bawaan StarterKit (tanpa dep baru): `#/##/###␣`, `-␣`, `1.␣`, `**x**`, `*x*`, `` `x` ``, `>␣`. Hasil identik dengan toolbar (test membandingkan). Tanpa mode markdown kedua (non-goal PRD). | FR-004. |
| D6 | Mode `placeholder` (empty), `disabled`, `readonly` via prop. Readonly = toolbar disembunyikan/disabled + `editable:false` tetapi konten tetap dibaca SR (bukan `disabled`). Disabled = seluruh toolbar mati + konten non-editable, nilai tetap terlihat kontras. | FR-007, FR-011. |
| D7 | Counter karakter dari teks polos (`editor.getText()`), bukan HTML. Prop `maxLength` default **10.000** (OQ#4 answered): 90% = `warning` + teks, >100% = `destructive` + pesan; **peringatan, bukan blokir** — mengetik/simpan tetap boleh. Tanpa `@tiptap/extension-character-count` baru (hitung manual di `onUpdate`). | FR-008; OQ#4; tanpa dependency baru. |
| D8 | Gambar via URL = `extension-image` + dialog **M-010** (URL + alt wajib + pratinjau). Alt kosong → tolak dengan pesan (tidak disisipkan). Ini **satu-satunya tambahan paket TipTap baru** (`@tiptap/extension-image`) — butuh konfirmasi eksplisit per CONVENTIONS (lihat §10). Bila ditolak, FR-009 turun ke iterasi berikut tanpa mengubah kontrak lain. Upload via callback konsumen disiapkan sebagai `onImageUpload?` (opsional, di luar v1). | FR-009 should; OQ#3 answered-masuk-v1-bersyarat. |
| D9 | Undo/redo bawaan TipTap (`StarterKit` history) diekspos di toolbar + `Ctrl/Cmd+Z` + `Ctrl/Cmd+Shift+Z` + `disabled` mengikuti `can().undo/redo` + live region. | FR-010 must. |
| D10 | State matrix milik komponen via `loading`/`error`/`onRetry` + derivasi empty (`value` kosong). Skeleton toolbar+konten, `alert` + retry, placeholder empty — semua di wireframe §3. | FR-011. |
| D11 | Tanpa token baru. Permukaan `card`/`background`/`muted`, teks `foreground`/`muted-foreground`, aktif/fokus `highlight` + `primary`, code chip `muted`, link `highlight`, invalid `destructive`, warning `warning`. Prose konten = mapping `layout/prose` agar tulis = terbit. Audit light & dark via `pnpm test:tokens`. | FR-012; constraint OKLCH + parity. |
| D12 | Integration point mention (spec RM-10): editor menerima `extensions?: Extension[]` + `slotBefore/slotAfter` render — konsumen menyuntik node mention tanpa fork. Tidak ada UI mention v1 (could). | FR-013. |
| D13 | Serializer markdown = util murni `htmlToMarkdown`/`markdownToHtml` di `form/rich-text-editor-serializer.ts` (tanpa dep markdown baru v1; cakupan inti FR-001/002). HTML tetap sumber kebenaran; markdown hanya konversi saat diminta. | FR-015 should. |
| D14 | Showcase upgrade (bukan bagian komponen): S-005.22 di-upgrade ke komponen baru + panel demo (`DemoSection`: pemicu loading/empty/error, toggle disabled/readonly, dataset Prose, resep controlled 15 baris) + `ol` 6 langkah + smoke `pnpm -C apps/showcase build`. Demo ringkas di S-004.03 Forms. | FR-014. |

## 2. API Publik (contract)

```ts
import type { Extension } from '@tiptap/core';

export type RichTextMode = 'editable' | 'readonly' | 'disabled';

export interface RichTextEditorProps {
  value: string;                          // HTML — controlled (FR-005)
  onChange?: (html: string) => void;
  onTextChange?: (text: string, stats: { chars: number; words: number }) => void;
  placeholder?: string;                   // default 'Tulis sesuatu…'
  mode?: RichTextMode;                     // default 'editable' (FR-007)
  loading?: boolean;                       // FR-011
  error?: string | null;                   // FR-011 eksternal
  onRetry?: () => void;                    // FR-011
  maxLength?: number;                      // default 10000 (FR-008)
  showCounter?: boolean;                   // default true
  extensions?: Extension[];                // slot mention RM-10 (FR-013)
  onImageUpload?: (file: File) => Promise<{ src: string }>; // opsional, luar v1
  ariaLabel?: string;                       // default 'Rich text editor'
  className?: string;
}

// Util serializer (FR-015) — file terpisah, tanpa dep baru v1
export function htmlToMarkdown(html: string): string;
export function markdownToHtml(markdown: string): string;
```

Aturan contract:

- Murni presentasi + komposisi; fetch, validasi bisnis, sanitasi HTML, dan persist milik konsumen/showcase. `loading`/`error`/`onRetry` hanya visual.
- Controlled: `value` sumber kebenaran; `onChange` dipanggil tiap update TipTap. Counter memakai teks polos agar konsisten dengan batas.
- Judul/link/gambar kosong ditolak inline (`aria-invalid` + pesan); tidak ada throw untuk konten invalid — error parse masuk state `error` + retry.
- Tidak ada warna literal; status hanya token semantik. Toolbar + popover + dialog semuanya dari `@ds/ui` (`button`, `tooltip`, `popover`, `dialog`, `input`, `badge`, `skeleton`, `alert`, `kbd`).
- `extensions` hanya menambah (mention), tidak mengganti set inti D1 — garansi FR-001/002 tidak rusak oleh injeksi.

## 3. Algoritma Konten & Serialisasi

1. Inisialisasi: `useEditor({ extensions: [StarterKit(heading 1–3), Underline, Link(openOnClick:false, autolink), Placeholder, Image(dari D8)], content: value, immediatelyRender:false })`. `value` luar → `editor.commands.setContent` hanya bila berbeda (hindari loop + jaga seleksi).
2. Update: `onUpdate` → `onChange(editor.getHTML())` + `onTextChange(getText(), {chars, words})` → counter + `aria-pressed` toolbar via `editor.isActive(mark/blok)`.
3. Shortcut: inputRules StarterKit; test: ketik `#␣` ≡ klik H1; `-␣` ≡ bullet; `**x**` ≡ bold — hasil HTML identik.
4. Link M-009: seleksi → `extendMarkRange('link')` → `setLink({href})` / `unsetLink()`; validasi URL sebelum chain; fokus kembali ke seleksi asal.
5. Gambar M-010: URL valid + alt non-kosong → `setImage({src, alt})` di kursor; alt kosong/URL invalid → tolak + pesan (tanpa sisip).
6. Counter: `chars = getText().length`; ambang 90%/100% dari `maxLength`; over-limit = pesan + gaya, bukan blokir (OQ#4).
7. Serializer markdown (FR-015): mapping inti h1–h3/p/ul/ol/quote/code/link/strong/em — di luar itu fallback HTML mentah; round-trip inti dijamin test.

## 4. Varian

Bukan `cva` besar baru; varian lewat props + state TipTap:

| Varian | Nilai | Perilaku |
|---|---|---|
| `mode` | `editable` / `readonly` / `disabled` | §2 + wireframe §1–3 (FR-007) |
| Kontrol state | `loading` / `error` / empty / data | matrix wireframe §3 (FR-011) |
| Counter | normal / mendekati / melewati | §2 `maxLength/showCounter` + wireframe §2.5 (FR-008) |
| Gambar | ada / tanpa (tanpa paket image) | D8 fallback: tombol gambar disembunyikan bila extension absen |

## 5. A11y & Keyboard (ringkas)

Detail penuh wireframe §4. Inti: toolbar `role=toolbar` + tiap tombol `aria-pressed` + label Indonesia/Inggris konsisten ("Bold (Ctrl+B)"); konten `role=textbox aria-multiline` + `aria-label` + `aria-describedby` counter; M-009/M-010 fokus-trap ringan + Esc + fokus-kembali; live region kata/karakter + status format; link tidak warna-saja (underline + label); invalid selalu teks + `aria-invalid`; ring `primary` 2px; reduced-motion matikan transisi; touch semua operasi ada tombol (tanpa hover).

## 6. Token & Tema

| Elemen | Token |
|---|---|
| Permukaan toolbar/card | `card`, `background`, `muted/10` |
| Garis/pemisah | `border` |
| Teks konten | `foreground` / `muted-foreground` |
| Tombol aktif | `highlight` + `highlight-foreground` (existing, sudah lolos di S-005.22) |
| Fokus ring | `primary` |
| Link | `highlight` + underline |
| Code chip | `muted/50` + `border` + mono |
| Warning/over-limit | `warning` / `destructive` + teks (bukan warna saja) |

Tanpa token baru. Pasangan kontras existing diverifikasi ulang light & dark saat implementasi (FR-012) via `pnpm test:tokens` + tabel audit di story.

## 7. FR Coverage

| FR | Cakupan di spec |
|---|---|
| FR-001 | D1 + D3 + §2–3; flow 2; wireframe §1–2.1 |
| FR-002 | D1 + D3 + D5; flow 2; wireframe §2.2 |
| FR-003 | D4 + M-009; flow 3; wireframe §2.3 |
| FR-004 | D5 + §3 langkah 3; flow 2; wireframe §1 langkah + §4 |
| FR-005 | D2 + §2 `value/onChange` + §3 langkah 1–2; flow 1; wireframe §1 resep |
| FR-006 | D3 + D4 + §5; flow 2–4 jalur keyboard; wireframe §4 |
| FR-007 | D6 + §2 `mode`; flow 1; wireframe §3 matrix |
| FR-008 | D7 + §2 `maxLength/showCounter` + §3 langkah 6; flow 4; wireframe §2.5 |
| FR-009 | D8 + M-010; flow 4; wireframe §2.4 |
| FR-010 | D9 + D1 history; flow 2; wireframe §1 toolbar + §4 |
| FR-011 | D10 + §2 `loading/error/onRetry`; flow 1; wireframe §3 matrix |
| FR-012 | D11 + §6; flow 1 panel demo; wireframe §6 audit |
| FR-013 | D12 + §2 `extensions` slot; wireframe §2.2 catatan (tidak diimplementasi) |
| FR-014 | D14 + §8 scenario S-005.22 + S-004.03 demo |
| FR-015 | D13 + §2 serializer + §3 langkah 7 |

## 8. Rencana Scenario Showcase (S-005.22 + S-004.03)

- Halaman `/patterns/rich-text-editor` di-upgrade (status `in-design`): komponen baru + dataset Prose realistis (heading, list, quote, code, link, gambar) + `ol` 6 langkah Bahasa Indonesia + tombol [Muat contoh] [Atur ulang demo].
- Panel demo (di luar komponen): pemicu loading/empty/error + retry, toggle disabled/readonly, toggle light/dark, dataset valid/invalid-URL, counter 90%/over-limit.
- Demo ringkas di `/components/forms` (S-004.03): satu instance kecil sebagai resep form.
- Test hooks wajib: `data-testid` = `rte-toolbar`, `rte-button-<bold|italic|…>`, `rte-content`, `rte-counter`, `rte-link-popover`, `rte-image-dialog`, `rte-error`, `rte-empty`.
- Smoke: `pnpm -C apps/showcase build`. Light & dark parity; handler demo mock (log/toast).

## 9. Out of Scope (sesuai PRD non-goals)

- Kolaborasi realtime/CRDT; editing tabel; node kustom embed interaktif; export PDF/print; penggantian `textarea`; mode markdown kedua.

## 10. Open Questions & Butuh Konfirmasi

| # PRD | Rekomendasi design | Butuh |
|---|---|---|
| OQ#1–#4 | Sudah answered di gate 1 (TipTap 3.30.1, HTML must, gambar should, batas 10.000 peringatan) — tidak ada OQ baru di gate 2 | none |
| Dep baru | Promosi 5 paket existing (`react`, `starter-kit`, `link`, `placeholder`, `underline`, + `pm`) ke `packages/ui` bukan dep baru secara prinsip (sudah disetujui gate 1). Tambahan **`@tiptap/extension-image`** untuk FR-009 adalah paket baru → **butuh approval eksplisit** per CONVENTIONS. Rekomendasi: setujui (kecil, scoped) atau turunkan FR-009 ke iterasi berikut | **approval user**: setujui `extension-image` atau tunda FR-009 |
| Serializer | `htmlToMarkdown` internal tanpa dep baru v1 (cakupan inti saja) | none — dicatat agar tidak melebar ke `tiptap-markdown` tanpa approval |

## Changelog

| Tanggal | Perubahan |
|---|---|
| 2026-11-21 | Draft gate 2: D1–D14, contract, algoritma konten, wireframe, 4 flow, FR-001–FR-015 coverage, rencana S-005.22 + S-004.03 |
