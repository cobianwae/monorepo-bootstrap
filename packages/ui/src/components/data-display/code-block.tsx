'use client';

import * as React from 'react';
import { Check, Copy, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../base/button';
import { highlightCode } from './code-block-highlight';

/** Teks tombol salin; yang tidak diisi memakai default bawaan. */
export interface CodeBlockCopyLabels {
  copy?: string;
  copyAriaLabel?: string;
  copied?: string;
  failed?: string;
  failedAriaLabel?: string;
}

const DEFAULT_COPY_LABELS: Required<CodeBlockCopyLabels> = {
  copy: 'Copy',
  copyAriaLabel: 'Copy code',
  copied: 'Copied',
  failed: 'Copy failed',
  failedAriaLabel: 'Copy failed',
};

export interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
  showCopyButton?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  maxHeight?: string;
  copyLabels?: CodeBlockCopyLabels;
}

type CopyState = 'idle' | 'copied' | 'failed';

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
      copyLabels,
      className,
      ...props
    },
    ref
  ) => {
    const [copyState, setCopyState] = React.useState<CopyState>('idle');
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
    const [highlightedHtml, setHighlightedHtml] = React.useState<string | null>(null);

    // Highlight async (Shiki). Selama memuat, dan untuk bahasa tak dikenal, tampil kode flat.
    React.useEffect(() => {
      setHighlightedHtml(null);
      if (!language) return;
      let active = true;
      highlightCode(code, language).then((html) => {
        if (active) setHighlightedHtml(html);
      });
      return () => {
        active = false;
      };
    }, [code, language]);

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(code);
        setCopyState('copied');
      } catch {
        setCopyState('failed');
      }
      setTimeout(() => setCopyState('idle'), 2000);
    };

    const lines = code.split('\n');
    const labels = { ...DEFAULT_COPY_LABELS, ...copyLabels };

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
                <span className="uppercase tracking-wider font-semibold text-xs">
                  {language}
                </span>
              ) : null}
            </div>

            <div className="flex items-center gap-2" aria-live="polite">
              {language && filename && (
                <span className="uppercase tracking-wider text-xs text-muted-foreground">
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
                  aria-label={
                    copyState === 'copied'
                      ? labels.copied
                      : copyState === 'failed'
                        ? labels.failedAriaLabel
                        : labels.copyAriaLabel
                  }
                >
                  {copyState === 'copied' ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-success" />
                      <span className="text-success font-medium">{labels.copied}</span>
                    </>
                  ) : copyState === 'failed' ? (
                    <>
                      <X className="h-3.5 w-3.5 text-destructive" />
                      <span className="text-foreground font-medium">{labels.failed}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>{labels.copy}</span>
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
          <div className="flex">
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
            {highlightedHtml ? (
              <div
                className="ds-code-block flex-1 whitespace-pre"
                // Output Shiki sudah di-escape per token; sumber hanya `code` dari pemanggil.
                dangerouslySetInnerHTML={{ __html: highlightedHtml }}
              />
            ) : (
              <pre className="flex-1 whitespace-pre">
                <code className="text-foreground">{code}</code>
              </pre>
            )}
          </div>
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
                  <span>Hide</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>View all ({lines.length} lines)</span>
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
