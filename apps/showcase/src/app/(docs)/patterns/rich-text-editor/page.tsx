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

const PROSE_EXAMPLE = `<h2>Write with RichTextEditor</h2><p>A sample document with <strong>bold</strong>, <em>italic</em>, <u>underline</u>, and <code>inline code</code>.</p><ul><li>Single-level bullet list</li><li>Toolbar formatting matches keyboard shortcuts</li></ul><ol><li>First step</li><li>Second step</li></ol><blockquote><p>Quote: editing and publishing share the same Prose styles.</p></blockquote><pre><code>pnpm -C apps/showcase build</code></pre><p>Read the <a href="https://tiptap.dev">Tiptap documentation</a> and visit a <a href="/path/lokal">local path</a>.</p><p><img src="/examples/rich-text-document.svg" alt="Document illustration with a heading and lines of text" /></p>`;

const RECIPE = `const [value, setValue] = useState('<p>Hello</p>');
<RichTextEditor
  value={value}
  onChange={setValue}
  onTextChange={(t, s) => setCount(s.chars)}
  placeholder="Write something…"
  maxLength={10000}
  showCounter
  ariaLabel="Rich text editor"
/>
<p>{value.length} characters of HTML</p>
<Button onClick={save}>Save</Button>`;

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
        description="Compose formatted content with links and images. Try editing, read-only mode, and validation feedback."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              S-005.22
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {words === null ? 'Counting words…' : `${words} words`}
            </Badge>
          </div>
        }
      />

      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border/60 bg-muted/10">
          <CardTitle className="text-sm">Try it</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li><strong className="text-foreground">Format:</strong> select text and choose a toolbar format. Active buttons follow the selection.</li>
            <li><strong className="text-foreground">Shortcuts:</strong> type <code className="font-mono">#␣</code>, <code className="font-mono">-␣</code>, or <code className="font-mono">**text**</code> to apply the same formats.</li>
            <li><strong className="text-foreground">Link:</strong> select text, press <code className="font-mono">Ctrl+K</code>, enter a valid URL, and save. Click a link to edit, open, or remove it.</li>
            <li><strong className="text-foreground">Image:</strong> enter a valid image URL and required alt text, preview it, then insert it.</li>
            <li><strong className="text-foreground">Counter:</strong> choose “Limit: 50” and type past the limit. A warning appears without blocking input.</li>
            <li><strong className="text-foreground">Reset:</strong> choose “Reset demo” to clear the editor and errors, enable editing, and restore the 10,000-character limit.</li>
          </ol>
          <div className="flex flex-wrap gap-2">
            <Button variant="highlight" size="sm" onClick={loadExample} className="gap-1.5">
              <FolderOpen className="h-3.5 w-3.5" />
              Load example
            </Button>
            <Button variant="outline" size="sm" onClick={resetDemo} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demo
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border/60 bg-muted/10">
          <CardTitle className="text-sm flex items-center gap-2">
            <FlaskConical className="h-4 w-4 text-highlight" />
            Interactive demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6" onErrorCapture={(event) => {
          if (event.target instanceof HTMLImageElement) setImageFailed(true);
        }}>
          {imageFailed ? (
            <p role="status" className="text-sm text-muted-foreground">
              The example image is unavailable. It illustrates a document with a heading and lines of text; the editor content is still readable.
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
              Load for 1.5 seconds
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setValue(''); setError(null); }}>
              Clear content
            </Button>
            <Button variant="outline" size="sm" onClick={() => setError('Could not load content')}>
              Simulate error
            </Button>
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              Clear error
            </Button>
            <span className="text-muted-foreground">Counter:</span>
            <Button variant="outline" size="sm" onClick={() => setMaxLength(10000)}>
              Limit: 10,000
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMaxLength(50)}>
              Limit: 50
            </Button>
            <span className="text-muted-foreground">Dataset:</span>
            <Button variant="outline" size="sm" onClick={loadExample}>
              Valid content
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setValue('<p>Check the <a href="notaurl">broken link</a> and image without alt text</p>'); setError('Invalid URL example: fix the link or image, then save again'); }}>
              Invalid URL
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The counter uses plain text (<code className="font-mono">getText()</code>). Exceeding the limit shows a warning and an invalid ring without blocking input.
            Light and dark modes use semantic tokens; invalid states include text and <code className="font-mono">aria-invalid</code>, not color alone.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <pre className="overflow-x-auto rounded-xl border border-border bg-muted/20 p-4 font-mono text-xs leading-relaxed text-foreground">
            {RECIPE}
          </pre>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={copyRecipe} className="gap-1.5">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Copy recipe'}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href="/components/forms#rte-demo">View the compact Forms demo →</a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            The Forms demo (S-004.03) shows a compact editor with a placeholder, toolbar, and counter. This page (S-005.22) adds state controls and link (M-009) and image (M-010) workflows.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
