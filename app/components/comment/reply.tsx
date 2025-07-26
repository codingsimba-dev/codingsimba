import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getSeed } from "~/utils/misc";
import { formatDistanceToNowStrict } from "date-fns";
import { Markdown } from "../mdx";
import { useOptionalUser } from "~/hooks/user";
import { CommentForm } from "./form";
import { getImgSrc, getInitials } from "~/utils/misc";
import type { CommentData } from "./comment";
import { Report } from "~/components/report";
import { CommentActions } from "./comment-actions";
import { Upvote } from "../upvote";
import { handleDeleteComment, handleUpdateComment } from "./utils";
import { useFetcher } from "react-router";

export type ReplyData = NonNullable<CommentData["replies"]>[0];

export function Reply({ reply }: { reply: ReplyData }) {
  const [replyBody, setReplyBody] = React.useState(reply.html);
  const [editReply, setEditReply] = React.useState(false);
  const user = useOptionalUser();
  const fetcher = useFetcher();

  const author = reply?.author;
  const userId = user?.id;
  const isOwner = userId === reply.authorId;

  const isLiked = reply.likes?.some((like) => like.userId === userId);
  const isReported = reply.reports?.some((report) => report.userId === userId);
  const totalLikes = reply?.likes?.reduce(
    (total, like) => total + like.count,
    0,
  );
  const userLikes =
    reply?.likes?.find((like) => like.userId === userId)?.count ?? 0;

  function updateReply() {
    if (!editReply) {
      setEditReply(true);
      return;
    }
    handleUpdateComment({
      fetcher,
      userId: user!.id,
      itemId: reply.id,
      body: replyBody,
    });
    setEditReply(false);
  }

  function deleteReply() {
    handleDeleteComment({
      fetcher,
      userId: user!.id,
      itemId: reply.id,
    });
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
            onSubmit={updateReply}
            onCancel={() => setEditReply(false)}
          />
        ) : (
          <div className="overflow-x-auto">
            <Markdown source={reply.body} className="py-1 !text-sm" />
          </div>
        )}
        <div className="mt-2 flex items-center gap-4">
          <Upvote
            size="sm"
            isLiked={isLiked}
            userLikes={userLikes}
            itemId={reply.id}
            contentType="comment"
            userId={userId!}
            totalLikes={totalLikes}
          />
          <CommentActions
            item={reply}
            contentType="reply"
            className={buttonClasses}
            onUpdate={updateReply}
            onDelete={deleteReply}
          />
          {!isOwner && user ? (
            <Report
              size="sm"
              itemId={reply.id}
              isReported={isReported}
              contentType="comment"
              showText={false}
            />
          ) : null}
        </div>
      </div>
    </li>
  );
}
