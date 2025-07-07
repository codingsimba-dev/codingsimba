/*
  Warnings:

  - You are about to drop the column `targetAdminId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetCourseId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetMemberId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `targetUserId` on the `AuditLog` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `AuditLog` table. All the data in the column will be lost.
  - Made the column `entityType` on table `AuditLog` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "category" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "retentionDays" INTEGER,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actorId" TEXT,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_AuditLog" ("action", "actorId", "category", "createdAt", "description", "entityId", "entityType", "id", "ipAddress", "metadata", "module", "retentionDays", "severity", "userAgent") SELECT "action", "actorId", "category", "createdAt", "description", "entityId", "entityType", "id", "ipAddress", "metadata", "module", "retentionDays", "severity", "userAgent" FROM "AuditLog";
DROP TABLE "AuditLog";
ALTER TABLE "new_AuditLog" RENAME TO "AuditLog";
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_category_idx" ON "AuditLog"("category");
CREATE INDEX "AuditLog_actorId_idx" ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_entityType_idx" ON "AuditLog"("entityType");
CREATE INDEX "AuditLog_entityId_idx" ON "AuditLog"("entityId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_module_createdAt_idx" ON "AuditLog"("module", "createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
