'use client';

import * as React from 'react';
import { ErrorPage } from '@ds/ui';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error('Showcase route error captured:', error);
  }, [error]);

  return (
    <ErrorPage
      title="Application Runtime Error"
      description="An unexpected error occurred while rendering this route."
      error={error}
      onReset={reset}
      onReload={() => window.location.reload()}
    />
  );
}