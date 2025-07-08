import { SideBarContainer } from "./side-bar-container";
import type { Lesson, Tutorial } from "~/utils/content.server/turorials/types";
import { Link } from "react-router";
import { cn } from "~/utils/misc";

export function LessonsNavigation({
  lessons,
  activeLessonId,
  tutorial,
}: {
  tutorial: Tutorial;
  lessons: Lesson[];
  activeLessonId?: string;
}) {
  return (
    <SideBarContainer title="Tutorial Sections" type="nav">
      <nav className="p-2">
        {lessons.map((lesson, index) => (
          <Link
            key={lesson.id}
            to={`/tutorials/${tutorial.id}/lessons/${lesson.id}`}
            className={cn(
              "mb-1 flex w-full items-center rounded-md px-3 py-2 text-left",
              "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              {
                "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400":
                  activeLessonId === lesson.id,
              },
            )}
          >
            {index + 1}. <span className="truncate"> {lesson.title}</span>
          </Link>
        ))}
      </nav>
    </SideBarContainer>
  );
}
