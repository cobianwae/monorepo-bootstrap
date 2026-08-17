'use client';

import * as React from 'react';
import { Check, Copy, TerminalSquare } from 'lucide-react';

const INSTALL_COMMAND = 'pnpm add @ds/ui';

/**
 * Copyable install command. The previous landing rendered the command as a
 * dead button — this one actually copies, with visual + screen-reader
 * feedback.
 */
export function CopyInstall() {
  const [copied, setCopied] = React.useState(false);
  const timeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
    } catch {
      // Fallback for environments without the async clipboard API
      const textarea = document.createElement('textarea');
      textarea.value = INSTALL_COMMAND;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }

    setCopied(true);
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy install command: ${INSTALL_COMMAND}`}
      className="group inline-flex h-12 items-center gap-3 rounded-full border border-border bg-card px-5 font-mono text-sm text-muted-foreground shadow-sm transition-colors hover:border-highlight/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <TerminalSquare className="h-4 w-4 shrink-0 text-highlight" aria-hidden="true" />
      <span>
        <span aria-hidden="true">$ </span>
        {INSTALL_COMMAND}
      </span>
      {copied ? (
        <Check className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
      ) : (
        <Copy
          className="h-4 w-4 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
          aria-hidden="true"
        />
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </button>
  );
}
