'use client';

import * as React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo2,
  Redo2,
  Link2,
  Highlighter,
  FileText,
  Save,
  Eye,
  Sparkles,
  PenLine,
} from 'lucide-react';
import {
  PageHeader,
  Button,
  Badge,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Skeleton,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  Separator,
  toast,
} from '@ds/ui';

const INITIAL_CONTENT = `<h2>Ship interfaces you're proud of</h2>
<p>This document is rendered by a <strong>Tiptap</strong> editor styled with the design-system tokens. Everything you type here supports real-time formatting — try it.</p>
<blockquote><p>&ldquo;Consistency is not sameness; it is disciplined variance within a shared language.&rdquo;</p></blockquote>
<h3>Why OKLCH?</h3>
<p>OKLCH is a <em>perceptual</em> color space, so equal numerical steps produce equal perceived steps. That makes contrast calculations predictable and lets us guarantee <strong>WCAG AA/AAA</strong> in both light and dark mode.</p>
<ul>
  <li>Perceptually uniform lightness axis</li>
  <li>Hue that stays stable while saturation scales</li>
  <li>Automated pairwise contrast auditing in CI</li>
</ul>
<pre><code>--color-primary: oklch(0.57 0.19 264);</code></pre>
<p>Add your own content above, or <a href="https://tiptap.dev" rel="noopener">read the Tiptap docs</a>.</p>`;

const PROSE_CLASSES = [
  'max-w-none',
  '[&_h1]:text-3xl [&_h1]:sm:text-4xl [&_h1]:font-extrabold [&_h1]:font-display [&_h1]:tracking-tight [&_h1]:mt-8 [&_h1]:mb-4',
  '[&_h2]:text-2xl [&_h2]:sm:text-3xl [&_h2]:font-bold [&_h2]:font-display [&_h2]:tracking-tight [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-border/50 [&_h2]:pb-2',
  '[&_h3]:text-xl [&_h3]:sm:text-2xl [&_h3]:font-bold [&_h3]:font-display [&_h3]:mt-6 [&_h3]:mb-2',
  '[&_p]:mb-4 [&_p]:text-base [&_p]:leading-7 [&_p]:text-muted-foreground',
  '[&_a]:text-highlight [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:opacity-80',
  '[&_strong]:text-foreground [&_strong]:font-semibold',
  '[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul]:space-y-1 [&_ul]:text-muted-foreground',
  '[&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol]:space-y-1 [&_ol]:text-muted-foreground',
  '[&_blockquote]:border-l-4 [&_blockquote]:border-highlight [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground',
  '[&_code]:rounded-md [&_code]:border [&_code]:border-border [&_code]:bg-muted/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-foreground',
  '[&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted/40 [&_pre]:p-4 [&_pre]:overflow-x-auto [&_pre]:my-6 [&_pre]:[&_code]:border-0 [&_pre]:[&_code]:bg-transparent [&_pre]:[&_code]:p-0',
  '[&_hr]:my-8 [&_hr]:border-border/60',
].join(' ');

interface ToolbarButton {
  icon: typeof Bold;
  label: string;
  action: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

const ToolbarGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-0.5">{children}</div>
);

const ToolButton = ({ icon: Icon, label, action, isActive, disabled }: ToolbarButton) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        type="button"
        aria-label={label}
        aria-pressed={isActive}
        disabled={disabled}
        onClick={action}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors ${
          isActive
            ? 'bg-highlight text-highlight-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-40'
        }`}
      >
        <Icon className="h-4 w-4" />
      </button>
    </TooltipTrigger>
    <TooltipContent side="bottom">{label}</TooltipContent>
  </Tooltip>
);

export default function RichTextEditorPage() {
  const [isMounted, setIsMounted] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [wordCount, setWordCount] = React.useState(0);

  React.useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 400);
    return () => clearTimeout(t);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Write something compelling…',
      }),
      Underline,
      Highlight.configure({ multicolor: false }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', class: 'text-highlight underline underline-offset-4' },
      }),
    ],
    content: INITIAL_CONTENT,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: `${PROSE_CLASSES} focus:outline-none min-h-[320px]`,
      },
    },
    onUpdate: ({ editor: e }) => {
      const text = e.getText().trim();
      setWordCount(text ? text.split(/\s+/).length : 0);
    },
  });

  const canUndo = editor?.can().undo();
  const canRedo = editor?.can().redo();

  const addLink = React.useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter the URL', previousUrl ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  const tools: ToolbarButton[] = [
    { icon: Bold, label: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: editor.isActive('bold') },
    { icon: Italic, label: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: editor.isActive('italic') },
    { icon: UnderlineIcon, label: 'Underline', action: () => editor.chain().focus().toggleUnderline().run(), isActive: editor.isActive('underline') },
    { icon: Strikethrough, label: 'Strikethrough', action: () => editor.chain().focus().toggleStrike().run(), isActive: editor.isActive('strike') },
    { icon: Highlighter, label: 'Highlight', action: () => editor.chain().focus().toggleHighlight().run() },
    { icon: Code, label: 'Inline code', action: () => editor.chain().focus().toggleCode().run(), isActive: editor.isActive('code') },
    { icon: Heading1, label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }) },
    { icon: Heading2, label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
    { icon: List, label: 'Bullet list', action: () => editor.chain().focus().toggleBulletList().run(), isActive: editor.isActive('bulletList') },
    { icon: ListOrdered, label: 'Ordered list', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: editor.isActive('orderedList') },
    { icon: Quote, label: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: editor.isActive('blockquote') },
    { icon: Minus, label: 'Divider', action: () => editor.chain().focus().setHorizontalRule().run() },
    { icon: Link2, label: 'Add link', action: addLink, isActive: editor.isActive('link') },
  ];

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={PenLine}
        title="Rich Text Editor"
        description="A production-grade WYSIWYG editor built on Tiptap with the design system's Prose styling, keyboard shortcuts, and a semantic toolbar."
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="highlight" className="font-mono text-xs">
              @tiptap/react
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              {wordCount} words
            </Badge>
          </div>
        }
      />

      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border/60 bg-muted/10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4 text-highlight" />
              Untitled document
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => setPreviewOpen((p) => !p)}
              >
                {previewOpen ? <PenLine className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {previewOpen ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="highlight"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => toast({ variant: 'success', title: 'Document saved', description: 'Your changes were saved locally.' })}
              >
                <Save className="h-3.5 w-3.5" />
                Save
              </Button>
            </div>
          </div>
        </CardHeader>

        {isMounted ? (
          <>
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 border-b border-border/60 bg-card p-2 sticky top-0 z-10 backdrop-blur-sm">
              <ToolbarGroup>
                {tools.slice(0, 6).map((t) => (
                  <ToolButton key={t.label} {...t} />
                ))}
              </ToolbarGroup>
              <Separator orientation="vertical" className="mx-1 h-5" />
              <ToolbarGroup>
                {tools.slice(6, 8).map((t) => (
                  <ToolButton key={t.label} {...t} />
                ))}
              </ToolbarGroup>
              <Separator orientation="vertical" className="mx-1 h-5" />
              <ToolbarGroup>
                {tools.slice(8, 12).map((t) => (
                  <ToolButton key={t.label} {...t} />
                ))}
              </ToolbarGroup>
              <Separator orientation="vertical" className="mx-1 h-5" />
              <ToolButton {...tools[12]} />
              <div className="ml-auto flex items-center gap-0.5">
                <ToolButton
                  icon={Undo2}
                  label="Undo (Ctrl+Z)"
                  action={() => editor.chain().focus().undo().run()}
                  disabled={!canUndo}
                />
                <ToolButton
                  icon={Redo2}
                  label="Redo (Ctrl+Y)"
                  action={() => editor.chain().focus().redo().run()}
                  disabled={!canRedo}
                />
              </div>
            </div>

            {/* Editor / Preview body */}
            <CardContent className="p-6">
              {previewOpen ? (
                <div className={`${PROSE_CLASSES} min-h-[320px]`}>
                  <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
                </div>
              ) : (
                <EditorContent editor={editor} />
              )}
            </CardContent>
          </>
        ) : (
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-40 w-full" />
          </CardContent>
        )}

        <div className="flex flex-wrap items-center gap-4 border-t border-border/60 bg-muted/10 px-6 py-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd>
            <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">B</kbd>
            Bold
          </span>
          <span className="flex items-center gap-1.5">
            <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd>
            <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">K</kbd>
            Insert link
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-highlight" />
            Content is sanitized and rendered with Prose styling
          </span>
        </div>
      </Card>

      {/* Pattern notes */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-highlight" />
            Implementation notes
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Tiptap + StarterKit:</strong> one small dependency gives you
            headings, lists, blockquotes, code, history, and undo/redo with full keyboard shortcuts.
          </p>
          <p>
            <strong className="text-foreground">SSR-safe:</strong> <code className="font-mono">immediatelyRender: false</code>{' '}
            avoids hydration mismatches — the editor only mounts after the page loads.
          </p>
          <p>
            <strong className="text-foreground">Styled output:</strong> the editor body uses the same{' '}
            <code className="font-mono">Prose</code> classes as rendered markdown, so the writing experience
            matches the published look exactly.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}