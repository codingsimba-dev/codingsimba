import type { Route } from "./+types/tutorial";
import type { ChatBotLesson } from "~/utils/content.server/turorials/types";
import { Outlet, useFetcher } from "react-router";
import {
  getChatBotLessonDetails,
  getTutorialDetails,
  getTutorialLessons,
} from "~/utils/content.server/turorials/utils";
import { invariantResponse } from "~/utils/misc";
import { StatusCodes } from "http-status-codes";
import { DetailsHeader } from "~/components/page-details-header";
import { TutorialSidebar } from "./components/sidebar";
import { usePageView } from "use-page-view";
import { z } from "zod";
import { getTutorialComments, getTutorialMetrics } from "./loader.server";
import { CommentIntent, Comments } from "~/components/comment";
import { Separator } from "~/components/ui/separator";
import { LessonsNavigation } from "./components/lessons-navigation";
import { SideBarContainer } from "./components/sidebar-container";
import {
  ActionSchema,
  addComment,
  trackPageView,
  updateComment,
  deleteComment,
  upvoteComment,
} from "~/utils/content.server/action";
import { checkHoneypot } from "~/utils/honeypot.server";
import { GeneralErrorBoundary } from "~/components/error-boundary";
import { useCallback } from "react";
// import { generateMetadata } from "~/utils/meta";

const SearchParamsSchema = z.object({
  commentTake: z.coerce.number().default(5),
  replyTake: z.coerce.number().default(3),
  intent: z.string().optional(),
});

export async function loader({ request, params }: Route.LoaderArgs) {
  const searchParams = Object.fromEntries(
    new URL(request.url).searchParams.entries(),
  );
  const parsedParams = SearchParamsSchema.safeParse(searchParams);
  invariantResponse(parsedParams.success, "Invalid comment search params", {
    status: StatusCodes.BAD_REQUEST,
  });

  const { tutorialId, lessonId } = params;
  invariantResponse(tutorialId, "Tutorial ID is required", {
    status: StatusCodes.BAD_REQUEST,
  });

  const lessons = getTutorialLessons(tutorialId);
  const metrics = getTutorialMetrics({ tutorialId });
  const comments = getTutorialComments({
    tutorialId,
    ...parsedParams.data,
  });
  const tutorial = await getTutorialDetails(tutorialId);
  invariantResponse(tutorial, "Tutorial not found", {
    status: StatusCodes.NOT_FOUND,
  });
  let lesson: ChatBotLesson | undefined = undefined;
  if (lessonId) {
    lesson = await getChatBotLessonDetails(lessonId);
  }

  return {
    lessons,
    lessonId,
    comments,
    metrics,
    tutorial,
    lesson,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  await checkHoneypot(formData);
  const formDataObj = Object.fromEntries(formData);
  const submittedData = {
    data: JSON.parse(formDataObj.data as string),
    intent: formDataObj.intent,
  };
  const result = await ActionSchema.safeParseAsync(submittedData);
  invariantResponse(result.success, "Invalid form data", {
    status: StatusCodes.BAD_REQUEST,
  });

  const { data, intent } = result.data;

  switch (intent as CommentIntent | MiscTypes) {
    case CommentIntent.ADD_COMMENT:
      return await addComment(data);
    case CommentIntent.UPDATE_COMMENT:
      return await updateComment(request, data);
    case CommentIntent.DELETE_COMMENT:
      return await deleteComment(request, data);
    case CommentIntent.UPVOTE_COMMENT:
      return await upvoteComment(data);
    case MiscTypes.TRACK_PAGE_VIEW:
      return await trackPageView({
        pageId: data.pageId as string,
        type: "TUTORIAL",
      });
    default:
      return new Response("Invalid intent", {
        status: StatusCodes.BAD_REQUEST,
      });
  }
}

enum MiscTypes {
  TRACK_PAGE_VIEW = "TRACK_PAGE_VIEW",
}

export default function TutorialPage({ loaderData }: Route.ComponentProps) {
  const { tutorial, lessons, lessonId } = loaderData;
  // const metadata = generateMetadata({
  //   title: tutorial.title,
  //   image: tutorial.image,
  //   imageAlt: tutorial.title,
  //   url: `tutorials/${tutorial.id}`,
  //   description: tutorial.overview,
  //   keywords: tutorial.tags
  //     .map((t) => t.slug)
  //     .join(",")
  //     .replace(/-/g, "_"),
  //   type: "article",
  // });

  const fetcher = useFetcher();
  const trackPageView = useCallback(() => {
    fetcher.submit(
      {
        intent: MiscTypes.TRACK_PAGE_VIEW,
        data: JSON.stringify({ pageId: tutorial.id }),
      },
      { method: "post" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  usePageView({
    pageId: tutorial.id,
    trackOnce: true,
    trackOnceDelay: 30,
    onPageView: trackPageView,
  });

  return (
    <>
      {/* {metadata} */}
      <DetailsHeader item={tutorial} />
      <div className="container mx-auto w-full px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <main className="w-full max-w-full lg:col-span-8">
            <SideBarContainer
              title="Tutorial Sections"
              type="nav"
              className="mb-8 block lg:hidden"
            >
              <LessonsNavigation
                lessons={lessons}
                activeLessonId={lessonId}
                tutorial={tutorial}
              />
            </SideBarContainer>

            <Outlet />
            <p>
              Share the topics you&apos;d like to see covered in future
              tutorials!
            </p>
            <Separator className="mb-4 mt-2" />
            <Comments />
          </main>
          <aside className="lg:col-span-4">
            <div className="sticky top-20">
              <TutorialSidebar
                tutorial={tutorial}
                lessons={lessons}
                activeLessonId={lessonId}
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}

export function ErrorBoundary() {
  return (
    <GeneralErrorBoundary
      statusHandlers={{
        403: () => <p>You do not have permission</p>,
        404: ({ params }) => (
          <p>Article with ${params.articleId} does not exist</p>
        ),
      }}
    />
  );
}
