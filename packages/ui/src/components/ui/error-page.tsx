'use client';

import * as React from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Alert, AlertTitle, AlertDescription } from './alert';
import { Button } from './button';

export interface ErrorPageProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  error?: unknown;
  onReset?: () => void;
  onReload?: () => void;
}

export function ErrorPage({
  className,
  title = 'Terjadi kesalahan',
  description = 'Sesuatu gagal dimuat. Coba reset atau muat ulang halaman.',
  error,
  onReset,
  onReload,
  ...props
}: ErrorPageProps) {
  return (
    <div
      className={cn('flex min-h-[50vh] items-center justify-center p-6', className)}
      {...props}
    >
      <div className="w-full max-w-lg space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
          {error != null && (
            <p className="mt-2 font-mono text-xs break-all opacity-70">
              {error instanceof Error ? error.message : String(error)}
            </p>
          )}
        </Alert>
        <div className="flex flex-wrap gap-2.5">
          {onReset && (
            <Button size="sm" variant="outline" onClick={onReset} className="gap-1.5">
              <RotateCcw className="h-3.5 w-3.5" />
              Coba Lagi
            </Button>
          )}
          {onReload && (
            <Button size="sm" variant="ghost" onClick={onReload} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Muat Ulang
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}