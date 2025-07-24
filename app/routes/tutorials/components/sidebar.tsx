import type { Tutorial, Lesson } from "~/utils/content.server/turorials/types";
// import { SupportAuthor } from "./support-author";
import { LessonsNavigation } from "./lessons-navigation";
import { Tags } from "./tags";
import { Stats } from "./stats";
import { Engagement } from "./engagement";
import { ContentEmailSubscriptionForm } from "~/components/content-email-subscription-form";
import { useOptionalUser } from "~/hooks/user";
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

      {/* Engagement */}
      <Engagement tutorial={tutorial} />
      {/* Stats */}
      <Stats />
      {/* Tags */}
      <Tags tutorial={tutorial} />
      {/* Email Subscription Form */}
      {!user?.isSubscribed ? <ContentEmailSubscriptionForm /> : null}
      {/* support author */}
      {/* {!tutorial.premium ? <SupportAuthor /> : null} */}
    </div>
  );
}
