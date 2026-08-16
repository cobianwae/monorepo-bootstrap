'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button, Alert, AlertTitle, AlertDescription } from '@ds/ui';
import { AlertCircle, RotateCcw, LayoutDashboard } from 'lucide-react';

export default function CrmErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('CRM scenario runtime error captured:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center p-6 space-y-6 animate-in fade-in-50">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>CRM Scenario Error</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            {error?.message || 'An unexpected error occurred while loading this CRM module.'}
          </AlertDescription>
        </Alert>

        <div className="flex justify-center gap-3 pt-2">
          <Link href="/crm">
            <Button variant="outline" size="sm" className="gap-1.5">
              <LayoutDashboard className="h-3.5 w-3.5" />
              Back to Dashboard
            </Button>
          </Link>
          <Button onClick={() => reset()} size="sm" className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}
