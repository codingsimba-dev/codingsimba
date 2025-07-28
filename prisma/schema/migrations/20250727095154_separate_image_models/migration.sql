/*
  Warnings:

  - You are about to drop the `Image` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `preferences` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Badge` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Image_badgeId_key";

-- DropIndex
DROP INDEX "Image_teamSettingsId_key";

-- DropIndex
DROP INDEX "Image_teamCertificateId_key";

-- DropIndex
DROP INDEX "Image_teamId_key";

-- DropIndex
DROP INDEX "Image_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Image";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "BadgeImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileKey" TEXT NOT NULL,
    "altText" TEXT,
    "badgeId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BadgeImage_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfileImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileKey" TEXT NOT NULL,
    "altText" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProfileImage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileKey" TEXT NOT NULL,
    "altText" TEXT,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "TeamImage_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamCertificateImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileKey" TEXT NOT NULL,
    "altText" TEXT,
    "teamCertificateId" TEXT NOT NULL,
    CONSTRAINT "TeamCertificateImage_teamCertificateId_fkey" FOREIGN KEY ("teamCertificateId") REFERENCES "TeamCertificate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Badge" ("createdAt", "criteria", "description", "id", "name") SELECT "createdAt", "criteria", "description", "id", "name" FROM "Badge";
DROP TABLE "Badge";
ALTER TABLE "new_Badge" RENAME TO "Badge";
CREATE UNIQUE INDEX "Badge_name_key" ON "Badge"("name");
CREATE TABLE "new_TeamSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "slackNotifications" BOOLEAN NOT NULL DEFAULT false,
    "weeklyReports" BOOLEAN NOT NULL DEFAULT true,
    "autoEnrollNewMembers" BOOLEAN NOT NULL DEFAULT false,
    "defaultLearningPath" TEXT,
    "requireCompletion" BOOLEAN NOT NULL DEFAULT false,
    "publicProfile" BOOLEAN NOT NULL DEFAULT false,
    "showMemberProgress" BOOLEAN NOT NULL DEFAULT true,
    "allowMemberInvites" BOOLEAN NOT NULL DEFAULT true,
    "customColors" JSONB,
    "customDomain" TEXT,
    "teamId" TEXT NOT NULL,
    CONSTRAINT "TeamSettings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TeamImage" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamSettings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TeamSettings" ("allowMemberInvites", "autoEnrollNewMembers", "customColors", "customDomain", "defaultLearningPath", "emailNotifications", "id", "publicProfile", "requireCompletion", "showMemberProgress", "slackNotifications", "teamId", "weeklyReports") SELECT "allowMemberInvites", "autoEnrollNewMembers", "customColors", "customDomain", "defaultLearningPath", "emailNotifications", "id", "publicProfile", "requireCompletion", "showMemberProgress", "slackNotifications", "teamId", "weeklyReports" FROM "TeamSettings";
DROP TABLE "TeamSettings";
ALTER TABLE "new_TeamSettings" RENAME TO "TeamSettings";
CREATE UNIQUE INDEX "TeamSettings_teamId_key" ON "TeamSettings"("teamId");
CREATE INDEX "TeamSettings_teamId_idx" ON "TeamSettings"("teamId");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "polarCustomerId" TEXT,
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
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

-- CreateIndex
CREATE UNIQUE INDEX "BadgeImage_badgeId_key" ON "BadgeImage"("badgeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileImage_userId_key" ON "ProfileImage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamImage_teamId_key" ON "TeamImage"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamCertificateImage_teamCertificateId_key" ON "TeamCertificateImage"("teamCertificateId");
