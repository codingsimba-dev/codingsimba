import type { Tutorial, Lesson } from "~/utils/content.server/turorials/types";

import SupportAuthor from "./support-author";
import { LessonsNavigation } from "./lessons-navigation";
import { Tags } from "./tags";
import { Stats } from "./stats";
import { Engagement } from "./engagement";

interface TutorialSidebarProps {
  tutorial: Tutorial;
  lessons: Lesson[];
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
      {/* <Sheet> */}
      <LessonsNavigation
        lessons={lessons}
        activeLessonId={activeLessonId}
        tutorial={tutorial}
      />
      {/* </Sheet> */}
      {/* Engagement */}
      <Engagement tutorial={tutorial} />
      {/* Stats */}
      <Stats stats={stats} />
      {/* Tags */}
      <Tags tutorial={tutorial} />
      {/* support author */}
      <SupportAuthor />
    </div>
  );
}
