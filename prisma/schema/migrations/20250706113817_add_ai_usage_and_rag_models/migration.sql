/*
  Warnings:

  - You are about to drop the column `lastWebhookAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `lastWebhookType` on the `Subscription` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "AIUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'learning_assistant',
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "costInCents" INTEGER NOT NULL DEFAULT 0,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "usageMonth" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chunkType" TEXT NOT NULL DEFAULT 'TEXT',
    "chunkIndex" INTEGER NOT NULL,
    "embedding" BLOB NOT NULL,
    "metadata" JSONB,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "type" TEXT NOT NULL DEFAULT 'individual',
    "plan" TEXT NOT NULL DEFAULT 'basic',
    "currentPeriodStart" DATETIME,
    "currentPeriodEnd" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT,
    "teamId" TEXT,
    CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Subscription_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Subscription" ("createdAt", "currentPeriodEnd", "currentPeriodStart", "id", "plan", "status", "subscriptionId", "teamId", "type", "updatedAt", "userId") SELECT "createdAt", "currentPeriodEnd", "currentPeriodStart", "id", "plan", "status", "subscriptionId", "teamId", "type", "updatedAt", "userId" FROM "Subscription";
DROP TABLE "Subscription";
ALTER TABLE "new_Subscription" RENAME TO "Subscription";
CREATE UNIQUE INDEX "Subscription_subscriptionId_key" ON "Subscription"("subscriptionId");
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX "Subscription_teamId_key" ON "Subscription"("teamId");
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");
CREATE INDEX "Subscription_teamId_idx" ON "Subscription"("teamId");
CREATE INDEX "Subscription_currentPeriodEnd_idx" ON "Subscription"("currentPeriodEnd");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "AIUsage_userId_idx" ON "AIUsage"("userId");

-- CreateIndex
CREATE INDEX "AIUsage_usageMonth_idx" ON "AIUsage"("usageMonth");

-- CreateIndex
CREATE INDEX "AIUsage_createdAt_idx" ON "AIUsage"("createdAt");

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_chunkIndex_idx" ON "DocumentChunk"("documentId", "chunkIndex");
