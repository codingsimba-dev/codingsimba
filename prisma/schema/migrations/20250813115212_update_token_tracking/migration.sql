/*
  Warnings:

  - You are about to drop the column `tokenUsage` on the `Conversation` table. All the data in the column will be lost.
  - You are about to drop the column `tokenCount` on the `Message` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "documentId" TEXT,
    "userId" TEXT NOT NULL,
    "totalInputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalOutputTokens" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Conversation" ("createdAt", "documentId", "id", "metadata", "title", "updatedAt", "userId") SELECT "createdAt", "documentId", "id", "metadata", "title", "updatedAt", "userId" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
CREATE TABLE "new_Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "content" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "inputTokens" INTEGER,
    "outputTokens" INTEGER,
    "totalTokens" INTEGER,
    "metadata" JSONB,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Message" ("content", "conversationId", "id", "metadata", "role", "timestamp") SELECT "content", "conversationId", "id", "metadata", "role", "timestamp" FROM "Message";
DROP TABLE "Message";
ALTER TABLE "new_Message" RENAME TO "Message";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "polarCustomerId" TEXT,
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "totalTokensUsed" INTEGER NOT NULL DEFAULT 0,
    "monthlyTokens" INTEGER NOT NULL DEFAULT 0,
    "lastTokenReset" DATETIME,
    "lastSeenAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "isSubscribed", "lastSeenAt", "name", "polarCustomerId", "updatedAt") SELECT "createdAt", "email", "id", "isSubscribed", "lastSeenAt", "name", "polarCustomerId", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_polarCustomerId_key" ON "User"("polarCustomerId");
CREATE INDEX "User_lastSeenAt_idx" ON "User"("lastSeenAt");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
