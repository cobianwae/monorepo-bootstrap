'use client';

import type * as React from 'react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  FileInput,
  type FileInputMessages,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from '@ds/ui';
import { UNSUPPORTED_FORMAT_ERROR } from '../_lib/parse-csv';
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
  { value: 'auto', label: 'Auto', testId: 'iw-delimiter-auto' },
  { value: ',', label: 'Comma (,)', testId: 'iw-delimiter-comma' },
  { value: ';', label: 'Semicolon (;)', testId: 'iw-delimiter-semicolon' },
  { value: '\t', label: 'Tab', testId: 'iw-delimiter-tab' },
];

/** Opt-in English copy; the shared FileInput defaults stay unchanged. */
const FILE_INPUT_MESSAGES: FileInputMessages = {
  dropzoneLabel: 'File upload dropzone',
  clickToUpload: 'Click to upload',
  dragAndDrop: 'or drag and drop',
  selectFile: 'Choose a file',
  allFileTypes: 'All file types',
  formatLabel: (accept) => `Format: ${accept}`,
  maxSizeLabel: (formattedMaxSize) => `Max: ${formattedMaxSize}`,
  uploadFile: 'Upload file',
  browse: 'Browse',
  uploadedFilesLabel: 'Uploaded files',
  removeFile: (fileName) => `Remove ${fileName}`,
  fileTooLarge: (fileName, formattedMaxSize) =>
    `File "${fileName}" exceeds the maximum size (${formattedMaxSize}).`,
  tooManyFiles: (maxFiles) => `Only ${maxFiles} file(s) allowed.`,
};

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
        Upload a <span className="font-medium text-foreground">.csv</span> file or paste its contents.
        XLSX is not supported yet (CSV only).
      </p>

      <div className="space-y-2">
        <Label htmlFor="iw-file">CSV file</Label>
        <div data-testid="iw-dropzone">
          <FileInput
            id="iw-file"
            ref={fileInputRef}
            accept=".csv,text/csv"
            maxFiles={1}
            replaceOnSelect
            value={files}
            onChange={onFiles}
            disabled={parsing}
            data-testid="iw-file-input"
            helperText="CSV. Recommended up to 5 MB / 10,000 rows. Larger files are still processed."
            messages={FILE_INPUT_MESSAGES}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="iw-paste">or paste CSV content</Label>
        <Textarea
          id="iw-paste"
          data-testid="iw-paste"
          rows={6}
          className="font-mono text-xs"
          placeholder={'name,email\nBudi,budi@example.com'}
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
            Process pasted text
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
          Download CSV template
        </Button>
        <span className="text-xs text-muted-foreground">Column headers + 1 sample row.</span>
      </div>

      <div aria-busy={parsing} className="space-y-3">
        {parsing && (
          <div className="space-y-2" data-testid="iw-loading">
            <p role="status" className="text-sm text-muted-foreground">
              Parsing file…
            </p>
            <Progress value={null} aria-label="Parsing file" />
          </div>
        )}

        {!parsing && parsed?.error && (
          <Alert variant="destructive" role="alert" data-testid="iw-error">
            <AlertTitle>The file couldn&apos;t be read</AlertTitle>
            <AlertDescription>
              {parsed.error === UNSUPPORTED_FORMAT_ERROR
                ? `${UNSUPPORTED_FORMAT_ERROR}. XLSX is not supported yet; save the file as .csv and upload it again.`
                : `${parsed.error}. Try choosing a delimiter manually or save the file again as UTF-8, then re-upload it.`}
            </AlertDescription>
          </Alert>
        )}

        {!parsing && isEmptyFile && (
          <div role="status" data-testid="iw-empty" className="rounded-lg border border-dashed border-border p-4 text-sm">
            <p className="font-medium text-foreground">Empty file: headers only, no rows.</p>
            <p className="mt-1 text-muted-foreground">Choose another file or paste CSV content that has data.</p>
          </div>
        )}

        {!parsing && parsed && !parsed.error && parsed.warnings.length > 0 && (
          <Alert variant="warning" data-testid="iw-warning">
            <AlertDescription>{parsed.warnings.join(' ')}</AlertDescription>
          </Alert>
        )}

        {!parsing && !parsed && files.length === 0 && pasteText.trim().length === 0 && (
          <p role="status" className="text-sm text-muted-foreground" data-testid="iw-no-source">
            No file yet. Choose a file, drop it on the upload area, or paste CSV content.
          </p>
        )}
      </div>
    </div>
  );
}
