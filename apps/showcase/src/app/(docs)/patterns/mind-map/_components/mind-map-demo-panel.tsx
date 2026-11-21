'use client';

import { Map as MapIcon, Moon, Upload } from 'lucide-react';
import { Button } from '@ds/ui';
import { STATES, type DemoState } from './mind-map-demo-data';

interface MindDemoPanelProps {
  demoState: DemoState;
  onSelectState: (state: DemoState) => void;
  onLoadLarge: () => void;
  dark: boolean;
  onDarkChange: (value: boolean) => void;
  minimap: boolean;
  onMinimapChange: (value: boolean) => void;
}

export function MindDemoPanel({
  demoState,
  onSelectState,
  onLoadLarge,
  dark,
  onDarkChange,
  minimap,
  onMinimapChange,
}: MindDemoPanelProps) {
  return (
    <div role="group" aria-label="Panel demo" className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div role="group" aria-label="Status demo" className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <span className="pt-2 text-xs font-medium text-muted-foreground sm:w-24 sm:shrink-0">Status data</span>
        <div className="flex flex-wrap gap-2">
          {STATES.map((state) => (
            <Button
              key={state}
              type="button"
              size="sm"
              variant={demoState === state ? 'default' : 'outline'}
              className="min-h-11"
              aria-pressed={demoState === state}
              onClick={() => onSelectState(state)}
            >
              {state}
            </Button>
          ))}
        </div>
      </div>

      <div role="group" aria-label="Aksi demo" className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <span className="pt-2 text-xs font-medium text-muted-foreground sm:w-24 sm:shrink-0">Aksi</span>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11"
            aria-label="Muat contoh 50 node"
            onClick={onLoadLarge}
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Muat 50 node
          </Button>
        </div>
      </div>

      <div role="group" aria-label="Tampilan demo" className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <span className="pt-2 text-xs font-medium text-muted-foreground sm:w-24 sm:shrink-0">Tampilan</span>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11"
            aria-pressed={dark}
            onClick={() => onDarkChange(!dark)}
          >
            <Moon className="h-4 w-4" aria-hidden="true" />
            Mode gelap
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-11"
            aria-pressed={minimap}
            onClick={() => onMinimapChange(!minimap)}
          >
            <MapIcon className="h-4 w-4" aria-hidden="true" />
            Peta mini
          </Button>
        </div>
      </div>
    </div>
  );
}
