import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getSeed } from "~/utils/misc";
import { formatDistanceToNowStrict } from "date-fns";
import { Markdown } from "../mdx";
import { useOptionalUser } from "~/hooks/user";
import { useDelete, useUpdate } from "~/hooks/content";
import { CommentForm } from "./comment-form";
import { getImgSrc, getInitials } from "~/utils/misc";
import { userHasPermission } from "~/utils/permissions";
import type { CommentData } from "./comment";
import { ReplyIntent } from ".";
import { ReportButton } from "~/components/report-button";
import { CommentActions } from "./comment-actions";
import { UpvoteButton } from "../upvote-button";

type ReplyData = NonNullable<CommentData["replies"]>[0];

export function Reply({ reply }: { reply: ReplyData }) {
  const [replyBody, setReplyBody] = React.useState(reply.html);
  const [editReply, setEditReply] = React.useState(false);
  const user = useOptionalUser();

  const author = reply?.author;
  const userId = user?.id;
  const isOwner = userId === reply.authorId;

  const isLiked = reply.likes?.some((like) => like.userId === userId);
  const isFlagged = reply.flags?.some((flag) => flag.userId === userId);
  const totalLikes = reply?.likes?.reduce(
    (total, like) => total + like.count,
    0,
  );
  const userLikes =
    reply?.likes?.find((like) => like.userId === userId)?.count ?? 0;
  const canDelete = userHasPermission(
    user,
    isOwner ? "DELETE:REPLY:OWN" : "DELETE:REPLY:ANY",
  );
  const canUpdate = userHasPermission(
    user,
    isOwner ? "UPDATE:REPLY:OWN" : "UPDATE:REPLY:ANY",
  );

  const { submit: deleteReply, isPending: isDeleting } = useDelete({
    intent: ReplyIntent.DELETE_REPLY,
    data: {
      itemId: reply.id,
      userId: userId!,
    },
  });

  const { submit: updateReply, isPending: isUpdating } = useUpdate({
    intent: ReplyIntent.UPDATE_REPLY,
    data: {
      itemId: reply.id,
      userId: userId!,
      body: replyBody,
    },
  });

  function handleUpdateReply() {
    if (!replyBody) return;
    updateReply();
    setEditReply(false);
  }

  const anonymous = "Anonymous";

  const buttonClasses =
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
          <UpvoteButton
            size="sm"
            isLiked={isLiked}
            userLikes={userLikes}
            itemId={reply.id}
            contentType="reply"
            userId={userId!}
            totalLikes={totalLikes}
          />
          <CommentActions
            canUpdate={canUpdate}
            canDelete={canDelete}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            contentType="reply"
            onEdit={() => setEditReply(!editReply)}
            onDelete={deleteReply}
            className={buttonClasses}
          />
          {!isOwner && user ? (
            <ReportButton
              size="sm"
              itemId={reply.id}
              isFlagged={isFlagged}
              contentType="reply"
              showText={false}
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}
