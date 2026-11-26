'use client';

import * as React from 'react';
import { Crop } from 'lucide-react';
import {
  CodeBlock,
  ImageCropper,
  Kbd,
  PageHeader,
  SegmentedControl,
  SegmentedControlItem,
  type CropResult,
} from '@ds/ui';
import { SectionHeading } from '../../../../components/section-heading';
import {
  ARIA_NOTES,
  ASPECT_OPTIONS,
  BREAK_CASES,
  CONTRACT,
  SCENARIOS,
  SHORTCUTS,
  STATE_CONFIG,
  type AspectPreset,
  type CropScenario,
  type DemoState,
} from './_lib/demo-data';
import { IMAGE_CROPPER_RECIPE } from './_lib/recipe';

interface DemoControlProps {
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onValueChange: (value: string) => void;
}

function DemoControl({ label, value, options, onValueChange }: DemoControlProps) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <SegmentedControl
        type="single"
        value={value}
        onValueChange={(next) => {
          if (next) onValueChange(next);
        }}
        aria-label={label}
        className="max-w-full overflow-x-auto"
      >
        {options.map((option) => (
          <SegmentedControlItem key={option.value} value={option.value}>
            {option.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>
    </div>
  );
}

/** Spesimen bingkai: bentuk area crop dan ukuran keluarannya. */
const FRAME_SPECIMENS = [
  { prop: 'cropShape="round"', name: 'Avatar', shape: 'h-32 w-32 rounded-full', result: '512 × 512' },
  { prop: 'aspect={16 / 9}', name: 'Cover', shape: 'h-28 w-48 rounded-md', result: '1280 × 720' },
  { prop: 'aspect="free"', name: 'Free', shape: 'h-32 w-24 rounded-md', result: 'Photo’s own ratio' },
] as const;

/** Area crop mini: grid sepertiga di dalam bingkai highlight. */
function CropFrame({ className }: { className: string }) {
  return (
    <span className={`relative block overflow-hidden border-2 border-highlight bg-highlight/10 ${className}`}>
      <span className="absolute inset-y-0 left-1/3 w-px bg-highlight/40" />
      <span className="absolute inset-y-0 left-2/3 w-px bg-highlight/40" />
      <span className="absolute inset-x-0 top-1/3 h-px bg-highlight/40" />
      <span className="absolute inset-x-0 top-2/3 h-px bg-highlight/40" />
    </span>
  );
}

export default function ImageCropperPage() {
  const [scenario, setScenario] = React.useState<CropScenario>('avatar');
  const [aspectPreset, setAspectPreset] = React.useState<AspectPreset>('square');
  const [demoState, setDemoState] = React.useState<DemoState>('valid');
  const [result, setResult] = React.useState<CropResult | null>(null);

  const config = SCENARIOS[scenario];
  const aspect = ASPECT_OPTIONS.find((option) => option.id === aspectPreset)?.aspect ?? config.aspect;
  const stateConfig = STATE_CONFIG[demoState];

  const selectScenario = (next: CropScenario) => {
    setScenario(next);
    setAspectPreset(next === 'avatar' ? 'square' : 'wide');
    setResult(null);
  };

  const handleComplete = (next: CropResult) => {
    setResult(next);
  };

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="UX Recipe Scenario"
        eyebrowIcon={Crop}
        title="Image Cropper"
        description="Crop an avatar or cover image. Adjust the aspect ratio, zoom, and rotation before saving."
      />

      <section aria-label="Interactive demo" className="space-y-4">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <DemoControl
            label="Scenario"
            value={scenario}
            onValueChange={(next) => selectScenario(next as CropScenario)}
            options={[
              { value: 'avatar', label: 'Avatar' },
              { value: 'cover', label: 'Cover' },
            ]}
          />
          <DemoControl
            label="Aspect"
            value={aspectPreset}
            onValueChange={(next) => setAspectPreset(next as AspectPreset)}
            options={ASPECT_OPTIONS.map((option) => ({ value: option.id, label: option.label }))}
          />
          <DemoControl
            label="State"
            value={demoState}
            onValueChange={(next) => setDemoState(next as DemoState)}
            options={[
              { value: 'valid', label: 'Valid' },
              { value: 'unsupported', label: 'Unsupported format' },
              { value: 'size-limit', label: 'Size limit' },
            ]}
          />
        </div>

        <ImageCropper
          key={`${scenario}-${demoState}`}
          aspect={aspect}
          cropShape={config.cropShape}
          outputSize={config.outputSize}
          accept={stateConfig.accept}
          maxBytes={stateConfig.maxBytes}
          onComplete={handleComplete}
        />

        <p role="status" className="text-sm text-muted-foreground" data-testid="ic-result">
          {result
            ? `${result.width}×${result.height} saved · blob ${Math.round(result.blob.size / 1024)} KB`
            : 'No crop saved yet.'}
        </p>
      </section>

      <section id="frames" aria-labelledby="frames-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="frames-heading"
          title="The frame decides the file"
          description="Shape and ratio are set by props. outputSize fixes the pixels you get back, always as PNG."
        />
        <ul className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          {FRAME_SPECIMENS.map((specimen) => (
            <li key={specimen.name} className="flex flex-col bg-card">
              <div className="flex items-center justify-between gap-3 border-b border-dashed border-border px-4 py-3">
                <code className="font-mono text-sm">{specimen.prop}</code>
                <span className="text-xs text-muted-foreground">{specimen.name}</span>
              </div>
              <div aria-hidden="true" className="flex min-h-44 items-center justify-center bg-muted/40 p-4">
                <CropFrame className={specimen.shape} />
              </div>
              <p className="border-t border-border px-4 py-3 text-center font-display text-xl font-bold tabular-nums">
                {specimen.result}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section id="edge-cases" aria-labelledby="edge-cases-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading id="edge-cases-heading" title="Try to break it" />
        <ul className="grid gap-6 md:grid-cols-3">
          {BREAK_CASES.map((item) => (
            <li key={item.input} className="space-y-2 border-t-2 border-highlight pt-4">
              <p className="font-mono text-2xl font-bold">{item.input}</p>
              <p className="text-sm">{item.action}</p>
              <p className="text-sm text-muted-foreground">{item.outcome}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="accessibility" aria-labelledby="accessibility-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading
          id="accessibility-heading"
          title="Keyboard & screen readers"
          description="Focus the crop area, then use these keys."
        />
        <div className="grid gap-6 lg:grid-cols-5">
          <dl className="self-start rounded-xl border border-border bg-card px-4 lg:col-span-2">
            {SHORTCUTS.map((shortcut) => (
              <div key={shortcut.label} className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
                <dt className="text-sm">{shortcut.label}</dt>
                <dd className="flex items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <dl className="lg:col-span-3">
            {ARIA_NOTES.map((note) => (
              <div key={note.term} className="grid gap-1 border-b border-border py-3 first:pt-0 last:border-b-0 sm:grid-cols-[9rem_1fr] sm:gap-4">
                <dt className="font-mono text-sm font-medium">{note.term}</dt>
                <dd className="text-sm text-muted-foreground">{note.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="implementation" aria-labelledby="implementation-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading id="implementation-heading" title="Drop it in" />
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-2">
            <dl className="space-y-4">
              {CONTRACT.map((item) => (
                <div key={item.term} className="space-y-1 border-l-2 border-highlight pl-4">
                  <dt className="font-mono text-sm font-medium">{item.term}</dt>
                  <dd className="text-sm text-muted-foreground">{item.meaning}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs text-muted-foreground">
              S-005.38 covers the avatar (S-005.38.01) and cover (S-005.38.02) scenarios. Token pairs are covered by the{' '}
              <a href="/foundations/colors" className="underline underline-offset-2">
                foundations contrast matrix
              </a>
              .
            </p>
          </div>
          <CodeBlock filename="ImageCropperDemo.tsx" language="tsx" code={IMAGE_CROPPER_RECIPE} className="min-w-0 self-start lg:col-span-3" />
        </div>
      </section>
    </div>
  );
}
