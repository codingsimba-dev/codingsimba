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
                to={`/tutorials/${tutorial.slug}/lessons/${lesson.id}`}
                className={cn(
                  "rounded-md px-4 py-2 text-sm font-medium",
                  activeLessonId === lesson.id
                    ? "bg-blue-500 text-white"
                    : "text-gray-700 hover:bg-gray-100",
                )}
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
    <div className="flex flex-col gap-4">
      <Skeleton className="h-12 w-full" />
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
