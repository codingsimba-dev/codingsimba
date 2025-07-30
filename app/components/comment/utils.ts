/* eslint-disable @typescript-eslint/no-explicit-any */
import type { FetcherWithComponents } from "react-router";
import { CommentIntent } from ".";

export async function handleUpdateComment({
  userId,
  itemId,
  body,
  fetcher,
}: {
  userId: string;
  itemId: string;
  body: string;
  fetcher: FetcherWithComponents<any>;
}) {
  fetcher.submit(
    {
      intent: CommentIntent.UPDATE_COMMENT,
      data: JSON.stringify({ userId, itemId, body }),
    },
    { method: "post" },
  );
}

export async function handleAddComment({
  userId,
  itemId,
  body,
  parentId,
  fetcher,
}: {
  userId: string;
  itemId: string;
  parentId: string | null;
  body: string;
  fetcher: FetcherWithComponents<any>;
}) {
  fetcher.submit(
    {
      intent: CommentIntent.ADD_COMMENT,
      data: JSON.stringify({
        userId,
        itemId,
        body,
        parentId,
      }),
    },
    { method: "post" },
  );
}

export async function handleDeleteComment({
  userId,
  itemId,
  fetcher,
}: {
  userId: string;
  itemId: string;
  fetcher: FetcherWithComponents<any>;
}) {
  fetcher.submit(
    {
      intent: CommentIntent.DELETE_COMMENT,
      data: JSON.stringify({ userId, itemId }),
    },
    { method: "post" },
  );
}
