import type { Route } from "../+types/article";
import { Link, useLoaderData } from "react-router";
import { Skeleton } from "~/components/ui/skeleton";
import { useTOC } from "~/hooks/use-toc";
import { cn } from "~/utils/misc";

export function TableOfContent({ className }: { className?: string }) {
  const loaderData = useLoaderData() as Route.ComponentProps["loaderData"];
  const { headings, activeId } = useTOC({
    containerId: "markdown-content",
  });

  return (
    <div
      className={cn(
        "border-border bg-card relative mb-6 rounded-xl border p-6",
        className,
      )}
    >
      <h3 className="mb-4 text-lg font-bold">Table of Contents</h3>
      <nav className="space-y-3">
        <ul>
          {headings?.length
            ? headings
                .filter((h) => !!h.id)
                .map((heading, i) => {
                  const { id, text } = heading;
                  const activeItem = activeId === id;

                  return (
                    <li key={`${id}-${i}-${loaderData.article.slug}`}>
                      <Link
                        to={`#${id}`}
                        className={cn(
                          "text-muted-foreground hover:text-primary block",
                          {
                            "text-primary font-bold": activeItem,
                          },
                        )}
                      >
                        <span className="text-muted-foreground mr-2">
                          {"👉🏽"}
                        </span>
                        {text}
                      </Link>
                    </li>
                  );
                })
            : Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  className={cn("h-4 w-full", {
                    "mt-2": i !== 0,
                  })}
                  key={i}
                />
              ))}
        </ul>
      </nav>
    </div>
  );
}
