'use client';

import * as React from 'react';
import {
  Alert,
  AlertDescription,
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@ds/ui';
import type { TargetField } from '../_lib/types';
import type { Mapping } from '../_lib/wizard-state';

const IGNORE_VALUE = '__ignore__';

export interface MappingStepProps {
  headers: string[];
  mapping: Mapping;
  suggested: string[];
  fields: TargetField[];
  missing: TargetField[];
  /** Mengembalikan pesan error bila perubahan ditolak, `null` bila berhasil. */
  onChangeTarget: (header: string, key: string | null) => string | null;
}

export function MappingStep({
  headers,
  mapping,
  suggested,
  fields,
  missing,
  onChangeTarget,
}: MappingStepProps) {
  const [rejection, setRejection] = React.useState<{ header: string; message: string } | null>(null);

  const handleChange = (header: string, value: string) => {
    const key = value === IGNORE_VALUE ? null : value;
    const error = onChangeTarget(header, key);
    setRejection(error ? { header, message: error } : null);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Hubungkan setiap kolom CSV ke field target. Saran ditandai &quot;disarankan&quot; dan bisa diubah.
        Target yang wajib harus terpetakan sebelum lanjut.
      </p>

      {rejection && (
        <Alert id="iw-mapping-error" variant="destructive" role="alert" data-testid="iw-duplicate">
          <AlertDescription>
            Kolom &quot;{rejection.header}&quot;: {rejection.message}
          </AlertDescription>
        </Alert>
      )}

      {missing.length > 0 && (
        <Alert variant="warning" data-testid="iw-missing">
          <AlertDescription>
            Wajib belum terpetakan: {missing.map((field) => field.label).join(', ')}.
          </AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table aria-label="Pemetaan kolom CSV ke field target">
          <TableHeader>
            <TableRow>
              <TableHead scope="col">Kolom CSV</TableHead>
              <TableHead scope="col">Target field</TableHead>
              <TableHead scope="col">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {headers.map((header) => {
              const current = mapping[header] ?? null;
              const field = fields.find((f) => f.key === current);
              const isRejected = rejection?.header === header;
              return (
                <TableRow key={header} data-testid={`iw-mapping-row-${header}`}>
                  <TableCell className="font-medium text-foreground">{header}</TableCell>
                  <TableCell>
                    <Select
                      value={current ?? IGNORE_VALUE}
                      onValueChange={(value) => handleChange(header, value)}
                    >
                      <SelectTrigger
                        aria-label={`Target untuk kolom ${header}`}
                        aria-invalid={isRejected || undefined}
                        aria-describedby={isRejected ? 'iw-mapping-error' : undefined}
                        className="w-full max-w-xs"
                        data-testid={`iw-mapping-select-${header}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={IGNORE_VALUE}>Abaikan</SelectItem>
                        {fields.map((f) => (
                          <SelectItem key={f.key} value={f.key}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap items-center gap-2">
                      {field?.required && (
                        <Badge variant="outline">
                          <span aria-hidden="true" className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-destructive" />
                          wajib
                        </Badge>
                      )}
                      {suggested.includes(header) && current !== null && (
                        <Badge variant="info-outline">disarankan</Badge>
                      )}
                      {current === null && <span className="text-xs text-muted-foreground">Diabaikan</span>}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
