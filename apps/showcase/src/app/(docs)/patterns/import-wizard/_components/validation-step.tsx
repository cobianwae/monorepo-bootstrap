'use client';

import * as React from 'react';
import {
  Badge,
  Button,
  EmptyState,
  SegmentedControl,
  SegmentedControlItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ds/ui';
import { AlertCircle } from 'lucide-react';
import { plural } from '../_lib/plural';
import type { TargetField } from '../_lib/types';
import {
  cellKey,
  paginate,
  visibleRowNumbers,
  type ValidationFilter,
  type ValidationView,
} from '../_lib/validation-view';
import type { Mapping } from '../_lib/wizard-state';

export interface ValidationStepProps {
  rows: Record<string, string>[];
  mapping: Mapping;
  fields: TargetField[];
  view: ValidationView;
  filter: ValidationFilter;
  onFilterChange: (filter: ValidationFilter) => void;
  page: number;
  onPageChange: (page: number) => void;
  onFixMapping: () => void;
  onReupload: () => void;
}

export function ValidationStep({
  rows,
  mapping,
  fields,
  view,
  filter,
  onFilterChange,
  page,
  onPageChange,
  onFixMapping,
  onReupload,
}: ValidationStepProps) {
  // Kolom tabel = field target yang terpetakan, urut sesuai definisi field.
  const headerByKey = new Map<string, string>();
  for (const [header, key] of Object.entries(mapping)) {
    if (key !== null) headerByKey.set(key, header);
  }
  const columns = fields.filter((field) => headerByKey.has(field.key));

  const rowNumbers = visibleRowNumbers(rows.length, view, filter);
  const slice = paginate(rowNumbers, page);
  const errorColumns = fields.filter((field) => (view.errorsByColumn[field.key] ?? 0) > 0);
  const allFilterRef = React.useRef<HTMLButtonElement>(null);

  const showAllRows = () => {
    onFilterChange('all');
    // Tombol pemulihan ikut hilang; fokus dipindah ke filter agar tidak jatuh ke body.
    allFilterRef.current?.focus();
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Review rows before importing. Problem cells are flagged with a text message inside the cell.
      </p>

      <div data-testid="iw-validation-summary" className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">{view.validCount} valid</Badge>
        <Badge variant={view.invalidCount > 0 ? 'destructive' : 'secondary'}>
          {view.invalidCount} failed
        </Badge>
        {errorColumns.map((field) => (
          <span key={field.key} className="text-xs text-muted-foreground">
            {field.label}: {plural(view.errorsByColumn[field.key] ?? 0, 'cell error')}
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          type="single"
          aria-label="Filter rows"
          value={filter}
          onValueChange={(value) => {
            if (value === 'all' || value === 'error') onFilterChange(value);
          }}
        >
          <SegmentedControlItem ref={allFilterRef} value="all" data-testid="iw-filter-all">
            All ({rows.length})
          </SegmentedControlItem>
          <SegmentedControlItem value="error" data-testid="iw-filter-error">
            Errors only ({view.invalidCount})
          </SegmentedControlItem>
        </SegmentedControl>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" className="h-11" onClick={onFixMapping}>
            Fix mapping
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-11" onClick={onReupload}>
            Re-upload
          </Button>
        </div>
      </div>

      {filter === 'error' && view.invalidCount === 0 ? (
        <EmptyState
          data-testid="iw-filter-empty"
          title="No rows with errors"
          description={`No rows match this filter. All ${plural(rows.length, 'row')} passed validation.`}
          actionLabel="Show all rows"
          onAction={showAllRows}
        />
      ) : (
        /* key: ganti halaman/filter memulai lagi dari atas. Wrapper bawaan Table dinetralkan
           agar hanya region ini yang menggulung (header sticky). */
        <div
          key={`${filter}-${slice.page}`}
          role="region"
          aria-label="Validation preview"
          tabIndex={0}
          data-testid="iw-validation-scroller"
          className="max-h-80 overflow-auto rounded-lg border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-h-96 [&>div]:overflow-visible"
        >
          <Table aria-label="Validation results by row" data-testid="iw-validation-table">
            <TableHeader className="sticky top-0 z-10 bg-card [&_th]:shadow-[inset_0_-1px_0_var(--color-border)]">
              <TableRow>
                <TableHead scope="col">Row</TableHead>
                {columns.map((field) => (
                  <TableHead scope="col" key={field.key}>
                    {field.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {slice.rows.map((rowNumber) => {
                const row = rows[rowNumber - 1] ?? {};
                return (
                  <TableRow key={rowNumber}>
                    <TableCell className="font-mono text-xs">{rowNumber}</TableCell>
                    {columns.map((field) => {
                      const header = headerByKey.get(field.key) ?? '';
                      const error = view.cellErrors.get(cellKey(rowNumber, field.key));
                      const errorId = `iw-err-${rowNumber}-${field.key}`;
                      return (
                        <TableCell
                          key={field.key}
                          aria-invalid={error ? true : undefined}
                          aria-describedby={error ? errorId : undefined}
                          className={error ? 'bg-destructive/10' : undefined}
                        >
                          <span>{row[header] ?? ''}</span>
                          {error && (
                            <span id={errorId} className="mt-1 flex items-start gap-1 text-xs font-medium text-foreground">
                              <AlertCircle aria-hidden="true" className="mt-px h-3.5 w-3.5 shrink-0 text-destructive" />
                              <span>Error: {error.message}</span>
                            </span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {slice.pageCount > 1 && (
        <nav aria-label="Validation pages" className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-11"
            disabled={slice.page <= 1}
            onClick={() => onPageChange(slice.page - 1)}
          >
            Previous
          </Button>
          <span aria-live="polite">
            Page {slice.page} of {slice.pageCount}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-11"
            disabled={slice.page >= slice.pageCount}
            onClick={() => onPageChange(slice.page + 1)}
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}
