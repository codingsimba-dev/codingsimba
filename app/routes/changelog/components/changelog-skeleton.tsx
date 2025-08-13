import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/utils/misc";

export function ChangelogSkeleton() {
  return (
    <section className="mb-24">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 md:left-1/2 md:-translate-x-px" />

        <div className="space-y-8">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-4 md:gap-8",
                index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse",
              )}
            >
              {/* Timeline dot */}
              <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-white shadow-lg dark:border-blue-400 dark:bg-gray-900">
                <div className="h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-400" />
              </div>

              {/* Content card skeleton */}
              <div className="max-w-md flex-1">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                  {/* Header skeleton */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-5 w-16 rounded" />
                    </div>
                    <Skeleton className="h-4 w-12 rounded" />
                  </div>

                  {/* Title skeleton */}
                  <Skeleton className="mb-2 h-6 w-48 rounded" />

                  {/* Description skeleton */}
                  <div className="mb-4 space-y-2">
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-4 w-1/2 rounded" />
                  </div>

                  {/* Read more skeleton */}
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
