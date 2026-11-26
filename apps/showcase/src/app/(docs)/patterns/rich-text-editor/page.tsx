'use client';

import * as React from 'react';
import { PenLine, RotateCcw } from 'lucide-react';
import {
  PageHeader,
  Button,
  CodeBlock,
  Kbd,
  RichTextEditor,
  SegmentedControl,
  SegmentedControlItem,
} from '@ds/ui';
import { SectionHeading } from '../../../../components/section-heading';

const PROSE_EXAMPLE = `<h2>Formatting in practice</h2><p>A sample document with <strong>bold</strong>, <em>italic</em>, <u>underline</u>, and <code>inline code</code>.</p><ul><li>Single-level bullet list</li><li>Toolbar formatting matches keyboard shortcuts</li></ul><ol><li>First step</li><li>Second step</li></ol><blockquote><p>Quote: editing and publishing share the same Prose styles.</p></blockquote><pre><code>pnpm -C apps/showcase build</code></pre><p>Read the <a href="https://tiptap.dev">Tiptap documentation</a> and visit a <a href="/path/lokal">local path</a>.</p><p><img src="/examples/rich-text-document.svg" alt="Document illustration with a heading and lines of text" /></p>`;

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

/** Input rules bawaan editor: yang diketik → hasil yang muncul. */
const TYPING_SPECIMENS = [
  {
    typed: '## Title',
    name: 'Heading',
    result: <span className="font-display text-3xl font-bold tracking-tight">Title</span>,
  },
  {
    typed: '- Item',
    name: 'Bullet list',
    result: (
      <span className="flex items-center gap-3 text-xl">
        <span className="h-2 w-2 rounded-full bg-highlight" />
        Item
      </span>
    ),
  },
  {
    typed: '1. Step',
    name: 'Numbered list',
    result: (
      <span className="flex items-baseline gap-3 text-xl">
        <span className="font-display font-bold tabular-nums">1.</span>
        Step
      </span>
    ),
  },
  {
    typed: '> Quote',
    name: 'Quote',
    result: <span className="border-l-4 border-highlight pl-4 text-xl italic text-muted-foreground">Quote</span>,
  },
  {
    typed: '**bold**',
    name: 'Bold',
    result: <span className="text-2xl font-bold">bold</span>,
  },
  {
    typed: '`code`',
    name: 'Inline code',
    result: <span className="rounded-md border border-border bg-muted/50 px-2 py-1 font-mono text-lg">code</span>,
  },
];

const BREAK_CASES = [
  {
    input: 'notaurl',
    action: 'Select text, press Ctrl+K or ⌘K, and save this.',
    outcome: 'The field is marked invalid and says why. Nothing is linked.',
  },
  {
    input: '50',
    action: 'Set Character limit to 50, then keep typing.',
    outcome: 'The counter raises an alert. Your input is never blocked.',
  },
  {
    input: 'Load error',
    action: 'Switch State to Load error.',
    outcome: 'An alert appears and editing pauses. Try again reloads.',
  },
];

const SHORTCUTS = [
  { label: 'Bold', keys: ['B'] },
  { label: 'Italic', keys: ['I'] },
  { label: 'Underline', keys: ['U'] },
  { label: 'Link', keys: ['K'] },
  { label: 'Undo', keys: ['Z'] },
  { label: 'Redo', keys: ['Shift', 'Z'] },
];

const ARIA_NOTES = [
  { term: 'aria-pressed', meaning: 'Format buttons in the “Text formatting” toolbar report whether they are active.' },
  { term: 'aria-invalid', meaning: 'Bad link and image fields are flagged, with a text message beside them.' },
  { term: 'aria-busy', meaning: 'Set while loading, alongside hidden loading text.' },
  { term: 'role="alert"', meaning: 'Load errors and an exceeded limit are announced as text, not just colour.' },
  { term: 'Tab order', meaning: 'Read only hides the toolbar. Disabled removes the editor from the Tab order.' },
];

const CONTRACT = [
  { term: 'value / onChange', meaning: 'Controlled HTML string in, HTML string out.' },
  { term: 'onTextChange', meaning: 'Plain text and its counts, so you never parse HTML.' },
  { term: 'maxLength', meaning: 'Counts plain text. It warns and does not block.' },
];

type Mode = 'editable' | 'readonly' | 'disabled';
type DemoState = 'idle' | 'loading' | 'load-error';

const MODE_OPTIONS = [
  { value: 'editable', label: 'Editable' },
  { value: 'readonly', label: 'Read only' },
  { value: 'disabled', label: 'Disabled' },
] as const;

const STATE_OPTIONS = [
  { value: 'idle', label: 'Idle' },
  { value: 'loading', label: 'Loading' },
  { value: 'load-error', label: 'Load error' },
] as const;

const LIMIT_OPTIONS = [
  { value: '10000', label: '10,000' },
  { value: '50', label: '50' },
] as const;

interface DemoControlProps<T extends string> {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onValueChange: (value: T) => void;
}

/** Label + segmented single-select; selalu ada satu nilai terpilih. */
function DemoControl<T extends string>({ label, value, options, onValueChange }: DemoControlProps<T>) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <SegmentedControl
        type="single"
        value={value}
        onValueChange={(next) => {
          if (next) onValueChange(next as T);
        }}
        aria-label={label}
        className="max-w-full overflow-x-auto"
      >
        {options.map((option) => (
          <SegmentedControlItem key={option.value} value={option.value}>
            {option.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  );
}

export default function RichTextEditorPage() {
  const [value, setValue] = React.useState(PROSE_EXAMPLE);
  const [words, setWords] = React.useState<number | null>(null);
  const [imageFailed, setImageFailed] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>('editable');
  const [demoState, setDemoState] = React.useState<DemoState>('idle');
  const [maxLength, setMaxLength] = React.useState(10000);

  // Cleanup membatalkan timer bila State diganti atau halaman ditutup lebih dulu.
  React.useEffect(() => {
    if (demoState !== 'loading') return;
    const timer = window.setTimeout(() => setDemoState('idle'), 1500);
    return () => window.clearTimeout(timer);
  }, [demoState]);

  const retry = React.useCallback(() => setDemoState('loading'), []);

  const resetDemo = React.useCallback(() => {
    setValue(PROSE_EXAMPLE);
    setMode('editable');
    setDemoState('idle');
    setMaxLength(10000);
    setImageFailed(false);
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={PenLine}
        title="Rich Text Editor"
        description="Compose formatted content with links and images. Try editing, read-only mode, and validation feedback."
      />

      <section
        aria-label="Interactive demo"
        className="space-y-4"
        onErrorCapture={(event) => {
          if (event.target instanceof HTMLImageElement) setImageFailed(true);
        }}
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <DemoControl label="Mode" value={mode} options={MODE_OPTIONS} onValueChange={setMode} />
          <DemoControl label="State" value={demoState} options={STATE_OPTIONS} onValueChange={setDemoState} />
          <DemoControl
            label="Character limit"
            value={String(maxLength)}
            options={LIMIT_OPTIONS}
            onValueChange={(next) => setMaxLength(Number(next))}
          />
        </div>

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
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset demo
          </Button>
        </div>
      </section>

      <section id="try-it" aria-labelledby="try-it-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="try-it-heading"
          title="Type it, don’t click it"
          description="Type these on an empty line in the editor above. Formatting happens as you go."
        />
        <ul className="grid gap-px overflow-hidden rounded-xl border border-border bg-border grid-cols-2 lg:grid-cols-3">
          {TYPING_SPECIMENS.map((specimen) => (
            <li key={specimen.name} className="flex flex-col bg-card">
              <div className="flex flex-col gap-1 border-b border-dashed border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <code className="font-mono text-sm">{specimen.typed}</code>
                <span className="text-xs text-muted-foreground">{specimen.name}</span>
              </div>
              <div aria-hidden="true" className="flex min-h-24 flex-1 sm:min-h-28 items-center justify-center p-4">
                {specimen.result}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="edge-cases" aria-labelledby="edge-cases-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading id="edge-cases-heading" title="Try to break it" />
        <ul className="grid gap-6 md:grid-cols-3">
          {BREAK_CASES.map((item) => (
            <li key={item.input} className="space-y-2 border-t-2 border-highlight pt-4">
              <p className="font-mono text-2xl font-bold">{item.input}</p>
              <p className="text-sm">{item.action}</p>
              <p className="text-sm text-muted-foreground">{item.outcome}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="accessibility" aria-labelledby="accessibility-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading id="accessibility-heading" title="Keyboard & screen readers" />
        <div className="grid gap-6 lg:grid-cols-5">
          <dl className="self-start rounded-xl border border-border bg-card px-4 lg:col-span-2">
            {SHORTCUTS.map((shortcut) => (
              <div key={shortcut.label} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
                <dt className="text-sm">{shortcut.label}</dt>
                <dd className="flex items-center gap-1">
                  <Kbd>⌘ / Ctrl</Kbd>
                  {shortcut.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <dl className="lg:col-span-3">
            {ARIA_NOTES.map((note) => (
              <div key={note.term} className="grid gap-1 border-b border-border py-3 first:pt-0 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="font-mono text-sm font-medium">{note.term}</dt>
                <dd className="text-sm text-muted-foreground">{note.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="implementation" aria-labelledby="implementation-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading id="implementation-heading" title="Drop it in" />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <dl className="space-y-4">
              {CONTRACT.map((item) => (
                <div key={item.term} className="space-y-1 border-l-2 border-highlight pl-4">
                  <dt className="font-mono text-sm font-medium">{item.term}</dt>
                  <dd className="text-sm text-muted-foreground">{item.meaning}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground">
              <a href="/components/forms#rte-demo" className="underline underline-offset-2">
                View the compact Forms demo →
              </a>
            </p>
          </div>
          <CodeBlock filename="RichTextEditorDemo.tsx" language="tsx" code={RECIPE} className="min-w-0 self-start lg:col-span-3" />
        </div>
      </section>
    </div>
  );
}
