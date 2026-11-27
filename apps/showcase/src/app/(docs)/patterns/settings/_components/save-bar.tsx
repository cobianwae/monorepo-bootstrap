import * as React from 'react';
import { Button } from '@ds/ui';

export interface SaveBarProps {
  count: number;
  saving: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

export const SaveBar = React.forwardRef<HTMLDivElement, SaveBarProps>(
  ({ count, saving, onDiscard, onSave }, ref) => (
    <div
      ref={ref}
      className="sticky bottom-4 z-10 m-4 mt-auto flex flex-wrap items-center justify-between gap-3 rounded-lg border border-highlight bg-card px-4 py-3 shadow-md"
    >
      <p className="text-sm font-medium text-foreground">
        {count} unsaved {count === 1 ? 'change' : 'changes'}
      </p>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" onClick={onDiscard} disabled={saving} className="pointer-coarse:min-h-11">
          Discard
        </Button>
        <Button onClick={onSave} loading={saving} className="pointer-coarse:min-h-11">
          Save changes
        </Button>
      </div>
    </div>
  )
);
SaveBar.displayName = 'SaveBar';
