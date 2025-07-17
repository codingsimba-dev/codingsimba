/*
  Warnings:

  - You are about to drop the `AIUsage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `isActive` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `lastMessageAt` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `messageCount` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `confidence` on the `ConversationMessage` table. All the data in the column will be lost.
  - You are about to drop the column `isMerged` on the `ConversationMessage` table. All the data in the column will be lost.
  - You are about to drop the column `mergedAt` on the `ConversationMessage` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `ConversationMessage` table. All the data in the column will be lost.
  - You are about to drop the column `sources` on the `ConversationMessage` table. All the data in the column will be lost.
  - You are about to drop the column `tokensUsed` on the `ConversationMessage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AIUsage_createdAt_idx";

-- DropIndex
DROP INDEX "AIUsage_usageMonth_idx";

-- DropIndex
DROP INDEX "AIUsage_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AIUsage";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "AIInteraction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'learning_assistant',
    "conversationId" TEXT,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "costInCents" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "usageMonth" TEXT NOT NULL,
    "sources" JSONB,
    "confidence" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AIInteraction_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "documentId" TEXT,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Conversation" ("createdAt", "documentId", "id", "title", "updatedAt", "userId") SELECT "createdAt", "documentId", "id", "title", "updatedAt", "userId" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE INDEX "Conversation_userId_idx" ON "Conversation"("userId");
CREATE INDEX "Conversation_documentId_idx" ON "Conversation"("documentId");
CREATE INDEX "Conversation_createdAt_idx" ON "Conversation"("createdAt");
CREATE INDEX "Conversation_userId_documentId_idx" ON "Conversation"("userId", "documentId");
CREATE TABLE "new_ConversationMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ConversationMessage" ("content", "conversationId", "createdAt", "id", "role", "updatedAt") SELECT "content", "conversationId", "createdAt", "id", "role", "updatedAt" FROM "ConversationMessage";
DROP TABLE "ConversationMessage";
ALTER TABLE "new_ConversationMessage" RENAME TO "ConversationMessage";
CREATE INDEX "ConversationMessage_conversationId_idx" ON "ConversationMessage"("conversationId");
CREATE INDEX "ConversationMessage_createdAt_idx" ON "ConversationMessage"("createdAt");
CREATE INDEX "ConversationMessage_role_idx" ON "ConversationMessage"("role");
CREATE INDEX "ConversationMessage_conversationId_createdAt_idx" ON "ConversationMessage"("conversationId", "createdAt");
CREATE INDEX "ConversationMessage_conversationId_role_idx" ON "ConversationMessage"("conversationId", "role");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "AIInteraction_userId_idx" ON "AIInteraction"("userId");

-- CreateIndex
CREATE INDEX "AIInteraction_conversationId_idx" ON "AIInteraction"("conversationId");

-- CreateIndex
CREATE INDEX "AIInteraction_usageMonth_idx" ON "AIInteraction"("usageMonth");

-- CreateIndex
CREATE INDEX "AIInteraction_createdAt_idx" ON "AIInteraction"("createdAt");

-- CreateIndex
CREATE INDEX "AIInteraction_type_idx" ON "AIInteraction"("type");

-- CreateIndex
CREATE INDEX "AIInteraction_success_idx" ON "AIInteraction"("success");
