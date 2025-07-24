import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { FilePenLine, Heart, Loader, Trash2 } from "lucide-react";
import { cn, getSeed } from "~/utils/misc";
import { formatDistanceToNowStrict } from "date-fns";
import { Markdown } from "../mdx";
import { useOptionalUser } from "~/hooks/user";
import { useUpvote, useDelete, useUpdate } from "~/hooks/content";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { CommentForm } from "./comment-form";
import { useNavigate } from "react-router";
import { getImgSrc, getInitials, requireAuth } from "~/utils/misc";
import { userHasPermission } from "~/utils/permissions";
import type { CommentData } from "./comment";
import { ReplyIntent } from ".";
import { FlagDialog } from "~/components/flag-dialog";

type ReplyData = NonNullable<CommentData["replies"]>[0];

export function Reply({ reply }: { reply: ReplyData }) {
  const [replyBody, setReplyBody] = React.useState(reply.html);
  const [editReply, setEditReply] = React.useState(false);
  const navigate = useNavigate();
  const user = useOptionalUser();

  const author = reply?.author;
  const userId = user?.id;
  const isOwner = userId === reply.authorId;

  const isLiked = reply.likes?.some((like) => like.userId === userId);
  const totalLikes = reply?.likes?.reduce(
    (total, like) => total + like.count,
    0,
  );

  const canDelete = userHasPermission(
    user,
    isOwner ? "DELETE:REPLY:OWN" : "DELETE:REPLY:ANY",
  );
  const canUpdate = userHasPermission(
    user,
    isOwner ? "UPDATE:REPLY:OWN" : "UPDATE:REPLY:ANY",
  );

  const {
    submit: deleteReply,
    isPending: isDeleting,
    submittedData: deletedData,
  } = useDelete({
    intent: ReplyIntent.DELETE_REPLY,
    data: {
      itemId: reply.id,
      userId: userId!,
    },
  });

  const isDeletingReply = isDeleting && deletedData?.get("itemId") === reply.id;

  const {
    submit: upvoteReply,
    isPending: isUpvoting,
    submittedData: upvotedData,
  } = useUpvote({
    intent: ReplyIntent.UPVOTE_REPLY,
    data: {
      itemId: reply.id,
      userId: userId!,
    },
  });
  const isUpvotingReply = isUpvoting && upvotedData?.get("itemId") === reply.id;

  const {
    submit: updateReply,
    isPending: isUpdating,
    submittedData: updatedData,
  } = useUpdate({
    intent: ReplyIntent.UPDATE_REPLY,
    data: {
      itemId: reply.id,
      userId: userId!,
      body: replyBody,
    },
  });
  const isUpdatingReply = isUpdating && updatedData?.get("itemId") === reply.id;

  function handleUpdateReply() {
    if (!replyBody) return;
    updateReply();
    setEditReply(false);
  }

  const anonymous = "Anonymous";

  const basicButtonClasses =
    "space-x-1 text-sm text-muted-foreground hover:text-foreground";
  return (
    <li>
      <div className="overflow-hidden">
        <div className="mb-1 flex items-center justify-between">
          <div className="flex items-center gap-x-4">
            <Avatar className="border-border size-6 border">
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
            <h5 className="text-sm font-medium">{author?.name ?? anonymous}</h5>
          </div>
          <span className="text-muted-foreground text-xs">
            {formatDistanceToNowStrict(new Date(reply.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        {editReply ? (
          <CommentForm
            isForUpdate
            comment={replyBody}
            setComment={setReplyBody}
            onSubmit={handleUpdateReply}
            onCancel={() => setEditReply(false)}
          />
        ) : (
          <div className="overflow-x-auto">
            <Markdown source={reply.body} className="py-1 !text-sm" />
          </div>
        )}
        <div className="mt-2 flex items-center gap-4">
          <button
            onClick={requireAuth({ fn: upvoteReply, user, navigate })}
            className={cn(basicButtonClasses, "flex items-center")}
            aria-label={isUpvotingReply ? "Upvoting" : "Upvote"}
          >
            <Heart
              className={cn("size-4", {
                "fill-red-500 text-red-500": isLiked,
                "animate-bounce": isUpvotingReply,
              })}
            />
            <span>{totalLikes}</span>
          </button>

          {canUpdate ? (
            <button
              onClick={() => setEditReply(!editReply)}
              disabled={isUpdatingReply}
              className={basicButtonClasses}
              aria-label={isUpdatingReply ? "Updating" : "Update"}
            >
              {isUpdatingReply ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <FilePenLine className="text-primary size-4" />
              )}
            </button>
          ) : null}
          {canDelete ? (
            <AlertDialog>
              <AlertDialogTrigger disabled={isDeletingReply}>
                {isDeletingReply ? (
                  <Loader className="size-4 animate-spin" />
                ) : (
                  <Trash2 className="text-destructive size-4" />
                )}
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to delete this reply?
                  </AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>No</AlertDialogCancel>
                  <AlertDialogAction onClick={deleteReply}>
                    Yes
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
          <FlagDialog
            itemId={reply.id}
            isFlagged={false}
            contentType="reply"
            size="sm"
            showText={false}
          />
        </div>
      </div>
    </li>
  );
}
