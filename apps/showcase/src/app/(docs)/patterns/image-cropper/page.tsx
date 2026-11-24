'use client';

import * as React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ImageCropper,
  PageHeader,
  SegmentedControl,
  SegmentedControlItem,
  type CropResult,
} from '@ds/ui';
import { SectionHeading } from '../../../../components/section-heading';
import {
  ASPECT_OPTIONS,
  AUDIT_PAIRS,
  DEMO_DATASETS,
  KEYBOARD,
  SCENARIOS,
  STEPS,
  type AspectPreset,
  type CropScenario,
} from './_lib/demo-data';
import { IMAGE_CROPPER_RECIPE } from './_lib/recipe';

export default function ImageCropperPage() {
  const [scenario, setScenario] = React.useState<CropScenario>('avatar');
  const [aspectPreset, setAspectPreset] = React.useState<AspectPreset>('square');
  const [dark, setDark] = React.useState(false);
  const [result, setResult] = React.useState<CropResult | null>(null);
  const [copyStatus, setCopyStatus] = React.useState('');

  const config = SCENARIOS[scenario];
  const aspect = ASPECT_OPTIONS.find((option) => option.id === aspectPreset)?.aspect ?? config.aspect;

  const selectScenario = (next: CropScenario) => {
    setScenario(next);
    setAspectPreset(next === 'avatar' ? 'square' : 'wide');
    setResult(null);
  };

  const handleComplete = (next: CropResult) => {
    setResult(next);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(IMAGE_CROPPER_RECIPE);
      setCopyStatus('Resep tersalin.');
    } catch {
      setCopyStatus('Gagal menyalin; salin manual dari blok di atas.');
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Pattern"
        title="Image Cropper"
        description="Crop avatar dan cover dengan aspek terkunci, zoom, putar, dan pratinjau live — output blob dan dataURL lewat onComplete."
      />

      <section id="skenario" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="skenario-heading"
          title="Skenario avatar dan cover"
          description="Ganti skenario atau aspek tanpa mengunggah ulang; hasil mengikuti konfigurasi aktif."
        />
        <Card className="mx-auto max-w-5xl">
          <CardHeader>
            <CardTitle>Skenario 6 langkah</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ol className="list-decimal space-y-2 pl-5 text-sm text-foreground">
              {STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>

            <div className="flex flex-wrap items-center gap-3">
              <SegmentedControl
                type="single"
                value={scenario}
                onValueChange={(value) => {
                  if (value) selectScenario(value as CropScenario);
                }}
                aria-label="Skenario crop"
              >
                <SegmentedControlItem value="avatar">Avatar</SegmentedControlItem>
                <SegmentedControlItem value="cover">Cover</SegmentedControlItem>
              </SegmentedControl>
              <SegmentedControl
                type="single"
                value={aspectPreset}
                onValueChange={(value) => {
                  if (value) setAspectPreset(value as AspectPreset);
                }}
                aria-label="Aspek crop"
              >
                {ASPECT_OPTIONS.map((option) => (
                  <SegmentedControlItem key={option.id} value={option.id}>
                    {option.label}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
              <Button
                variant="outline"
                size="sm"
                aria-pressed={dark}
                onClick={() => setDark((current) => !current)}
              >
                {dark ? 'Tema: gelap' : 'Tema: terang'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{config.label}</p>

            <div
              data-testid="ic-theme-scope"
              className={
                dark
                  ? 'dark space-y-4 rounded-lg border border-border bg-background p-4 text-foreground'
                  : 'space-y-4 rounded-lg border border-border bg-background p-4 text-foreground'
              }
            >
              <ImageCropper
                key={scenario}
                aspect={aspect}
                cropShape={config.cropShape}
                outputSize={config.outputSize}
                onComplete={handleComplete}
              />
            </div>

            <p role="status" className="text-sm text-muted-foreground" data-testid="ic-result">
              {result
                ? `${result.width}×${result.height} tersimpan · blob ${Math.round(result.blob.size / 1024)} KB`
                : 'Belum ada hasil tersimpan.'}
            </p>
          </CardContent>
        </Card>
      </section>

      <section id="keyboard" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="keyboard-heading"
          title="Navigasi keyboard"
          description="Semua operasi tersedia tanpa mouse; perubahan diumumkan lewat live region."
        />
        <Card className="mx-auto max-w-5xl">
          <CardHeader>
            <CardTitle>Keyboard dan screen reader</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1 pl-5 text-sm text-foreground">
              {KEYBOARD.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      <section id="panel-demo" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="panel-demo-heading"
          title="Panel demo state"
          description="Tiap dataset memicu state berbeda; empty dan loading tampil sebelum gambar terdecode."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {DEMO_DATASETS.map((dataset) => (
            <Card key={dataset.id}>
              <CardHeader>
                <CardTitle>{dataset.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{dataset.hint}</p>
                <ImageCropper accept={dataset.accept} maxBytes={dataset.maxBytes} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="audit" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="audit-heading"
          title="Audit kontras light dan dark"
          description="Pasangan token yang dipakai komponen; ambang dihitung dari validator @ds/tokens (pnpm test:tokens)."
        />
        <Card className="mx-auto max-w-5xl">
          <CardHeader>
            <CardTitle>Pasangan token dan ambang</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th scope="col" className="py-2 pr-4 font-medium text-foreground">
                    Pasangan
                  </th>
                  <th scope="col" className="py-2 pr-4 font-medium text-foreground">
                    Jenis
                  </th>
                  <th scope="col" className="py-2 font-medium text-foreground">
                    Ambang
                  </th>
                </tr>
              </thead>
              <tbody>
                {AUDIT_PAIRS.map((row) => (
                  <tr key={row.pair} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4 text-foreground">{row.pair}</td>
                    <td className="py-2 pr-4 text-muted-foreground">{row.kind}</td>
                    <td className="py-2 text-muted-foreground">{row.threshold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>

      <section id="resep" className="space-y-4 scroll-mt-20">
        <SectionHeading id="resep-heading" title="Resep onComplete" />
        <Card className="mx-auto max-w-5xl">
          <CardHeader>
            <CardTitle>Resep controlled</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs text-foreground">
              <code>{IMAGE_CROPPER_RECIPE}</code>
            </pre>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                Salin resep
              </Button>
              <p role="status" className="text-sm text-muted-foreground">
                {copyStatus}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
