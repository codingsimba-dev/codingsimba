import { cn } from "~/utils/misc";
import { SectionHeader } from "./section-header";
import { Badge } from "~/components/ui/badge";
import { Calendar, ChevronRight, MapPin } from "lucide-react";
import { Suspense } from "react";
import { Await } from "react-router";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Markdown } from "~/components/mdx";
import type { Journey } from "~/utils/content.server/system/types";

export function Journey({ journeyData }: { journeyData: Promise<Journey[]> }) {
  return (
    <section className="mb-24">
      <SectionHeader
        title="Our Journey"
        description="Key moments and milestones that have shaped our path as developers and educators."
      />
      <Suspense fallback={<JourneySkeleton />}>
        <Await resolve={journeyData}>
          {(resolvedJourneyData: Journey[]) => (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 md:left-1/2 md:-translate-x-px" />
              <div className="space-y-8">
                {resolvedJourneyData
                  ? resolvedJourneyData
                      .filter((item) => item?.published !== false)
                      .map((item: Journey, index: number) => (
                        <TimelineItem
                          key={item?.title}
                          index={index}
                          journeyItem={item}
                        />
                      ))
                  : null}
              </div>
            </div>
          )}
        </Await>
      </Suspense>
    </section>
  );
}

function JourneySkeleton() {
  return (
    <div className="relative">
      <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 md:left-1/2 md:-translate-x-px" />
      <div className="space-y-8">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-start gap-4 md:gap-8">
            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-white dark:border-blue-400 dark:bg-gray-900">
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineItem({
  index,
  journeyItem,
}: {
  index: number;
  journeyItem: Journey;
}) {
  const isEven = index % 2 === 0;

  return (
    <div
      className={cn(
        "flex items-start gap-4 md:gap-8",
        isEven ? "md:flex-row" : "md:flex-row-reverse",
      )}
    >
      {/* Timeline dot */}
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-white shadow-lg dark:border-blue-400 dark:bg-gray-900">
        <div className="h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-400" />
      </div>

      {/* Content card */}
      <div
        className={cn(
          "max-w-md flex-1",
          isEven ? "md:text-left" : "md:text-right",
        )}
      >
        <Dialog>
          <DialogContent className="scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 dark:scrollbar-track-gray-800 dark:scrollbar-thumb-gray-600 dark:hover:scrollbar-thumb-gray-500 max-h-[80vh] !max-w-3xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-500" />
                {journeyItem.title}
              </DialogTitle>
            </DialogHeader>
            <div className="-my-6">
              <Markdown source={journeyItem.content} />
            </div>
          </DialogContent>
          <DialogTrigger asChild>
            <div className="group cursor-pointer">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                  >
                    {journeyItem.category}
                  </Badge>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="mr-1 h-3 w-3" />
                    {journeyItem.year}
                  </div>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                  {journeyItem.title}
                </h3>

                {/* Description */}
                <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                  {journeyItem.description}
                </p>

                {/* Image preview */}
                <div className="mb-4 overflow-hidden rounded-md">
                  <img
                    src={journeyItem.image}
                    alt={journeyItem.title}
                    className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Read more indicator */}
                <div className="flex items-center text-sm font-medium text-blue-600 transition-colors group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
                  Read more
                  <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </DialogTrigger>
        </Dialog>
      </div>
    </div>
  );
}
