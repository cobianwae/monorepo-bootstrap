import { Skeleton, Card } from '@ds/ui';

export default function ClinicLoading() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* PageHeader Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36 rounded-full" />
          <Skeleton className="h-8 w-64 md:w-80" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28 rounded-lg" />
          <Skeleton className="h-9 w-36 rounded-lg" />
        </div>
      </div>

      {/* 4 KPI Stat Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6 space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-3 w-32" />
          </Card>
        ))}
      </div>

      {/* Analytics / Charts Grid Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-border/40">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </Card>
        <Card className="p-6 space-y-4">
          <div className="pb-2 border-b border-border/40">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bottom Content Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-44" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </Card>
        <Card className="p-6 space-y-4">
          <Skeleton className="h-6 w-44" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
