import React from "react";
import type { Route } from "../+types/tutorial";
import { Await, useLoaderData, useRevalidator } from "react-router";
import { SideBarContainer } from "./sidebar-container";
import { ChartBar, Eye, Heart, MessageSquare } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";
import { EmptyState } from "~/components/empty-state";

export function Stats() {
  const loaderData = useLoaderData<Route.ComponentProps["loaderData"]>();
  const metrics = loaderData.metrics;
  const revalidator = useRevalidator();
  return (
    <React.Suspense fallback={<LoadingStats />}>
      <Await
        resolve={metrics}
        errorElement={
          <EmptyState
            icon={<ChartBar className="size-8 text-gray-400" />}
            title="Failed to load stats"
            description="Failed to load stats, click the reload button to reload the page."
            action={{
              label: "Reload",
              onClick: () => revalidator.revalidate(),
            }}
          />
        }
      >
        {(data) =>
          data ? (
            <ResolvedStats stats={data} />
          ) : (
            <EmptyState
              icon={<ChartBar className="size-10 text-gray-400" />}
              title="No engagement data yet"
              description="View and like statistics will be displayed here once available"
              className="pt-4"
            />
          )
        }
      </Await>
    </React.Suspense>
  );
}

function ResolvedStats({
  stats,
}: {
  stats: Awaited<Route.ComponentProps["loaderData"]["metrics"]>;
}) {
  if (!stats) return null;
  return (
    <SideBarContainer title="Stats">
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center text-gray-600 dark:text-gray-300">
            <Eye className="mr-2 h-4 w-4" />
            Views
          </span>
          <span className="font-medium">{stats.views.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center text-gray-600 dark:text-gray-300">
            <Heart className="mr-2 h-4 w-4" />
            Likes
          </span>
          <span className="font-medium">{stats._count.likes}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center text-gray-600 dark:text-gray-300">
            <MessageSquare className="mr-2 h-4 w-4" />
            Comments
          </span>
          <span className="font-medium">{stats._count.comments}</span>
        </div>
      </div>
    </SideBarContainer>
  );
}

function LoadingStats() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-12" />
      <Skeleton className="h-4" />
      <Skeleton className="h-4" />
      <Skeleton className="h-4" />
      <Skeleton className="h-4" />
    </div>
  );
}
