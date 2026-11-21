'use client';

import * as React from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import type { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
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
  Link2,
  ImagePlus,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { proseVariants } from '../layout/prose';
import { Separator } from '../base/separator';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../base/tooltip';
import { Popover, PopoverAnchor, PopoverContent } from '../overlay/popover';
import { Sheet, SheetContent, SheetTitle } from '../overlay/sheet';
import { Alert, AlertDescription, AlertTitle } from '../feedback/alert';
import { Skeleton } from '../base/skeleton';
import { Input } from '../base/input';
import { Label } from '../base/label';
import { Button } from '../base/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../feedback/dialog';

export { htmlToMarkdown, markdownToHtml } from './rich-text-editor-serializer';

export type RichTextMode = 'editable' | 'readonly' | 'disabled';

function stripHtmlToLength(html: string): number {
  if (typeof document === 'undefined') return 0;
  const div = document.createElement('div');
  div.innerHTML = html;
  return (div.textContent ?? '').length;
}

export interface RichTextEditorProps {
  value: string;
  onChange?: (html: string) => void;
  onTextChange?: (text: string, stats: { chars: number; words: number }) => void;
  placeholder?: string;
  mode?: RichTextMode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  maxLength?: number;
  showCounter?: boolean;
  /** Slot mention RM-10: extension tambahan (append-only, tidak mengganti set inti D1). */
  extensions?: Extension[];
  /** Disiapkan untuk konsumen (di luar v1, tanpa implementasi upload). */
  onImageUpload?: (file: File) => Promise<{ src: string }>;
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

function isValidLinkUrl(raw: string): boolean {
  const value = raw.trim();
  if (!value) return false;
  return /^(https?:\/\/[^\s]+|\/[^\s]*)$/.test(value);
}

function linkErrorFor(raw: string): string | null {
  if (!raw.trim()) return 'URL tautan wajib diisi';
  if (!isValidLinkUrl(raw)) return 'Gunakan format https://… atau /path';
  return null;
}

function isValidImageUrl(raw: string): boolean {
  return isValidLinkUrl(raw);
}

function imageErrorFor(url: string, alt: string, previewFailed: boolean): string | null {
  if (!url.trim()) return 'URL gambar wajib diisi';
  if (!isValidImageUrl(url)) return 'URL tidak valid';
  if (previewFailed) return 'Gambar gagal dimuat — periksa URL';
  if (!alt.trim()) return 'alt wajib';
  return null;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);
  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(max-width: 767px)');
    setIsMobile(query.matches);
    const listener = (event: MediaQueryListEvent) => setIsMobile(event.matches);
    query.addEventListener('change', listener);
    return () => query.removeEventListener('change', listener);
  }, []);
  return isMobile;
}

interface LinkFormProps {
  url: string;
  error: string | null;
  isEditing: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onUrlChange: (value: string) => void;
  onSave: () => void;
  onOpen: () => void;
  onRemove: () => void;
  onCancel: () => void;
}

function LinkForm({ url, error, isEditing, inputRef, onUrlChange, onSave, onOpen, onRemove, onCancel }: LinkFormProps) {
  const saveDisabled = error !== null || url.trim().length === 0;
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="rte-link-input">URL tautan</Label>
        <Input
          id="rte-link-input"
          ref={inputRef}
          value={url}
          onChange={(event) => onUrlChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (!saveDisabled) onSave();
            } else if (event.key === 'Escape') {
              event.preventDefault();
              onCancel();
            }
          }}
          placeholder="https://contoh.com atau /path"
          autoComplete="off"
          inputMode="url"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'rte-link-error' : undefined}
          data-testid="rte-link-input"
        />
        {error ? (
          <p role="alert" data-testid="rte-link-error" className="text-xs text-destructive">
            {error}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Gunakan https://… atau /path.</p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isEditing ? (
          <Button type="button" variant="outline" size="sm" data-testid="rte-link-open" onClick={onOpen}>
            Buka
          </Button>
        ) : null}
        {isEditing ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            data-testid="rte-link-remove"
            onClick={onRemove}
          >
            Hapus
          </Button>
        ) : null}
        <Button type="button" variant="ghost" size="sm" data-testid="rte-link-cancel" onClick={onCancel}>
          Batal
        </Button>
        <Button type="button" variant="highlight" size="sm" data-testid="rte-link-save" disabled={saveDisabled} onClick={onSave}>
          Simpan
        </Button>
      </div>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
  onTextChange,
  placeholder = 'Tulis sesuatu…',
  mode = 'editable',
  loading = false,
  error = null,
  onRetry,
  maxLength = 10000,
  showCounter = true,
  extensions = [],
  onImageUpload,
  ariaLabel = 'Rich text editor',
  className,
}: RichTextEditorProps) {
  const [, bump] = React.useReducer((x: number) => x + 1, 0);
  const [announce, setAnnounce] = React.useState('');
  // Counter dihitung dari teks polos (getText); nilai awal diderivasi dari
  // HTML agar tidak flash 0 — onCreate/onUpdate mengoreksi dari editor.
  const [chars, setChars] = React.useState(() => stripHtmlToLength(value));
  const overAnnouncedRef = React.useRef(false);
  const counterId = React.useId();
  const [linkOpen, setLinkOpen] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState('');
  const [linkError, setLinkError] = React.useState<string | null>(null);
  const [isEditingLink, setIsEditingLink] = React.useState(false);
  const [imageOpen, setImageOpen] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState('');
  const [imageAlt, setImageAlt] = React.useState('');
  const [imagePreviewFailed, setImagePreviewFailed] = React.useState(false);
  void onImageUpload;
  const linkInputRef = React.useRef<HTMLInputElement | null>(null);
  const openedHrefRef = React.useRef('');
  const isMobile = useIsMobile();
  const onChangeRef = React.useRef(onChange);
  const onTextChangeRef = React.useRef(onTextChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  React.useEffect(() => {
    onTextChangeRef.current = onTextChange;
  }, [onTextChange]);

  const isDisabled = mode === 'disabled';
  const isReadOnly = mode === 'readonly';
  const hasError = error !== null && error !== '';
  const nonEditable = isDisabled || isReadOnly || loading || hasError;

  const editor = useEditor({
    editable: !nonEditable,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
      Image.configure({ HTMLAttributes: { class: 'rounded-xl border border-border' } }),
      ...extensions,
    ],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(proseVariants(), 'min-h-[160px] w-full px-3 py-2 focus:outline-none'),
        'aria-label': ariaLabel,
        'aria-describedby': counterId,
        ...(isDisabled ? { 'aria-disabled': 'true' } : null),
        ...(isReadOnly ? { 'aria-readonly': 'true' } : null),
      },
    },
    onCreate: ({ editor: e }) => {
      setChars(e.getText().length);
    },
    onUpdate: ({ editor: e }) => {
      onChangeRef.current?.(e.getHTML());
      const text = e.getText();
      const trimmed = text.trim();
      setChars(text.length);
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
      setChars(editor.getText().length);
    }
  }, [value, editor]);

  React.useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const next = !nonEditable;
    // Guard: setEditable memancarkan event update (→ onChange palsu),
    // jadi hanya panggil saat status editable benar-benar berubah.
    if (editor.isEditable !== next) {
      editor.setEditable(next);
    }
    // Disabled dilewati fokus; readonly tetap bisa dibaca SR.
    try {
      if (isDisabled) {
        editor.view.dom.setAttribute('tabindex', '-1');
      } else {
        editor.view.dom.removeAttribute('tabindex');
      }
    } catch {
      // Best-effort: DOM belum siap saat teardown.
    }
  }, [editor, nonEditable, isDisabled]);

  const counterStatus = chars > maxLength ? 'over' : chars >= 0.9 * maxLength ? 'near' : 'normal';
  const overBy = chars - maxLength;

  React.useEffect(() => {
    if (counterStatus === 'over' && !overAnnouncedRef.current) {
      overAnnouncedRef.current = true;
      setAnnounce(`Melewati batas ${overBy} karakter`);
    }
    if (counterStatus !== 'over') {
      overAnnouncedRef.current = false;
    }
  }, [counterStatus, overBy]);

  const populateLinkState = React.useCallback(() => {
    const href = (editor?.getAttributes('link')?.href as string | undefined) ?? '';
    const editing = (editor?.isActive('link') ?? false) && href.length > 0;
    openedHrefRef.current = href;
    setIsEditingLink(editing);
    setLinkUrl(href);
    setLinkError(linkErrorFor(href));
  }, [editor]);

  const openLinkPopover = React.useCallback(
    (presetHref?: string) => {
      if (!editor || nonEditable) return;
      if (presetHref !== undefined) {
        openedHrefRef.current = presetHref;
        setIsEditingLink(true);
        setLinkUrl(presetHref);
        setLinkError(linkErrorFor(presetHref));
        setLinkOpen(true);
        return;
      }
      populateLinkState();
      setLinkOpen(true);
    },
    [editor, nonEditable, populateLinkState]
  );

  const handleLinkOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) {
        populateLinkState();
        setLinkOpen(true);
        return;
      }
      setLinkOpen(false);
      setLinkError(null);
    },
    [populateLinkState]
  );

  const focusEditor = React.useCallback(() => {
    try {
      if (!editor || editor.isDestroyed) return;
      editor.chain().focus().run();
    } catch {
      // Best-effort: editor may be tearing down while the popover closes.
    }
  }, [editor]);

  const selectOpenedLink = React.useCallback(() => {
    if (!editor) return;
    const oldHref = openedHrefRef.current;
    if (!oldHref) return;
    let from = -1;
    let to = -1;
    editor.state.doc.descendants((node, pos) => {
      if (from >= 0 || !node.isText) return true;
      const mark = node.marks.find((m) => m.type.name === 'link');
      if (mark && (mark.attrs.href as string | undefined) === oldHref) {
        from = pos;
        to = pos + (node.text?.length ?? 0);
      }
      return true;
    });
    if (from >= 0) editor.chain().focus().setTextSelection({ from, to }).run();
  }, [editor]);

  const handleLinkUrlChange = React.useCallback((next: string) => {
    setLinkUrl(next);
    setLinkError(linkErrorFor(next));
  }, []);

  const handleLinkSave = React.useCallback(() => {
    const href = linkUrl.trim();
    if (!isValidLinkUrl(href)) {
      setLinkError(linkErrorFor(linkUrl));
      return;
    }
    if (!editor) return;
    if (isEditingLink) selectOpenedLink();
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    setAnnounce(isEditingLink ? 'Tautan diperbarui' : 'Tautan disisipkan');
    setLinkOpen(false);
    setLinkError(null);
  }, [editor, isEditingLink, linkUrl, selectOpenedLink]);

  const handleLinkRemove = React.useCallback(() => {
    if (!editor) return;
    if (isEditingLink) selectOpenedLink();
    editor.chain().focus().unsetLink().run();
    setAnnounce('Tautan dihapus');
    setLinkOpen(false);
    setLinkError(null);
  }, [editor, isEditingLink, selectOpenedLink]);

  const handleLinkOpenExternal = React.useCallback(() => {
    const href = ((editor?.getAttributes('link')?.href as string | undefined) ?? linkUrl.trim()).trim();
    if (href) window.open(href, '_blank', 'noopener,noreferrer');
  }, [editor, linkUrl]);

  const handleLinkCancel = React.useCallback(() => {
    setLinkOpen(false);
    setLinkError(null);
  }, []);

  const imageError = imageErrorFor(imageUrl, imageAlt, imagePreviewFailed);
  const imageSaveDisabled = imageError !== null;

  const openImageDialog = React.useCallback(() => {
    if (!editor || nonEditable) return;
    setImageUrl('');
    setImageAlt('');
    setImagePreviewFailed(false);
    setImageOpen(true);
  }, [editor, nonEditable]);

  const handleImageUrlChange = React.useCallback((next: string) => {
    setImageUrl(next);
    setImagePreviewFailed(false);
  }, []);

  const handleImageAltChange = React.useCallback((next: string) => {
    setImageAlt(next);
  }, []);

  const handleImageSave = React.useCallback(() => {
    const src = imageUrl.trim();
    const alt = imageAlt.trim();
    const err = imageErrorFor(imageUrl, imageAlt, imagePreviewFailed);
    if (err || !editor) return;
    editor.chain().focus().setImage({ src, alt }).run();
    setAnnounce('Gambar disisipkan');
    setImageOpen(false);
  }, [editor, imageAlt, imagePreviewFailed, imageUrl]);

  const handleImageOpenChange = React.useCallback((next: boolean) => {
    setImageOpen(next);
    if (!next) focusEditor();
  }, [focusEditor]);

  React.useEffect(() => {
    if (!editor) return;
    const dom = editor.view.dom;
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        openLinkPopover();
      }
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest?.('a');
      if (anchor) {
        event.preventDefault();
        openLinkPopover(anchor.getAttribute('href') ?? '');
      }
    };
    dom.addEventListener('keydown', onKeyDown);
    dom.addEventListener('click', onClick);
    return () => {
      dom.removeEventListener('keydown', onKeyDown);
      dom.removeEventListener('click', onClick);
    };
  }, [editor, openLinkPopover]);

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

  const focusLinkInput = (event: Event) => {
    event.preventDefault();
    linkInputRef.current?.focus();
    linkInputRef.current?.select();
  };

  const returnFocusToEditor = (event: Event) => {
    event.preventDefault();
    focusEditor();
  };

  const isLinkActive = editor?.isActive('link') ?? false;

  const linkControl = editor ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label="Tautan (Ctrl+K)"
          aria-pressed={isLinkActive}
          disabled={nonEditable}
          onClick={() => openLinkPopover()}
          data-testid="rte-button-link"
          className={cn(TOOLBAR_BUTTON_CLASSES, isLinkActive ? TOOLBAR_ACTIVE_CLASSES : TOOLBAR_IDLE_CLASSES)}
        >
          <Link2 className="h-4 w-4" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">Tautan (Ctrl+K)</TooltipContent>
    </Tooltip>
  ) : null;

  const linkForm = (
    <LinkForm
      url={linkUrl}
      error={linkError}
      isEditing={isEditingLink}
      inputRef={linkInputRef}
      onUrlChange={handleLinkUrlChange}
      onSave={handleLinkSave}
      onOpen={handleLinkOpenExternal}
      onRemove={handleLinkRemove}
      onCancel={handleLinkCancel}
    />
  );

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

  const isEmpty = chars === 0 && !loading && !hasError;

  const counterClass =
    counterStatus === 'over'
      ? 'text-destructive'
      : counterStatus === 'near'
        ? 'text-warning'
        : 'text-muted-foreground';

  const loadingSkeleton = (
    <div aria-busy="true" data-testid="rte-loading">
      <div className="flex flex-wrap items-center gap-1 border-b border-border/60 p-2" aria-hidden="true">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="ml-auto h-8 w-16" />
      </div>
      <div className="space-y-2 p-3" aria-hidden="true">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-24 w-full" />
      </div>
      <span className="sr-only">Memuat editor…</span>
    </div>
  );

  return (
    <TooltipProvider delayDuration={0}>
    <div
      className={cn('w-full overflow-hidden rounded-md border border-border bg-card', className)}
      aria-busy={loading || undefined}
    >
      {loading ? (
        loadingSkeleton
      ) : (
      <>
      {isReadOnly ? null : (
      <div
        role="toolbar"
        aria-label="Format teks"
        aria-disabled={isDisabled || undefined}
        data-testid="rte-toolbar"
        className="flex flex-wrap items-center gap-1 border-b border-border/60 bg-card p-2"
      >
        <div className="flex items-center gap-0.5">
          {inlineTools.map((tool) => (
            <ToolbarButton key={tool.name} {...tool} disabled={nonEditable || undefined} />
          ))}
        </div>
        <Separator orientation="vertical" className="mx-1 h-5" decorative />
        <div className="flex items-center gap-0.5">
          {blockTools.map((tool) => (
            <ToolbarButton key={tool.name} {...tool} disabled={nonEditable || undefined} />
          ))}
        </div>
        <Separator orientation="vertical" className="mx-1 h-5" decorative />
        {isMobile ? (
          <Sheet open={linkOpen && !nonEditable} onOpenChange={handleLinkOpenChange}>
            {linkControl}
            <SheetContent
              side="bottom"
              data-testid="rte-link-popover"
              aria-label="Editor tautan"
              onOpenAutoFocus={focusLinkInput}
              onCloseAutoFocus={returnFocusToEditor}
            >
              <SheetTitle>Editor tautan</SheetTitle>
              <div className="mt-4">{linkForm}</div>
            </SheetContent>
          </Sheet>
        ) : (
          <Popover open={linkOpen && !nonEditable} onOpenChange={handleLinkOpenChange}>
            <PopoverAnchor asChild>
              <span className="inline-flex">{linkControl}</span>
            </PopoverAnchor>
            <PopoverContent
              data-testid="rte-link-popover"
              aria-label="Editor tautan"
              side="bottom"
              align="center"
              className="w-80"
              onOpenAutoFocus={focusLinkInput}
              onCloseAutoFocus={returnFocusToEditor}
            >
              {linkForm}
            </PopoverContent>
          </Popover>
        )}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label="Sisip gambar"
              disabled={nonEditable}
              onClick={openImageDialog}
              data-testid="rte-button-image"
              className={cn(TOOLBAR_BUTTON_CLASSES, TOOLBAR_IDLE_CLASSES)}
            >
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom">Sisip gambar</TooltipContent>
        </Tooltip>
        <Dialog open={imageOpen} onOpenChange={handleImageOpenChange}>
          <DialogContent data-testid="rte-image-dialog" aria-label="Sisip gambar">
            <DialogHeader>
              <DialogTitle>Sisip gambar</DialogTitle>
              <DialogDescription>Tempel URL gambar dan isi alt agar terbaca pembaca layar.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="rte-image-url">URL gambar</Label>
                <Input
                  id="rte-image-url"
                  data-testid="rte-image-url"
                  value={imageUrl}
                  onChange={(event) => handleImageUrlChange(event.target.value)}
                  placeholder="https://contoh.com/gambar.png"
                  autoComplete="off"
                  inputMode="url"
                  aria-invalid={imageError ? true : undefined}
                  aria-describedby={imageError ? 'rte-image-error' : undefined}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="rte-image-alt">Teks alt</Label>
                <Input
                  id="rte-image-alt"
                  data-testid="rte-image-alt"
                  value={imageAlt}
                  onChange={(event) => handleImageAltChange(event.target.value)}
                  placeholder="Deskripsi singkat gambar"
                  autoComplete="off"
                  aria-invalid={imageError ? true : undefined}
                  aria-describedby={imageError ? 'rte-image-error' : undefined}
                />
              </div>
              {imageUrl.trim() && isValidImageUrl(imageUrl) ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  <img
                    src={imageUrl.trim()}
                    alt=""
                    aria-hidden="true"
                    data-testid="rte-image-preview"
                    className="max-h-48 w-full object-contain bg-muted/20"
                    onError={() => setImagePreviewFailed(true)}
                    onLoad={() => setImagePreviewFailed(false)}
                  />
                </div>
              ) : null}
              {imageError ? (
                <p role="alert" data-testid="rte-image-error" className="text-xs text-destructive">
                  {imageError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Pratinjau tampil setelah URL valid. Alt wajib diisi.</p>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="ghost" size="sm" data-testid="rte-image-cancel" onClick={() => setImageOpen(false)}>
                Batal
              </Button>
              <Button
                type="button"
                variant="highlight"
                size="sm"
                data-testid="rte-image-save"
                disabled={imageSaveDisabled}
                onClick={handleImageSave}
              >
                Sisipkan
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="ml-auto flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label="Urungkan (Ctrl+Z)"
                disabled={!canUndo || nonEditable}
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
                disabled={!canRedo || nonEditable}
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
      )}
      {hasError ? (
        <div className="p-3">
          <Alert variant="destructive" data-testid="rte-error">
            <AlertTitle>Gagal memuat konten</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center gap-2">
              <span>{error}</span>
              {onRetry ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  data-testid="rte-error-retry"
                  onClick={onRetry}
                >
                  Coba lagi
                </Button>
              ) : null}
            </AlertDescription>
          </Alert>
        </div>
      ) : null}
      <div
        data-testid="rte-content"
        className={cn('min-h-[160px]', counterStatus === 'over' && 'rounded-sm ring-1 ring-destructive/50')}
      >
        <EditorContent editor={editor} />
      </div>
      {isEmpty ? (
        <p data-testid="rte-empty" className="px-3 pb-1 text-xs text-muted-foreground">
          Editor kosong — mulai mengetik atau pilih format.
        </p>
      ) : null}
      {showCounter ? (
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 bg-card px-3 py-1.5">
          {counterStatus === 'near' ? (
            <span className="text-xs text-warning">mendekati batas</span>
          ) : null}
          {counterStatus === 'over' ? (
            <p role="alert" data-testid="rte-counter-alert" className="text-xs text-destructive">
              melewati batas {overBy} karakter
            </p>
          ) : null}
          <p
            id={counterId}
            data-testid="rte-counter"
            role="status"
            aria-live="polite"
            className={cn('text-xs tabular-nums', counterClass)}
          >
            {chars}/{maxLength}
          </p>
        </div>
      ) : null}
      <div aria-live="polite" role="status" data-testid="rte-live" className="sr-only">
        {announce}
      </div>
      </>
      )}
    </div>
    </TooltipProvider>
  );
}
