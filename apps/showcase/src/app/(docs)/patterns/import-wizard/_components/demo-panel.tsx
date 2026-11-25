'use client';

import * as React from 'react';
import { Button, DemoSection } from '@ds/ui';
import { DEMO_DATASETS, type DemoDatasetId } from '../_lib/demo-datasets';

/** Enam state demo S-005.37: valid, invalid, kosong, besar, loading, error. */
const DEMO_BUTTONS: { id: DemoDatasetId; delayMs?: number; label: string; testId: string }[] = [
  { id: 'valid', label: DEMO_DATASETS.valid.label, testId: 'iw-demo-valid' },
  { id: 'invalid', label: DEMO_DATASETS.invalid.label, testId: 'iw-demo-invalid' },
  { id: 'empty', label: DEMO_DATASETS.empty.label, testId: 'iw-demo-empty' },
  { id: 'large', label: DEMO_DATASETS.large.label, testId: 'iw-demo-large' },
  { id: 'valid', delayMs: 1200, label: 'Loading (parse lambat)', testId: 'iw-demo-loading' },
  { id: 'format', label: DEMO_DATASETS.format.label, testId: 'iw-demo-error' },
];

/** Resep consumer: cara menangani hasil onComplete (15 baris). */
export const ONCOMPLETE_RECIPE = [
  '// ImportResult: { rows, skipped, failed }',
  'function handleComplete(result: ImportResult) {',
  '  // result.rows: hanya baris valid, key = field target',
  '  // result.skipped: baris dilewati (policy "Lewati")',
  '  // result.failed: baris gagal (policy "Gagalkan")',
  '  const { rows, skipped, failed } = result;',
  '  console.info(`Diimpor ${rows.length}, dilewati ${skipped}, gagal ${failed}`);',
  '  void fetch("/api/members/import", {',
  '    method: "POST",',
  '    headers: { "Content-Type": "application/json" },',
  '    body: JSON.stringify({ rows }),',
  '  });',
  '}',
  '',
  '',
  '<ImportWizard onComplete={handleComplete} />',
].join('\n');

export interface DemoPanelProps {
  onLoad: (id: DemoDatasetId, delayMs?: number) => void;
  lastResultSummary: string | null;
}

export function DemoPanel({ onLoad, lastResultSummary }: DemoPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ONCOMPLETE_RECIPE);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <DemoSection label="Panel demo" description="Muat dataset contoh atau picu state tertentu.">
      <div className="space-y-6" data-testid="iw-demo-panel">
        <div className="flex flex-wrap gap-2">
          {DEMO_BUTTONS.map((item) => (
            <Button
              key={item.testId}
              type="button"
              variant="outline"
              size="sm"
              className="h-11"
              data-testid={item.testId}
              onClick={() => onLoad(item.id, item.delayMs)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {lastResultSummary && (
          <p className="text-sm text-muted-foreground" data-testid="iw-demo-result">
            Hasil onComplete: {lastResultSummary}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">Resep onComplete</p>
            <Button type="button" variant="outline" size="sm" className="h-11" onClick={handleCopy} data-testid="iw-recipe-copy">
              {copied ? 'Tersalin' : 'Salin resep'}
            </Button>
          </div>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-xs text-foreground" data-testid="iw-recipe">
            <code>{ONCOMPLETE_RECIPE}</code>
          </pre>
        </div>
      </div>
    </DemoSection>
  );
}
