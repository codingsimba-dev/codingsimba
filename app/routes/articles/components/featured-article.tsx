import React from "react";
import type { Route } from "../+types/index";
import type { Article } from "~/utils/content.server/articles/types";
import { Await, Link, PrefetchPageLinks, useLoaderData } from "react-router";
import { format } from "date-fns";
import { readingTime } from "reading-time-estimator";
import { Skeleton } from "~/components/ui/skeleton";
import { getImgSrc, getInitials } from "~/utils/misc";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";

export function FeaturedArticle() {
  const loaderData = useLoaderData() as Route.ComponentProps["loaderData"];
  return (
    <React.Suspense
      fallback={<Skeleton className="mb-4 h-72 w-full rounded-lg" />}
    >
      <Await resolve={loaderData.featuredArticle}>
        {(article) => (article ? <Article article={article} /> : null)}
      </Await>
    </React.Suspense>
  );
}

function Article({ article }: { article: Article }) {
  const stats = readingTime(article.markdown);
  const MAX_EXCERPT_LENGTH = 200;
  return (
    <Link
      to={`/articles/${article.slug}`}
      className="group mb-12 block"
      prefetch="intent"
    >
      <PrefetchPageLinks page={`/articles/${article.slug}`} />
      <article className="bg-muted grid gap-8 overflow-hidden rounded-2xl md:h-[300px] md:max-h-[300px] md:grid-cols-2">
        <div className="relative aspect-video md:aspect-auto md:h-[300px] md:max-h-[300px]">
          <img
            src={article.image}
            alt={article.title}
            className="h-full min-h-full w-full object-fill transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-blue-600 px-3 py-1 text-sm font-medium text-white">
              Featured
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-center p-8 md:h-full">
          <div className="mb-3 flex items-center gap-2 text-sm">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              {article.category.title}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">
              {format(article.createdAt, "MMMM dd, yyyy")}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">~ {stats.text}</span>
          </div>
          <h2 className="mb-4 text-2xl font-bold transition-colors group-hover:text-blue-600 md:text-3xl dark:group-hover:text-blue-400">
            {article.title}
          </h2>
          <p className="text-muted-foreground mb-6">
            {article.excerpt.length > MAX_EXCERPT_LENGTH
              ? `${article.excerpt.slice(0, MAX_EXCERPT_LENGTH)}...`
              : article.excerpt}
          </p>
          {"author" in article && article.author ? (
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage
                  src={
                    env.MODE === "development"
                      ? getImgSrc({
                          seed: article.author.name.split(" ")[0],
                        })
                      : article.author.image
                  }
                />
                <AvatarFallback>
                  {getInitials(article.author.name)}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-medium">{article.author.name}</p>
            </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
}
