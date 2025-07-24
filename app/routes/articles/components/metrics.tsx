import React from "react";

import type { Route } from "../+types/article";
import { Await, useFetcher, useLoaderData, useRevalidator } from "react-router";
import { ChartBar, Eye } from "lucide-react";
import { cn } from "~/utils/misc";
import { useOptionalUser } from "~/hooks/user";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/empty-state";
import { FlagDialog } from "~/components/flag-dialog";
import { UpvoteButton } from "~/components/upvote-button";
import { BookmarkButton } from "~/components/bookmark-button";

type Like = {
  count: number;
  userId: string;
};

export function Metrics({ className }: { className?: string }) {
  const loaderData = useLoaderData<Route.ComponentProps["loaderData"]>();
  const metrics = loaderData.metrics;
  const revalidator = useRevalidator();
  return (
    <React.Suspense fallback={<MetricsSkeleton className={className} />}>
      <Await
        resolve={metrics}
        errorElement={
          <EmptyState
            icon={<ChartBar className="text-muted-foreground size-10" />}
            title="Failed to load metrics"
            description="Failed to load metrics, click the reload button to reload the page."
            action={{
              label: "Reload",
              onClick: () => revalidator.revalidate(),
            }}
            className="mb-6"
          />
        }
      >
        {(metrics) =>
          metrics ? (
            <ArticleMetricsContent metrics={metrics} className={className} />
          ) : (
            <EmptyState
              icon={<ChartBar className="text-muted-foreground size-10" />}
              title="No metrics"
              description="This article has no metrics."
              className="mb-2 pt-4"
            />
          )
        }
      </Await>
    </React.Suspense>
  );
}

function MetricsSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "border-border mb-8 flex flex-col items-start justify-between border-b py-4",
        className,
      )}
    >
      <div className="flex items-center space-x-6">
        <Skeleton className="h-4 w-8 rounded-xl" />
        <Skeleton className="h-4 w-8 rounded-xl" />
        <Skeleton className="h-4 w-14 rounded-xl" />
      </div>
    </div>
  );
}

function ArticleMetricsContent({
  metrics,
  className,
}: {
  metrics: Awaited<Route.ComponentProps["loaderData"]["metrics"]>;
  className?: string;
}) {
  const fetcher = useFetcher();
  const user = useOptionalUser();
  const userId = user?.id;
  const MAX_LIKES = 5;
  const LEAST_COUNT = 0;

  const { totalLikes, userLikes, isBookmarked, isFlagged } =
    React.useMemo(() => {
      const totalLikes =
        metrics?.likes?.reduce(
          (total: number, like: Like) => total + like.count,
          0,
        ) ?? LEAST_COUNT;
      const userLikes =
        metrics?.likes.find((like: Like) => like.userId === userId)?.count ??
        LEAST_COUNT;
      const isBookmarked =
        metrics?.bookmarks.some((bookmark) => bookmark.userId === userId) ??
        false;
      const isFlagged =
        metrics?.flags.some((flag) => flag.userId === userId) ?? false;
      return { totalLikes, userLikes, isBookmarked, isFlagged };
    }, [metrics, userId]);

  const [optimisticState, setOptimisticState] = React.useState({
    totalLikes,
    userLikes,
  });

  React.useEffect(() => {
    if (metrics) {
      setOptimisticState({
        totalLikes,
        userLikes,
      });
    }
  }, [metrics, totalLikes, userLikes]);

  function handleUpvote() {
    if (optimisticState.userLikes >= MAX_LIKES) return;
    setOptimisticState((prev) => ({
      totalLikes: prev.totalLikes + 1,
      userLikes: prev.userLikes + 1,
    }));

    fetcher.submit(
      {
        intent: "upvote-article",
        data: JSON.stringify({ itemId: metrics?.id ?? "", userId: userId! }),
      },
      { method: "post" },
    );
  }

  function handleBookmark() {
    fetcher.submit(
      {
        intent: "bookmark-article",
        data: JSON.stringify({ itemId: metrics?.id ?? "", userId: userId! }),
      },
      { method: "post" },
    );
  }

  if (!metrics) return <MetricsSkeleton className={className} />;
  return (
    <div
      className={cn(
        "border-border mb-8 flex flex-col items-start justify-between border-b py-4",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-4">
        <UpvoteButton
          onUpvote={handleUpvote}
          totalLikes={optimisticState.totalLikes}
          isFilled={optimisticState.userLikes > LEAST_COUNT}
          isDisabled={optimisticState.userLikes >= MAX_LIKES}
          showMaxLabel={true}
        />
        <BookmarkButton
          isBookmarked={isBookmarked}
          onBookmark={handleBookmark}
        />
        <FlagDialog
          itemId={metrics?.id}
          isFlagged={isFlagged}
          contentType="article"
          size="sm"
          showText={false}
        />
        <Views views={metrics?.views ?? LEAST_COUNT} />
      </div>
    </div>
  );
}

function Views({ views, className }: { views: number; className?: string }) {
  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <Eye className="size-5" />
      <span>{views.toLocaleString()} views</span>
    </div>
  );
}
