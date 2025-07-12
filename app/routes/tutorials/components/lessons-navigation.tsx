import type { Lesson, Tutorial } from "~/utils/content.server/turorials/types";
import { Link } from "react-router";
import { cn } from "~/utils/misc";

export function LessonsNavigation({
  lessons,
  activeLessonId,
  tutorial,
  className,
}: {
  className?: string;
  tutorial: Tutorial;
  lessons: Lesson[];
  activeLessonId?: string;
}) {
  return (
    <nav className={cn(className)}>
      {lessons.map((lesson) => (
        <Link
          key={lesson.id}
          prefetch="intent"
          to={`/tutorials/${tutorial.id}/lessons/${lesson.id}`}
          className={cn(
            "mb-1 flex w-full items-center rounded-md px-2 py-1 text-left",
            "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            {
              "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400":
                activeLessonId === lesson.id,
            },
          )}
        >
          <span className="truncate">{lesson.title}</span>
        </Link>
      ))}
    </nav>
  );
}
