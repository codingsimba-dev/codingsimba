import { Link } from "react-router";
import { Play, Clock, BookOpen } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { Tutorial, Lesson } from "~/utils/content.server/turorials/types";
import { Markdown } from "~/components/mdx";

interface TutorialOverviewProps {
  tutorial: Tutorial;
  lessons: Lesson[];
}

export function TutorialOverview({ tutorial, lessons }: TutorialOverviewProps) {
  return (
    <div className="space-y-8">
      {/* Tutorial introduction */}
      <div className="border-border bg-card rounded-lg border p-6">
        <h2 className="text-2xl font-bold">Overview</h2>
        <Markdown source={tutorial.overview || ""} className="pt-0" />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <Clock className="text-muted-foreground mr-2 size-4" />
            <span className="text-muted-foreground text-sm">
              {tutorial.lessonsCount} lessons
            </span>
          </div>
          <div className="flex items-center">
            <BookOpen className="text-muted-foreground mr-2 size-4" />
            <span className="text-muted-foreground text-sm">
              {tutorial.category?.title || "Uncategorized"}
            </span>
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <div className="border-border bg-card rounded-lg border">
        <div className="border-border flex items-center justify-between border-b p-6">
          <h3 className="text-xl font-bold">Tutorial Lessons</h3>
          <p className="text-muted-foreground text-sm">
            {lessons.length} lessons
          </p>
        </div>

        <div className="divide-border divide-y">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-muted text-muted-foreground mr-4 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium">{lesson.title}</h4>
                    <p className="text-muted-foreground text-sm">
                      Lesson {index + 1}
                    </p>
                  </div>
                </div>
                <Link to={`/tutorials/${tutorial.id}/lessons/${lesson.id}`}>
                  <Button variant="outline" size="sm">
                    <Play className="mr-1 size-3" />
                    Start
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related tutorials */}
      <div className="border-border bg-card rounded-lg border p-6">
        <h3 className="mb-4 text-xl font-bold">You might also like</h3>
        <p className="text-muted-foreground">
          Explore more tutorials in the {tutorial.category?.title} category.
        </p>
        <div className="mt-4">
          <Link
            to={{
              pathname: "/tutorials",
              search: `?category=${tutorial.category?.id}`,
            }}
          >
            <Button variant="outline">Browse All Related Tutorials</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
