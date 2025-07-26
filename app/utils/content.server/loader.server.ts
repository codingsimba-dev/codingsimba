import type { ContentType } from "~/generated/prisma/client";
import { getArticleIdBySlug } from "./articles/utils";
import { prisma } from "../db.server";
import { MarkdownConverter } from "~/utils/misc.server";
import { bundleMDX } from "mdx-bundler";

/**
 * Retrieves metrics for article or tutorial by slug or id including views, likes, and comment counts
 * @param slugOrId - The slug or id of the article or tutorial
 * @param type - The type of the content
 * @returns Object containing content metrics and likes, or undefined if content not found
 */
export async function getContentMetrics({
  slugOrId,
  type,
}: {
  slugOrId: string;
  type: ContentType;
}) {
  const isArticle = type === "ARTICLE";
  let articleId: string | undefined = undefined;
  if (isArticle) {
    articleId = await getArticleIdBySlug(slugOrId);
  }
  if (!articleId && isArticle) {
    return null;
  }
  return await prisma.content.findUnique({
    where: {
      sanityId: isArticle ? articleId : slugOrId,
      type,
    },
    select: {
      id: true,
      sanityId: true,
      views: true,
      bookmarks: {
        select: {
          id: true,
          userId: true,
          notes: true,
          bookmarkTags: {
            select: {
              tag: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
      reports: {
        select: {
          userId: true,
        },
      },
      likes: {
        select: {
          count: true,
          userId: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });
}

/**
 * Retrieves comments and their replies for an article or tutorial by slug or id
 * @param slugOrId - The slug or id of the article or tutorial
 * @param type - The type of the content
 * @param commentTake - Number of comments to retrieve
 * @param replyTake - Number of replies to retrieve per comment
 * @returns Array of comments with their associated replies and author information
 */
export async function getContentComments({
  slugOrId,
  type,
  commentTake,
  replyTake,
}: {
  slugOrId: string;
  type: ContentType;
  commentTake: number;
  replyTake: number;
}) {
  const isArticle = type === "ARTICLE";
  let articleId: string | undefined = undefined;
  if (isArticle) {
    articleId = await getArticleIdBySlug(slugOrId);
  }
  if (!articleId && isArticle) {
    return [];
  }

  const content = await prisma.content.findUnique({
    where: { sanityId: isArticle ? articleId : slugOrId, type },
    select: { id: true },
  });

  if (!content) {
    return [];
  }

  const comments = await prisma.comment.findMany({
    where: {
      contentId: content.id,
      parentId: null,
    },
    select: {
      id: true,
      body: true,
      reports: {
        select: {
          userId: true,
        },
      },
      likes: {
        select: { count: true, userId: true },
      },
      createdAt: true,
      authorId: true,
      parentId: true,
      contentId: true,
      author: {
        select: {
          id: true,
          name: true,
          image: { select: { fileKey: true } },
        },
      },
      replies: {
        select: {
          id: true,
          body: true,
          reports: {
            select: {
              userId: true,
            },
          },
          likes: {
            select: { count: true, userId: true },
          },
          createdAt: true,
          authorId: true,
          parentId: true,
          contentId: true,
          author: {
            select: {
              id: true,
              name: true,
              image: { select: { fileKey: true } },
            },
          },
        },
        take: replyTake,
        orderBy: {
          createdAt: "desc",
        },
      },
    },
    take: commentTake,
    orderBy: {
      createdAt: "desc",
    },
  });

  return await Promise.all(
    comments?.map(async (comment) => ({
      ...comment,
      markdown: comment.body,
      html: await MarkdownConverter.toHtml(comment.body),
      body: (await bundleMDX({ source: comment.body })).code,
      replies: await Promise.all(
        (comment.replies || []).map(async (reply) => ({
          ...reply,
          markdown: reply.body,
          html: await MarkdownConverter.toHtml(reply.body),
          body: (await bundleMDX({ source: reply.body })).code,
        })),
      ),
    })) ?? [],
  );
}
