/*
  Warnings:

  - You are about to drop the `ContentFlag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ContentFlag";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "ContentReport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "resolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    "resolvedById" TEXT,
    "contentId" TEXT,
    "commentId" TEXT,
    CONSTRAINT "ContentReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentReport_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ContentReport_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ContentReport_userId_idx" ON "ContentReport"("userId");

-- CreateIndex
CREATE INDEX "ContentReport_contentId_idx" ON "ContentReport"("contentId");

-- CreateIndex
CREATE INDEX "ContentReport_commentId_idx" ON "ContentReport"("commentId");

-- CreateIndex
CREATE INDEX "ContentReport_status_idx" ON "ContentReport"("status");

-- CreateIndex
CREATE INDEX "ContentReport_createdAt_idx" ON "ContentReport"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ContentReport_contentId_userId_key" ON "ContentReport"("contentId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentReport_commentId_userId_key" ON "ContentReport"("commentId", "userId");
