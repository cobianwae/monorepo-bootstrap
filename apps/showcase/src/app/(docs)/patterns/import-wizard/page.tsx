'use client';

import * as React from 'react';
import { Button, Card, CardContent, CardFooter, PageHeader, Stepper } from '@ds/ui';
import { SectionHeading } from '../../../../components/section-heading';
import { DEMO_FIELDS, DEMO_TEMPLATE_NAME } from './_lib/demo-fields';
import { DEMO_DATASETS, toDemoFile, type DemoDatasetId } from './_lib/demo-datasets';
import { parseCsv } from './_lib/parse-csv';
import { toTemplateCsv } from './_lib/template';
import { plural } from './_lib/plural';
import { buildValidation, type ValidationFilter } from './_lib/validation-view';
import { buildImportResult, planSubmit, type FailPolicy } from './_lib/submit';
import type { ImportResult } from './_lib/types';
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
import { ValidationStep } from './_components/validation-step';
import { ConfirmStep } from './_components/confirm-step';
import { DemoPanel } from './_components/demo-panel';

const STEP_LABELS = ['Upload', 'Mapping', 'Validation', 'Confirm'];
const STEP_HEADINGS = ['Upload CSV file', 'Map columns', 'Validate data', 'Confirm import'];
const DONE_HEADING = 'Import ready';
const NEXT_LABELS = ['Continue to mapping', 'Continue to validation', 'Continue to confirm'];
const FILE_WINS_NOTICE = 'The file is in use, so pasted text is ignored. Remove the file to use pasted text.';

export default function ImportWizardPage() {
  const [state, setState] = React.useState<WizardState>(initialWizardState);
  const [parsing, setParsing] = React.useState(false);
  const [delimiter, setDelimiter] = React.useState<DelimiterChoice>('auto');
  const [pasteText, setPasteText] = React.useState('');
  const [pasteNotice, setPasteNotice] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<ValidationFilter>('all');
  const [validationPage, setValidationPage] = React.useState(1);
  const [policy, setPolicy] = React.useState<FailPolicy>('skip');
  const [rejection, setRejection] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const [lastSummary, setLastSummary] = React.useState<string | null>(null);

  const requestId = React.useRef(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const gateReasonRef = React.useRef<HTMLParagraphElement>(null);
  const summaryRef = React.useRef<HTMLDivElement>(null);
  const skipFocus = React.useRef(true);

  const completed = result !== null;

  // Ganti langkah atau selesai impor → fokus ke judul (bukan saat render pertama).
  React.useEffect(() => {
    if (skipFocus.current) {
      skipFocus.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [state.step, completed]);

  const runParse = React.useCallback(
    async (source: WizardSource, chosen: DelimiterChoice, delayMs = 0) => {
      const id = ++requestId.current;
      setParsing(true);
      setRejection(null);
      setState((prev) => setSource(prev, source));
      if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
      const parsed = await parseCsv(source.kind === 'file' ? source.file : source.text, {
        delimiter: chosen,
      });
      if (id !== requestId.current) return;
      setState((prev) => applyParsed(prev, parsed, DEMO_FIELDS));
      setValidationPage(1);
      setParsing(false);
    },
    []
  );

  const fileActive = state.source?.kind === 'file';

  const handleFiles = (files: File[]) => {
    const file = files[0];
    if (!file) {
      requestId.current++;
      setParsing(false);
      setPasteNotice(null);
      setRejection(null);
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
    const next = setTarget(state, header, key, DEMO_FIELDS);
    if (next.error) return next.error;
    setState(next.state);
    setRejection(null);
    return null;
  };

  const handleDemo = (id: DemoDatasetId, delayMs = 0) => {
    setResult(null);
    setRejection(null);
    setFilter('all');
    setPasteNotice(null);
    setState((prev) => ({ ...prev, step: 1 }));
    void runParse({ kind: 'file', file: toDemoFile(DEMO_DATASETS[id]) }, delimiter, delayMs);
  };

  const handleRestart = () => {
    requestId.current++;
    setParsing(false);
    setState(initialWizardState());
    setPasteText('');
    setPasteNotice(null);
    setFilter('all');
    setValidationPage(1);
    setPolicy('skip');
    setRejection(null);
    setResult(null);
  };

  const handleReupload = () => {
    handleRestart();
  };

  const handleSubmit = () => {
    if (!state.parsed || state.parsed.error || !view) return;
    const built = buildImportResult(state.parsed.rows, state.mapping, view.rowErrors, policy);
    if (!built.ok) {
      setRejection(built.reason);
      summaryRef.current?.focus();
      return;
    }
    setRejection(null);
    setResult(built.result);
    setLastSummary(
      `${plural(built.result.rows.length, 'row')}, ${built.result.skipped} skipped, ${built.result.failed} failed`
    );
  };

  const gate = canContinue(state, DEMO_FIELDS);
  const nextAvailable = state.step < MAX_FUNCTIONAL_STEP;
  const nextBlocked = !gate.ok || !nextAvailable;
  const nextReason = !gate.ok ? gate.reason : undefined;

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
  const headingText = completed ? DONE_HEADING : STEP_HEADINGS[stepIndex];

  const view =
    state.parsed && !state.parsed.error
      ? buildValidation(state.parsed.rows, state.mapping, DEMO_FIELDS)
      : null;
  const plan = view ? planSubmit(view.validCount, view.invalidCount, policy) : null;

  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200 motion-reduce:animate-none">
      <PageHeader
        eyebrow="Pattern"
        title="CSV Import Wizard"
        description="Four-step CSV import wizard: upload or paste, map columns, validate, then confirm."
      />

      <section aria-labelledby="iw-wizard-heading" className="max-w-4xl space-y-4 scroll-mt-20">
        <SectionHeading id="iw-wizard-heading" title="Import members" />
        <Card className="w-full min-w-0 overflow-hidden" data-testid="iw-card">
          <CardContent className="space-y-8 min-w-0 pt-6">
            <Stepper
              aria-label="Import steps"
              steps={STEP_LABELS.map((title, index) => ({ id: index + 1, title }))}
              currentStep={stepIndex}
              onStepClick={(index) => {
                // Setelah selesai, stepper hanya menunjukkan posisi terakhir (CR-076).
                if (completed) return;
                setState((prev) => goToStep(prev, index + 1, DEMO_FIELDS));
              }}
              data-testid="iw-stepper"
            />
            <p className="text-xs text-muted-foreground">
              Unlocked steps are clickable; the next step unlocks once its requirements are met.
            </p>

            <div className="space-y-4">
              <h3
                ref={headingRef}
                tabIndex={-1}
                className="text-xl font-bold font-display text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                {headingText}
              </h3>
              <p role="status" aria-live="polite" className="sr-only" data-testid="iw-live">
                Step {state.step} of {TOTAL_STEPS}: {headingText}
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

              {state.step === 3 && view && state.parsed && (
                <ValidationStep
                  rows={state.parsed.rows}
                  mapping={state.mapping}
                  fields={DEMO_FIELDS}
                  view={view}
                  filter={filter}
                  onFilterChange={(value) => {
                    setFilter(value);
                    setValidationPage(1);
                  }}
                  page={validationPage}
                  onPageChange={setValidationPage}
                  onFixMapping={() => setState((prev) => goToStep(prev, 2, DEMO_FIELDS))}
                  onReupload={handleReupload}
                />
              )}

              {state.step === 4 && plan && (
                <ConfirmStep
                  plan={plan}
                  policy={policy}
                  onPolicyChange={(next) => {
                    // Penolakan lama tidak relevan setelah policy berubah.
                    setPolicy(next);
                    setRejection(null);
                  }}
                  onSubmit={handleSubmit}
                  rejection={rejection}
                  summaryRef={summaryRef}
                  result={result}
                  onRestart={handleRestart}
                />
              )}
            </div>

            {state.source && state.parsed && !state.parsed.error && (
              <p data-testid="iw-status" className="text-xs text-muted-foreground">
                Source: {state.source.kind === 'file' ? state.source.file.name : 'pasted text'} · Rows:{' '}
                {state.parsed.rowCount} · Delimiter: {delimiter === '\t' ? 'tab' : delimiter}
              </p>
            )}
          </CardContent>

          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              data-testid="iw-back"
              disabled={state.step === 1 || completed}
              onClick={() => setState((prev) => goToStep(prev, prev.step - 1, DEMO_FIELDS))}
            >
              Back
            </Button>
            {nextAvailable && (
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
                  {NEXT_LABELS[stepIndex]}
                </Button>
              </div>
            )}
          </CardFooter>
        </Card>
      </section>

      <DemoPanel onLoad={handleDemo} lastResultSummary={lastSummary} />
    </div>
  );
}
