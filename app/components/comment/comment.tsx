import React from "react";
import type { Route } from "../../routes/articles/+types/article";
import { useFetcher, useSearchParams } from "react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSquareQuote, ChevronDown } from "lucide-react";
import { Reply } from "./reply";
import { CommentForm } from "./form";
import { Markdown } from "../mdx";
import { useOptionalUser } from "~/hooks/user";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Report } from "~/components/report";
import { getImgSrc, getInitials } from "~/utils/misc";
import { Upvote } from "../upvote";
import { CommentActions } from "./comment-actions";
import {
  handleAddComment,
  handleDeleteComment,
  handleUpdateComment,
} from "./utils";
import { anonymous, anonymousSeed } from ".";

export type CommentData = NonNullable<
  Awaited<Route.ComponentProps["loaderData"]["comments"]>
>[0];

export function Comment({ comment }: { comment: CommentData }) {
  const [editComment, setEditComment] = React.useState(false);
  const [commentBody, setCommentBody] = React.useState(comment.html);
  const [reply, setReply] = React.useState("");
  const [showReplyForm, setShowReplyForm] = React.useState(false);

  const fetcher = useFetcher();
  const user = useOptionalUser();
  const [searchParams, setSearchParams] = useSearchParams();

  const replyTake = Number(searchParams.get("replyTake") ?? 3);

  const userId = user?.id;
  const author = comment?.author;
  const isOwner = userId === comment.authorId;

  const isReported = comment.reports.some((report) => report.userId === userId);
  const isLiked = comment.likes?.some((like) => like.userId === userId);
  const userLikes =
    comment?.likes?.find((like) => like.userId === userId)?.count ?? 0;
  const totalLikes = comment?.likes?.reduce(
    (total, like) => total + like.count,
    0,
  );

  function createReply() {
    if (!reply.trim()) return;
    handleAddComment({
      fetcher,
      body: reply,
      userId: user!.id,
      parentId: comment.id,
      itemId: comment.contentId,
    });
    setShowReplyForm(false);
    setReply("");
  }

  function updateComment() {
    if (!editComment) {
      setEditComment(true);
      return;
    }
    handleUpdateComment({
      fetcher,
      userId: user!.id,
      itemId: comment.id,
      body: commentBody,
    });
    setEditComment(false);
  }

  function deleteComment() {
    handleDeleteComment({
      fetcher,
      userId: user!.id,
      itemId: comment.id,
    });
  }

  function handleLoadMoreReplies() {
    setSearchParams(
      (prev) => {
        prev.set("replyTake", String(replyTake + 3));
        return prev;
      },
      { preventScrollReset: true },
    );
  }

  const buttonClasses =
    "flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground";
  return (
    <li className="border-border border-b pb-6 last:border-0">
      <div className="flex items-start space-x-2">
        <Avatar className="border-border -mt-0.5 size-8 border">
          <AvatarImage
            src={getImgSrc({
              fileKey: author?.image?.fileKey,
              seed: author?.name ?? anonymousSeed,
            })}
            alt={author?.name ?? anonymous}
          />
          <AvatarFallback>
            {getInitials(author?.name ?? anonymous)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 overflow-hidden">
          <div className="mb-1 flex items-center justify-between">
            <h4 className="font-medium">{author?.name ?? anonymous}</h4>
            <div className="flex gap-2 text-sm">
              {comment.replies?.length ? (
                <Badge>
                  {comment.replies.length}{" "}
                  {comment.replies.length === 1 ? "reply" : "replies"}
                </Badge>
              ) : null}
              <span className="text-muted-foreground">
                {formatDistanceToNowStrict(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </div>
          {editComment ? (
            <CommentForm
              isForUpdate
              comment={commentBody}
              setComment={setCommentBody}
              onSubmit={updateComment}
              onCancel={() => setEditComment(false)}
            />
          ) : (
            <div className="w-full overflow-x-auto">
              <Markdown source={comment.body} className="py-0 text-sm" />
            </div>
          )}
          <div className="mt-2 flex items-center space-x-4">
            <Upvote
              size="sm"
              isLiked={isLiked}
              userLikes={userLikes}
              itemId={comment.id}
              contentType="comment"
              userId={userId!}
              totalLikes={totalLikes}
            />
            {user ? (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className={buttonClasses}
                aria-label="reply comment"
              >
                <MessageSquareQuote className="mr-1 size-4" />
                Reply
              </button>
            ) : null}
            <CommentActions
              item={comment}
              contentType="comment"
              className={buttonClasses}
              onUpdate={updateComment}
              onDelete={deleteComment}
            />
            {!isOwner && user ? (
              <Report
                size="sm"
                itemId={comment.id}
                isReported={isReported}
                contentType="comment"
                showText={true}
              />
            ) : null}
          </div>
          {comment.replies?.length ? <Separator className="mb-6 mt-4" /> : null}
          {showReplyForm ? (
            <CommentForm
              comment={reply}
              setComment={setReply}
              onSubmit={createReply}
              onCancel={() => setShowReplyForm(false)}
            />
          ) : null}

          {/* Comment replies */}
          {comment.replies?.length ? (
            <ul className="mt-4 space-y-4 dark:border-gray-800">
              {comment.replies.map((reply, index) => (
                <div key={reply.id}>
                  <Reply reply={reply} />
                  {index < comment.replies!.length - 1 && (
                    <Separator className="my-4" />
                  )}
                </div>
              ))}
              {comment.replies.length >= replyTake && (
                <Button
                  variant="ghost"
                  className="mt-2 w-full"
                  onClick={handleLoadMoreReplies}
                >
                  <ChevronDown className="mr-2 size-4" />
                  Load More Replies
                </Button>
              )}
            </ul>
          ) : null}
        </div>
      </div>
    </li>
  );
}
