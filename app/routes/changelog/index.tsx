import type { Route } from "./+types/index";
import { Suspense } from "react";
import { Await } from "react-router";
import { Changelog } from "./components/changelog";
import { ChangelogSkeleton } from "./components/changelog-skeleton";
import { Header } from "~/components/page-header";
import { getChangelogs } from "~/utils/content.server/system/utils";

export async function loader() {
  const changelogData = getChangelogs();
  return { changelogData };
}

export default function ChangelogPage({ loaderData }: Route.ComponentProps) {
  const { changelogData } = loaderData;
  return (
    <>
      <Header
        title="Changelog"
        description="Stay updated with the latest features, improvements, and bug fixes."
      />
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<ChangelogSkeleton />}>
          <Await resolve={changelogData}>
            {(changelogData) => <Changelog changelogData={changelogData} />}
          </Await>
        </Suspense>
      </div>
    </>
  );
}
