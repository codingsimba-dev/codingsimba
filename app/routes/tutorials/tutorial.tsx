import React from "react";
import { Outlet, useFetcher } from "react-router";
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

export async function loader({ params }: Route.LoaderArgs) {
  const { tutorialId, lessonId } = params;
  invariantResponse(tutorialId, "Tutorial ID is required", {
    status: StatusCodes.BAD_REQUEST,
  });
  const lessons = getTutorialLessons(tutorialId);
  const tutorial = await getTutorialDetails(tutorialId);
  invariantResponse(tutorial, "Tutorial not found", {
    status: StatusCodes.NOT_FOUND,
  });

  return {
    tutorial,
    lessons,
    lessonId,
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
            <Outlet />
            {/* <Comments comments={[]} onAddComment={() => {}} /> */}
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
