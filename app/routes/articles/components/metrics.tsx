import React from "react";

import type { Route } from "../+types/article";
import { Await, useLoaderData, useRevalidator } from "react-router";
import { ChartBar, Eye } from "lucide-react";
import { cn } from "~/utils/misc";
import { useOptionalUser } from "~/hooks/user";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/empty-state";
import { ReportButton } from "~/components/report";
import { UpvoteButton } from "~/components/upvote";
import { BookmarkButton } from "~/components/bookmark";

/**
 * Props for the Metrics component
 */
interface MetricsProps {
  /** Additional CSS classes to apply to the metrics container */
  className?: string;
}

/**
 * Main metrics component that displays article engagement statistics.
 *
 * This component provides a comprehensive view of article metrics including:
 * - Upvote functionality with optimistic updates
 * - Bookmark management with tags and notes
 * - Content reporting/flagging system
 * - View count display
 * - Loading states and error handling
 *
 * The component handles asynchronous data loading with React Suspense and
 * provides fallback UI for loading, error, and empty states.
 *
 * @param {MetricsProps} props - Component configuration
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Metrics />
 *
 * // With custom styling
 * <Metrics className="my-custom-class" />
 * ```
 *
 * @returns {JSX.Element} A metrics display with engagement controls
 */
export function Metrics({ className }: MetricsProps) {
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
            <ResolvedMetrics metrics={metrics} className={className} />
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

/**
 * Props for the MetricsSkeleton component
 */
interface MetricsSkeletonProps {
  /** Additional CSS classes to apply to the skeleton container */
  className?: string;
}

/**
 * Skeleton loading component for the metrics display.
 *
 * Provides a placeholder UI that matches the layout of the actual metrics
 * component while data is being loaded. Shows 4 skeleton elements to
 * represent the upvote, bookmark, report, and views sections.
 *
 * @param {MetricsSkeletonProps} props - Component configuration
 * @param {string} [props.className] - Additional CSS classes
 *
 * @returns {JSX.Element} A skeleton loading state for metrics
 */
function MetricsSkeleton({ className }: MetricsSkeletonProps) {
  return (
    <div
      className={cn(
        "border-border mb-8 flex flex-col items-start justify-between border-b py-4",
        className,
      )}
    >
      <div className="flex items-center gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-12 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * Props for the ResolvedMetrics component
 */
interface ResolvedMetricsProps {
  /** The resolved metrics data from the loader */
  metrics: Awaited<Route.ComponentProps["loaderData"]["metrics"]>;
  /** Additional CSS classes to apply to the metrics container */
  className?: string;
}

/**
 * Resolved metrics component that displays the actual metrics data.
 *
 * This component processes the metrics data and renders the engagement controls:
 * - Calculates total likes and user-specific like count
 * - Determines bookmark and flag status for the current user
 * - Renders interactive buttons for upvoting, bookmarking, and reporting
 * - Displays view count
 *
 * The component uses React.useMemo for efficient data processing and
 * provides optimistic updates through the individual button components.
 *
 * @param {ResolvedMetricsProps} props - Component configuration
 * @param {Awaited<Route.ComponentProps["loaderData"]["metrics"]>} props.metrics - The metrics data
 * @param {string} [props.className] - Additional CSS classes
 *
 * @returns {JSX.Element} The resolved metrics display with engagement controls
 */
function ResolvedMetrics({ metrics, className }: ResolvedMetricsProps) {
  const user = useOptionalUser();
  const userId = user?.id;
  const LEAST_COUNT = 0;

  /**
   * Process metrics data to extract user-specific engagement information.
   *
   * This useMemo hook efficiently processes the metrics data in a single pass:
   * - Calculates total likes across all users
   * - Identifies likes given by the current user
   * - Determines if the current user has bookmarked the content
   * - Determines if the current user has flagged the content
   * - Computes whether the user has liked the content (userLikes > 0)
   *
   * The processing is optimized to avoid multiple array iterations and
   * provides fallback values when data is missing or user is not authenticated.
   */
  const { totalLikes, userLikes, isBookmarked, isFlagged, isLiked } =
    React.useMemo(() => {
      if (!metrics) {
        return {
          totalLikes: LEAST_COUNT,
          userLikes: LEAST_COUNT,
          isBookmarked: false,
          isFlagged: false,
          isLiked: false,
        };
      }

      let totalLikes = LEAST_COUNT;
      let userLikes = LEAST_COUNT;
      let isBookmarked = false;
      let isFlagged = false;

      // Single pass through likes array for optimal performance
      if (metrics.likes?.length) {
        totalLikes = 0;
        for (const like of metrics.likes) {
          totalLikes += like.count;
          if (like.userId === userId) {
            userLikes = like.count;
          }
        }
        if (totalLikes === 0) totalLikes = LEAST_COUNT;
      }

      // Check bookmarks and flags for current user
      isBookmarked =
        metrics.bookmarks?.some((bookmark) => bookmark.userId === userId) ??
        false;
      isFlagged =
        metrics.flags?.some((flag) => flag.userId === userId) ?? false;

      const isLiked = userLikes > LEAST_COUNT;

      return {
        totalLikes,
        userLikes,
        isBookmarked,
        isFlagged,
        isLiked,
      };
    }, [metrics, userId]);

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
          isLiked={isLiked}
          totalLikes={totalLikes}
          userLikes={userLikes}
          itemId={metrics?.id ?? ""}
          contentType="article"
          userId={userId!}
        />
        <BookmarkButton
          size="sm"
          isBookmarked={isBookmarked}
          itemId={metrics?.id ?? ""}
          contentType="article"
        />
        <ReportButton
          itemId={metrics?.id}
          isFlagged={isFlagged}
          contentType="article"
          size="sm"
        />
        <Views views={metrics?.views ?? LEAST_COUNT} />
      </div>
    </div>
  );
}

/**
 * Props for the Views component
 */
interface ViewsProps {
  /** Number of views to display */
  views: number;
  /** Additional CSS classes to apply to the views container */
  className?: string;
}

/**
 * Displays the view count for an article with an eye icon.
 *
 * This component renders a simple view counter with an eye icon and
 * the formatted view count. The count is formatted using toLocaleString()
 * for proper number formatting with commas.
 *
 * @param {ViewsProps} props - Component configuration
 * @param {number} props.views - Number of views to display
 * @param {string} [props.className] - Additional CSS classes
 *
 * @example
 * ```tsx
 * <Views views={1234} />
 * // Renders: 👁 1,234 views
 * ```
 *
 * @returns {JSX.Element} A view count display with eye icon
 */
function Views({ views, className }: ViewsProps) {
  return (
    <div className={cn("flex items-center space-x-1 text-sm", className)}>
      <Eye className="size-4" />
      <span>{views.toLocaleString()} views</span>
    </div>
  );
}
