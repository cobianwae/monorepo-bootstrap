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
          {result.rows.length} baris siap diimpor.
        </p>
        <p className="text-sm text-muted-foreground">
          {result.skipped > 0 ? `${result.skipped} baris dilewati. ` : ''}
          {result.failed > 0 ? `${result.failed} baris gagal. ` : ''}
          Hasil dikirim ke onComplete sebagai ImportResult.
        </p>
        <Button type="button" variant="outline" onClick={onRestart}>
          Mulai ulang
        </Button>
      </div>
    );
  }

  const buckets = summaryBuckets(plan, policy);

  return (
    <div className="space-y-6">
      <div ref={summaryRef} tabIndex={-1} data-testid="iw-summary" className="space-y-4 focus:outline-none">
        <div className="grid gap-3 sm:grid-cols-3">
          <StatCard
            title="Valid"
            value={buckets.valid}
            icon={CheckCircle2}
            description={plan.canSubmit ? 'Akan diimpor' : 'Belum bisa diimpor'}
          />
          <StatCard
            title="Lewati"
            value={buckets.skipped}
            icon={MinusCircle}
            description="Error; tidak ikut impor"
          />
          <StatCard
            title="Gagal"
            value={buckets.failed}
            icon={AlertCircle}
            description="Error; memblokir impor"
          />
        </div>

        {rejection && (
          <Alert variant="destructive" role="alert" data-testid="iw-reject">
            <AlertDescription>{rejection}</AlertDescription>
          </Alert>
        )}
        {!rejection && plan.reason && (
          <Alert variant="warning" data-testid="iw-plan-reason">
            <AlertDescription>{plan.reason}</AlertDescription>
          </Alert>
        )}
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-foreground">Jika ada baris gagal</legend>
        <RadioGroup
          value={policy}
          onValueChange={(value) => onPolicyChange(value === 'fail' ? 'fail' : 'skip')}
          aria-label="Kebijakan baris gagal"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="skip" id="iw-policy-skip" data-testid="iw-policy-skip" />
            <Label htmlFor="iw-policy-skip">Lewati baris gagal (default)</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="fail" id="iw-policy-fail" data-testid="iw-policy-fail" />
            <Label htmlFor="iw-policy-fail">Gagalkan impor bila masih ada error</Label>
          </div>
        </RadioGroup>
      </fieldset>

      <div className="flex justify-end">
        <Button
          type="button"
          data-testid="iw-submit"
          aria-disabled={!plan.canSubmit}
          className={plan.canSubmit ? undefined : 'opacity-50'}
          onClick={onSubmit}
        >
          {submitLabel(plan)}
        </Button>
      </div>
    </div>
  );
}
