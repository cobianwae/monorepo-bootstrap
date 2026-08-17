'use client';

import { useRouter } from 'next/navigation';
import { Compass } from 'lucide-react';
import { EmptyState } from '@ds/ui';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you are looking for doesn't exist or may have been moved. Check the navigation to find the right section."
        actionLabel="Back to overview"
        onAction={() => router.push('/')}
        secondaryActionLabel="Browse components"
        onSecondaryAction={() => router.push('/components')}
      />
    </div>
  );
}