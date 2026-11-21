'use client';

import * as React from 'react';
import { Button, Card, CardContent, CardFooter, CardHeader, CardTitle, PageHeader, Stepper } from '@ds/ui';
import { DEMO_FIELDS, DEMO_TEMPLATE_NAME } from './_lib/demo-fields';
import { parseCsv } from './_lib/parse-csv';
import { toTemplateCsv } from './_lib/template';
import {
  MAX_FUNCTIONAL_STEP,
  TOTAL_STEPS,
  applyParsed,
  canContinue,
  goToStep,
  initialWizardState,
  missingRequired,
  setSource,
  setTarget,
  type WizardSource,
  type WizardState,
} from './_lib/wizard-state';
import { MappingStep } from './_components/mapping-step';
import { UploadStep, type DelimiterChoice } from './_components/upload-step';

const STEP_LABELS = ['Upload', 'Mapping', 'Validasi', 'Konfirmasi'];
const STEP_HEADINGS = ['Unggah file CSV', 'Petakan kolom', 'Validasi data', 'Konfirmasi impor'];
const FILE_WINS_NOTICE = 'Berkas sudah dipakai; teks tempel diabaikan. Hapus berkas untuk memakai teks tempel.';

export default function ImportWizardPage() {
  const [state, setState] = React.useState<WizardState>(initialWizardState);
  const [parsing, setParsing] = React.useState(false);
  const [delimiter, setDelimiter] = React.useState<DelimiterChoice>('auto');
  const [pasteText, setPasteText] = React.useState('');
  const [pasteNotice, setPasteNotice] = React.useState<string | null>(null);

  const requestId = React.useRef(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const gateReasonRef = React.useRef<HTMLParagraphElement>(null);
  const skipFocus = React.useRef(true);

  // Ganti langkah → fokus ke judul langkah (bukan saat render pertama).
  React.useEffect(() => {
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [state.step]);

  const runParse = React.useCallback(async (source: WizardSource, chosen: DelimiterChoice) => {
    const id = ++requestId.current;
    setParsing(true);
    setState((prev) => setSource(prev, source));
    const parsed = await parseCsv(source.kind === 'file' ? source.file : source.text, {
      delimiter: chosen,
    });
    if (id !== requestId.current) return;
    setState((prev) => applyParsed(prev, parsed, DEMO_FIELDS));
    setParsing(false);
  }, []);

  const fileActive = state.source?.kind === 'file';

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file) {
      requestId.current++;
      setParsing(false);
      setPasteNotice(null);
      setState((prev) => ({ ...prev, source: null, parsed: null, mapping: {}, suggested: [] }));
      return;
    }
    if (pasteText.trim().length > 0) setPasteNotice(FILE_WINS_NOTICE);
    void runParse({ kind: 'file', file }, delimiter);
  };

  const handleProcessPaste = () => {
    if (fileActive) {
      setPasteNotice(FILE_WINS_NOTICE);
      return;
    }
    setPasteNotice(null);
    void runParse({ kind: 'paste', text: pasteText }, delimiter);
  };

  const handleDelimiterChange = (value: DelimiterChoice) => {
    setDelimiter(value);
    if (state.source) void runParse(state.source, value);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([toTemplateCsv(DEMO_FIELDS)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = DEMO_TEMPLATE_NAME;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handleTarget = (header: string, key: string | null): string | null => {
    const result = setTarget(state, header, key, DEMO_FIELDS);
    if (result.error) return result.error;
    setState(result.state);
    return null;
  };

  const gate = canContinue(state, DEMO_FIELDS);
  const nextAvailable = state.step < MAX_FUNCTIONAL_STEP;
  const nextBlocked = !gate.ok || !nextAvailable;
  const nextReason = !gate.ok
    ? gate.reason
    : !nextAvailable
      ? 'Validasi menyusul pada iterasi berikutnya.'
      : undefined;

  const handleNext = () => {
    if (nextBlocked) {
      gateReasonRef.current?.focus();
      return;
    }
    setState((prev) => goToStep(prev, prev.step + 1, DEMO_FIELDS));
  };

  const headers = state.parsed && !state.parsed.error ? state.parsed.headers : [];
  const missing = missingRequired(state.mapping, DEMO_FIELDS);
  const stepIndex = state.step - 1;

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <PageHeader
        eyebrow="Pattern"
        title="Import Wizard CSV"
        description="Wizard impor CSV 4 langkah: unggah atau tempel, petakan kolom, validasi, lalu konfirmasi. Langkah validasi dan konfirmasi menyusul."
      />

      <Card className="mx-auto max-w-4xl" data-testid="iw-card">
        <CardHeader>
          <CardTitle>Impor anggota</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          <Stepper
            aria-label="Langkah impor"
            steps={STEP_LABELS.map((title, index) => ({ id: index + 1, title }))}
            currentStep={stepIndex}
            onStepClick={(index) => setState((prev) => goToStep(prev, index + 1, DEMO_FIELDS))}
            data-testid="iw-stepper"
          />
          <p className="text-xs text-muted-foreground">
            Langkah 3–4 belum tersedia; hanya langkah selesai yang bisa diklik.
          </p>

          <div className="space-y-4">
            <h2
              ref={headingRef}
              tabIndex={-1}
              className="text-lg font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {STEP_HEADINGS[stepIndex]}
            </h2>
            <p role="status" aria-live="polite" className="sr-only" data-testid="iw-live">
              Langkah {state.step} dari {TOTAL_STEPS}: {STEP_HEADINGS[stepIndex]}
            </p>

            {state.step === 1 && (
              <UploadStep
                files={fileActive && state.source?.kind === 'file' ? [state.source.file] : []}
                onFiles={handleFiles}
                pasteText={pasteText}
                onPasteChange={setPasteText}
                onProcessPaste={handleProcessPaste}
                pasteNotice={pasteNotice}
                delimiter={delimiter}
                onDelimiterChange={handleDelimiterChange}
                parsing={parsing}
                parsed={state.parsed}
                fileInputRef={fileInputRef}
                onDownloadTemplate={handleDownloadTemplate}
              />
            )}

            {state.step === 2 && (
              <MappingStep
                headers={headers}
                mapping={state.mapping}
                suggested={state.suggested}
                fields={DEMO_FIELDS}
                missing={missing}
                onChangeTarget={handleTarget}
              />
            )}
          </div>

          {state.source && state.parsed && !state.parsed.error && (
            <p data-testid="iw-status" className="text-xs text-muted-foreground">
              Sumber: {state.source.kind === 'file' ? state.source.file.name : 'teks tempel'} · Baris:{' '}
              {state.parsed.rowCount} · Delimiter: {delimiter === '\t' ? 'tab' : delimiter}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            data-testid="iw-back"
            disabled={state.step === 1}
            onClick={() => setState((prev) => goToStep(prev, prev.step - 1, DEMO_FIELDS))}
          >
            Kembali
          </Button>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {nextReason && (
              <p
                ref={gateReasonRef}
                id="iw-gate-reason"
                tabIndex={-1}
                data-testid="iw-gate-reason"
                className="text-xs text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                {nextReason}
              </p>
            )}
            <Button
              type="button"
              data-testid="iw-next"
              aria-disabled={nextBlocked}
              aria-describedby={nextReason ? 'iw-gate-reason' : undefined}
              className={nextBlocked ? 'opacity-50' : undefined}
              onClick={handleNext}
            >
              {state.step === 1 ? 'Lanjut ke mapping' : 'Lanjut ke validasi'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
