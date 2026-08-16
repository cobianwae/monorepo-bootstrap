'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Send, CheckCheck, Sparkles, Copy, Check } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Button } from './button';
import { Textarea } from './textarea';

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

export const chatMessageVariants = cva('flex gap-2.5 transition-all', {
  variants: {
    sender: {
      user: 'justify-end',
      assistant: 'justify-start',
      agent: 'justify-end',
      system: 'justify-center',
    },
  },
  defaultVariants: {
    sender: 'assistant',
  },
});

export const chatBubbleVariants = cva(
  'relative rounded-xl px-4 py-2.5 text-sm leading-relaxed max-w-[85%] sm:max-w-[75%]',
  {
    variants: {
      sender: {
        user: 'bg-primary text-primary-foreground font-medium',
        agent: 'bg-primary text-primary-foreground font-medium',
        assistant: 'bg-muted/70 text-foreground border border-border',
        system:
          'bg-muted/40 border border-border text-center text-xs text-muted-foreground font-mono max-w-full',
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
    const isUserOrAgent = sender === 'user' || sender === 'agent';
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
        {!isUserOrAgent && (
          <Avatar className="h-7 w-7 border border-border shrink-0 mt-0.5">
            {avatar && <AvatarImage src={avatar} alt={senderName || 'Avatar'} />}
            <AvatarFallback className="text-[10px] font-mono">
              {senderName ? senderName.substring(0, 2).toUpperCase() : 'AI'}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="group/bubble relative flex flex-col space-y-1">
          {senderName && !isUserOrAgent && (
            <span className="text-[11px] font-semibold text-muted-foreground px-1">
              {senderName}
            </span>
          )}

          <div className={cn(chatBubbleVariants({ sender }))}>
            <div className="whitespace-pre-wrap">{content}</div>
            {children}

            {(timestamp || (isUserOrAgent && status)) && (
              <div
                className={cn(
                  'mt-1 flex items-center justify-end gap-1 text-[11px] font-mono',
                  isUserOrAgent ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}
              >
                {timestamp && <span>{timestamp}</span>}
                {isUserOrAgent && <CheckCheck className="h-3.5 w-3.5" />}
              </div>
            )}
          </div>

          {copyable && typeof content === 'string' && (
            <button
              type="button"
              onClick={handleCopy}
              className="opacity-0 group-hover/bubble:opacity-100 transition-opacity self-end mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
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
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
  cannedResponses?: Array<{ label: string; text: string }>;
  onSelectCanned?: (text: string) => void;
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
      ...props
    },
    ref
  ) => {
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!value.trim() || disabled) return;
      onSend();
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
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={2}
            disabled={disabled}
            className="text-sm resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
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
