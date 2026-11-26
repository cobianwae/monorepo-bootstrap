'use client';

import * as React from 'react';
import {
  CodeBlock,
  ImageCropper,
  PageHeader,
  SegmentedControl,
  SegmentedControlItem,
  type CropResult,
} from '@ds/ui';
import { SectionHeading } from '../../../../components/section-heading';
import {
  ASPECT_OPTIONS,
  KEYBOARD,
  SCENARIOS,
  STATE_CONFIG,
  STEPS,
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

function StepLead({ step, index }: { step: string; index: number }) {
  const separator = step.indexOf(' — ');
  const lead = separator > 0 ? step.slice(0, separator) : null;
  const rest = separator > 0 ? step.slice(separator + 3) : step;
  return (
    <li className="flex items-start gap-3">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-highlight/40 bg-highlight/10 text-xs font-semibold text-foreground"
      >
        {index + 1}
      </span>
      <span className="text-base text-muted-foreground">
        {lead ? <strong className="font-semibold text-foreground">{lead}</strong> : null}
        {lead ? ' — ' : null}
        {rest}
      </span>
    </li>
  );
}

function KeyboardShortcut({ item }: { item: string }) {
  const separator = item.indexOf(': ');
  const lead = separator > 0 ? item.slice(0, separator) : null;
  const rest = separator > 0 ? item.slice(separator + 2) : item;
  return (
    <li className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      {lead ? (
        <kbd className="shrink-0 rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs font-medium text-foreground">
          {lead}
        </kbd>
      ) : null}
      <span className="text-base text-muted-foreground">{rest}</span>
    </li>
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

      <section id="try-it" aria-labelledby="try-it-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading id="try-it-heading" title="Try it" description="Five moves from upload to error states." />
        <ol className="max-w-xl space-y-3">
          {STEPS.map((step, index) => (
            <StepLead key={step} step={step} index={index} />
          ))}
        </ol>
      </section>

      <section id="implementation" aria-labelledby="implementation-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading id="implementation-heading" title="Implementation" description="Copy the recipe and wire onComplete to your upload." />
        <CodeBlock filename="ImageCropperDemo.tsx" language="tsx" code={IMAGE_CROPPER_RECIPE} className="max-w-3xl" />
        <p className="max-w-3xl text-xs text-muted-foreground">
          This page (S-005.38) shows the avatar (S-005.38.01) and cover (S-005.38.02) scenarios with state simulation.{' '}
          Token pairs used here are covered by the{' '}
          <a href="/foundations/colors" className="underline underline-offset-2">
            foundations contrast matrix
          </a>
          .
        </p>
      </section>

      <section id="accessibility" aria-labelledby="accessibility-heading" className="space-y-4 scroll-mt-20">
        <SectionHeading id="accessibility-heading" title="Accessibility notes" description="Every crop action works with the keyboard alone." />
        <ul className="max-w-xl space-y-2.5">
          {KEYBOARD.map((item) => (
            <KeyboardShortcut key={item} item={item} />
          ))}
        </ul>
      </section>
    </div>
  );
}
