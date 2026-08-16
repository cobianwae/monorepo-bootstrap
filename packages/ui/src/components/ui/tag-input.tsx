'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Badge } from './badge';

const tagInputVariants = cva(
  'flex w-full flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 shadow-xs transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      error: {
        true: 'border-destructive focus-within:ring-destructive',
      },
      size: {
        default: 'min-h-9',
        sm: 'min-h-8',
        lg: 'min-h-10',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
);

export interface TagInputProps
  extends VariantProps<typeof tagInputVariants>,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'value' | 'onChange' | 'onKeyDown' | 'defaultValue'> {
  value: string[];
  onChange: (value: string[]) => void;
  maxTags?: number;
  splitOn?: string[];
  placeholder?: string;
  error?: boolean;
  disabled?: boolean;
  className?: string;
  caseSensitive?: boolean;
  allowDuplicates?: boolean;
  label?: string;
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
(
      {
        value,
        onChange,
        maxTags,
        splitOn = [',', 'Enter'],
        placeholder = 'Type and press Enter...',
        error,
        size,
        disabled,
        className,
        caseSensitive = false,
        allowDuplicates = false,
        label,
        ...props
      },
      ref
    ) => {
    const [inputValue, setInputValue] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const normalize = (tag: string) => (caseSensitive ? tag : tag.trim());
    const isFull = maxTags !== undefined && value.length >= maxTags;

    const addTags = React.useCallback(
      (raw: string) => {
        const singleCharSeps = splitOn.filter((sep) => sep.length === 1);
        const parts = singleCharSeps.length > 0
          ? raw
              .split(new RegExp(`[${singleCharSeps.map(escapeRegex).join('')}]`, 'i'))
              .map(normalize)
              .filter(Boolean)
          : raw.split(/\r?\n/).map(normalize).filter(Boolean);
        if (parts.length === 0) return;

        const next = [...value];
        let added = 0;
        for (const part of parts) {
          if (maxTags !== undefined && next.length >= maxTags) break;
          const exists = next.some((t) => (caseSensitive ? t === part : t.toLowerCase() === part.toLowerCase()));
          if (exists && !allowDuplicates) continue;
          next.push(part);
          added++;
        }
        if (added > 0) onChange(next);
      },
      [value, onChange, maxTags, splitOn, caseSensitive, allowDuplicates]
    );

    const removeTag = (index: number) => {
      onChange(value.filter((_, i) => i !== index));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      const key = e.key;
      if (splitOn.includes(key)) {
        e.preventDefault();
        if (inputValue.trim()) addTags(inputValue);
        setInputValue('');
      } else if (key === 'Backspace' && inputValue === '' && value.length > 0) {
        removeTag(value.length - 1);
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text');
      if (!pasted) return;
      if (splitOn.some((sep) => pasted.includes(sep))) {
        addTags(pasted);
        setInputValue('');
      } else {
        setInputValue((prev) => prev + pasted);
      }
    };

    return (
      <div className={cn('w-full', className)}>
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <div
          className={cn(tagInputVariants({ error, size }))}
          onClick={() => inputRef.current?.focus()}
        >
        {value.map((tag, index) => (
          <Badge key={`${tag}-${index}`} variant="secondary" className="gap-1 pr-1">
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="rounded-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`Remove ${tag}`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
        <input
          ref={ref}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={isFull ? `Max ${maxTags} tags` : placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          className="min-w-[120px] flex-1 bg-transparent py-1 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...props}
        />
        </div>
      </div>
    );
  }
);
TagInput.displayName = 'TagInput';

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}