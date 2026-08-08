-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'ON_LEAVE', 'INJURED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'RETURNED');

-- CreateEnum
CREATE TYPE "TeamSheetRole" AS ENUM ('STARTER', 'SUBSTITUTE');

-- CreateEnum
CREATE TYPE "DisciplinaryStatus" AS ENUM ('OPEN', 'RESOLVED', 'APPEALED');

-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('NORMAL', 'HIGH', 'EMERGENCY');

-- AlterTable
ALTER TABLE "Announcement" ADD COLUMN     "audience" "Role",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "priority" "AnnouncementPriority" NOT NULL DEFAULT 'NORMAL';

-- AlterTable
ALTER TABLE "Fixture" ADD COLUMN     "reportNotes" TEXT,
ADD COLUMN     "reportStatus" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "reportSubmittedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "availability" "Availability";

-- CreateTable
CREATE TABLE "TeamSheet" (
    "id" TEXT NOT NULL,
    "fixtureId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamSheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamSheetEntry" (
    "id" TEXT NOT NULL,
    "teamSheetId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "role" "TeamSheetRole" NOT NULL,
    "isCaptain" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TeamSheetEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DisciplinaryCase" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "fixtureId" TEXT,
    "reason" TEXT NOT NULL,
    "decision" TEXT,
    "decisionDate" TIMESTAMP(3),
    "status" "DisciplinaryStatus" NOT NULL DEFAULT 'OPEN',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DisciplinaryCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "targetId" TEXT,
    "detail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamSheet_fixtureId_idx" ON "TeamSheet"("fixtureId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamSheet_fixtureId_clubId_key" ON "TeamSheet"("fixtureId", "clubId");

-- CreateIndex
CREATE INDEX "TeamSheetEntry_teamSheetId_idx" ON "TeamSheetEntry"("teamSheetId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamSheetEntry_teamSheetId_playerId_key" ON "TeamSheetEntry"("teamSheetId", "playerId");

-- CreateIndex
CREATE INDEX "DisciplinaryCase_playerId_idx" ON "DisciplinaryCase"("playerId");

-- CreateIndex
CREATE INDEX "DisciplinaryCase_clubId_idx" ON "DisciplinaryCase"("clubId");

-- CreateIndex
CREATE INDEX "DisciplinaryCase_status_idx" ON "DisciplinaryCase"("status");

-- CreateIndex
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Announcement_audience_idx" ON "Announcement"("audience");

-- AddForeignKey
ALTER TABLE "TeamSheet" ADD CONSTRAINT "TeamSheet_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSheet" ADD CONSTRAINT "TeamSheet_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSheetEntry" ADD CONSTRAINT "TeamSheetEntry_teamSheetId_fkey" FOREIGN KEY ("teamSheetId") REFERENCES "TeamSheet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamSheetEntry" ADD CONSTRAINT "TeamSheetEntry_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryCase" ADD CONSTRAINT "DisciplinaryCase_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryCase" ADD CONSTRAINT "DisciplinaryCase_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisciplinaryCase" ADD CONSTRAINT "DisciplinaryCase_fixtureId_fkey" FOREIGN KEY ("fixtureId") REFERENCES "Fixture"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
