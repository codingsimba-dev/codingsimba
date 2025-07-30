import { invariant, invariantResponse } from "~/utils/misc";
import { prisma } from "../db.server";
import type {
  Content,
  ContentType,
  FlagReason,
} from "~/generated/prisma/client";
import { MarkdownConverter } from "../misc.server";
import { StatusCodes } from "http-status-codes";
import { requireUserWithPermission } from "~/utils/permissions.server";
import { z } from "zod";

export const ActionSchema = z.object({
  intent: z.string(),
  data: z.record(z.union([z.string(), z.null()])),
});

export type ActionPayload = z.infer<typeof ActionSchema>;

/**
 * Adds a new comment or reply to an article or tutorial
 * @param sanityId - The Sanity.io document ID of the article or tutorial (if it's a comment)
 * @param contentId - The ID of the content to add the reply to (if it's a reply)
 * @param body - The comment content in HTML format
 * @param userId - The ID of the user creating the comment
 * @param parentId - The ID of the parent comment (if it's a reply)
 * @returns The created comment or reply  ID
 * @throws {Error} If comment body is missing
 */
export async function addComment(data: ActionPayload["data"]) {
  const { itemId, body, userId, parentId, type } = data;
  invariant(itemId, "Item ID is required");
  invariant(body, "Comment body is required to add  a comment");
  invariant(type, "Type is required");
  const contentType = type as ContentType;
  let content: Pick<Content, "id"> | undefined = undefined;
  if (!parentId) {
    content = await prisma.content.upsert({
      where: { sanityId_type: { sanityId: itemId, type: contentType } },
      create: { sanityId: itemId, type: contentType },
      update: {},
      select: { id: true },
    });
  }
  const comment = await prisma.comment.create({
    data: {
      authorId: userId,
      contentId: parentId ? itemId : content!.id,
      parentId: parentId ?? null,
      body: MarkdownConverter.toMarkdown(body),
    },
    select: { id: true },
  });
  return comment;
}

/**
 * Updates an existing comment
 * @param request - The HTTP request object for permission checking
 * @param itemId - The ID of the comment to update
 * @param body - The new comment content in HTML format
 * @returns The updated comment with its ID
 * @throws {Error} If comment not found, body is missing, or user lacks UPDATE:COMMENT:OWN permission
 */
export async function updateComment(
  request: Request,
  { itemId, body }: ActionPayload["data"],
) {
  invariant(body, "Comment body is required");
  invariant(itemId, "Item ID is required");
  const comment = await prisma.comment.findUnique({
    where: { id: itemId },
    select: { id: true },
  });
  invariant(comment, "Comment not found");
  invariantResponse(
    await requireUserWithPermission(request, "UPDATE:COMMENT:OWN"),
    "Unauthorized: You don't have permission to update this comment",
    { status: StatusCodes.FORBIDDEN },
  );
  const updatedComment = await prisma.comment.update({
    where: { id: itemId },
    data: { body: MarkdownConverter.toMarkdown(body) },
    select: { id: true },
  });
  return updatedComment;
}

/**
 * Deletes a comment
 * @param request - The HTTP request object for permission checking
 * @param itemId - The ID of the comment to delete
 * @param userId - The ID of the user attempting to delete
 * @returns Object indicating successful deletion
 * @throws {Error} If comment not found, user ID is missing, or user lacks DELETE:COMMENT:OWN permission
 */
export async function deleteComment(
  request: Request,
  { itemId, userId }: ActionPayload["data"],
) {
  invariant(userId, "User ID is required");
  invariant(itemId, "Item ID is required");
  const comment = await prisma.comment.findUnique({
    where: { id: itemId },
    select: { id: true },
  });
  invariantResponse(comment, "Comment not found", {
    status: StatusCodes.NOT_FOUND,
  });
  invariantResponse(
    await requireUserWithPermission(request, "DELETE:COMMENT:OWN"),
    "Unauthorized: You don't have permission to delete this comment",
    { status: StatusCodes.FORBIDDEN },
  );

  await prisma.comment.delete({
    where: { id: itemId },
  });

  return { success: true };
}

/**
 * Toggles upvote status for an article or tutorial
 * @param itemId - The ID of the article or tutorial to upvote
 * @param userId - The ID of the user upvoting
 * @returns The updated like record with its ID
 * @throws {Error} If item ID is missing
 */
export async function upvoteContent(data: ActionPayload["data"]) {
  const { itemId, userId } = data;
  invariant(itemId, "Item ID is required");
  invariant(userId, "User ID is required");
  const upsertLike = await prisma.like.upsert({
    where: { contentId_userId: { contentId: itemId, userId } },
    update: { count: { increment: 1 } },
    create: { contentId: itemId, userId, count: 1 },
    select: { id: true },
  });
  return upsertLike;
}

/**
 * Toggles upvote status for a comment
 * @param itemId - The ID of the comment to upvote
 * @param userId - The ID of the user upvoting
 * @returns The updated like record with its ID
 * @throws {Error} If item ID is missing
 */
export async function upvoteComment(data: ActionPayload["data"]) {
  const { itemId, userId } = data;
  invariant(itemId, "Item ID is required");
  invariant(userId, "User ID is required");
  const upsertLike = await prisma.like.upsert({
    where: { commentId_userId: { commentId: itemId, userId } },
    update: { count: { increment: 1 } },
    create: { commentId: itemId, userId, count: 1 },
    select: { id: true },
  });
  return upsertLike;
}

/**
 * Tracks a page view for an article or tutorial
 * @param pageId - The Sanity.io document ID of the article or tutorial
 * @param type - The type of the content
 * @returns The updated content record with its ID
 * @description Creates a new content record if it doesn't exist, otherwise increments the view count
 */
export async function trackPageView(data: ActionPayload["data"]) {
  const { pageId, type } = data;
  invariant(pageId, "Page ID is required");
  invariant(type, "Type is required");
  const contentType = type as ContentType;
  const content = await prisma.content.upsert({
    where: { sanityId: pageId },
    create: { sanityId: pageId, type: contentType, views: 1 },
    update: { views: { increment: 1 } },
    select: { id: true },
  });
  return content;
}

/**
 * Creates a new flag for an article or tutorial
 * @param pageId - The Sanity.io document ID of the article or tutorial
 * @param userId - The ID of the user flagging the article or tutorial
 * @param reason - The reason for flagging the article or tutorial
 * @param details - The details of the flag
 * @returns The created report with its ID
 * @throws {Error} If page ID or user ID is missing
 */
export async function reportContent(data: ActionPayload["data"]) {
  const { itemId: pageId, userId, reason, details } = data;
  invariant(pageId, "Page ID is required");
  invariant(userId, "User ID is required");
  invariant(reason, "Reason is required");
  const reportReason = reason.toUpperCase() as FlagReason;
  const content = await prisma.content.findUniqueOrThrow({
    where: { sanityId: pageId },
    select: { id: true },
  });
  const report = await prisma.contentReport.create({
    data: { contentId: content.id, userId, reason: reportReason, details },
    select: { id: true },
  });
  return report;
}

/**
 * Creates a new flag for a comment
 * @param itemId - The ID of the comment to flag
 * @param userId - The ID of the user flagging the comment
 * @param reason - The reason for flagging the comment
 * @param details - The details of the flag
 * @returns The created report with its ID
 * @throws {Error} If item ID or user ID is missing
 */
export async function reportComment(data: ActionPayload["data"]) {
  const { itemId, userId, reason, details } = data;
  invariant(itemId, "Item ID is required");
  invariant(userId, "User ID is required");
  invariant(reason, "Reason is required");
  const reportReason = reason.toUpperCase() as FlagReason;
  const report = await prisma.contentReport.create({
    data: { commentId: itemId, userId, reason: reportReason, details },
    select: { id: true },
  });
  return report;
}

/**
 * Deletes a report
 * @param itemId - The ID of the report to delete
 * @param userId - The ID of the user deleting the report
 * @returns Object indicating successful deletion
 * @throws {Error} If item ID or user ID is missing
 */
export async function deleteReport(data: ActionPayload["data"]) {
  const { itemId, userId } = data;
  invariant(itemId, "Item ID is required");
  invariant(userId, "User ID is required");
  await prisma.contentReport.deleteMany({
    where: {
      OR: [
        { contentId: itemId, userId },
        { commentId: itemId, userId },
      ],
    },
  });
  return { success: true };
}

/**
 * Creates a new bookmark for an article or tutorial
 * @param itemId - The Sanity.io document ID of the article or tutorial
 * @param userId - The ID of the user bookmarking the article or tutorial
 * @returns The created bookmark with its ID
 * @throws {Error} If page ID or user ID is missing
 */
export async function bookmarkContent(data: ActionPayload["data"]) {
  const { itemId: pageId, userId, tags, notes } = data;
  invariant(pageId, "Item ID is required");
  invariant(userId, "User ID is required");

  const tagNames = cleanTags(tags);
  const content = await prisma.content.findUniqueOrThrow({
    where: { sanityId: pageId },
    select: { id: true },
  });
  const bookmark = await prisma.bookmark.create({
    data: {
      contentId: content.id,
      userId,
      notes,
      bookmarkTags: {
        create: createBookmarkTags(tagNames, userId),
      },
    },
    select: { id: true },
  });
  if (!bookmark) {
    return { success: false };
  }
  return { success: true };
}

/**
 * Updates a bookmark
 * @param itemId - The ID of the bookmark to update
 * @param userId - The ID of the user updating the bookmark
 * @param tags - The tags for the bookmark
 * @param notes - The notes for the bookmark
 * @returns The updated bookmark with its ID
 * @throws {Error} If item ID or user ID is missing
 */
export async function updateBookmark(data: ActionPayload["data"]) {
  const { itemId, userId, tags, notes } = data;
  invariant(itemId, "Item ID is required");
  invariant(userId, "User ID is required");
  const tagNames = cleanTags(tags);

  const bookmark = await prisma.bookmark.update({
    where: { id: itemId, userId },
    data: {
      userId,
      notes,
      bookmarkTags: {
        deleteMany: {},
        create: createBookmarkTags(tagNames, userId),
      },
    },
    select: { id: true },
  });
  if (!bookmark) {
    return { success: false };
  }
  return { success: true };
}

/**
 * Cleans tags by splitting them into an array of strings and removing empty strings
 * @param tags - The tags to clean
 * @returns The cleaned tags
 */
function cleanTags(tags: string | null): string[] {
  return (
    tags
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean) ?? []
  );
}

/**
 * Creates bookmark tags by connecting or creating them
 * @param tags - The tags to create
 * @param userId - The ID of the user creating the tags
 * @returns The created tags
 */
function createBookmarkTags(tags: string[], userId: string) {
  return tags.map((tagName) => ({
    tag: {
      connectOrCreate: {
        where: { name_userId: { name: tagName, userId } },
        create: { name: tagName, userId },
      },
    },
  }));
}

/**
 * Deletes a bookmark
 * @param itemId - The ID of the bookmark to delete
 * @param userId - The ID of the user deleting the bookmark
 * @returns Object indicating successful deletion
 * @throws {Error} If item ID or user ID is missing
 */
export async function deleteBookmark(data: ActionPayload["data"]) {
  const { itemId, userId } = data;
  invariant(itemId, "Item ID is required");
  invariant(userId, "User ID is required");
  await prisma.bookmark.delete({
    where: { id: itemId, userId },
  });
  return { success: true };
}
