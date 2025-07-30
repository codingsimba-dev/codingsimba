/*
  Warnings:

  - You are about to drop the column `slug` on the `Content` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sanityId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Content" ("createdAt", "id", "sanityId", "type", "updatedAt", "views") SELECT "createdAt", "id", "sanityId", "type", "updatedAt", "views" FROM "Content";
DROP TABLE "Content";
ALTER TABLE "new_Content" RENAME TO "Content";
CREATE UNIQUE INDEX "Content_sanityId_key" ON "Content"("sanityId");
CREATE INDEX "Content_type_views_idx" ON "Content"("type", "views");
CREATE INDEX "Content_createdAt_type_idx" ON "Content"("createdAt", "type");
CREATE INDEX "Content_views_idx" ON "Content"("views");
CREATE UNIQUE INDEX "Content_sanityId_type_key" ON "Content"("sanityId", "type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
