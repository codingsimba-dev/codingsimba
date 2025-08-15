import React from "react";
import type { Route as ArticleRoute } from "../../routes/articles/+types/article";
import type { Route as TutorialRoute } from "../../routes/tutorials/+types/tutorial";
import { Loader, MessageSquareOff } from "lucide-react";
import { EmptyState } from "../empty-state";
import { CommentForm } from "./form";
import { Comment } from "./comment";
import { useOptionalUser } from "~/hooks/user";
import {
  Await,
  useFetcher,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from "react-router";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { Separator } from "../ui/separator";

export const anonymous = "Anonymous";
export const anonymousSeed = "Doe";

export enum CommentIntent {
  ADD_COMMENT = "ADD_COMMENT",
  UPDATE_COMMENT = "UPDATE_COMMENT",
  DELETE_COMMENT = "DELETE_COMMENT",
  UPVOTE_COMMENT = "UPVOTE_COMMENT",
}

export function Comments() {
  const loaderData = useLoaderData<
    | ArticleRoute.ComponentProps["loaderData"]
    | TutorialRoute.ComponentProps["loaderData"]
  >();
  const [comment, setComment] = React.useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const commentTake = Number(searchParams.get("commentTake") ?? 5);
  const user = useOptionalUser();
  const navigation = useNavigation();
  const fetcher = useFetcher({ key: CommentIntent.ADD_COMMENT });

  const item =
    "article" in loaderData ? loaderData.article : loaderData.tutorial;
  const itemId = item.id;

  function addComment() {
    if (!comment.trim()) return;
    fetcher.submit(
      {
        intent: CommentIntent.ADD_COMMENT,
        data: JSON.stringify({
          itemId,
          parentId: null,
          body: comment,
          userId: user!.id,
        }),
      },
      { method: "post" },
    );
  }

  React.useEffect(() => {
    if (fetcher.state === "idle") {
      setComment("");
    }
  }, [fetcher.state]);

  function handleLoadMoreComments() {
    setSearchParams(
      (prev) => {
        prev.set("commentTake", String(commentTake + 5));
        return prev;
      },
      { preventScrollReset: true },
    );
  }

  return (
    <section className="mb-8" id="comments">
      <React.Suspense fallback={<CommentSkeleton />}>
        <Await resolve={loaderData.comments}>
          {(comments) => (
            <>
              <h3 className="text-xl font-bold">
                Comments ({comments.length})
              </h3>
              <Separator className="my-4" />
              <CommentForm
                comment={comment}
                setComment={setComment}
                onSubmit={addComment}
              />
              {comments?.length ? (
                <>
                  <ul className="mt-4 space-y-4">
                    {comments.map((comment) => (
                      <Comment key={comment.id} comment={comment} />
                    ))}
                  </ul>
                  {comments.length >= commentTake ? (
                    <Button
                      variant="ghost"
                      className="mt-4 w-full"
                      onClick={handleLoadMoreComments}
                      disabled={navigation.state !== "idle"}
                    >
                      {navigation.state !== "idle" ? (
                        <Loader className="mr-2 size-4 animate-spin" />
                      ) : (
                        <ChevronDown className="mr-2 size-4" />
                      )}
                      Load More Comments
                    </Button>
                  ) : null}
                </>
              ) : (
                <EmptyState
                  icon={<MessageSquareOff className="size-8" />}
                  title="No comments yet"
                  description="Be the first to share your thoughts on this article!"
                  className="py-6"
                />
              )}
            </>
          )}
        </Await>
      </React.Suspense>
    </section>
  );
}

function CommentSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="bg-muted h-6 w-32 animate-pulse rounded" />
        <div className="bg-muted h-4 w-16 animate-pulse rounded" />
      </div>
      {/* Render multiple comment skeletons */}
      {Array.from({ length: 3 }).map((_, index) => (
        <IndividualCommentSkeleton key={index} />
      ))}
    </div>
  );
}

/**
 * Skeleton component for individual Comment loading states.
 *
 * Provides a placeholder representation of a comment while data is loading.
 * Matches the typical structure of a comment with user info, content, and actions.
 *
 * @returns {JSX.Element} A skeleton placeholder for a comment
 */
function IndividualCommentSkeleton() {
  return (
    <li className="space-y-3">
      <div className="flex items-start space-x-3">
        {/* Avatar skeleton */}
        <div className="bg-muted h-8 w-8 flex-shrink-0 animate-pulse rounded-full" />

        <div className="flex-1 space-y-2">
          {/* User info and timestamp */}
          <div className="flex items-center space-x-2">
            <div className="bg-muted h-4 w-20 animate-pulse rounded" />
            <div className="bg-muted h-3 w-16 animate-pulse rounded" />
          </div>

          {/* Comment content */}
          <div className="space-y-2">
            <div className="bg-muted h-4 w-full animate-pulse rounded" />
            <div className="bg-muted h-4 w-3/4 animate-pulse rounded" />
            <div className="bg-muted h-4 w-1/2 animate-pulse rounded" />
          </div>

          {/* Action buttons skeleton */}
          <div className="flex items-center space-x-4 pt-2">
            <div className="bg-muted h-6 w-12 animate-pulse rounded" />
            <div className="bg-muted h-6 w-12 animate-pulse rounded" />
            <div className="bg-muted h-6 w-16 animate-pulse rounded" />
          </div>
        </div>
      </div>

      {/* Nested replies skeleton (optional - shows for some comments) */}
      {Math.random() > 0.7 && (
        <div className="ml-11 space-y-2">
          <div className="flex items-start space-x-3">
            <div className="bg-muted h-6 w-6 flex-shrink-0 animate-pulse rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="flex items-center space-x-2">
                <div className="bg-muted h-3 w-16 animate-pulse rounded" />
                <div className="bg-muted h-3 w-12 animate-pulse rounded" />
              </div>
              <div className="bg-muted h-3 w-2/3 animate-pulse rounded" />
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
