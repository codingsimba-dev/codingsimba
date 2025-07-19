import type { Route } from "../routes/articles/+types/article";
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
        "relative mb-6 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
    >
      <h3 className="mb-4 text-lg font-bold">Table of Contents</h3>
      <nav className="space-y-3">
        <ul>
          {headings?.length ? (
            headings
              .filter((h) => !!h.id)
              .map((heading, i) => {
                const { id, text } = heading;
                const activeItem = activeId === id;

                return (
                  <li key={`${id}-${i}-${loaderData.article.slug}`}>
                    <Link
                      to={`#${id}`}
                      className={cn(
                        "block text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400",
                        {
                          "text-blue-700 dark:text-blue-600": activeItem,
                        },
                      )}
                    >
                      <span className="mr-2 font-bold">{"👉🏽"}</span>
                      {text}
                    </Link>
                  </li>
                );
              })
          ) : (
            <>
              <Skeleton className="h-2 w-full" />
              <Skeleton className="mt-2 h-2 w-full" />
              <Skeleton className="mt-2 h-2 w-full" />
            </>
          )}
        </ul>
      </nav>
    </div>
  );
}
