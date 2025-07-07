import type { Route } from "./+types/tutorial-details";
import {
  getTutorialDetails,
  getTutorialLessons,
} from "~/utils/content.server/turorials/utils";
import { TutorialOverview } from "./components/overview";
import { StatusCodes } from "http-status-codes";
import { invariantResponse } from "~/utils/misc";

export async function loader({ params }: Route.LoaderArgs) {
  const { tutorialId } = params;
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
  };
}

export default function TurotialDetailsRoute({
  loaderData,
}: Route.ComponentProps) {
  const { tutorial, lessons } = loaderData;
  return (
    <div className="mx-auto w-full px-4 pb-12">
      <TutorialOverview tutorial={tutorial} lessons={lessons} />
    </div>
  );
}
