'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Send, CheckCheck, Sparkles, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../base/avatar';
import { Button } from '../base/button';
import { Textarea } from '../base/textarea';
import { PopoverAnchor, Popover, PopoverContent } from '../overlay/popover';
import {
  ChatEmojiPicker,
  ChatMentionList,
  filterMentionCandidates,
  getMentionQuery,
  type ChatMentionCandidate,
  type ChatMentionStatus,
  type ChatMentionToken,
  type MentionQuery,
} from './chat-composer-tools';

export const ChatContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col h-full w-full bg-card overflow-hidden', className)}
    {...props}
  >
    {children}
  </div>
));
ChatContainer.displayName = 'ChatContainer';

export const ChatThread = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex-1 overflow-y-auto p-4 space-y-3.5', className)}
    {...props}
  >
    {children}
  </div>
));
ChatThread.displayName = 'ChatThread';

export const chatMessageVariants = cva('flex gap-2.5 transition-all w-full min-w-0', {
  variants: {
    sender: {
      user: 'justify-end',
      agent: 'justify-end',
      assistant: 'justify-start',
      customer: 'justify-start',
      bot: 'justify-start',
      system: 'justify-center',
    },
  },
  defaultVariants: {
    sender: 'assistant',
  },
});

export const chatBubbleVariants = cva(
  'relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed max-w-full break-words shadow-2xs',
  {
    variants: {
      sender: {
        agent: 'bg-primary text-primary-foreground font-medium rounded-br-xs shadow-xs',
        user: 'bg-primary text-primary-foreground font-medium rounded-br-xs shadow-xs',
        customer:
          'bg-muted/70 text-card-foreground border border-border/80 rounded-bl-xs',
        assistant:
          'bg-muted/70 text-card-foreground border border-border/80 rounded-bl-xs',
        bot: 'bg-highlight/10 text-card-foreground border border-highlight/30 rounded-bl-xs',
        system:
          'bg-muted/50 border border-border/80 text-center text-xs text-muted-foreground font-mono rounded-full px-3.5 py-1 max-w-full shadow-none',
      },
    },
    defaultVariants: {
      sender: 'assistant',
    },
  }
);

export interface ChatMessageProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'>,
    VariantProps<typeof chatMessageVariants> {
  avatar?: string;
  senderName?: string;
  timestamp?: string;
  content: React.ReactNode;
  status?: 'sent' | 'delivered' | 'read';
  copyable?: boolean;
}

export const ChatMessage = React.forwardRef<HTMLDivElement, ChatMessageProps>(
  (
    {
      className,
      sender = 'assistant',
      avatar,
      senderName,
      timestamp,
      content,
      status = 'read',
      copyable = false,
      children,
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false);
    const isOutgoing = sender === 'user' || sender === 'agent';
    const isSystem = sender === 'system';

    const handleCopy = () => {
      if (typeof content === 'string') {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    if (isSystem) {
      return (
        <div
          ref={ref}
          className={cn(chatMessageVariants({ sender, className }))}
          {...props}
        >
          <div className={cn(chatBubbleVariants({ sender }))}>
            {content} {timestamp && `• ${timestamp}`}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(chatMessageVariants({ sender, className }))}
        {...props}
      >
        {!isOutgoing && (
          <Avatar className="h-7 w-7 border border-border shrink-0 mt-0.5">
            {avatar && <AvatarImage src={avatar} alt={senderName || 'Avatar'} />}
            <AvatarFallback className="text-[10px] font-mono">
              {senderName
                ? senderName.substring(0, 2).toUpperCase()
                : sender === 'bot' || sender === 'assistant'
                  ? 'AI'
                  : 'CU'}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={cn(
            'group/bubble relative flex flex-col space-y-1 max-w-[85%] sm:max-w-[75%] min-w-0',
            isOutgoing ? 'items-end' : 'items-start'
          )}
        >
          {senderName && !isOutgoing && (
            <span className="text-[11px] font-semibold text-muted-foreground px-1 truncate max-w-full">
              {senderName}
            </span>
          )}

          <div className={cn(chatBubbleVariants({ sender }), 'w-fit')}>
            <div className="whitespace-pre-wrap break-words">{content}</div>
            {children}

            {(timestamp || (isOutgoing && status)) && (
              <div
                className={cn(
                  'mt-1 flex items-center justify-end gap-1 text-[11px] font-mono',
                  isOutgoing ? 'text-primary-foreground/75' : 'text-muted-foreground'
                )}
              >
                {timestamp && <span>{timestamp}</span>}
                {isOutgoing && <CheckCheck className="h-3.5 w-3.5" />}
              </div>
            )}
          </div>

          {copyable && typeof content === 'string' && (
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'opacity-0 group-hover/bubble:opacity-100 transition-opacity mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer',
                isOutgoing ? 'self-end' : 'self-start'
              )}
            >
              {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
    );
  }
);
ChatMessage.displayName = 'ChatMessage';

export const ChatTypingIndicator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center gap-2 p-2', className)} {...props}>
    <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 shadow-xs">
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
      <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
    </div>
    <span className="text-xs text-muted-foreground">Thinking...</span>
  </div>
));
ChatTypingIndicator.displayName = 'ChatTypingIndicator';

export interface ChatSuggestionListProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  title?: string;
}

export const ChatSuggestionList = React.forwardRef<
  HTMLDivElement,
  ChatSuggestionListProps
>(
  (
    {
      className,
      suggestions,
      onSelect,
      title = 'Suggested Prompts',
      ...props
    },
    ref
  ) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
      <div
        ref={ref}
        className={cn('p-3 border-t border-border bg-muted/10 space-y-2', className)}
        {...props}
      >
        {title && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wider">
            <Sparkles className="h-3.5 w-3.5 text-highlight" />
            <span>{title}</span>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          {suggestions.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(item)}
              className="text-left text-xs rounded-lg border border-border bg-card p-2 text-foreground hover:border-highlight hover:bg-highlight/5 transition-colors line-clamp-1 flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-highlight shrink-0" />
              <span>&ldquo;{item}&rdquo;</span>
            </button>
          ))}
        </div>
      </div>
    );
  }
);
ChatSuggestionList.displayName = 'ChatSuggestionList';

export interface ChatComposerProps extends Omit<React.HTMLAttributes<HTMLFormElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  /** Dipanggil saat kirim; `mentions` berisi token mention yang masih ada di teks. */
  onSend: (mentions: ChatMentionToken[]) => void;
  placeholder?: string;
  disabled?: boolean;
  cannedResponses?: Array<{ label: string; text: string }>;
  onSelectCanned?: (text: string) => void;
  /** Kandidat mention. Bila diisi, mengetik `@` membuka popover kandidat. */
  candidates?: ChatMentionCandidate[];
  /** Status kandidat: `loading`, `error`, atau `ready` (default). */
  candidatesStatus?: ChatMentionStatus;
  /** Dipanggil setiap query mention berubah; konsumen bisa mengambil kandidat. */
  onMentionQuery?: (query: string) => void;
  /** Dipanggil saat kandidat dipilih. */
  onMention?: (token: ChatMentionToken) => void;
  /** Tampilkan tombol emoji picker yang menyisip di posisi kursor. */
  emojiPicker?: boolean;
}

export const ChatComposer = React.forwardRef<HTMLFormElement, ChatComposerProps>(
  (
    {
      className,
      value,
      onChange,
      onSend,
      placeholder = 'Type your message... (Press Enter to Send)',
      disabled = false,
      cannedResponses,
      onSelectCanned,
      candidates,
      candidatesStatus = 'ready',
      onMentionQuery,
      onMention,
      emojiPicker = false,
      ...props
    },
    ref
  ) => {
    const mentionsEnabled = candidates !== undefined;
    const listId = React.useId();
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const pendingCaret = React.useRef<number | null>(null);
    const [mention, setMention] = React.useState<MentionQuery | null>(null);
    const [closed, setClosed] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [mentionTokens, setMentionTokens] = React.useState<ChatMentionToken[]>([]);

    const visibleCandidates = React.useMemo(
      () => (mentionsEnabled ? filterMentionCandidates(candidates ?? [], mention?.query ?? '') : []),
      [candidates, mention, mentionsEnabled]
    );
    const open = mentionsEnabled && mention !== null && !closed;
    const hasOptions = open && candidatesStatus === 'ready' && visibleCandidates.length > 0;
    const safeActiveIndex = Math.min(activeIndex, Math.max(visibleCandidates.length - 1, 0));
    const activeDescendant = hasOptions
      ? `${listId}-opt-${safeActiveIndex}`
      : undefined;

    // Pindahkan kursor setelah value berubah dari mention/emoji.
    React.useLayoutEffect(() => {
      const el = textareaRef.current;
      const pos = pendingCaret.current;
      if (el && pos !== null) {
        el.setSelectionRange(pos, pos);
        pendingCaret.current = null;
      }
    }, [value]);

    // Buang token yang teksnya sudah dihapus (termasuk perubahan value dari konsumen).
    React.useEffect(() => {
      setMentionTokens((prev) => {
        const next = prev.filter((t) => value.includes(`@${t.label}`));
        return next.length === prev.length ? prev : next;
      });
    }, [value]);

    const syncMention = (el: HTMLTextAreaElement, reopen: boolean) => {
      if (!mentionsEnabled) return;
      const found = getMentionQuery(el.value, el.selectionStart);
      setMention(found);
      if (reopen) setClosed(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
      if (!mentionsEnabled) return;
      const found = getMentionQuery(e.target.value, e.target.selectionStart);
      setMention(found);
      setClosed(false);
      setActiveIndex(0);
      if (found) onMentionQuery?.(found.query);
    };

    const selectCandidate = (candidate: ChatMentionCandidate) => {
      if (!mention) return;
      const next =
        value.slice(0, mention.start) + `@${candidate.label} ` + value.slice(mention.end);
      pendingCaret.current = mention.start + candidate.label.length + 2;
      onChange(next);
      setMention(null);
      setMentionTokens((prev) =>
        prev.some((t) => t.id === candidate.id)
          ? prev
          : [...prev, { id: candidate.id, label: candidate.label }]
      );
      onMention?.({ id: candidate.id, label: candidate.label });
      textareaRef.current?.focus();
    };

    const insertEmoji = (emoji: string) => {
      const el = textareaRef.current;
      const start = el ? el.selectionStart : value.length;
      const end = el ? el.selectionEnd : value.length;
      onChange(value.slice(0, start) + emoji + value.slice(end));
      pendingCaret.current = start + emoji.length;
      el?.focus();
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!value.trim() || disabled) return;
      onSend(mentionTokens);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (open && hasOptions) {
        const count = visibleCandidates.length;
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex((safeActiveIndex + 1) % count);
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex((safeActiveIndex - 1 + count) % count);
          return;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          const picked = visibleCandidates[safeActiveIndex];
          if (picked) selectCandidate(picked);
          return;
        }
      }
      if (open && e.key === 'Escape') {
        e.preventDefault();
        setClosed(true);
        return;
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    return (
      <form
        ref={ref}
        onSubmit={handleSubmit}
        className={cn('p-3 border-t border-border bg-card space-y-2', className)}
        {...props}
      >
        {cannedResponses && cannedResponses.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {cannedResponses.map((canned, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => (onSelectCanned ? onSelectCanned(canned.text) : onChange(canned.text))}
                className="shrink-0 text-xs rounded-full border border-border px-2.5 py-1 text-muted-foreground hover:text-foreground bg-muted/30 font-medium cursor-pointer transition-colors"
              >
                {canned.label}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          {emojiPicker && (
            <ChatEmojiPicker
              disabled={disabled}
              onPick={insertEmoji}
              onRequestFocus={() => textareaRef.current?.focus()}
            />
          )}
          <Popover
            open={open}
            onOpenChange={(next) => {
              if (!next) setClosed(true);
            }}
          >
            <PopoverAnchor asChild>
              <div className="relative flex-1 min-w-0">
                <Textarea
                  ref={textareaRef}
                  value={value}
                  onChange={handleChange}
                  onClick={(e) => syncMention(e.currentTarget, false)}
                  onKeyUp={(e) => {
                    if (!['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
                      syncMention(e.currentTarget, false);
                    }
                  }}
                  placeholder={placeholder}
                  rows={2}
                  disabled={disabled}
                  className="text-sm resize-none"
                  role={mentionsEnabled ? 'combobox' : undefined}
                  aria-autocomplete={mentionsEnabled ? 'list' : undefined}
                  aria-haspopup={mentionsEnabled ? 'listbox' : undefined}
                  aria-expanded={mentionsEnabled ? open : undefined}
                  aria-controls={hasOptions ? listId : undefined}
                  aria-activedescendant={activeDescendant}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </PopoverAnchor>
            {mentionsEnabled && (
              <PopoverContent
                align="start"
                side="top"
                className="w-72 p-1"
                onOpenAutoFocus={(e) => e.preventDefault()}
                onCloseAutoFocus={(e) => e.preventDefault()}
                onInteractOutside={(e) => {
                  if (e.target === textareaRef.current) e.preventDefault();
                }}
              >
                <ChatMentionList
                  listId={listId}
                  candidates={visibleCandidates}
                  status={candidatesStatus}
                  query={mention?.query ?? ''}
                  activeIndex={safeActiveIndex}
                  onActiveChange={setActiveIndex}
                  onSelect={selectCandidate}
                />
              </PopoverContent>
            )}
          </Popover>
          <Button
            type="submit"
            size="sm"
            disabled={!value.trim() || disabled}
            className="h-10 px-3.5 shadow-xs"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    );
  }
);
ChatComposer.displayName = 'ChatComposer';
