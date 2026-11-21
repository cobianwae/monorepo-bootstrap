'use client';

import * as React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo2,
  Redo2,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { proseVariants } from '../layout/prose';
import { Separator } from '../base/separator';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../base/tooltip';

export interface RichTextEditorProps {
  value: string;
  onChange?: (html: string) => void;
  onTextChange?: (text: string, stats: { chars: number; words: number }) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

const TOOLBAR_BUTTON_CLASSES =
  'inline-flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40';

const TOOLBAR_ACTIVE_CLASSES = 'bg-highlight text-highlight-foreground shadow-sm';
const TOOLBAR_IDLE_CLASSES = 'text-muted-foreground hover:bg-muted/40 hover:text-foreground';

interface ToolbarToggle {
  name: string;
  label: string;
  icon: typeof Bold;
  isActive: boolean;
  action: () => void;
}

function ToolbarButton({ name, label, icon: Icon, isActive, action, disabled }: ToolbarToggle & { disabled?: boolean }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={label}
          aria-pressed={isActive}
          disabled={disabled}
          onClick={action}
          data-testid={`rte-button-${name}`}
          className={cn(TOOLBAR_BUTTON_CLASSES, isActive ? TOOLBAR_ACTIVE_CLASSES : TOOLBAR_IDLE_CLASSES)}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

export function RichTextEditor({
  value,
  onChange,
  onTextChange,
  placeholder = 'Tulis sesuatu…',
  ariaLabel = 'Rich text editor',
  className,
}: RichTextEditorProps) {
  const [, bump] = React.useReducer((x: number) => x + 1, 0);
  const [announce, setAnnounce] = React.useState('');
  const onChangeRef = React.useRef(onChange);
  const onTextChangeRef = React.useRef(onTextChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  React.useEffect(() => {
    onTextChangeRef.current = onTextChange;
  }, [onTextChange]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(proseVariants(), 'min-h-[160px] w-full px-3 py-2 focus:outline-none'),
        'aria-label': ariaLabel,
      },
    },
    onUpdate: ({ editor: e }) => {
      onChangeRef.current?.(e.getHTML());
      const text = e.getText();
      const trimmed = text.trim();
      onTextChangeRef.current?.(text, {
        chars: text.length,
        words: trimmed ? trimmed.split(/\s+/).length : 0,
      });
      bump();
    },
    onSelectionUpdate: () => {
      bump();
    },
  });

  React.useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    if (value !== current) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const canUndo = editor?.can().undo() ?? false;
  const canRedo = editor?.can().redo() ?? false;

  const handleUndo = () => {
    editor?.chain().focus().undo().run();
    setAnnounce('Dibatalkan');
  };

  const handleRedo = () => {
    editor?.chain().focus().redo().run();
    setAnnounce('Diulangi');
  };

  const inlineTools: ToolbarToggle[] = editor
    ? [
        {
          name: 'bold',
          label: 'Tebal (Ctrl+B)',
          icon: Bold,
          isActive: editor.isActive('bold'),
          action: () => editor.chain().focus().toggleBold().run(),
        },
        {
          name: 'italic',
          label: 'Miring (Ctrl+I)',
          icon: Italic,
          isActive: editor.isActive('italic'),
          action: () => editor.chain().focus().toggleItalic().run(),
        },
        {
          name: 'underline',
          label: 'Garis bawah (Ctrl+U)',
          icon: UnderlineIcon,
          isActive: editor.isActive('underline'),
          action: () => editor.chain().focus().toggleUnderline().run(),
        },
        {
          name: 'strike',
          label: 'Coret',
          icon: Strikethrough,
          isActive: editor.isActive('strike'),
          action: () => editor.chain().focus().toggleStrike().run(),
        },
      ]
    : [];

  const blockTools: ToolbarToggle[] = editor
    ? [
        {
          name: 'h1',
          label: 'Judul 1',
          icon: Heading1,
          isActive: editor.isActive('heading', { level: 1 }),
          action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        },
        {
          name: 'h2',
          label: 'Judul 2',
          icon: Heading2,
          isActive: editor.isActive('heading', { level: 2 }),
          action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        },
        {
          name: 'h3',
          label: 'Judul 3',
          icon: Heading3,
          isActive: editor.isActive('heading', { level: 3 }),
          action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        },
        {
          name: 'bullet',
          label: 'Daftar bullet',
          icon: List,
          isActive: editor.isActive('bulletList'),
          action: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          name: 'ordered',
          label: 'Daftar bernomor',
          icon: ListOrdered,
          isActive: editor.isActive('orderedList'),
          action: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
          name: 'quote',
          label: 'Kutipan',
          icon: Quote,
          isActive: editor.isActive('blockquote'),
          action: () => editor.chain().focus().toggleBlockquote().run(),
        },
      ]
    : [];

  return (
    <TooltipProvider delayDuration={0}>
    <div className={cn('w-full overflow-hidden rounded-md border border-border bg-card', className)}>
      <div
        role="toolbar"
        aria-label="Format teks"
        data-testid="rte-toolbar"
        className="flex flex-wrap items-center gap-1 border-b border-border/60 bg-card p-2"
      >
        <div className="flex items-center gap-0.5">
          {inlineTools.map((tool) => (
            <ToolbarButton key={tool.name} {...tool} />
          ))}
        </div>
        <Separator orientation="vertical" className="mx-1 h-5" decorative />
        <div className="flex items-center gap-0.5">
          {blockTools.map((tool) => (
            <ToolbarButton key={tool.name} {...tool} />
          ))}
        </div>
        <Separator orientation="vertical" className="mx-1 h-5" decorative />
        <div className="ml-auto flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Urungkan (Ctrl+Z)"
                disabled={!canUndo}
                onClick={handleUndo}
                data-testid="rte-button-undo"
                className={cn(TOOLBAR_BUTTON_CLASSES, TOOLBAR_IDLE_CLASSES)}
              >
                <Undo2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Urungkan (Ctrl+Z)</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Ulangi (Ctrl+Shift+Z)"
                disabled={!canRedo}
                onClick={handleRedo}
                data-testid="rte-button-redo"
                className={cn(TOOLBAR_BUTTON_CLASSES, TOOLBAR_IDLE_CLASSES)}
              >
                <Redo2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom">Ulangi (Ctrl+Shift+Z)</TooltipContent>
          </Tooltip>
        </div>
      </div>
      <div data-testid="rte-content" className="min-h-[160px]">
        <EditorContent editor={editor} />
      </div>
      <div aria-live="polite" role="status" data-testid="rte-live" className="sr-only">
        {announce}
      </div>
    </div>
    </TooltipProvider>
  );
}
