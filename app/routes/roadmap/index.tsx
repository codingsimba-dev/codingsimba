import type { Route } from "./+types/index";
import { Suspense } from "react";
import { Await } from "react-router";
import { Roadmap } from "./components/roadmap";
import { RoadmapSkeleton } from "./components/roadmap-skeleton";
import { Header } from "~/components/page-header";
import { getRoadmaps } from "~/utils/content.server/system/utils";

export async function loader() {
  const roadmapData = getRoadmaps();
  return { roadmapData };
}

export default function RoadmapPage({ loaderData }: Route.ComponentProps) {
  const { roadmapData } = loaderData;
  return (
    <>
      <Header
        title="Development Roadmap"
        description="Our comprehensive roadmap for building the ultimate learning platform."
      />
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<RoadmapSkeleton />}>
          <Await resolve={roadmapData}>
            {(roadmapData) => <Roadmap roadmapData={roadmapData} />}
          </Await>
        </Suspense>
      </div>
    </>
  );
}
