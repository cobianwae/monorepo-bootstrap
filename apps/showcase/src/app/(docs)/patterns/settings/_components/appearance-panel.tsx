import {
  Badge,
  Button,
  SegmentedControl,
  SegmentedControlItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useTheme,
} from '@ds/ui';
import type { ArtDirectionId } from '@ds/tokens';
import { Monitor, Moon, Sun } from 'lucide-react';
import { SettingRow } from './setting-row';

const SCHEMES = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
] as const;

const SWATCHES = [
  { swatch: 'bg-primary', label: 'Primary' },
  { swatch: 'bg-highlight', label: 'Highlight' },
  { swatch: 'bg-success', label: 'Success' },
  { swatch: 'bg-warning', label: 'Warning' },
  { swatch: 'bg-destructive', label: 'Destructive' },
];

export function AppearancePanel() {
  const { theme, setTheme, resolvedTheme, artDirection, setArtDirection } = useTheme();
  const mode = resolvedTheme === 'dark' ? 'Dark' : 'Light';

  return (
    <>
      <SettingRow id="color-scheme" label="Color scheme" description="Applies to this browser." labelled={false}>
        {(describedBy) => (
          <>
            <SegmentedControl
              id="color-scheme"
              type="single"
              aria-label="Color scheme"
              aria-describedby={describedBy}
              value={theme}
              onValueChange={(value: string) => value && setTheme(value as 'light' | 'dark' | 'system')}
              className="flex w-full"
            >
              {SCHEMES.map(({ value, label, icon: Icon }) => (
                <SegmentedControlItem key={value} value={value} className="flex-1">
                  <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                  {label}
                </SegmentedControlItem>
              ))}
            </SegmentedControl>
            <p className="text-xs text-muted-foreground">Showing: {mode}</p>
          </>
        )}
      </SettingRow>

      <SettingRow id="art-direction" label="Art direction" description="Changes fonts, motifs and tones.">
        {(describedBy) => (
          <Select value={artDirection} onValueChange={(value) => setArtDirection(value as ArtDirectionId)}>
            <SelectTrigger id="art-direction" aria-describedby={describedBy}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="atelier">Atelier</SelectItem>
              <SelectItem value="aurora">Aurora</SelectItem>
              <SelectItem value="blueprint">Blueprint</SelectItem>
            </SelectContent>
          </Select>
        )}
      </SettingRow>

      <div className="border-l-2 border-l-transparent px-4 py-5 sm:px-5">
        <div role="group" aria-label="Preview" className="max-w-md space-y-4 rounded-xl border border-border bg-background p-5 shadow-xs">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-highlight text-sm font-bold text-highlight-foreground"
              >
                A
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">Acme Workspace</p>
                <p className="truncate text-xs text-muted-foreground">
                  {mode} mode · <span className="capitalize">{artDirection}</span>
                </p>
              </div>
            </div>
            <Badge variant="outline" className="shrink-0 capitalize">
              {theme}
            </Badge>
          </div>

          <div className="flex gap-2">
            {SWATCHES.map((color) => (
              <div key={color.label} role="img" aria-label={`${color.label} swatch`} className={`h-8 w-8 rounded-lg ${color.swatch}`} />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div className="h-full w-2/3 rounded-full bg-highlight" />
            </div>
            <span className="text-xs text-muted-foreground">Sample progress</span>
          </div>

          <Button size="sm" variant="highlight" tabIndex={-1} className="pointer-events-none">
            Sample button
          </Button>
        </div>
      </div>
    </>
  );
}
