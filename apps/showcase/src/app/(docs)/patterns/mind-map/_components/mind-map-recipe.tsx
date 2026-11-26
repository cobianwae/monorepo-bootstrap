'use client';

import * as React from 'react';
import { Check, Code2, Copy } from 'lucide-react';
import { Button } from '@ds/ui';
import { RECIPE } from './mind-map-demo-data';

export function MindMapRecipe() {
  const [copied, setCopied] = React.useState('');
  const resetTimeout = React.useRef<number | null>(null);

  React.useEffect(() => () => {
    if (resetTimeout.current !== null) window.clearTimeout(resetTimeout.current);
  }, []);

  const copyRecipe = async () => {
    if (resetTimeout.current !== null) window.clearTimeout(resetTimeout.current);
    setCopied('');
    try {
      await navigator.clipboard.writeText(RECIPE);
      setCopied('Recipe copied');
      resetTimeout.current = window.setTimeout(() => setCopied(''), 2000);
    } catch {
      setCopied('Could not copy. Select the recipe text manually.');
    }
  };

  return (
    <section aria-labelledby="mind-recipe" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <h2 id="mind-recipe" className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <Code2 aria-hidden="true" className="h-6 w-6 text-highlight" />
            <span>Implementation</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Copy this example to connect data and search in the consuming app.
          </p>
        </div>
      </div>
      <div>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
          <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2 text-xs">
            <span className="font-mono text-muted-foreground">tsx</span>
            <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={copyRecipe}>
              {copied === 'Recipe copied' ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Copy className="h-4 w-4" aria-hidden="true" />
              )}
              Copy recipe
            </Button>
          </div>
          <pre
            tabIndex={0}
            aria-label="MindMap integration example"
            className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground"
          >
            <code>{RECIPE}</code>
          </pre>
        </div>
        <p role="status" className={copied ? 'mt-2 text-sm text-muted-foreground' : 'sr-only'}>
          {copied}
        </p>
      </div>
    </section>
  );
}
