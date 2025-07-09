import React from "react";
import type { Tutorial, Lesson } from "~/utils/content.server/turorials/types";
import { SupportAuthor } from "./support-author";
import { LessonsNavigation } from "./lessons-navigation";
import { Tags } from "./tags";
import { Stats } from "./stats";
import { Engagement } from "./engagement";
import { Await } from "react-router";

interface TutorialSidebarProps {
  tutorial: Tutorial;
  lessons: Promise<Lesson[]>;
  activeLessonId?: string;
  stats?: {
    viewCount: number;
    likeCount: number;
    commentCount: number;
  };
}

export function TutorialSidebar({
  tutorial,
  lessons,
  activeLessonId,
  stats = { viewCount: 0, likeCount: 0, commentCount: 0 },
}: TutorialSidebarProps) {
  return (
    <div className="sticky top-24 space-y-6">
      {/* Tutorial Sections */}
      <React.Suspense fallback={<LessonNavigationSkeleton />}>
        <Await resolve={lessons} errorElement={<LessonNavigationError />}>
          {(lessons) => (
            <LessonsNavigation
              lessons={lessons}
              activeLessonId={activeLessonId}
              tutorial={tutorial}
            />
          )}
        </Await>
      </React.Suspense>
      {/* Engagement */}
      <Engagement tutorial={tutorial} />
      {/* Stats */}
      <Stats stats={stats} />
      {/* Tags */}
      <Tags tutorial={tutorial} />
      {/* support author */}
      {!tutorial.premium ? <SupportAuthor /> : null}
    </div>
  );
}

function LessonNavigationSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-10 w-full animate-pulse rounded-md" />
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="h-4 w-full animate-pulse rounded-md" />
      ))}
    </div>
  );
}

function LessonNavigationError() {
  return (
    <p className="mx-auto text-sm text-red-500">
      Failed to load lessons. Please try again later.
    </p>
  );
}
