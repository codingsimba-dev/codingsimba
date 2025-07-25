import React from "react";
import type { Route } from "../../routes/articles/+types/article";
import { useSearchParams } from "react-router";
import { formatDistanceToNowStrict } from "date-fns";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { MessageSquareQuote, ChevronDown, Loader } from "lucide-react";
import { Reply } from "./reply";
import { CommentForm } from "./comment-form";
import { Markdown } from "../mdx";
import { useOptionalUser } from "~/hooks/user";
import { useDelete, useCreate, useUpdate } from "~/hooks/content";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { getSeed } from "~/utils/misc";
import { ReportButton } from "~/components/report-button";
import { getImgSrc, getInitials } from "~/utils/misc";
import { userHasPermission } from "~/utils/permissions";
import { CommentIntent, ReplyIntent } from ".";
import { UpvoteButton } from "../upvote-button";
import { CommentActions } from "./comment-actions";

export type CommentData = NonNullable<
  Awaited<Route.ComponentProps["loaderData"]["comments"]>
>[0];

export function Comment({ comment }: { comment: CommentData }) {
  const [editComment, setEditComment] = React.useState(false);
  const [commentBody, setCommentBody] = React.useState(comment.html);
  const [reply, setReply] = React.useState("");
  const [showReplyForm, setShowReplyForm] = React.useState(false);

  const [searchParams, setSearchParams] = useSearchParams();
  const user = useOptionalUser();

  const replyTake = Number(searchParams.get("replyTake") ?? 3);

  const userId = user?.id;
  const author = comment?.author;
  const isOwner = userId === comment.authorId;

  const isFlagged = comment.flags.some((flag) => flag.userId === userId);
  const isLiked = comment.likes?.some((like) => like.userId === userId);
  const userLikes =
    comment?.likes?.find((like) => like.userId === userId)?.count ?? 0;
  const totalLikes = comment?.likes?.reduce(
    (total, like) => total + like.count,
    0,
  );

  const canDelete = userHasPermission(
    user,
    isOwner ? "DELETE:COMMENT:OWN" : "DELETE:COMMENT:ANY",
  );
  const canUpdate = userHasPermission(
    user,
    isOwner ? "UPDATE:COMMENT:OWN" : "UPDATE:COMMENT:ANY",
  );

  const { submit: submitReply, isPending: isCreating } = useCreate({
    intent: ReplyIntent.ADD_REPLY,
    data: {
      userId: userId!,
      itemId: comment.contentId,
      parentId: comment.id,
      body: reply,
    },
  });

  const { submit: deleteComment, isPending: isDeleting } = useDelete(
    {
      intent: CommentIntent.DELETE_COMMENT,
      data: {
        itemId: comment.id,
        userId: userId!,
      },
    },
    { showSuccessToast: true },
  );

  const { submit: updateComment, isPending: isUpdating } = useUpdate({
    intent: CommentIntent.UPDATE_COMMENT,
    data: {
      itemId: comment.id,
      userId: userId!,
      body: commentBody,
    },
  });

  const handleReplySubmit = () => {
    if (!reply.trim()) return;
    submitReply();
    setShowReplyForm(false);
    setReply("");
  };

  const handleUpdateSubmit = () => {
    if (!commentBody.trim()) return;
    updateComment();
    setEditComment(false);
  };

  const handleLoadMoreReplies = () => {
    setSearchParams(
      (prev) => {
        prev.set("replyTake", String(replyTake + 3));
        return prev;
      },
      { preventScrollReset: true },
    );
  };

  const anonymous = "Anonymous";

  const buttonClasses =
    "flex items-center space-x-1 text-sm text-muted-foreground hover:text-foreground";
  return (
    <li className="border-border border-b pb-6 last:border-0">
      <div className="flex items-start space-x-2">
        <Avatar className="border-border -mt-0.5 size-8 border">
          <AvatarImage
            src={getImgSrc({
              path: "users",
              fileKey: author?.image?.fileKey,
              seed: getSeed(author?.name ?? anonymous),
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
              onSubmit={handleUpdateSubmit}
              onCancel={() => setEditComment(false)}
            />
          ) : (
            <div className="overflow-x-auto">
              <Markdown source={comment.body} className="py-0 text-sm" />
            </div>
          )}
          <div className="mt-2 flex items-center space-x-4">
            <UpvoteButton
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
                aria-label={isCreating ? "replying comment" : "reply comment"}
              >
                {isCreating ? (
                  <Loader className="mr-1 size-4 animate-spin" />
                ) : (
                  <MessageSquareQuote className="mr-1 size-4" />
                )}
                Reply
              </button>
            ) : null}
            <CommentActions
              canUpdate={canUpdate}
              canDelete={canDelete}
              isUpdating={isUpdating}
              isDeleting={isDeleting}
              contentType="comment"
              onEdit={() => setEditComment(true)}
              onDelete={deleteComment}
              className={buttonClasses}
            />
            {!isOwner && user ? (
              <ReportButton
                size="sm"
                itemId={comment.id}
                isFlagged={isFlagged}
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
              onSubmit={handleReplySubmit}
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
