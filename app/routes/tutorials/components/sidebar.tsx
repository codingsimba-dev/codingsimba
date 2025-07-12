import React from "react";
import type { Tutorial, Lesson } from "~/utils/content.server/turorials/types";
import { SupportAuthor } from "./support-author";
import { LessonsNavigation } from "./lessons-navigation";
import { Tags } from "./tags";
import { Stats } from "./stats";
import { Engagement } from "./engagement";
import { Await } from "react-router";
import { ContentEmailSubscriptionForm } from "~/components/content-email-subscription-form";
import { useOptionalUser } from "~/hooks/user";
import { Skeleton } from "~/components/ui/skeleton";
import { SideBarContainer } from "./sidebar-container";

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
}: TutorialSidebarProps) {
  const user = useOptionalUser();
  return (
    <div className="sticky top-24 space-y-6">
      {/* Tutorial Sections */}
      <React.Suspense fallback={<LessonNavigationSkeleton />}>
        <Await resolve={lessons} errorElement={<LessonNavigationError />}>
          {(lessons) => (
            <SideBarContainer
              title="Tutorial Sections"
              type="nav"
              className="hidden lg:block"
            >
              <LessonsNavigation
                lessons={lessons}
                activeLessonId={activeLessonId}
                tutorial={tutorial}
              />
            </SideBarContainer>
          )}
        </Await>
      </React.Suspense>
      {/* Engagement */}
      <Engagement tutorial={tutorial} />
      {/* Stats */}
      <Stats />
      {/* Tags */}
      <Tags tutorial={tutorial} />
      {/* Email Subscription Form */}
      {!user?.isSubscribed ? <ContentEmailSubscriptionForm /> : null}
      {/* support author */}
      {!tutorial.premium ? <SupportAuthor /> : null}
    </div>
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
  return (
    <p className="mx-auto text-sm text-red-500">
      Failed to load lessons. Please try again later.
    </p>
  );
}
