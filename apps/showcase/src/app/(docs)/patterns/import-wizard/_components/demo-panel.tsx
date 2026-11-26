'use client';

import { Button, Card, CardContent, CodeBlock } from '@ds/ui';
import { SectionHeading } from '../../../../../components/section-heading';
import { DEMO_DATASETS, type DemoDatasetId } from '../_lib/demo-datasets';

/** Enam state demo S-005.37: valid, invalid, kosong, besar, loading, error. */
const DEMO_BUTTONS: { id: DemoDatasetId; delayMs?: number; label: string; testId: string }[] = [
  { id: 'valid', label: DEMO_DATASETS.valid.label, testId: 'iw-demo-valid' },
  { id: 'invalid', label: DEMO_DATASETS.invalid.label, testId: 'iw-demo-invalid' },
  { id: 'empty', label: DEMO_DATASETS.empty.label, testId: 'iw-demo-empty' },
  { id: 'large', label: DEMO_DATASETS.large.label, testId: 'iw-demo-large' },
  { id: 'valid', delayMs: 1200, label: 'Loading (slow parse)', testId: 'iw-demo-loading' },
  { id: 'format', label: DEMO_DATASETS.format.label, testId: 'iw-demo-error' },
];

/** Integration sketch for the composed pattern; the demo itself never sends data. */
export const ONCOMPLETE_RECIPE = [
  '// Integration sketch for the composed pattern, not an @ds/ui export.',
  "// buildImportResult lives in this demo's _lib/submit.ts.",
  'function handleSubmit() {',
  '  const built = buildImportResult(rows, mapping, rowErrors, policy);',
  '  if (!built.ok) {',
  '    setRejection(built.reason);',
  '    return;',
  '  }',
  '  // The demo stops here and keeps the result in local state.',
  '  setResult(built.result);',
  '',
  '  // In your app, pass built.result.rows to your own code, for example',
  '  // an endpoint that your application provides and owns:',
  '  // await sendToYourApi(built.result.rows);',
  '}',
].join('\n');

export interface DemoPanelProps {
  onLoad: (id: DemoDatasetId, delayMs?: number) => void;
  lastResultSummary: string | null;
}

/** CodeBlock berdefault Indonesia; halaman ini berbahasa Inggris. */
const COPY_LABELS = {
  copy: 'Copy',
  copyAriaLabel: 'Copy code',
  copied: 'Copied',
  failed: 'Copy failed',
  failedAriaLabel: 'Copy failed',
};

export function DemoPanel({ onLoad, lastResultSummary }: DemoPanelProps) {
  return (
    <>
      <section aria-labelledby="iw-demo-heading" className="max-w-4xl space-y-4 scroll-mt-20">
        <SectionHeading
          id="iw-demo-heading"
          title="Demo panel"
          description="Load a sample dataset or trigger a specific state."
        />
        <Card className="w-full min-w-0">
          <CardContent className="space-y-4 pt-6" data-testid="iw-demo-panel">
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
                Previous simulated result: {lastResultSummary}
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="iw-recipe-heading" className="max-w-4xl space-y-4 scroll-mt-20">
        <SectionHeading id="iw-recipe-heading" title="Integration sketch" />
        <CodeBlock
          code={ONCOMPLETE_RECIPE}
          language="ts"
          copyLabels={COPY_LABELS}
          data-testid="iw-recipe"
        />
      </section>
    </>
  );
}
