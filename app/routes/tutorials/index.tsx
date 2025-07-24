import React from "react";
import type { Route } from "./+types/index";
import { Link, useSearchParams } from "react-router";
import { Search } from "lucide-react";
import { Header } from "~/components/page-header";
import { ContentFilter } from "~/components/content-filter";
import { ContentPagination } from "~/components/content-pagination";
import { EmptyState } from "~/components/empty-state";
// import { TutorialCard } from "./components/tutorial-card";
import { generateMetadata } from "~/utils/meta";
import { UrlSchema } from "~/utils/content.server/shared-types";
import { StatusCodes } from "http-status-codes";
import { invariantResponse } from "~/utils/misc";
import { getAllCategories } from "~/utils/content.server/shared-utils";
import { getTutorials } from "~/utils/content.server/turorials/utils";

export async function loader({ request }: Route.LoaderArgs) {
  const searchParams = Object.fromEntries(
    new URL(request.url).searchParams.entries(),
  );
  const parsedParams = UrlSchema.safeParse(searchParams);

  invariantResponse(parsedParams.success, "Invalid parameters", {
    status: StatusCodes.BAD_REQUEST,
  });

  const { search, tag, order, category, page } = parsedParams.data;

  const PAGE_SIZE = 6;

  const safePage = Math.max(0, page);
  const safeStart = (safePage - 1) * PAGE_SIZE;
  const safeEnd = safeStart + PAGE_SIZE;

  const categories = getAllCategories();
  const tutorialsData = await getTutorials({
    search,
    tag,
    order,
    category,
    start: safeStart,
    end: safeEnd,
  });

  return {
    tutorials: tutorialsData.tutorials,
    total: tutorialsData.total,
    currentPage: safePage,
    totalPages: Math.ceil(tutorialsData.total / PAGE_SIZE),
    categories,
  };
}

export default function TutorialsRoute({ loaderData }: Route.ComponentProps) {
  const metadata = generateMetadata({ title: "Tutorials" });
  const [, setSearchParams] = useSearchParams();
  const { tutorials } = loaderData;
  const PAGE = "page";

  const resetFilters = React.useCallback(() => {
    setSearchParams((prevParams) => {
      const params = new URLSearchParams();
      const page = prevParams.get(PAGE);
      if (page) {
        params.set(PAGE, page);
      }
      return params;
    });
  }, [setSearchParams]);

  return (
    <>
      {metadata}
      <Header
        title="tutorials"
        description="Practical, hands-on tutorials to help you master specific technologies and concepts."
        placeholder="search for tutorials..."
        enableSearch
      />
      <section className="container mx-auto px-4 pb-12 pt-6">
        <ContentFilter />
        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tutorials?.length
            ? tutorials.map((tutorial) => (
                <Link
                  prefetch="intent"
                  key={tutorial.id}
                  to={`/tutorials/${tutorial.id}`}
                >
                  some
                  {/* <TutorialCard tutorial={tutorial} /> */}
                </Link>
              ))
            : null}
        </section>
        {tutorials?.length ? (
          <ContentPagination />
        ) : (
          <EmptyState
            icon={<Search className="size-8" />}
            title="No tutorials found"
            description="We couldn't find any matches for your search. Try adjusting your search terms or filters."
            action={{
              label: "Clear filters",
              onClick: resetFilters,
            }}
          />
        )}
      </section>
    </>
  );
}
