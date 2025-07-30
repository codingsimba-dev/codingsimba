/*
  Warnings:

  - You are about to drop the `BadgeImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamCertificate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamCertificateImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamImage` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Content` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "BadgeImage_badgeId_key";

-- DropIndex
DROP INDEX "TeamCertificate_teamId_idx";

-- DropIndex
DROP INDEX "TeamCertificateImage_teamCertificateId_key";

-- DropIndex
DROP INDEX "TeamImage_teamId_key";

-- AlterTable
ALTER TABLE "Content" ADD COLUMN "slug" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "BadgeImage";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeamCertificate";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeamCertificateImage";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TeamImage";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileKey" TEXT NOT NULL,
    "altText" TEXT,
    "userId" TEXT,
    "teamId" TEXT,
    "badgeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Image_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Image_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "TeamSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Image_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Image" ("altText", "createdAt", "fileKey", "id", "updatedAt", "userId") SELECT "altText", "createdAt", "fileKey", "id", "updatedAt", "userId" FROM "Image";
DROP TABLE "Image";
ALTER TABLE "new_Image" RENAME TO "Image";
CREATE UNIQUE INDEX "Image_userId_key" ON "Image"("userId");
CREATE UNIQUE INDEX "Image_teamId_key" ON "Image"("teamId");
CREATE UNIQUE INDEX "Image_badgeId_key" ON "Image"("badgeId");
CREATE TABLE "new_TeamMemberCertificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "earnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "teamId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "certificateId" TEXT NOT NULL,
    CONSTRAINT "TeamMemberCertificate_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMemberCertificate_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "TeamMember" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMemberCertificate_certificateId_fkey" FOREIGN KEY ("certificateId") REFERENCES "Certificate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TeamMemberCertificate" ("certificateId", "earnedAt", "expiresAt", "id", "memberId", "teamId") SELECT "certificateId", "earnedAt", "expiresAt", "id", "memberId", "teamId" FROM "TeamMemberCertificate";
DROP TABLE "TeamMemberCertificate";
ALTER TABLE "new_TeamMemberCertificate" RENAME TO "TeamMemberCertificate";
CREATE INDEX "TeamMemberCertificate_teamId_idx" ON "TeamMemberCertificate"("teamId");
CREATE INDEX "TeamMemberCertificate_memberId_idx" ON "TeamMemberCertificate"("memberId");
CREATE INDEX "TeamMemberCertificate_certificateId_idx" ON "TeamMemberCertificate"("certificateId");
CREATE UNIQUE INDEX "TeamMemberCertificate_teamId_memberId_certificateId_key" ON "TeamMemberCertificate"("teamId", "memberId", "certificateId");
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
    CONSTRAINT "TeamSettings_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TeamSettings" ("allowMemberInvites", "autoEnrollNewMembers", "customColors", "customDomain", "defaultLearningPath", "emailNotifications", "id", "publicProfile", "requireCompletion", "showMemberProgress", "slackNotifications", "teamId", "weeklyReports") SELECT "allowMemberInvites", "autoEnrollNewMembers", "customColors", "customDomain", "defaultLearningPath", "emailNotifications", "id", "publicProfile", "requireCompletion", "showMemberProgress", "slackNotifications", "teamId", "weeklyReports" FROM "TeamSettings";
DROP TABLE "TeamSettings";
ALTER TABLE "new_TeamSettings" RENAME TO "TeamSettings";
CREATE UNIQUE INDEX "TeamSettings_teamId_key" ON "TeamSettings"("teamId");
CREATE INDEX "TeamSettings_teamId_idx" ON "TeamSettings"("teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "Comment_contentId_createdAt_idx" ON "Comment"("contentId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Content_slug_key" ON "Content"("slug");

-- CreateIndex
CREATE INDEX "Content_type_views_idx" ON "Content"("type", "views");

-- CreateIndex
CREATE INDEX "Content_createdAt_type_idx" ON "Content"("createdAt", "type");

-- CreateIndex
CREATE INDEX "Content_views_idx" ON "Content"("views");

-- CreateIndex
CREATE INDEX "ContentReport_resolvedById_idx" ON "ContentReport"("resolvedById");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX "Course_completedAt_idx" ON "Course"("completedAt");

-- CreateIndex
CREATE INDEX "Enrollment_userId_idx" ON "Enrollment"("userId");

-- CreateIndex
CREATE INDEX "Enrollment_enrolledAt_idx" ON "Enrollment"("enrolledAt");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");

-- CreateIndex
CREATE INDEX "Enrollment_programId_idx" ON "Enrollment"("programId");

-- CreateIndex
CREATE INDEX "Lesson_completedAt_idx" ON "Lesson"("completedAt");

-- CreateIndex
CREATE INDEX "Like_userId_idx" ON "Like"("userId");

-- CreateIndex
CREATE INDEX "Like_contentId_idx" ON "Like"("contentId");

-- CreateIndex
CREATE INDEX "Like_commentId_idx" ON "Like"("commentId");

-- CreateIndex
CREATE INDEX "Module_testId_idx" ON "Module"("testId");

-- CreateIndex
CREATE INDEX "Program_status_idx" ON "Program"("status");

-- CreateIndex
CREATE INDEX "Program_completedAt_idx" ON "Program"("completedAt");

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");

-- CreateIndex
CREATE INDEX "Review_featured_idx" ON "Review"("featured");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_subscriptionId_idx" ON "Subscription"("subscriptionId");

-- CreateIndex
CREATE INDEX "Test_sanityId_idx" ON "Test"("sanityId");

-- CreateIndex
CREATE INDEX "TestQuestion_testId_idx" ON "TestQuestion"("testId");

-- CreateIndex
CREATE INDEX "TestQuestion_type_idx" ON "TestQuestion"("type");

-- CreateIndex
CREATE INDEX "TimeSpent_userId_lastActive_idx" ON "TimeSpent"("userId", "lastActive");

-- CreateIndex
CREATE INDEX "TimeSpent_duration_idx" ON "TimeSpent"("duration");
