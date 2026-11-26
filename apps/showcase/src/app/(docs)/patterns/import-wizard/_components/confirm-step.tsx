'use client';

import type * as React from 'react';
import {
  Alert,
  AlertDescription,
  Button,
  Label,
  RadioGroup,
  RadioGroupItem,
} from '@ds/ui';
import { plural } from '../_lib/plural';
import type { ImportResult } from '../_lib/types';
import { submitLabel, summaryBuckets, type FailPolicy, type SubmitPlan } from '../_lib/submit';

export interface ConfirmStepProps {
  plan: SubmitPlan;
  policy: FailPolicy;
  onPolicyChange: (policy: FailPolicy) => void;
  onSubmit: () => void;
  /** Alasan submit ditolak pada percobaan terakhir (null bila belum ada). */
  rejection: string | null;
  summaryRef: React.RefObject<HTMLDivElement | null>;
  result: ImportResult | null;
  onRestart: () => void;
}

export function ConfirmStep({
  plan,
  policy,
  onPolicyChange,
  onSubmit,
  rejection,
  summaryRef,
  result,
  onRestart,
}: ConfirmStepProps) {
  if (result) {
    return (
      <div data-testid="iw-success" className="space-y-4 rounded-lg border border-border p-6">
        <p className="text-base font-medium text-foreground">
          {plural(result.rows.length, 'row')} ready to import.
        </p>
        <p className="text-sm text-muted-foreground">
          {result.skipped > 0 ? `${plural(result.skipped, 'row')} skipped. ` : ''}
          {result.failed > 0 ? `${plural(result.failed, 'row')} failed. ` : ''}
          Local simulation: an ImportResult was prepared on this page. Nothing was sent or saved.
        </p>
        <Button type="button" variant="outline" onClick={onRestart}>
          Start over
        </Button>
      </div>
    );
  }

  const buckets = summaryBuckets(plan, policy);
  // Warna status hanya saat angkanya bermakna (> 0); selain itu netral.
  const stats = [
    {
      label: 'Valid',
      value: buckets.valid,
      description: plan.canSubmit ? 'Will be included' : 'Cannot be imported yet',
      tone: buckets.valid > 0 ? 'border-success' : 'border-border',
    },
    {
      label: 'Skipped',
      value: buckets.skipped,
      description: 'Errors; left out of the import',
      tone: 'border-border',
    },
    {
      label: 'Failed',
      value: buckets.failed,
      description: 'Errors; blocking the import',
      tone: buckets.failed > 0 ? 'border-destructive' : 'border-border',
    },
  ];

  return (
    <div className="space-y-6">
      <div
        ref={summaryRef}
        tabIndex={-1}
        data-testid="iw-summary"
        className="space-y-4 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <dl className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className={`rounded-lg border border-l-4 p-4 ${stat.tone}`}>
              <dt className="text-sm font-medium text-foreground">{stat.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-foreground font-display">{stat.value}</dd>
              <dd className="mt-1 text-xs text-muted-foreground">{stat.description}</dd>
            </div>
          ))}
        </dl>

        {rejection && (
          <Alert id="iw-gate-reject" variant="destructive" role="alert" data-testid="iw-reject">
            <AlertDescription>{rejection}</AlertDescription>
          </Alert>
        )}
        {!rejection && plan.reason && (
          <Alert id="iw-gate-reason" variant="warning" data-testid="iw-plan-reason">
            <AlertDescription>{plan.reason}</AlertDescription>
          </Alert>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">If any row fails</legend>
        <RadioGroup
          value={policy}
          onValueChange={(value) => onPolicyChange(value === 'fail' ? 'fail' : 'skip')}
          aria-label="Failed row policy"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="skip" id="iw-policy-skip" data-testid="iw-policy-skip" />
            <Label htmlFor="iw-policy-skip">Skip failed rows (default)</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="fail" id="iw-policy-fail" data-testid="iw-policy-fail" />
            <Label htmlFor="iw-policy-fail">Block the import while errors remain</Label>
          </div>
        </RadioGroup>
      </fieldset>

      <div className="flex justify-end">
        <Button
          type="button"
          data-testid="iw-submit"
          aria-disabled={!plan.canSubmit}
          aria-describedby={
            rejection ? 'iw-gate-reject' : plan.reason ? 'iw-gate-reason' : undefined
          }
          className={plan.canSubmit ? 'h-11' : 'h-11 opacity-50'}
          onClick={onSubmit}
        >
          {submitLabel(plan)}
        </Button>
      </div>
    </div>
  );
}
