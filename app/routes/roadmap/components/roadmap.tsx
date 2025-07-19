import { cn } from "~/utils/misc";
import { Badge } from "~/components/ui/badge";
import {
  Calendar,
  ChevronRight,
  BookOpen,
  Code,
  Trophy,
  GraduationCap,
  Layers,
  Briefcase,
  ShoppingBag,
  MessageSquare,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Markdown } from "~/components/mdx";

type RoadmapItem = {
  slug: string;
  content: string;
  frontmatter: {
    title?: string;
    description?: string;
    category?:
      | "articles"
      | "tutorials"
      | "challenges"
      | "courses"
      | "programs"
      | "job-board"
      | "store"
      | "chat";
    startDate?: string;
    endDate?: string;
    status?: "completed" | "in-progress" | "planned";
    progress?: number;
    [key: string]: unknown;
  };
};

const categoryIcons = {
  articles: BookOpen,
  tutorials: Code,
  challenges: Trophy,
  courses: GraduationCap,
  programs: Layers,
  "job-board": Briefcase,
  store: ShoppingBag,
  chat: MessageSquare,
};

const statusColors = {
  completed:
    "border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-900/20 dark:text-green-300",
  "in-progress":
    "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-300",
  planned:
    "border-gray-500 bg-gray-50 text-gray-700 dark:border-gray-400 dark:bg-gray-900/20 dark:text-gray-300",
};

export function Roadmap({ roadmapData }: { roadmapData: RoadmapItem[] }) {
  return (
    <section className="mb-24">
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 h-full w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 md:left-1/2 md:-translate-x-px" />

        <div className="space-y-8">
          {roadmapData.map((item: RoadmapItem, index: number) => (
            <TimelineItem key={item.slug} index={index} roadmapItem={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function TimelineItem({
  index,
  roadmapItem,
}: {
  index: number;
  roadmapItem: RoadmapItem;
}) {
  const isEven = index % 2 === 0;
  const frontmatter = roadmapItem.frontmatter;
  const category = frontmatter.category || "articles";
  const IconComponent = categoryIcons[category];

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
                {frontmatter.title}
              </DialogTitle>
            </DialogHeader>
            <div className="-my-6">
              <Markdown source={roadmapItem.content} />
            </div>
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
                      className={cn(
                        "px-2 py-1 text-xs font-medium",
                        statusColors[frontmatter.status || "planned"],
                      )}
                    >
                      {(frontmatter.status || "planned").replace("-", " ")}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="mr-1 h-3 w-3" />
                    {frontmatter.startDate || "TBD"}
                  </div>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                  {frontmatter.title || "Untitled"}
                </h3>

                {/* Description */}
                <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                  {frontmatter.description || "No description available"}
                </p>

                {/* Progress bar for in-progress items */}
                {frontmatter.status === "in-progress" &&
                  frontmatter.progress && (
                    <div className="mb-4">
                      <div className="mb-1 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Progress</span>
                        <span>{frontmatter.progress}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${frontmatter.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

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
