import { cn } from "~/utils/misc";
import { Badge } from "~/components/ui/badge";
import { Calendar, ChevronRight, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Markdown } from "~/components/mdx";
import type { Changelog } from "~/utils/content.server/system/types";
import { format } from "date-fns";

export function Changelog({ changelogData }: { changelogData: Changelog[] }) {
  return (
    <section className="mb-24">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 md:left-1/2 md:-translate-x-px" />

        <div className="space-y-8">
          {changelogData?.map((item, index) => (
            <TimelineItem key={item.title} index={index} changelogItem={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  index,
  changelogItem,
}: {
  index: number;
  changelogItem: Changelog;
}) {
  const isEven = index % 2 === 0;
  const IconComponent = Zap;

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
          <DialogContent className="max-h-[80vh] !max-w-3xl overflow-y-auto [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300 [&::-webkit-scrollbar-thumb]:hover:bg-gray-400 dark:[&::-webkit-scrollbar-thumb]:bg-gray-600 dark:[&::-webkit-scrollbar-thumb]:hover:bg-gray-500 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 dark:[&::-webkit-scrollbar-track]:bg-gray-800 [&::-webkit-scrollbar]:w-2">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IconComponent className="h-4 w-4 text-blue-500" />
                {changelogItem.title}
              </DialogTitle>
            </DialogHeader>
            <Markdown source={changelogItem.content} />
          </DialogContent>
          <DialogTrigger asChild>
            <div className="group cursor-pointer">
              <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-blue-200 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700">
                {/* Header */}
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-blue-500" />
                    <Badge
                      variant="outline"
                      className="border-green-500 bg-green-50 px-2 py-1 text-xs font-medium text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-300"
                    >
                      {changelogItem.version}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(changelogItem.date), "MMM, yyyy")}
                  </div>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                  {changelogItem.title}
                </h3>

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
