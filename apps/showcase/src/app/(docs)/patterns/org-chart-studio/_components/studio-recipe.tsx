'use client';

import * as React from 'react';
import { Button } from '@ds/ui';
import { STUDIO_RECIPE_LINES } from './studio-demo-data';

export function StudioRecipe() {
  const [copied, setCopied] = React.useState(false);
  const recipe = React.useMemo(() => STUDIO_RECIPE_LINES.join('\n'), []);

  const copyRecipe = React.useCallback(() => {
    void navigator.clipboard?.writeText(recipe).then(
      () => setCopied(true),
      () => setCopied(false),
    );
    window.setTimeout(() => setCopied(false), 2000);
  }, [recipe]);

  return (
    <section aria-labelledby="org-studio-recipe" className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="org-studio-recipe" className="text-lg font-semibold text-foreground">
          Resep integrasi (15 baris)
        </h2>
        <Button type="button" variant="outline" size="sm" onClick={copyRecipe}>
          {copied ? 'Resep disalin' : 'Salin resep'}
        </Button>
      </div>
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 font-mono text-xs leading-relaxed text-foreground">
        <code>{recipe}</code>
      </pre>
      <p className="text-xs text-muted-foreground">
        Komponen tidak fetch/persist sendiri: page memegang <code>data</code> + <code>onChange</code> sekali per
        commit; contoh 40 orang dan pencarian milik konsumen.
      </p>
    </section>
  );
}
