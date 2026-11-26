'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  FileUpload,
  Label,
  Slider,
  Switch,
  type UploadHandler,
} from '@ds/ui';
import { Sparkles } from 'lucide-react';
import { PageHeader } from '@ds/ui';

const MAX_SIZE_MB = 2;

function abortError(signal: AbortSignal): Error {
  const error = new Error('Upload cancelled.');
  error.name = 'AbortError';
  void signal;
  return error;
}

export default function FileUploadPage() {
  const [failNames, setFailNames] = React.useState<string[]>(['failed.pdf']);
  const [latencyMs, setLatencyMs] = React.useState(1200);
  const [maxConcurrent, setMaxConcurrent] = React.useState(2);
  const [maxRetries, setMaxRetries] = React.useState(0);
  const [sortable, setSortable] = React.useState(false);
  const [compact, setCompact] = React.useState(false);
  const [lastResult, setLastResult] = React.useState<string | null>(null);

  const uploadHandler = React.useCallback<UploadHandler>(
    async (file, { onProgress, signal }) => {
      const steps = 10;
      for (let step = 1; step <= steps; step += 1) {
        if (signal.aborted) throw abortError(signal);
        await new Promise<void>((resolve, reject) => {
          const timer = window.setTimeout(resolve, latencyMs / steps);
          signal.addEventListener('abort', () => {
            window.clearTimeout(timer);
            reject(abortError(signal));
          });
        });
        onProgress((step / steps) * 100);
      }
      if (failNames.includes(file.name)) {
        throw new Error(`Server menolak "${file.name}" (simulasi demo).`);
      }
    },
    [failNames, latencyMs]
  );

  return (
    <div className="animate-in fade-in-50 space-y-10 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Sparkles}
        title="File Upload / Drag & Drop"
        description="Upload files in a queue, track their progress, and retry or cancel individual uploads."
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-border">
          <CardContent className="space-y-5 p-6">
            <FileUpload
              uploadHandler={uploadHandler}
              maxConcurrent={maxConcurrent}
              maxRetries={maxRetries}
              sortable={sortable}
              variant={compact ? 'compact' : 'dropzone'}
              maxSize={MAX_SIZE_MB * 1024 * 1024}
              accept="image/png,image/jpeg,image/webp,application/pdf"
              helperText={`PNG, JPG, WEBP, PDF · max ${MAX_SIZE_MB} MB per file`}
              onAllDone={(items) => setLastResult(`${items.length} files uploaded.`)}
              onItemError={(item) =>
                setLastResult(`Upload failed: ${item.file.name} — ${item.error ?? 'unknown error'}`)
              }
            />
            {lastResult && (
              <p role="status" className="text-xs text-muted-foreground">
                {lastResult}
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="space-y-5 p-6">
            <h2 className="text-sm font-semibold text-foreground">Demo controls</h2>

            <div className="space-y-2">
              <Label htmlFor="demo-fail">Files to reject (comma-separated)</Label>
              <input
                id="demo-fail"
                type="text"
                value={failNames.join(', ')}
                onChange={(event) =>
                  setFailNames(
                    event.target.value
                      .split(',')
                      .map((name) => name.trim())
                      .filter(Boolean)
                  )
                }
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="failed.pdf"
              />
              <p className="text-xs text-muted-foreground">
                The simulated server rejects these filenames at the end of an upload.
                Use them to try the error state and retry action.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="demo-latency">Upload latency</Label>
                <span className="text-xs text-muted-foreground">{latencyMs} ms</span>
              </div>
              <Slider
                id="demo-latency"
                min={200}
                max={4000}
                step={200}
                value={[latencyMs]}
                onValueChange={(values) => setLatencyMs(values[0] ?? 1200)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="demo-concurrent">Concurrent uploads (maxConcurrent)</Label>
                <span className="text-xs text-muted-foreground">{maxConcurrent}</span>
              </div>
              <Slider
                id="demo-concurrent"
                min={1}
                max={5}
                step={1}
                value={[maxConcurrent]}
                onValueChange={(values) => setMaxConcurrent(values[0] ?? 2)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="demo-retries">Auto-retry (maxRetries)</Label>
                <span className="text-xs text-muted-foreground">{maxRetries}x</span>
              </div>
              <Slider
                id="demo-retries"
                min={0}
                max={3}
                step={1}
                value={[maxRetries]}
                onValueChange={(values) => setMaxRetries(values[0] ?? 0)}
              />
              <p className="text-xs text-muted-foreground">
                Failed uploads retry up to this limit before showing a final error.
              </p>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="demo-sortable">Reorder the queue (sortable)</Label>
                <p className="text-xs text-muted-foreground">
                  Use drag handles, keyboard controls, or move-up and move-down buttons.
                </p>
              </div>
              <Switch id="demo-sortable" checked={sortable} onCheckedChange={setSortable} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="demo-compact">Compact variant</Label>
                <p className="text-xs text-muted-foreground">
                  Compact rows hide thumbnails by default and keep status and actions visible.
                </p>
              </div>
              <Switch id="demo-compact" checked={compact} onCheckedChange={setCompact} />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="demo-abort">Respect AbortSignal</Label>
                <p className="text-xs text-muted-foreground">
                  The demo handler listens for the signal so cancellation stops an upload in progress.
                </p>
              </div>
              <Switch id="demo-abort" checked disabled />
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          The app supplies{' '}
          <code>uploadHandler(file, {'{ onProgress, signal }'})</code> and must respect{' '}
          <code>AbortSignal</code>.
        </p>
        <p className="text-center text-xs text-muted-foreground">
          The summary bar shows <strong>Retry all failed</strong> and{' '}
          <strong>Cancel all</strong> when available. <code>sortable</code> (default{' '}
          <code>false</code>) enables drag handles, keyboard controls, and move buttons.
          <code>maxRetries</code> (default <code>0</code>) limits automatic retries.
          <code>variant=&quot;compact&quot;</code> hides thumbnails by default.
        </p>
      </div>
    </div>
  );
}
