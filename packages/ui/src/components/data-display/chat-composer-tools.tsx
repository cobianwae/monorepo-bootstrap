'use client';

import * as React from 'react';
import { MessageCircleOff, Smile } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../base/avatar';
import { Button } from '../base/button';
import { Input } from '../base/input';
import { Skeleton } from '../base/skeleton';
import { EmptyState } from '../feedback/empty-state';
import { Popover, PopoverContent, PopoverTrigger } from '../overlay/popover';

export type ChatMentionStatus = 'ready' | 'loading' | 'error';

export interface ChatMentionCandidate {
  id: string;
  label: string;
  avatar?: string;
}

export interface ChatMentionToken {
  id: string;
  label: string;
}

export interface MentionQuery {
  /** Indeks karakter `@`. */
  start: number;
  /** Posisi kursor saat ini (akhir query). */
  end: number;
  query: string;
}

/**
 * Mendeteksi query mention `@...` yang berakhir tepat di posisi kursor.
 * `@` harus berada di awal teks atau setelah whitespace (email seperti `a@b` diabaikan).
 */
export function getMentionQuery(value: string, caret: number): MentionQuery | null {
  const before = value.slice(0, caret);
  const match = /(^|\s)@(\S*)$/.exec(before);
  if (!match) return null;
  const query = match[2] ?? '';
  return { start: caret - query.length - 1, end: caret, query };
}

export function filterMentionCandidates(
  candidates: ChatMentionCandidate[],
  query: string
): ChatMentionCandidate[] {
  const q = query.trim().toLowerCase();
  if (!q) return candidates;
  return candidates.filter((c) => c.label.toLowerCase().includes(q));
}

function getInitials(label: string): string {
  return label.substring(0, 2).toUpperCase();
}

export interface ChatMentionChipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'id'> {
  id: string;
  label: string;
}

/** Render mention terstruktur di bubble pesan. Gunakan sebagai bagian dari `content` ChatMessage. */
export const ChatMentionChip = React.forwardRef<HTMLSpanElement, ChatMentionChipProps>(
  ({ className, id, label, ...props }, ref) => (
    <span
      ref={ref}
      data-mention-id={id}
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-card px-1.5 py-px text-xs font-semibold text-card-foreground whitespace-nowrap',
        className
      )}
      {...props}
    >
      @{label}
    </span>
  )
);
ChatMentionChip.displayName = 'ChatMentionChip';

export interface ChatMentionListProps {
  listId: string;
  candidates: ChatMentionCandidate[];
  status: ChatMentionStatus;
  query: string;
  activeIndex: number;
  onActiveChange: (index: number) => void;
  onSelect: (candidate: ChatMentionCandidate) => void;
}

/** Isi popover kandidat mention: loading, error, kosong, atau daftar opsi (listbox). */
export function ChatMentionList({
  listId,
  candidates,
  status,
  query,
  activeIndex,
  onActiveChange,
  onSelect,
}: ChatMentionListProps) {
  if (status === 'loading') {
    return (
      <div role="status" aria-live="polite" aria-busy="true" className="flex flex-col gap-2 p-2">
        <span className="sr-only">Loading candidates…</span>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <p role="alert" className="p-2 text-xs text-destructive">
        Could not load candidates. Type again to try.
      </p>
    );
  }

  if (candidates.length === 0) {
    return (
      <EmptyState
        icon={MessageCircleOff}
        title="No candidates"
        description={`Nothing matches "${query}".`}
      />
    );
  }

  return (
    <div
      id={listId}
      role="listbox"
      aria-label="Mention candidates"
      className="flex max-h-60 flex-col overflow-y-auto"
    >
      {candidates.map((candidate, index) => {
        const active = index === activeIndex;
        return (
          <div
            key={candidate.id}
            id={`${listId}-opt-${index}`}
            role="option"
            aria-label={candidate.label}
            aria-selected={active}
            onMouseDown={(e) => e.preventDefault()}
            onMouseEnter={() => onActiveChange(index)}
            onClick={() => onSelect(candidate)}
            className={cn(
              'flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-foreground',
              active && 'bg-muted'
            )}
          >
            <Avatar className="h-6 w-6">
              {candidate.avatar && <AvatarImage src={candidate.avatar} alt="" />}
              <AvatarFallback className="text-[10px] font-mono">
                {getInitials(candidate.label)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate">{candidate.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export interface EmojiItem {
  char: string;
  name: string;
  keywords: string[];
}

export interface EmojiCategory {
  id: string;
  label: string;
  items: EmojiItem[];
}

export const CHAT_EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'wajah',
    label: 'Wajah',
    items: [
      { char: '😀', name: 'wajah senang', keywords: ['happy', 'smile'] },
      { char: '😂', name: 'tertawa sampai menangis', keywords: ['laugh', 'tears', 'lol'] },
      { char: '😊', name: 'senyum malu', keywords: ['smile', 'blush'] },
      { char: '😢', name: 'sedih menangis', keywords: ['sad', 'cry'] },
      { char: '😮', name: 'terkejut', keywords: ['wow', 'surprised'] },
      { char: '😡', name: 'marah', keywords: ['angry', 'mad'] },
    ],
  },
  {
    id: 'gestur',
    label: 'Gestur',
    items: [
      { char: '👍', name: 'jempol', keywords: ['thumbs up', 'ok', 'like'] },
      { char: '👏', name: 'tepuk tangan', keywords: ['clap', 'applause'] },
      { char: '🙏', name: 'berdoa terima kasih', keywords: ['pray', 'thanks'] },
      { char: '👀', name: 'mata melihat', keywords: ['eyes', 'look'] },
    ],
  },
  {
    id: 'simbol',
    label: 'Simbol',
    items: [
      { char: '❤️', name: 'hati merah', keywords: ['love', 'heart'] },
      { char: '🎉', name: 'pesta', keywords: ['party', 'celebrate'] },
      { char: '🔥', name: 'api', keywords: ['fire', 'hot'] },
      { char: '✅', name: 'centang', keywords: ['check', 'done'] },
    ],
  },
  {
    id: 'objek',
    label: 'Objek',
    items: [
      { char: '💡', name: 'ide', keywords: ['idea', 'bulb'] },
      { char: '📌', name: 'pin', keywords: ['pin', 'pushpin'] },
      { char: '📎', name: 'klip kertas', keywords: ['attach', 'paperclip'] },
      { char: '🚀', name: 'roket', keywords: ['rocket', 'launch'] },
    ],
  },
];

export interface ChatEmojiPickerProps {
  onPick: (emoji: string) => void;
  /** Dipanggil saat picker ditutup agar fokus kembali ke composer. */
  onRequestFocus: () => void;
  disabled?: boolean;
}

/** Tombol emoji dengan popover berkategori, pencarian, dan navigasi panah pada grid. */
export function ChatEmojiPicker({ onPick, onRequestFocus, disabled = false }: ChatEmojiPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [categoryId, setCategoryId] = React.useState(CHAT_EMOJI_CATEGORIES[0]?.id ?? '');
  const [search, setSearch] = React.useState('');
  const gridRef = React.useRef<HTMLDivElement>(null);

  const results = React.useMemo<EmojiItem[]>(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return CHAT_EMOJI_CATEGORIES.find((c) => c.id === categoryId)?.items ?? [];
    }
    return CHAT_EMOJI_CATEGORIES.flatMap((c) => c.items).filter(
      (item) => item.name.includes(q) || item.keywords.some((k) => k.includes(q))
    );
  }, [search, categoryId]);

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(
      gridRef.current?.querySelectorAll<HTMLButtonElement>('button[data-emoji]') ?? []
    );
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (current === -1) return;
    const columns = 8;
    const moves: Record<string, number> = {
      ArrowRight: 1,
      ArrowLeft: -1,
      ArrowDown: columns,
      ArrowUp: -columns,
    };
    const delta = moves[e.key];
    if (delta === undefined) return;
    e.preventDefault();
    const next = Math.min(Math.max(current + delta, 0), buttons.length - 1);
    buttons[next]?.focus();
  };

  return (
    <Popover open={open} onOpenChange={(next) => { setOpen(next); if (!next) setSearch(''); }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          aria-label="Sisipkan emoji"
          aria-haspopup="dialog"
          aria-expanded={open}
          disabled={disabled}
        >
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="top"
        className="w-72 p-3"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          onRequestFocus();
        }}
      >
        <Input
          type="search"
          aria-label="Search emoji"
          placeholder="Search emoji…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div role="group" aria-label="Kategori emoji" className="mt-2 flex gap-1">
          {CHAT_EMOJI_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              aria-pressed={category.id === categoryId}
              onClick={() => setCategoryId(category.id)}
              className={cn(
                'rounded-md px-2 py-1 text-xs font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                category.id === categoryId
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div
          ref={gridRef}
          onKeyDown={handleGridKeyDown}
          className="mt-2 grid grid-cols-8 gap-1"
        >
          {results.length === 0 ? (
            <p className="col-span-8 py-4 text-center text-xs text-muted-foreground">
              No matching emoji.
            </p>
          ) : (
            results.map((item) => (
              <button
                key={item.char + item.name}
                type="button"
                data-emoji
                aria-label={item.name}
                title={item.name}
                onClick={() => {
                  onPick(item.char);
                  setOpen(false);
                  setSearch('');
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-lg cursor-pointer hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.char}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
