'use client';

import type * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  FileInput,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from '@ds/ui';
import type { CsvParseResult } from '../_lib/types';

export type DelimiterChoice = 'auto' | ',' | ';' | '\t';

export interface UploadStepProps {
  files: File[];
  onFiles: (files: File[]) => void;
  pasteText: string;
  onPasteChange: (text: string) => void;
  onProcessPaste: () => void;
  pasteNotice: string | null;
  delimiter: DelimiterChoice;
  onDelimiterChange: (value: DelimiterChoice) => void;
  parsing: boolean;
  parsed: CsvParseResult | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onDownloadTemplate: () => void;
}

const DELIMITERS: { value: DelimiterChoice; label: string; testId: string }[] = [
  { value: 'auto', label: 'Otomatis', testId: 'iw-delimiter-auto' },
  { value: ',', label: 'Koma (,)', testId: 'iw-delimiter-comma' },
  { value: ';', label: 'Titik koma (;)', testId: 'iw-delimiter-semicolon' },
  { value: '\t', label: 'Tab', testId: 'iw-delimiter-tab' },
];

export function UploadStep({
  files,
  onFiles,
  pasteText,
  onPasteChange,
  onProcessPaste,
  pasteNotice,
  delimiter,
  onDelimiterChange,
  parsing,
  parsed,
  fileInputRef,
  onDownloadTemplate,
}: UploadStepProps) {
  const isEmptyFile = parsed !== null && !parsed.error && parsed.rowCount === 0;

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Unggah file <span className="font-medium text-foreground">.csv</span>, atau tempel isinya.
        Format XLSX belum didukung (v1 CSV saja).
      </p>

      <div className="space-y-2">
        <Label htmlFor="iw-file">Berkas CSV</Label>
        <div data-testid="iw-dropzone">
          <FileInput
            id="iw-file"
            ref={fileInputRef}
            accept=".csv,text/csv"
            maxFiles={1}
            value={files}
            onChange={onFiles}
            disabled={parsing}
            data-testid="iw-file-input"
            helperText="CSV, maks 5 MB / 10.000 baris"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="iw-paste">atau tempel isi CSV</Label>
        <Textarea
          id="iw-paste"
          data-testid="iw-paste"
          rows={6}
          className="font-mono text-xs"
          placeholder={'nama,email\nBudi,budi@contoh.id'}
          value={pasteText}
          onChange={(event) => onPasteChange(event.target.value)}
          disabled={parsing}
        />
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            data-testid="iw-paste-submit"
            className="h-11"
            onClick={onProcessPaste}
            disabled={parsing || pasteText.trim().length === 0}
          >
            Proses tempel
          </Button>
        </div>
        {pasteNotice && (
          <p role="status" className="text-xs text-muted-foreground">
            {pasteNotice}
          </p>
        )}
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Delimiter</legend>
        <RadioGroup
          value={delimiter}
          onValueChange={(value) => onDelimiterChange(value as DelimiterChoice)}
          className="flex flex-wrap gap-4"
          aria-label="Delimiter"
        >
          {DELIMITERS.map((item) => {
            const id = `iw-delim-${item.label}`;
            return (
              <div key={item.value} className="flex items-center gap-2">
                <RadioGroupItem id={id} value={item.value} data-testid={item.testId} />
                <Label htmlFor={id} className="font-normal">
                  {item.label}
                </Label>
              </div>
            );
          })}
        </RadioGroup>
      </fieldset>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          data-testid="iw-template"
          className="h-11"
          onClick={onDownloadTemplate}
        >
          Unduh template CSV
        </Button>
        <span className="text-xs text-muted-foreground">Header kolom + 1 baris contoh.</span>
      </div>

      <div aria-busy={parsing} className="space-y-3">
        {parsing && (
          <div className="space-y-2" data-testid="iw-loading">
            <p role="status" className="text-sm text-muted-foreground">
              Memparsing berkas…
            </p>
            <Progress value={null} aria-label="Memparsing berkas" />
          </div>
        )}

        {!parsing && parsed?.error && (
          <Alert variant="destructive" role="alert" data-testid="iw-error">
            <AlertTitle>Berkas tidak dapat dibaca</AlertTitle>
            <AlertDescription>
              {parsed.error === 'v1 CSV saja'
                ? 'Hanya CSV (v1 CSV saja). Simpan berkas sebagai .csv lalu unggah ulang.'
                : `${parsed.error}. Coba pilih delimiter manual atau simpan ulang sebagai UTF-8, lalu unggah ulang.`}
            </AlertDescription>
          </Alert>
        )}

        {!parsing && isEmptyFile && (
          <div role="status" data-testid="iw-empty" className="rounded-lg border border-dashed border-border p-4 text-sm">
            <p className="font-medium text-foreground">File kosong — hanya header tanpa baris.</p>
            <p className="mt-1 text-muted-foreground">Pilih file lain atau tempel isi CSV yang berisi data.</p>
          </div>
        )}

        {!parsing && parsed && !parsed.error && parsed.warnings.length > 0 && (
          <Alert variant="warning" data-testid="iw-warning">
            <AlertDescription>{parsed.warnings.join(' ')}</AlertDescription>
          </Alert>
        )}

        {!parsing && !parsed && files.length === 0 && pasteText.trim().length === 0 && (
          <p role="status" className="text-sm text-muted-foreground" data-testid="iw-no-source">
            Belum ada berkas. Pilih file, seret ke area unggah, atau tempel isi CSV.
          </p>
        )}
      </div>
    </div>
  );
}
