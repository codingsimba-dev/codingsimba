import type { Route } from "../+types/article";
import { Link } from "react-router";

export function Tags({
  tags,
}: {
  tags: Route.ComponentProps["loaderData"]["article"]["tags"];
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {tags?.map((tag) => (
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
    </div>
  );
}
