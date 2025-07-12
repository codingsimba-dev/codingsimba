import React from "react";
import { Outlet, useFetcher, Await } from "react-router";
import {
  getTutorialDetails,
  getTutorialLessons,
} from "~/utils/content.server/turorials/utils";
import { invariantResponse } from "~/utils/misc";
import { StatusCodes } from "http-status-codes";
import { DetailsHeader } from "~/components/details-header";
import type { Route } from "./+types/tutorial";
import { TutorialSidebar } from "./components/sidebar";
import { type PageViewData } from "use-page-view";
import { z } from "zod";
import { getTutorialComments, getTutorialMetrics } from "./loader.server";
import { Comments } from "~/components/comment";
import { Separator } from "~/components/ui/separator";
import { LessonsNavigation } from "./components/lessons-navigation";
import { SideBarContainer } from "./components/sidebar-container";

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

  return {
    lessons,
    lessonId,
    comments,
    metrics,
    tutorial,
  };
}

export default function TutorialPage({ loaderData }: Route.ComponentProps) {
  const { tutorial, lessons, lessonId } = loaderData;

  const fetcher = useFetcher();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handlePageView = React.useCallback(async (data: PageViewData) => {
    await fetcher.submit(
      { ...data, itemId: data.pageId, intent: "track-page-view" },
      { method: "post" },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // usePageView({
  //   pageId: tutorial.id,
  //   trackOnce: true,
  //   trackOnceDelay: 30,
  //   onPageView: handlePageView,
  // });

  return (
    <>
      <DetailsHeader item={tutorial} />
      <div className="container mx-auto w-full px-4 py-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <main className="w-full max-w-full lg:col-span-8">
            <React.Suspense fallback={<div>Loading lessons...</div>}>
              <Await resolve={lessons}>
                {(resolvedLessons) => (
                  <SideBarContainer
                    title="Tutorial Sections"
                    type="nav"
                    className="mb-8 block lg:hidden"
                  >
                    <LessonsNavigation
                      lessons={resolvedLessons}
                      activeLessonId={lessonId}
                      tutorial={tutorial}
                    />
                  </SideBarContainer>
                )}
              </Await>
            </React.Suspense>
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
