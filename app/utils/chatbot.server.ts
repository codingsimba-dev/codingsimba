import { prisma } from "~/utils/db.server";

export async function getLessonConversation({
  userId,
  lessonId,
}: {
  userId: string;
  lessonId: string;
}) {
  return prisma.conversation.findFirst({
    select: {
      id: true,
      title: true,
      createdAt: true,
      messages: {
        select: {
          content: true,
          createdAt: true,
          role: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
    where: {
      userId,
      documentId: lessonId,
    },
  });
}
