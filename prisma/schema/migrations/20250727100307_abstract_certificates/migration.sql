/*
  Warnings:

  - You are about to drop the `ProfileImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `name` on the `Certificate` table. All the data in the column will be lost.
  - Added the required column `certificateNumber` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completedAt` to the `Certificate` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `Certificate` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ProfileImage_userId_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProfileImage";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CertificateTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "design" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileKey" TEXT NOT NULL,
    "altText" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Certificate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completedAt" DATETIME NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "certificateNumber" TEXT NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "courseId" TEXT,
    "programId" TEXT,
    "userId" TEXT NOT NULL,
    "templateId" TEXT,
    "issuedBy" TEXT,
    "signature" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Certificate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Certificate_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Certificate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Certificate_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "CertificateTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Certificate" ("createdAt", "id", "updatedAt", "userId") SELECT "createdAt", "id", "updatedAt", "userId" FROM "Certificate";
DROP TABLE "Certificate";
ALTER TABLE "new_Certificate" RENAME TO "Certificate";
CREATE UNIQUE INDEX "Certificate_certificateNumber_key" ON "Certificate"("certificateNumber");
CREATE INDEX "Certificate_userId_idx" ON "Certificate"("userId");
CREATE INDEX "Certificate_certificateNumber_idx" ON "Certificate"("certificateNumber");
CREATE INDEX "Certificate_courseId_idx" ON "Certificate"("courseId");
CREATE INDEX "Certificate_programId_idx" ON "Certificate"("programId");
CREATE UNIQUE INDEX "Certificate_userId_courseId_key" ON "Certificate"("userId", "courseId");
CREATE UNIQUE INDEX "Certificate_userId_programId_key" ON "Certificate"("userId", "programId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Image_userId_key" ON "Image"("userId");
