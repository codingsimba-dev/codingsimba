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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Bot, BrainCircuit, Send } from "lucide-react";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "~/components/ui/tooltip";
import { Markdown } from "~/components/mdx";
// import { Comments } from "~/components/comment";

export async function loader({ params }: Route.LoaderArgs) {
  const { tutorialId, lessonId } = params;

  invariantResponse(tutorialId, "Tutorial ID is required", {
    status: StatusCodes.BAD_REQUEST,
  });

  const tutorial = await getTutorialDetails(tutorialId);
  invariantResponse(tutorial, "Tutorial not found", {
    status: StatusCodes.NOT_FOUND,
  });

  const lessons = await getTutorialLessons(tutorialId);

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
      <Sheet>
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
        <SheetContent className="lg:min-w-2xl min-w-[90%] sm:min-w-[80%] md:min-w-[70%]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Bot className="size-6" />
              <span className="text-lg font-medium">
                Chat with your learning assistant
              </span>
            </SheetTitle>
            <SheetDescription>
              I am your helpful assistant that can answer questions about any
              confusion you have.
            </SheetDescription>
          </SheetHeader>
          <div className="-mt-6 overflow-y-auto px-4">
            <Markdown source={tutorial.overview} className="pt-0" />
          </div>
          <div className="mt-auto flex items-center gap-2 border-t border-gray-200 p-4">
            <Textarea
              placeholder="Ask me anything you want to be clarified about"
              className="flex-1"
              autoFocus
            />
            <div className="flex flex-col items-center gap-2">
              <Tooltip>
                <TooltipTrigger>
                  <Button size="sm">
                    <Send className="size-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Send the question</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger>
                  <Button size="sm">
                    <BrainCircuit className="size-4" />
                    <span className="sr-only">Reason</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reason about complex questions</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
