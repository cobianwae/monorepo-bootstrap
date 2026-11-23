'use client';

import {
  Button,
  Card,
  CardContent,
  Input,
  Label,
  SegmentedControl,
  SegmentedControlItem,
} from '@ds/ui';
import type { StudioInvalidKind } from './studio-demo-data';

export type StudioDemoKind = 'populated' | 'large' | 'loading' | 'empty' | 'invalid' | 'external';

const DEMO_KINDS: Array<{ id: StudioDemoKind; label: string; hint: string }> = [
  { id: 'populated', label: 'Populated', hint: 'Canvas with controls and minimap' },
  { id: 'large', label: '40 people', hint: '40 people across 4 levels and 4 departments' },
  { id: 'loading', label: 'Loading', hint: 'Skeleton cards with a screen-reader message (aria-busy)' },
  { id: 'empty', label: 'Empty', hint: 'Status message with a "Create root" action' },
  { id: 'invalid', label: 'Invalid', hint: 'Alert with the cause, the first bad id and a copy button' },
  { id: 'external', label: 'External error', hint: 'Alert above the last good diagram' },
];

const INVALID_KINDS: Array<{ id: StudioInvalidKind; label: string }> = [
  { id: 'duplicate', label: 'Duplicate ID' },
  { id: 'missing-parent', label: 'Missing parent' },
  { id: 'cycle', label: 'Cycle' },
];

const LABEL_CLASS = 'text-xs font-semibold uppercase tracking-wider text-muted-foreground';

interface StudioDemoPanelProps {
  kind: StudioDemoKind;
  onKindChange: (kind: StudioDemoKind) => void;
  invalidKind: StudioInvalidKind;
  onInvalidKindChange: (kind: StudioInvalidKind) => void;
  minimap: boolean;
  onMinimapChange: (value: boolean) => void;
  query: string;
  onQueryChange: (value: string) => void;
  searchStatus: string;
  summary: string;
  onReset: () => void;
}

export function StudioDemoPanel({
  kind,
  onKindChange,
  invalidKind,
  onInvalidKindChange,
  minimap,
  onMinimapChange,
  query,
  onQueryChange,
  searchStatus,
  summary,
  onReset,
}: StudioDemoPanelProps) {
  const hint = DEMO_KINDS.find((option) => option.id === kind)?.hint;

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="space-y-1.5">
          <span className={LABEL_CLASS}>State</span>
          <div className="max-w-full overflow-x-auto">
            <SegmentedControl
              type="single"
              value={kind}
              onValueChange={(next) => {
                if (next) onKindChange(next as StudioDemoKind);
              }}
              aria-label="Demo state"
            >
              {DEMO_KINDS.map((option) => (
                <SegmentedControlItem key={option.id} value={option.id} title={option.hint}>
                  {option.label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
          </div>
          <p role="status" className="text-sm text-muted-foreground">
            {hint}
          </p>
        </div>

        {kind === 'invalid' ? (
          <div className="space-y-1.5">
            <span className={LABEL_CLASS}>Invalid data</span>
            <div className="max-w-full overflow-x-auto">
              <SegmentedControl
                type="single"
                value={invalidKind}
                onValueChange={(next) => {
                  if (next) onInvalidKindChange(next as StudioInvalidKind);
                }}
                aria-label="Invalid dataset type"
              >
                {INVALID_KINDS.map((option) => (
                  <SegmentedControlItem key={option.id} value={option.id}>
                    {option.label}
                  </SegmentedControlItem>
                ))}
              </SegmentedControl>
            </div>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="org-studio-search" className={LABEL_CLASS}>
              Search
            </Label>
            <Input
              id="org-studio-search"
              type="search"
              value={query}
              placeholder="Name, title or department, e.g. engineer"
              onChange={(event) => onQueryChange(event.target.value)}
            />
            <p role="status" className="text-sm text-muted-foreground">
              {searchStatus}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className={LABEL_CLASS}>Minimap</span>
            <div>
              <SegmentedControl
                type="single"
                value={minimap ? 'on' : 'off'}
                onValueChange={(next) => {
                  if (next) onMinimapChange(next === 'on');
                }}
                aria-label="Minimap"
              >
                <SegmentedControlItem value="off">Off</SegmentedControlItem>
                <SegmentedControlItem value="on">On</SegmentedControlItem>
              </SegmentedControl>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">{summary}</p>
          <Button type="button" size="sm" variant="outline" onClick={onReset}>
            Reset demo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
