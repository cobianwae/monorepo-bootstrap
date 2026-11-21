'use client';

import * as React from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@ds/ui';
import { RECIPE } from './mind-map-demo-data';

export function MindMapRecipe() {
  const [copied, setCopied] = React.useState('');

  const copyRecipe = async () => {
    try {
      await navigator.clipboard.writeText(RECIPE);
      setCopied('Resep disalin');
    } catch {
      setCopied('Tidak dapat menyalin. Pilih teks resep secara manual.');
    }
  };

  return (
    <section aria-labelledby="mind-recipe" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="mind-recipe" className="text-lg font-semibold text-foreground">
          Resep integrasi
        </h2>
        <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={copyRecipe}>
          {copied === 'Resep disalin' ? (
            <Check className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Copy className="h-4 w-4" aria-hidden="true" />
          )}
          Salin resep
        </Button>
      </div>
      <pre
        tabIndex={0}
        aria-label="Contoh kode integrasi MindMap"
        className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground"
      >
        <code>{RECIPE}</code>
      </pre>
      <p role="status" className="text-sm text-muted-foreground">
        {copied}
      </p>
    </section>
  );
}
