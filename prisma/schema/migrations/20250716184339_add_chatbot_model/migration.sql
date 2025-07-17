/*
  Warnings:

  - You are about to drop the `AIInteraction` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `ConversationMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AIInteraction_success_idx";

-- DropIndex
DROP INDEX "AIInteraction_type_idx";

-- DropIndex
DROP INDEX "AIInteraction_createdAt_idx";

-- DropIndex
DROP INDEX "AIInteraction_usageMonth_idx";

-- DropIndex
DROP INDEX "AIInteraction_conversationId_idx";

-- DropIndex
DROP INDEX "AIInteraction_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AIInteraction";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "documentId" TEXT,
    "title" TEXT,
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
    "userId" TEXT NOT NULL,
    "documentId" TEXT,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "aiUsageType" TEXT NOT NULL DEFAULT 'learning_assistant',
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "costInCents" INTEGER NOT NULL DEFAULT 0,
    "conversationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ConversationMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ConversationMessage" ("content", "conversationId", "createdAt", "id", "role", "updatedAt") SELECT "content", "conversationId", "createdAt", "id", "role", "updatedAt" FROM "ConversationMessage";
DROP TABLE "ConversationMessage";
ALTER TABLE "new_ConversationMessage" RENAME TO "ConversationMessage";
CREATE INDEX "ConversationMessage_userId_idx" ON "ConversationMessage"("userId");
CREATE INDEX "ConversationMessage_documentId_idx" ON "ConversationMessage"("documentId");
CREATE INDEX "ConversationMessage_conversationId_idx" ON "ConversationMessage"("conversationId");
CREATE INDEX "ConversationMessage_createdAt_idx" ON "ConversationMessage"("createdAt");
CREATE INDEX "ConversationMessage_role_idx" ON "ConversationMessage"("role");
CREATE INDEX "ConversationMessage_aiUsageType_idx" ON "ConversationMessage"("aiUsageType");
CREATE INDEX "ConversationMessage_userId_documentId_idx" ON "ConversationMessage"("userId", "documentId");
CREATE INDEX "ConversationMessage_conversationId_createdAt_idx" ON "ConversationMessage"("conversationId", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
