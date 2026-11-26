'use client';

import type * as React from 'react';
import { AlertCircle, CheckCircle2, MinusCircle } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  Button,
  Label,
  RadioGroup,
  RadioGroupItem,
  StatCard,
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

  return (
    <div className="space-y-6">
      <div
        ref={summaryRef}
        tabIndex={-1}
        data-testid="iw-summary"
        className="space-y-4 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            title="Valid"
            value={buckets.valid}
            icon={CheckCircle2}
            description={plan.canSubmit ? 'Will be included' : 'Cannot be imported yet'}
          />
          <StatCard
            title="Skipped"
            value={buckets.skipped}
            icon={MinusCircle}
            description="Errors; left out of the import"
          />
          <StatCard
            title="Failed"
            value={buckets.failed}
            icon={AlertCircle}
            description="Errors; blocking the import"
          />
        </div>

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
