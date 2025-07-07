import React from "react";
import type { Route } from "./+types/lesson";
import { getTutorialLessonDetails } from "~/utils/content.server/turorials/utils";
import { invariantResponse } from "~/utils/misc";
import { StatusCodes } from "http-status-codes";
import { Markdown } from "~/components/mdx";
import { Await } from "react-router";
import { Skeleton } from "~/components/ui/skeleton";

export async function loader({ params }: Route.LoaderArgs) {
  const { lessonId } = params;
  invariantResponse(lessonId, "Lesson ID is required", {
    status: StatusCodes.BAD_REQUEST,
  });
  const lesson = getTutorialLessonDetails(lessonId);
  invariantResponse(lesson, "Lesson not found", {
    status: StatusCodes.NOT_FOUND,
  });
  return { lesson, lessonId };
}

export default function LessonPage({ loaderData }: Route.ComponentProps) {
  const { lesson } = loaderData;

  return (
    <>
      <div className="mx-auto w-full pb-12">
        <React.Suspense fallback={<LessonSkeleton />}>
          <Await resolve={lesson} errorElement={<LessonError />}>
            {(lesson) => (
              <div className="w-full">
                <h2 className="text-2xl font-bold">{lesson.title}</h2>
                <Markdown source={lesson.content} className="m-0" />
              </div>
            )}
          </Await>
        </React.Suspense>
      </div>
    </>
  );
}

function LessonSkeleton() {
  return (
    <div className="w-full">
      <Skeleton className="mb-6 h-10 w-full" />
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full" />
        ))}
      </div>
    </div>
  );
}

function LessonError() {
  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold">
        Something went wrong while loading the lesson
      </h2>
    </div>
  );
}
