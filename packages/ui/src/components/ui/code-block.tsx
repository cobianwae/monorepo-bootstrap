'use client';

import * as React from 'react';
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './button';

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  maxHeight?: string;
}

export const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    {
      code,
      language,
      filename,
      showLineNumbers = false,
      showCopyButton = true,
      collapsible = false,
      defaultExpanded = false,
      maxHeight = '360px',
      className,
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = React.useState(false);
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard write error fallback
      }
    };

    const lines = code.split('\n');

    return (
      <div
        ref={ref}
        className={cn(
          'relative w-full rounded-xl border border-border bg-card overflow-hidden shadow-xs',
          className
        )}
        {...props}
      >
        {/* Header bar if filename or language or copy button */}
        {(filename || language || showCopyButton) && (
          <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground font-mono">
              {filename ? (
                <span className="font-medium text-foreground">{filename}</span>
              ) : null}
              {language && !filename ? (
                <span className="uppercase tracking-wider font-semibold text-[10px]">
                  {language}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              {language && filename && (
                <span className="uppercase tracking-wider text-[10px] text-muted-foreground">
                  {language}
                </span>
              )}
              {showCopyButton && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                  aria-label={copied ? 'Tersalin' : 'Salin kode'}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" />
                      <span className="text-success font-medium">Tersalin</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Salin</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Code Content */}
        <div
          style={{
            maxHeight:
              collapsible && !isExpanded ? maxHeight : undefined,
          }}
          className={cn(
            'overflow-x-auto p-4 text-xs font-mono transition-all',
            collapsible && !isExpanded && 'overflow-hidden'
          )}
        >
          <pre className="flex">
            {showLineNumbers && (
              <div
                aria-hidden="true"
                className="select-none pr-4 text-right text-muted-foreground/40"
              >
                {lines.map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
            )}
            <code className="flex-1 text-foreground whitespace-pre">{code}</code>
          </pre>
        </div>

        {/* Expand / Collapse Button if collapsible */}
        {collapsible && (
          <div
            className={cn(
              'flex justify-center border-t border-border bg-muted/20 p-1.5',
              !isExpanded &&
                'absolute inset-x-0 bottom-0 bg-gradient-to-t from-card to-transparent pt-8'
            )}
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 text-xs text-muted-foreground gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span>Sembunyikan</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>Lihat semua ({lines.length} baris)</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    );
  }
);
CodeBlock.displayName = 'CodeBlock';
