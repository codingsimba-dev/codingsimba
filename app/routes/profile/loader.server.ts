import { prisma } from "~/utils/db.server";
import { getSubscription as getSubscriptionFromPolar } from "~/utils/subcription.server";

export async function getSubscription(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
    select: { subscriptionId: true },
  });
  if (!subscription) return null;
  return getSubscriptionFromPolar(subscription.subscriptionId);
}

export async function getUserProfle(userId: string) {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      isSubscribed: true,
      notificationSettings: true,
      image: { select: { fileKey: true } },
      _count: {
        select: {
          sessions: {
            where: {
              expirationDate: { gt: new Date() },
            },
          },
        },
      },
    },
  });
}

export async function getBookmarks(userId: string) {
  return prisma.bookmark.findMany({
    where: { userId },
    select: {
      id: true,
      notes: true,
      createdAt: true,
      content: {
        select: {
          id: true,
          sanityId: true,
          type: true,
          views: true,
        },
      },
      bookmarkTags: {
        select: {
          tag: {
            select: {
              name: true,
              color: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReports(userId: string) {
  return prisma.contentReport.findMany({
    where: { userId },
    select: {
      id: true,
      reason: true,
      details: true,
      status: true,
      createdAt: true,
      resolvedAt: true,
      content: {
        select: {
          id: true,
          sanityId: true,
          type: true,
        },
      },
      comment: {
        select: {
          id: true,
          body: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}
