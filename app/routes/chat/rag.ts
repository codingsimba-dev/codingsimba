// // utils/chat.server.ts
// import { prisma } from "~/utils/db.server";

// export async function updateTokenUsage(
//   userId: string,
//   conversationId: string,
//   inputTokens: number,
//   outputTokens: number,
// ) {
//   const totalTokens = inputTokens + outputTokens;

//   await prisma.$transaction(async (tx) => {
//     // 1. Update the conversation totals
//     await tx.conversation.update({
//       where: { id: conversationId },
//       data: {
//         totalInputTokens: { increment: inputTokens },
//         totalOutputTokens: { increment: outputTokens },
//         totalTokens: { increment: totalTokens },
//       },
//     });

//     // 2. Update user's total token usage
//     await tx.user.update({
//       where: { id: userId },
//       data: {
//         totalTokensUsed: { increment: totalTokens },
//         monthlyTokens: { increment: totalTokens },
//       },
//     });
//   });
// }

// // Usage in your chat route
// export async function action({ request }: ActionFunctionArgs) {
//   const formData = await request.formData();
//   const question = formData.get("question") as string;
//   const conversationId = formData.get("conversationId") as string;
//   const userId = await getUserId(request);

//   try {
//     // Save user message
//     await prisma.message.create({
//       data: {
//         conversationId,
//         role: "user",
//         content: question,
//       },
//     });

//     // Get AI response
//     const response = await ragAssistant({ query: question, contexts: [] });

//     // Save assistant message with token counts
//     await prisma.message.create({
//       data: {
//         conversationId,
//         role: "assistant",
//         content: response.content,
//         inputTokens: response.usage.inputTokens,
//         outputTokens: response.usage.outputTokens,
//         totalTokens: response.usage.totalTokens,
//       },
//     });

//     // Update token usage
//     await updateTokenUsage(
//       userId,
//       conversationId,
//       response.usage.inputTokens,
//       response.usage.outputTokens,
//     );

//     return json({ answer: response.content });
//   } catch (error) {
//     return json({ error: "Failed to process question" }, { status: 500 });
//   }
// }
