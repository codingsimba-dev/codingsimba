import React from "react";
import type { Lesson, Tutorial } from "~/utils/content.server/turorials/types";
import { Await, Link, useRevalidator } from "react-router";
import { cn } from "~/utils/misc";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/empty-state";

export function LessonsNavigation({
  lessons,
  activeLessonId,
  tutorial,
  className,
}: {
  className?: string;
  tutorial: Tutorial;
  lessons: Promise<Lesson[]>;
  activeLessonId?: string;
}) {
  return (
    <React.Suspense fallback={<LessonNavigationSkeleton />}>
      <Await resolve={lessons} errorElement={<LessonNavigationError />}>
        {(lessons) => (
          <nav className={cn("flex flex-col gap-2", className)}>
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                to={`/tutorials/${tutorial.id}/lessons/${lesson.id}`}
                className={cn("rounded-md px-4 py-2 text-sm font-medium", {
                  "bg-amber-50": activeLessonId === lesson.id,
                })}
              >
                {lesson.title}
              </Link>
            ))}
          </nav>
        )}
      </Await>
    </React.Suspense>
  );
}

function LessonNavigationSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-4 w-full" />
      ))}
    </div>
  );
}

function LessonNavigationError() {
  const revalidator = useRevalidator();

  return (
    <EmptyState
      title="Error loading lessons"
      description="Please try reloading the page. If the problem persists, contact support."
      action={{
        label: "Reload",
        onClick: () => revalidator.revalidate(),
      }}
    />
  );
}
