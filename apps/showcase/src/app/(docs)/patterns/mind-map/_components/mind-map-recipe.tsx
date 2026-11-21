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
      setCopied('Resep disalin');
      resetTimeout.current = window.setTimeout(() => setCopied(''), 2000);
    } catch {
      setCopied('Tidak dapat menyalin. Pilih teks resep secara manual.');
    }
  };

  return (
    <section aria-labelledby="mind-recipe" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <h2 id="mind-recipe" className="flex items-center gap-2 font-display text-2xl font-bold text-foreground">
            <Code2 aria-hidden="true" className="h-6 w-6 text-highlight" />
            <span>Resep integrasi</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            Salin contoh ini untuk menghubungkan data dan pencarian di aplikasi konsumen.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={copyRecipe}>
          {copied === 'Resep disalin' ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          Salin resep
        </Button>
      </div>
      <div>
        <pre
          tabIndex={0}
          aria-label="Contoh kode integrasi MindMap"
          className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground"
        >
          <code>{RECIPE}</code>
        </pre>
        <p role="status" className={copied ? 'mt-2 text-sm text-muted-foreground' : 'sr-only'}>
          {copied}
        </p>
      </div>
    </section>
  );
}
