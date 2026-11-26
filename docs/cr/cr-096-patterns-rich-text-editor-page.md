# CR-096 — Patterns: halaman Rich Text Editor

**Status:** approved (ditetapkan user 2026-11-26)
**Sumber:** audit visual Patterns 2026-11-26 (screenshot 37 route) + umpan balik user atas pilot CR-094
**Ref:** `docs/design/visual-language.md`, CR-094 (payung komposisi), CR-095 (payung visual), CR-093 (istilah English), `packages/ui/src/components/form/rich-text-editor.tsx`

## Temuan

Lokasi: `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.tsx`. Bukti visual: `~/Projects/monorepo-bootstrap-audit/patterns/audit/shots/patterns_rich-text-editor__*` (light 2 segmen, dark 1, mobile 2 segmen).

| # | Severity | Lokasi | Deskripsi | Rekomendasi |
|---|---|---|---|---|
| 1 | major | `page.tsx:93–117` | **D1.2 Demo-first.** Enam langkah instruksi dan dua tombol mendahului editor; di mobile demo baru mulai pada y≈893. | Editor menjadi blok pertama setelah pengantar. |
| 2 | major | `page.tsx:95,121–124,193` | **D2.1, D2.2 Hierarki.** Tiga kartu setara berjudul `CardTitle text-sm` (14px). Level 14px muncul di antara body 16px dan h2 24px, dan halaman tidak punya h2. Satu demo diberi tiga lapis penanda: judul kartu, ikon labu, strip header. | Section docs memakai `SectionHeading` (h2); demo tunggal tanpa judul kartu. |
| 3 | major | `page.tsx:144–183` | **D2.5 Aksi vs state, D6.2.** Sepuluh tombol dalam empat baris berlabel. State terpilih = tombol `highlight` terisi, identik dengan aksi “Load example”; label memakai nilai mentah (`editable`). | State lewat `SegmentedControl` (Mode, State, Character limit); satu aksi: Reset demo. |
| 4 | major | `page.tsx:93–97,119–126,134` | **D5.1 Depth.** Card → strip header → editor berbingkai: tiga level permukaan untuk satu objek. | Editor memakai bingkai miliknya sendiri di latar halaman. |
| 5 | major | `page.tsx:75,97,144` | **D1.3 Spacing.** Ritme 40 → 16 → 12 (`pb-3` strip) → 8/12 (baris kontrol). Jarak strip dan baris kontrol berada di luar ritme halaman. | Dua nilai: 40 antar-section, 16 di dalam unit demo; 24 antar grup kontrol. |
| 6 | minor | `page.tsx:81–90` | **D2.6, D4.1 Fokus.** PageHeader membawa badge ID `S-005.22` dan counter kata: dua aksen tambahan di samping h1. | PageHeader tanpa `actions`; ID ke Implementation, counter ke baris status. |
| 7 | minor | `page.tsx:98–105,16` | **D1.5, D3.4.** Langkah ±110 karakter/baris selebar kartu. Judul dokumen contoh “Write with RichTextEditor” adalah instruksi meta, bukan isi dokumen. | Teks docs `max-w-xl`; judul dokumen realistis. |
| 8 | minor | `page.tsx:196–203` | **D5.4, D6.** `<pre>` manual + tombol copy buatan, berbeda dari `CodeBlock` di halaman lain. | `CodeBlock` dari `@ds/ui`. |
| 9 | minor | `page.tsx:81–90,144–183` | **D6.6 Mobile.** Badge header wrap ke baris sendiri; tombol kontrol menggerombol tanpa grup. | Kontrol menumpuk per grup; tanpa badge. |

## Perubahan yang Diusulkan

Hanya dua file: `rich-text-editor/page.tsx` dan `rich-text-editor/page.test.tsx`. Tidak ada perubahan `packages/ui`, API publik, token, atau dependency.

### Struktur tujuan

```text
PageHeader — eyebrow · h1 · pengantar (tanpa badge)
  ↓ 40
DEMO — satu unit, tanpa kartu pembungkus, tanpa judul terlihat
  kontrol simulasi (satu baris, wrap per grup):
    Mode [Editable | Read only | Disabled]
    State [Idle | Loading | Load error]
    Character limit [10,000 | 50]
  ↓ 16
  RichTextEditor — bingkai milik komponen
  ↓ 16
  baris status: “47 words” (kiri) · [Reset demo] ghost (kanan)
  ↓ 40
Try it — SectionHeading h2, 6 langkah ringkas, max-w-xl, tanpa kartu
  ↓ 40
Implementation — SectionHeading h2, CodeBlock + Copy, meta ID (text-xs muted)
  ↓ 40
Accessibility notes — SectionHeading h2, 5 bullet dari perilaku komponen, max-w-xl
```

Level heading turun menjadi dua: h1 36px → h2 24px (`SectionHeading`). Judul 14px dihapus. Di bawahnya hanya body 16px, label kontrol 14px (sama dengan item `SegmentedControl`), dan meta 12px.

### Snippet kunci

```tsx
<section aria-label="Interactive demo" className="space-y-4">
  <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
    <DemoControl label="Mode" value={mode} onValueChange={setMode}
      options={[{ value: 'editable', label: 'Editable' }, { value: 'readonly', label: 'Read only' }, { value: 'disabled', label: 'Disabled' }]} />
    <DemoControl label="State" value={demoState} onValueChange={setDemoState}
      options={[{ value: 'idle', label: 'Idle' }, { value: 'loading', label: 'Loading' }, { value: 'load-error', label: 'Load error' }]} />
    <DemoControl label="Character limit" value={String(maxLength)} onValueChange={(next) => setMaxLength(Number(next))}
      options={[{ value: '10000', label: '10,000' }, { value: '50', label: '50' }]} />
  </div>

  <RichTextEditor
    value={value}
    onChange={setValue}
    onTextChange={(_text, stats) => setWords(stats.words)}
    mode={mode}
    loading={demoState === 'loading'}
    error={demoState === 'load-error' ? 'Check your connection, then try again.' : null}
    onRetry={retry}
    maxLength={maxLength}
  />

  <div className="flex flex-wrap items-center justify-between gap-2">
    <p className="text-xs tabular-nums text-muted-foreground">
      {words === null ? 'Counting words…' : `${words} words`}
    </p>
    <Button variant="ghost" size="sm" onClick={resetDemo} className="gap-1.5">
      <RotateCcw className="h-3.5 w-3.5" />
      Reset demo
    </Button>
  </div>
</section>
```

```tsx
// Helper lokal; kelas label mengikuti `Label` @ds/ui (dicek saat eksekusi).
function DemoControl({ label, value, onValueChange, options }: DemoControlProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <SegmentedControl
        type="single"
        value={value}
        onValueChange={(next) => { if (next) onValueChange(next); }}
        aria-label={label}
        className="max-w-full overflow-x-auto"
      >
        {options.map((option) => (
          <SegmentedControlItem key={option.value} value={option.value}>{option.label}</SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  );
}
```

```tsx
<section id="try-it" aria-labelledby="try-it-heading" className="space-y-4 scroll-mt-20">
  <SectionHeading id="try-it-heading" title="Try it" />
  <ol className="max-w-xl list-decimal space-y-2 pl-5 text-base">
    <li><strong className="font-semibold">Format</strong> — select text and choose a toolbar format; active buttons follow the selection.</li>
    <li><strong className="font-semibold">Shortcuts</strong> — type <code className="font-mono">#␣</code>, <code className="font-mono">-␣</code>, or <code className="font-mono">**text**</code> to apply the same formats.</li>
    <li><strong className="font-semibold">Link</strong> — select text, press <code className="font-mono">Ctrl+K</code>, enter <code className="font-mono">notaurl</code> to see the validation message, then save a valid URL.</li>
    <li><strong className="font-semibold">Image</strong> — enter a valid image URL and alt text, preview it, then insert it.</li>
    <li><strong className="font-semibold">Limit</strong> — set Character limit to 50 and type past the limit; input is not blocked.</li>
    <li><strong className="font-semibold">State</strong> — set Mode to Read only, or State to Load error and choose Try again.</li>
  </ol>
</section>
```

```tsx
<section id="implementation" aria-labelledby="implementation-heading" className="space-y-4 scroll-mt-20">
  <SectionHeading id="implementation-heading" title="Implementation" />
  <CodeBlock filename="RichTextEditorDemo.tsx" language="tsx" code={RECIPE} className="max-w-3xl" />
  <p className="text-xs text-muted-foreground">
    The Forms demo (S-004.03) shows a compact editor with a placeholder, toolbar, and counter.
    This page (S-005.22) adds state controls and the link (M-009) and image (M-010) workflows.{' '}
    <a href="/components/forms#rte-demo" className="underline underline-offset-2">View the compact Forms demo →</a>
  </p>
</section>
```

### Before / after per area

| Area | Prinsip | Sebelum | Sesudah |
|---|---|---|---|
| Urutan | D1.2 | Langkah + tombol sebelum editor | Editor langsung setelah pengantar |
| Hierarki | D2.1, D2.2 | 3 kartu `CardTitle` 14px, tanpa h2 | h1 → h2 `SectionHeading` → body → meta |
| Kontrol | D2.5, D6.2 | 10 tombol, state terpilih menyerupai aksi | 3 `SegmentedControl` (8 pilihan) + 1 aksi ghost |
| Header | D2.6, D4.1 | Badge ID + counter di PageHeader | PageHeader polos; ID di Implementation; counter di baris status |
| Permukaan | D5.1 | Card → strip → editor | Editor dengan bingkainya di latar halaman |
| Spacing | D1.3 | 40 / 16 / 12 / 8 bercampur | 40 antar-section; 16 dalam unit demo; 8 label–kontrol; 24 antar grup kontrol |
| Teks | D1.5, D3.4 | ±110 karakter/baris; judul meta | ≤ ±75 karakter/baris; “Formatting in practice” |
| Kode | D5.4 | `<pre>` + tombol copy buatan | `CodeBlock` @ds/ui |
| Mobile | D6.6 | Badge wrap; tombol menggerombol | Grup kontrol menumpuk; tanpa badge |

### Model state

`loading` dan `error` digabung menjadi `demoState: 'idle' | 'loading' | 'load-error'`.

| demoState | Efek |
|---|---|
| `idle` | Tanpa loading/error. |
| `loading` | Skeleton 1,5 detik, lalu kembali ke `idle`; timer dibersihkan bila state diganti lebih dulu. |
| `load-error` | Alert bawaan komponen (judul “Could not load content”) berisi “Check your connection, then try again.”; **Try again** memicu `loading`. |

Tidak ada state “Invalid link”: judul alert komponen tetap “Could not load content”, sehingga menyesatkan untuk kesalahan URL. Validasi URL diperagakan lewat dialog link (langkah Try it), tempat pesan aslinya muncul.

`resetDemo` mengembalikan kondisi awal: `PROSE_EXAMPLE`, Editable, `idle`, batas 10.000, fallback gambar dihapus.

Isi paragraf helper di bawah editor (`page.tsx:184–187`: counter memakai teks polos, limit tidak memblokir, invalid tidak hanya lewat warna) pindah ke Accessibility notes.

### Perubahan perilaku demo (perlu persetujuan eksplisit)

1. **Reset demo** mengembalikan kondisi awal, bukan mengosongkan editor. Editor kosong tetap bisa dicapai dengan menghapus isi; “Load example” tidak diperlukan lagi.
2. Tombol “Load example”, “Clear content”, “Simulate error”, “Clear error”, “Valid content”, “Invalid URL” dihapus, diganti grup State di atas.
3. Pilihan mode/state/limit berpindah dari tombol `aria-pressed` ke `SegmentedControl` (`ToggleGroup type="single"`): role dan keyboard mengikuti kontrak DS: panah memindah fokus, Space/Enter memilih.
4. `page.test.tsx` ditulis ulang dengan niat sama (hitungan kata mengikuti isi, fallback gambar, reset, state error), bukan sekadar mengganti angka.
5. Judul dokumen contoh berubah dari “Write with RichTextEditor” menjadi “Formatting in practice” (jumlah kata tetap 3, total tetap 47).

### Di luar scope (input CR komponen)

- Toolbar editor membungkus tiga baris di mobile (`packages/ui/src/components/form/rich-text-editor.tsx:692–698`).
- `SegmentedControl` memotong item saat lebih lebar dari kontainer; halaman ini hanya membungkusnya dengan `overflow-x-auto`.
- Judul `<h2>` di dalam dokumen contoh tetap level h2 (isi pengguna, bukan struktur halaman).

## Tasks (jalur small-fix)

- [ ] Susun ulang `page.tsx` sesuai struktur tujuan; hapus Card/CardHeader/CardTitle/Badge/FlaskConical/FolderOpen/Copy/Check yang tak terpakai.
- [ ] Ganti state `loading`/`error` dengan `demoState`; tulis `resetDemo`, `retry`, dan pembersihan timer loading.
- [ ] Tulis ulang Try it, Implementation (`RECIPE` lewat `CodeBlock`), dan Accessibility notes; verifikasi setiap klaim a11y ke `rich-text-editor.tsx` (toolbar :692–698, loading :665, error :870–883, limit :885–916).
- [ ] Tulis ulang `page.test.tsx`: 47 words di awal; fallback gambar; Read only menyembunyikan toolbar; reset mengembalikan mode dan isi; Load error → pesan error → Try again → loading selesai; batas 50 → alert over-limit.
- [ ] Preview before/after light, dark, mobile (alat capture di `~/Projects/monorepo-bootstrap-audit/tools/shot2.mjs`), screenshot dibaca sebagai image, iterasi bersama user.
- [ ] Verifikasi targeted (`vitest run patterns/rich-text-editor`, eslint, `build:types`) lalu typecheck → lint → test; build dari salinan sementara.

### Test terdampak

- `apps/showcase/src/app/(docs)/patterns/rich-text-editor/page.test.tsx` — ditulis ulang (lihat Tasks).
- `apps/showcase/src/test/visual-language-guard.test.ts` — harus tetap hijau; heading section memakai `SectionHeading`.
- Smoke interaktif RTE di `packages/ui` yang flaky (pre-existing) tidak tersentuh.

## Keputusan

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Halaman = satu demo utama + tiga section docs (Try it, Implementation, Accessibility notes). | D2.1: satu fokus utama. |
| 2 | Demo tunggal tidak diberi heading terlihat; h1 dan pengantar langsung di atasnya. Section lain memakai `SectionHeading`. | Menghindari “satu informasi, heading berlapis” (koreksi user). Demo ditandai `section aria-label="Interactive demo"`. |
| 3 | Kontrol simulasi = state lewat `SegmentedControl`; satu aksi yaitu Reset demo (ghost). | D2.5: state tidak boleh tampil seperti aksi; `primary`/`highlight` hanya untuk aksi. |
| 4 | Ritme halaman memakai dua nilai yang sudah ada di visual-language: 40 antar-section, 16 di dalam unit. | Spacing sebagai ritme, bukan menu nilai. |
| 5 | Tidak mengubah `packages/ui`. Masalah toolbar mobile dan overflow `SegmentedControl` menjadi CR komponen. | Satu masalah satu CR; API publik tidak berubah. |
| 6 | CR-094 dan CR-095 adalah payung; CR ini CR halaman pertama dari seri Patterns. | Keputusan 9 CR-094. |

## Design System Checks

- [ ] Tidak ada hex/RGB hardcode; memakai token semantik.
- [ ] Kontras light dan dark lolos WCAG AA pada pasangan yang disentuh (`text-muted-foreground` untuk label dan status).
- [ ] Perilaku Radix/a11y tidak rusak: label grup kontrol, `aria-busy`, alert error, `role="status"` counter tetap ada.
- [ ] API `cva` dan export `@ds/ui` tetap konsisten (tidak ada perubahan).
- [ ] State loading, empty, dan error relevan tersedia (loading, error dengan Try again, editor kosong, fallback gambar).
- [ ] Mobile: grup kontrol menumpuk tanpa terpotong; tanpa scroll horizontal.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` pass; smoke build dari salinan sementara.

## Eksekusi

Branch: `cr-096-patterns-rich-text-editor-page`
Commit: `fix: redesign patterns rich text editor page [CR-096]`

- [x] CR disetujui user (termasuk 5 perubahan perilaku demo) — 2026-11-26.
- [ ] Branch dibuat dari `pattern-polish`.
- [ ] Perubahan diimplementasikan.
- [ ] Preview before/after bersama user; CR dimutakhirkan ke `file:line` final.
- [ ] Verifikasi dijalankan.
- [ ] CR di-tick dan status di `docs/BACKLOG.md` diperbarui.
- [ ] `docs/STATUS.md` diperbarui bila relevan.
- [ ] `docs/STATUS-LOG.md` di-append (`YYYY-MM-DD — ringkasan — referensi`) dan `node scripts/check-status-log.mjs` hijau.
