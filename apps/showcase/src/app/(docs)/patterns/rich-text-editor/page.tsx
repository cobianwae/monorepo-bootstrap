'use client';

import * as React from 'react';
import { PenLine, RotateCcw, FolderOpen, FlaskConical, Copy, Check } from 'lucide-react';
import {
  PageHeader,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  RichTextEditor,
} from '@ds/ui';

const PROSE_EXAMPLE = `<h2>Menulis dengan RichTextEditor</h2><p>Dokumen contoh dengan <strong>tebal</strong>, <em>miring</em>, <u>garis bawah</u>, dan <code>kode sebaris</code>.</p><ul><li>Bullet satu tingkat</li><li>Format via toolbar = hasil shortcut</li></ul><ol><li>Langkah pertama</li><li>Langkah kedua</li></ol><blockquote><p>Kutipan: tulis = terbit, gaya Prose sama.</p></blockquote><pre><code>pnpm -C apps/showcase build</code></pre><p>Baca <a href="https://tiptap.dev">dokumentasi Tiptap</a> dan lihat <a href="/path/lokal">jalur lokal</a>.</p><p><img src="/examples/rich-text-document.svg" alt="Ilustrasi dokumen dengan judul dan baris teks" /></p>`;

const RECIPE = `const [value, setValue] = useState('<p>Halo</p>');
<RichTextEditor
  value={value}
  onChange={setValue}
  onTextChange={(t, s) => setCount(s.chars)}
  placeholder="Tulis sesuatu…"
  maxLength={10000}
  showCounter
  ariaLabel="Rich text editor"
/>
<p>{value.length} karakter</p>
<Button onClick={save}>Simpan</Button>`;

export default function RichTextEditorPage() {
  const [value, setValue] = React.useState(PROSE_EXAMPLE);
  const [words, setWords] = React.useState<number | null>(null);
  const [imageFailed, setImageFailed] = React.useState(false);
  const [mode, setMode] = React.useState<'editable' | 'readonly' | 'disabled'>('editable');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [maxLength, setMaxLength] = React.useState(10000);
  const [copied, setCopied] = React.useState(false);

  const loadExample = React.useCallback(() => {
    setError(null);
    setLoading(false);
    setMode('editable');
    setMaxLength(10000);
    setValue(PROSE_EXAMPLE);
    setImageFailed(false);
  }, []);

  const resetDemo = React.useCallback(() => {
    setError(null);
    setLoading(false);
    setMode('editable');
    setMaxLength(10000);
    setValue('');
  }, []);

  const triggerLoading = React.useCallback(() => {
    setError(null);
    setLoading(true);
    window.setTimeout(() => setLoading(false), 1500);
  }, []);

  const copyRecipe = React.useCallback(async () => {
    try {
      await navigator.clipboard.writeText(RECIPE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={PenLine}
        title="Rich Text Editor"
        description="Showcase final S-005.22: komponen reusable form/RichTextEditor — toolbar milik komponen, M-009 link, M-010 gambar, counter, dan state matrix. Demo S-004.03 ada di halaman Forms."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              S-005.22
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {words === null ? 'Menghitung kata…' : `${words} kata`}
            </Badge>
          </div>
        }
      />

      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border/60 bg-muted/10">
          <CardTitle className="text-sm">Alur end-to-end (6 langkah)</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li><strong className="text-foreground">Format:</strong> seleksi teks lalu klik Bold/Italic/Heading/list/quote di toolbar — tombol aktif mengikuti seleksi.</li>
            <li><strong className="text-foreground">Shortcut:</strong> ketik <code className="font-mono">#␣</code>, <code className="font-mono">-␣</code>, <code className="font-mono">**teks**</code> — hasil identik dengan toolbar.</li>
            <li><strong className="text-foreground">Link M-009:</strong> seleksi teks → tombol Link / <code className="font-mono">Ctrl+K</code> → isi URL valid → Simpan; klik link membuka edit/buka/hapus.</li>
            <li><strong className="text-foreground">Gambar M-010:</strong> tombol gambar → URL valid + alt wajib → pratinjau → Sisipkan; tanpa alt ditolak dengan pesan.</li>
            <li><strong className="text-foreground">Counter:</strong> tekan “batas 50”, ketik melewati batas — status warning/over-limit muncul, mengetik tetap boleh (peringatan, bukan blokir).</li>
            <li><strong className="text-foreground">Atur ulang:</strong> tekan [Atur ulang demo] — kembali ke kosong/editable/10.000 tanpa error.</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button variant="highlight" size="sm" onClick={loadExample} className="gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              Muat contoh
            </Button>
            <Button variant="outline" size="sm" onClick={resetDemo} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Atur ulang demo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border/60 bg-muted/10">
          <CardTitle className="text-sm flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-highlight" />
            Demo interaktif + panel state
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6" onErrorCapture={(event) => {
          if (event.target instanceof HTMLImageElement) setImageFailed(true);
        }}>
          {imageFailed ? (
            <p role="status" className="text-sm text-muted-foreground">
              Gambar contoh tidak tersedia. Ilustrasi menunjukkan dokumen dengan judul dan baris teks; isi editor tetap dapat dibaca.
            </p>
          ) : null}
          <RichTextEditor
            value={value}
            onChange={setValue}
            onTextChange={(_text, stats) => setWords(stats.words)}
            mode={mode}
            loading={loading}
            error={error}
            onRetry={() => setError(null)}
            maxLength={maxLength}
          />
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Mode:</span>
            {(['editable', 'readonly', 'disabled'] as const).map((m) => (
              <Button
                key={m}
                variant={mode === m ? 'highlight' : 'outline'}
                size="sm"
                onClick={() => setMode(m)}
              >
                {m}
              </Button>
            ))}
            <span className="text-muted-foreground">State:</span>
            <Button variant="outline" size="sm" onClick={triggerLoading}>
              loading 1,5 dtk
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setValue(''); setError(null); }}>
              empty
            </Button>
            <Button variant="outline" size="sm" onClick={() => setError('Konten gagal dimuat')}>
              error
            </Button>
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              retry/clear
            </Button>
            <span className="text-muted-foreground">Counter:</span>
            <Button variant="outline" size="sm" onClick={() => setMaxLength(10000)}>
              10.000
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMaxLength(50)}>
              batas 50
            </Button>
            <span className="text-muted-foreground">Dataset:</span>
            <Button variant="outline" size="sm" onClick={loadExample}>
              valid Prose
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setValue('<p>Lihat <a href="notaurl">tautan rusak</a> + gambar tanpa alt</p>'); setError('Dataset invalid-URL: perbaiki tautan/gambar lalu simpan ulang'); }}>
              invalid-URL
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Counter dari teks polos (<code className="font-mono">getText()</code>); over-limit = peringatan + ring invalid, bukan blokir.
            Light & dark memakai token semantik; invalid selalu teks + <code className="font-mono">aria-invalid</code>, bukan warna saja.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Resep controlled (15 baris) + demo Forms S-004.03</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="overflow-x-auto rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs leading-relaxed text-foreground">
            {RECIPE}
          </pre>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyRecipe} className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Tersalin' : 'Salin resep'}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/components/forms#rte-demo">Lihat demo ringkas di Forms →</a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            S-004.03 memakai instance ringkas (placeholder + toolbar + counter) sebagai contoh form benar; panel demo penuh hanya di S-005.22 ini.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
