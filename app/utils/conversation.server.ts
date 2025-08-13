// /**
//  * @fileoverview Conversation Management for RAG Chatbot System
//  *
//  * This module provides conversation persistence and management for the RAG chatbot,
//  * including:
//  * - Creating and managing conversation sessions
//  * - Storing and retrieving conversation messages with AI usage tracking
//  * - Conversation history retrieval
//  * - Message tracking with token counts and costs
//  *
//  * The system ensures that conversations are tied to specific documents and users,
//  * allowing for contextual chat experiences with proper history management.
//  */

// import { prisma } from "./db.server";
// import type {
//   AIUsageType,
//   Conversation,
//   ConversationMessage,
// } from "~/generated/prisma/client";

// /**
//  * Creates a new conversation for a user and document
//  */
// export async function createConversation({
//   userId,
//   documentId,
//   title,
// }: {
//   userId: string;
//   documentId?: string;
//   title?: string;
// }): Promise<Conversation> {
//   return await prisma.conversation.create({
//     data: {
//       userId,
//       documentId,
//       title,
//     },
//   });
// }

// /**
//  * Gets or creates a conversation for a user and document
//  */
// export async function getOrCreateConversation({
//   userId,
//   documentId,
//   title,
// }: {
//   userId: string;
//   documentId?: string;
//   title?: string;
// }): Promise<Conversation> {
//   // Try to find existing conversation for this user and document
//   const existingConversation = await prisma.conversation.findFirst({
//     where: {
//       userId,
//       documentId,
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   if (existingConversation) {
//     return existingConversation;
//   }

//   // Create new conversation if none exists
//   return await createConversation({ userId, documentId, title });
// }

// /**
//  * Adds a user message to a conversation
//  */
// export async function addUserMessage({
//   userId,
//   conversationId,
//   documentId,
//   content,
//   aiUsageType = "learning_assistant",
//   tokensUsed = 0,
//   costInCents = 0,
// }: {
//   userId: string;
//   conversationId?: string;
//   documentId?: string;
//   content: string;
//   aiUsageType?: AIUsageType;
//   tokensUsed?: number;
//   costInCents?: number;
// }): Promise<ConversationMessage> {
//   return await prisma.conversationMessage.create({
//     data: {
//       userId,
//       conversationId,
//       documentId,
//       role: "user",
//       content,
//       aiUsageType,
//       tokensUsed,
//       costInCents,
//     },
//   });
// }

// /**
//  * Adds an assistant message to a conversation
//  */
// export async function addAssistantMessage({
//   userId,
//   conversationId,
//   documentId,
//   content,
//   aiUsageType = "learning_assistant",
//   tokensUsed = 0,
//   costInCents = 0,
// }: {
//   userId: string;
//   conversationId?: string;
//   documentId?: string;
//   content: string;
//   aiUsageType?: "learning_assistant" | "chatbot" | "code_review";
//   tokensUsed?: number;
//   costInCents?: number;
// }): Promise<ConversationMessage> {
//   return await prisma.conversationMessage.create({
//     data: {
//       userId,
//       conversationId,
//       documentId,
//       role: "assistant",
//       content,
//       aiUsageType,
//       tokensUsed,
//       costInCents,
//     },
//   });
// }

// /**
//  * Gets the previous assistant message for a conversation
//  */
// export async function getPreviousAnswer(
//   conversationId: string,
// ): Promise<string | null> {
//   const previousMessage = await prisma.conversationMessage.findFirst({
//     where: {
//       conversationId,
//       role: "assistant",
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   return previousMessage?.content || null;
// }

// /**
//  * Gets conversation history for a user and document
//  */
// export async function getConversationHistory({
//   userId,
//   documentId,
//   limit = 50,
// }: {
//   userId: string;
//   documentId: string;
//   limit?: number;
// }): Promise<Conversation[]> {
//   return await prisma.conversation.findMany({
//     where: {
//       userId,
//       documentId,
//     },
//     include: {
//       messages: {
//         orderBy: {
//           createdAt: "asc",
//         },
//         take: limit,
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });
// }

// /**
//  * Gets messages for a specific conversation
//  */
// export async function getConversationMessages({
//   conversationId,
//   limit = 50,
// }: {
//   conversationId: string;
//   limit?: number;
// }): Promise<ConversationMessage[]> {
//   return await prisma.conversationMessage.findMany({
//     where: {
//       conversationId,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//     take: limit,
//   });
// }

// /**
//  * Gets all messages for a user and document (with or without conversation grouping)
//  */
// export async function getUserDocumentMessages({
//   userId,
//   documentId,
//   limit = 50,
// }: {
//   userId: string;
//   documentId: string;
//   limit?: number;
// }): Promise<ConversationMessage[]> {
//   return await prisma.conversationMessage.findMany({
//     where: {
//       userId,
//       documentId,
//     },
//     orderBy: {
//       createdAt: "asc",
//     },
//     take: limit,
//   });
// }

// /**
//  * Gets conversation statistics for a user
//  */
// export async function getConversationStats(userId: string): Promise<{
//   totalConversations: number;
//   totalMessages: number;
//   averageMessagesPerConversation: number;
// }> {
//   const [totalConversations, totalMessages] = await Promise.all([
//     prisma.conversation.count({
//       where: { userId },
//     }),
//     prisma.conversationMessage.count({
//       where: { userId },
//     }),
//   ]);

//   const averageMessagesPerConversation =
//     totalConversations > 0 ? totalMessages / totalConversations : 0;

//   return {
//     totalConversations,
//     totalMessages,
//     averageMessagesPerConversation: Math.round(averageMessagesPerConversation),
//   };
// }

// /**
//  * Gets AI usage statistics for a user
//  */
// export async function getAIUsageStats(userId: string): Promise<{
//   totalMessages: number;
//   totalTokensUsed: number;
//   totalCostInCents: number;
//   messagesByType: Record<string, number>;
//   messagesByRole: Record<string, number>;
// }> {
//   const messages = await prisma.conversationMessage.findMany({
//     where: { userId },
//     select: {
//       role: true,
//       aiUsageType: true,
//       tokensUsed: true,
//       costInCents: true,
//     },
//   });

//   const totalMessages = messages.length;
//   const totalTokensUsed = messages.reduce((sum, m) => sum + m.tokensUsed, 0);
//   const totalCostInCents = messages.reduce((sum, m) => sum + m.costInCents, 0);

//   const messagesByType = messages.reduce(
//     (acc, m) => {
//       acc[m.aiUsageType] = (acc[m.aiUsageType] || 0) + 1;
//       return acc;
//     },
//     {} as Record<string, number>,
//   );

//   const messagesByRole = messages.reduce(
//     (acc, m) => {
//       acc[m.role] = (acc[m.role] || 0) + 1;
//       return acc;
//     },
//     {} as Record<string, number>,
//   );

//   return {
//     totalMessages,
//     totalTokensUsed,
//     totalCostInCents,
//     messagesByType,
//     messagesByRole,
//   };
// }

// /**
//  * Gets monthly AI usage for a user
//  */
// export async function getMonthlyAIUsage(
//   userId: string,
//   year: number,
//   month: number,
// ): Promise<{
//   messages: ConversationMessage[];
//   totalTokens: number;
//   totalCost: number;
//   messageCount: number;
// }> {
//   const startDate = new Date(year, month - 1, 1);
//   const endDate = new Date(year, month, 0);

//   const messages = await prisma.conversationMessage.findMany({
//     where: {
//       userId,
//       createdAt: {
//         gte: startDate,
//         lte: endDate,
//       },
//     },
//     orderBy: {
//       createdAt: "desc",
//     },
//   });

//   const totalTokens = messages.reduce((sum, m) => sum + m.tokensUsed, 0);
//   const totalCost = messages.reduce((sum, m) => sum + m.costInCents, 0);

//   return {
//     messages,
//     totalTokens,
//     totalCost,
//     messageCount: messages.length,
//   };
// }
