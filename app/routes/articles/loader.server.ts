import { getArticleIdBySlug } from "~/utils/content.server/articles/utils";
import { prisma } from "~/utils/db.server";
import { bundleMDX } from "~/utils/mdx.server";
import { MarkdownConverter } from "~/utils/misc.server";

/**
 * Retrieves metrics for a specific article including views, likes, and comment counts
 * @param articleSlug - The slug of the article
 * @returns Object containing article metrics and likes, or undefined if article not found
 */
export async function getArticleMetrics({
  articleSlug,
}: {
  articleSlug: string;
}) {
  const articleId = await getArticleIdBySlug(articleSlug);
  if (!articleId) {
    return null;
  }
  return await prisma.content.findUnique({
    where: {
      sanityId: articleId,
    },
    select: {
      id: true,
      views: true,
      bookmarks: {
        select: {
          userId: true,
        },
      },
      flags: {
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
 * Retrieves comments and their replies for a specific article
 * @param articleSlug - The slug of the article
 * @param commentTake - Number of comments to retrieve
 * @param replyTake - Number of replies to retrieve per comment
 * @returns Array of comments with their associated replies and author information
 */
export async function getArticleComments({
  articleSlug,
  commentTake,
  replyTake,
}: {
  articleSlug: string;
  commentTake: number;
  replyTake: number;
}) {
  const articleId = await getArticleIdBySlug(articleSlug);
  if (!articleId) {
    return [];
  }

  const content = await prisma.content.findUnique({
    where: { sanityId: articleId },
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
      flags: {
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
          flags: {
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
