import React from "react";
import type { Route as ArticleRoute } from "../../routes/articles/+types/article";
import type { Route as TutorialRoute } from "../../routes/tutorials/+types/tutorial";
import { MessageSquareOff } from "lucide-react";
import { EmptyState } from "../empty-state";
import { CommentForm } from "./comment-form";
import { Comment } from "./comment";
import { useOptionalUser } from "~/hooks/user";
import { Badge } from "../ui/badge";
import { useCreate } from "~/hooks/content";
import { Await, Link, useLoaderData, useSearchParams } from "react-router";
import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import { Separator } from "../ui/separator";

export function Comments() {
  const loaderData = useLoaderData<
    | ArticleRoute.ComponentProps["loaderData"]
    | TutorialRoute.ComponentProps["loaderData"]
  >();
  const [comment, setComment] = React.useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const commentTake = Number(searchParams.get("commentTake")) || 5;
  const user = useOptionalUser();

  const itemId =
    "article" in loaderData ? loaderData.article.id : loaderData.tutorial.id;

  const { submit } = useCreate({
    itemId: itemId,
    userId: user?.id as string,
    intent: "add-comment",
    body: comment,
  });

  const handleSubmit = () => {
    if (!comment.trim()) return;
    submit();
    setComment("");
  };

  const handleLoadMoreComments = () => {
    setSearchParams(
      (prev) => {
        prev.set("commentTake", String(commentTake + 5));
        return prev;
      },
      { preventScrollReset: true },
    );
  };

  return (
    <section className="mb-8" id="comments">
      <React.Suspense fallback={<div>Loading...</div>}>
        <Await resolve={loaderData.comments}>
          {(comments) => (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">
                  Comments ({comments.length})
                </h3>
                {!user ? (
                  <Badge asChild>
                    <Link to={"/signin"}>Signin to add a comment</Link>
                  </Badge>
                ) : null}
              </div>
              <Separator className="my-4" />
              {user ? (
                <CommentForm
                  comment={comment}
                  setComment={setComment}
                  onSubmit={handleSubmit}
                />
              ) : null}

              {comments?.length ? (
                <>
                  <ul className="space-y-6">
                    {comments.map((comment) => (
                      <Comment key={comment.id} comment={comment} />
                    ))}
                  </ul>
                  {comments.length >= commentTake && (
                    <Button
                      variant="ghost"
                      className="mt-4 w-full"
                      onClick={handleLoadMoreComments}
                    >
                      <ChevronDown className="mr-2 size-4" />
                      Load More Comments
                    </Button>
                  )}
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
