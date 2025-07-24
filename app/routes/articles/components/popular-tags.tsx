import React from "react";
import type { Route } from "../+types/article";
import { Await, Link, useLoaderData } from "react-router";
import { Skeleton } from "~/components/ui/skeleton";
import type { Tag } from "~/utils/content.server/shared-types";

export function PopularTags() {
  const loaderData = useLoaderData() as Route.ComponentProps["loaderData"];
  return (
    <React.Suspense
      fallback={Array.from({ length: 3 }).map((_, index) => (
        <Skeleton key={index} />
      ))}
    >
      <Await resolve={loaderData.tags}>
        {(tags) => (tags?.length ? <Tags tags={tags} /> : null)}
      </Await>
    </React.Suspense>
  );
}

function Tags({ tags }: { tags: Tag[] }) {
  return (
    <section className="border-border bg-card rounded-xl border p-6">
      <h3 className="mb-4 text-lg font-bold">Popular Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Link
            key={tag.id}
            prefetch="intent"
            to={{
              pathname: "/articles",
              search: `?tag=${tag.slug}`,
            }}
            className="bg-muted text-foreground hover:bg-muted/80 rounded-full px-3 py-1 text-sm transition-colors"
          >
            #{tag.title}
          </Link>
        ))}
      </div>
    </section>
  );
}
