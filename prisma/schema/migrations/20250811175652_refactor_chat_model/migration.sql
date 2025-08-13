/*
  Warnings:

  - You are about to drop the `ConversationMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Document` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DocumentChunk` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "ConversationMessage_conversationId_createdAt_idx";

-- DropIndex
DROP INDEX "ConversationMessage_userId_documentId_idx";

-- DropIndex
DROP INDEX "ConversationMessage_aiUsageType_idx";

-- DropIndex
DROP INDEX "ConversationMessage_role_idx";

-- DropIndex
DROP INDEX "ConversationMessage_createdAt_idx";

-- DropIndex
DROP INDEX "ConversationMessage_conversationId_idx";

-- DropIndex
DROP INDEX "ConversationMessage_documentId_idx";

-- DropIndex
DROP INDEX "ConversationMessage_userId_idx";

-- DropIndex
DROP INDEX "DocumentChunk_documentId_chunkIndex_idx";

-- DropIndex
DROP INDEX "DocumentChunk_documentId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ConversationMessage";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Document";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "DocumentChunk";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "content" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tokenCount" INTEGER,
    "metadata" JSONB,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "document_chunks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chunkType" TEXT NOT NULL DEFAULT 'TEXT',
    "chunkIndex" INTEGER NOT NULL,
    "embedding" BLOB NOT NULL,
    "metadata" JSONB,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "document_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "documents" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "source" TEXT,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "query_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "originalQuery" TEXT NOT NULL,
    "expandedQuery" TEXT,
    "rewrittenQueries" JSONB,
    "intent" TEXT,
    "chunksRetrieved" INTEGER NOT NULL DEFAULT 0,
    "avgSimilarity" REAL,
    "confidence" REAL,
    "useContextual" BOOLEAN NOT NULL DEFAULT false,
    "responseTime" INTEGER,
    "userFeedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "embedding_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT NOT NULL,
    "dimensions" INTEGER NOT NULL,
    "provider" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "metrics" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "documentId" TEXT,
    "tokenUsage" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB
);
INSERT INTO "new_Conversation" ("createdAt", "documentId", "id", "title", "updatedAt", "userId") SELECT "createdAt", "documentId", "id", "title", "updatedAt", "userId" FROM "Conversation";
DROP TABLE "Conversation";
ALTER TABLE "new_Conversation" RENAME TO "Conversation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "document_chunks_documentId_idx" ON "document_chunks"("documentId");

-- CreateIndex
CREATE INDEX "document_chunks_documentId_chunkIndex_idx" ON "document_chunks"("documentId", "chunkIndex");

-- CreateIndex
CREATE INDEX "document_chunks_chunkType_idx" ON "document_chunks"("chunkType");

-- CreateIndex
CREATE INDEX "documents_createdAt_idx" ON "documents"("createdAt");

-- CreateIndex
CREATE INDEX "query_logs_intent_idx" ON "query_logs"("intent");

-- CreateIndex
CREATE INDEX "query_logs_createdAt_idx" ON "query_logs"("createdAt");

-- CreateIndex
CREATE INDEX "query_logs_confidence_idx" ON "query_logs"("confidence");

-- CreateIndex
CREATE INDEX "embedding_versions_isActive_idx" ON "embedding_versions"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "embedding_versions_modelName_modelVersion_key" ON "embedding_versions"("modelName", "modelVersion");
