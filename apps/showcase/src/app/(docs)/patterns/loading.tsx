import { Skeleton } from '@ds/ui';

export default function PatternsLoading() {
  return (
    <div className="space-y-10 animate-in fade-in-50 duration-200">
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-4 w-[560px] max-w-full" />
      </div>

      <Skeleton className="h-12 w-full rounded-xl" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}