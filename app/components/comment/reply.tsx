import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatDistanceToNowStrict } from "date-fns";
import { Markdown } from "../mdx";
import { useOptionalUser } from "~/hooks/user";
import { CommentForm } from "./form";
import { getImgSrc, getInitials } from "~/utils/misc";
import type { CommentData } from "./comment";
import { Report } from "~/components/report";
import { Upvote } from "../upvote";
import { useFetcher } from "react-router";
import { anonymous, anonymousSeed, CommentIntent } from ".";
import { DeleteComment } from "./delete-comment";
import { UpdateComment } from "./update-comment";

export type ReplyData = NonNullable<CommentData["replies"]>[0];

export function Reply({ reply }: { reply: ReplyData }) {
  const [replyBody, setReplyBody] = React.useState(reply.html);
  const [editReply, setEditReply] = React.useState(false);

  const user = useOptionalUser();
  const fetcher = useFetcher({ key: CommentIntent.UPDATE_COMMENT });

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
    fetcher.submit(
      {
        intent: CommentIntent.UPDATE_COMMENT,
        data: JSON.stringify({ userId, itemId: reply.id, body: replyBody }),
      },
      { method: "post" },
    );
    setEditReply(false);
  }

  return (
    <li className="overflow-hidden">
      <div className="mb-1 flex items-start gap-2">
        <Avatar className="border-border size-6 border">
          <AvatarImage
            src={getImgSrc({
              fileKey: author?.image?.fileKey,
              seed: author?.name ?? anonymousSeed,
            })}
            alt={author?.name ?? anonymous}
          />
          <AvatarFallback>
            {getInitials(author?.name ?? anonymousSeed)}
          </AvatarFallback>
        </Avatar>
        <div className="w-full">
          <div className="flex w-full items-center justify-between">
            <h5 className="text-sm font-medium">{author?.name ?? anonymous}</h5>
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
              <Markdown
                source={reply.body}
                className="mx-auto max-w-3xl py-1 !text-sm"
              />
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
            <DeleteComment item={reply} contentType="reply" />
            <UpdateComment
              item={reply}
              contentType="reply"
              onUpdate={updateReply}
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
      </div>
    </li>
  );
}
