'use client';

import {
  Badge,
  Button,
  SegmentedControl,
  SegmentedControlItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ds/ui';
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

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Periksa baris sebelum impor. Sel bermasalah diberi tanda dan pesan teks di dalam sel.
      </p>

      <div data-testid="iw-validation-summary" className="flex flex-wrap items-center gap-2 text-sm">
        <Badge variant="secondary">{view.validCount} valid</Badge>
        <Badge variant={view.invalidCount > 0 ? 'destructive' : 'secondary'}>
          {view.invalidCount} gagal
        </Badge>
        {errorColumns.map((field) => (
          <span key={field.key} className="text-xs text-muted-foreground">
            {field.label}: {view.errorsByColumn[field.key]} sel error
          </span>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl
          type="single"
          aria-label="Filter baris"
          value={filter}
          onValueChange={(value) => {
            if (value === 'all' || value === 'error') onFilterChange(value);
          }}
        >
          <SegmentedControlItem value="all" data-testid="iw-filter-all">
            Semua ({rows.length})
          </SegmentedControlItem>
          <SegmentedControlItem value="error" data-testid="iw-filter-error">
            Hanya error ({view.invalidCount})
          </SegmentedControlItem>
        </SegmentedControl>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onFixMapping}>
            Perbaiki mapping
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onReupload}>
            Unggah ulang
          </Button>
        </div>
      </div>

      {filter === 'error' && view.invalidCount === 0 ? (
        <p className="text-sm text-muted-foreground">Tidak ada baris error.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border">
          <Table aria-label="Hasil validasi per baris" data-testid="iw-validation-table">
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Baris</TableHead>
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
                            <span id={errorId} className="block text-xs font-medium text-destructive">
                              {error.message}
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
        <nav aria-label="Halaman validasi" className="flex items-center justify-between text-sm">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={slice.page <= 1}
            onClick={() => onPageChange(slice.page - 1)}
          >
            Sebelumnya
          </Button>
          <span aria-live="polite">
            Halaman {slice.page} dari {slice.pageCount}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={slice.page >= slice.pageCount}
            onClick={() => onPageChange(slice.page + 1)}
          >
            Berikutnya
          </Button>
        </nav>
      )}
    </div>
  );
}
