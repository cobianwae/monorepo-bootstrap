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
  const error = new Error('Upload dibatalkan.');
  error.name = 'AbortError';
  void signal;
  return error;
}

export default function FileUploadPage() {
  const [failNames, setFailNames] = React.useState<string[]>(['gagal.pdf']);
  const [latencyMs, setLatencyMs] = React.useState(1200);
  const [maxConcurrent, setMaxConcurrent] = React.useState(2);
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
        description="Dropzone dengan fallback keyboard, validasi per file, antrean upload dengan progres per item, batal/ulang per item, dan ringkasan agregat — semuanya dari komponen FileUpload."
      />

      <div className="mx-auto max-w-2xl space-y-6">
        <Card className="border-border">
          <CardContent className="space-y-5 p-6">
            <FileUpload
              uploadHandler={uploadHandler}
              maxConcurrent={maxConcurrent}
              maxSize={MAX_SIZE_MB * 1024 * 1024}
              accept="image/png,image/jpeg,image/webp,application/pdf"
              helperText={`PNG, JPG, WEBP, PDF · maks ${MAX_SIZE_MB} MB per file`}
              onAllDone={(items) => setLastResult(`${items.length} file selesai diunggah.`)}
              onItemError={(item) =>
                setLastResult(`Gagal: ${item.file.name} — ${item.error ?? 'kesalahan tidak dikenal'}`)
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
            <h2 className="text-sm font-semibold text-foreground">Kontrol demo</h2>

            <div className="space-y-2">
              <Label htmlFor="demo-fail">File yang digagalkan (pisahkan koma)</Label>
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
                placeholder="gagal.pdf"
              />
              <p className="text-xs text-muted-foreground">
                File dengan nama ini akan ditolak server pada akhir upload, sehingga state
                error dan tombol Ulang bisa didemokan.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="demo-latency">Latensi upload</Label>
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
                <Label htmlFor="demo-concurrent">Upload bersamaan (maxConcurrent)</Label>
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

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="demo-abort">Hormati AbortSignal</Label>
                <p className="text-xs text-muted-foreground">
                  Mock handler demo mendengarkan signal, jadi Batal berhenti di tengah jalan.
                </p>
              </div>
              <Switch id="demo-abort" checked disabled />
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Komponen tidak pernah upload sendiri: konsumen menyediakan{' '}
          <code>uploadHandler(file, {'{ onProgress, signal }'})</code> dan wajib menghormati{' '}
          <code>AbortSignal</code>.
        </p>
      </div>
    </div>
  );
}
