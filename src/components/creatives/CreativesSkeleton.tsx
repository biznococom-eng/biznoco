import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/** 5 stat-card skeleton matching OverviewCards layout */
export function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-4 w-14 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-3 w-24" />
            <Skeleton className="mt-2 h-7 w-32" />
            <Skeleton className="mt-2 h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/** N creative-card skeletons mimicking CreativeCard layout */
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          {/* Media zone */}
          <Skeleton className="aspect-square w-full rounded-none" />
          <CardContent className="space-y-3 p-4">
            <div>
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="mt-1.5 h-3 w-1/2" />
            </div>

            {/* Quick stat row */}
            <div className="grid grid-cols-3 gap-2 rounded-md border border-border/50 bg-secondary/30 p-2">
              {Array.from({ length: 3 }).map((__, j) => (
                <div key={j} className="space-y-1.5">
                  <Skeleton className="mx-auto h-2 w-12" />
                  <Skeleton className="mx-auto h-4 w-16" />
                </div>
              ))}
            </div>

            {/* Progress bars */}
            <div className="space-y-2.5">
              <SkelBar />
              <SkelBar />
              <SkelBar />
            </div>

            {/* Retention chart */}
            <div className="border-t border-border/50 pt-3">
              <div className="mb-2 flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-[120px] w-full" />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/50 pt-3">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SkelBar() {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-12" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  );
}

/** Filter bar skeleton — show only while initial fetch */
export function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/60 p-3 backdrop-blur-sm md:flex-row md:items-center">
      <Skeleton className="h-10 flex-1 min-w-[220px]" />
      <Skeleton className="h-10 w-[240px]" />
      <Skeleton className="h-10 w-[200px]" />
      <Skeleton className="h-8 w-20" />
    </div>
  );
}
