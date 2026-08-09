-- AlterEnum
ALTER TYPE "MatchEventType" ADD VALUE 'OWN_GOAL';

-- AlterTable
ALTER TABLE "DisciplinaryCase" ADD COLUMN     "matchesBanned" INTEGER,
ADD COLUMN     "matchesServed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "suspensionType" TEXT;

-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "middleName" TEXT,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "TeamSheetEntry" ADD COLUMN     "jerseyNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "DisciplinaryCase_playerId_fixtureId_suspensionType_key" ON "DisciplinaryCase"("playerId", "fixtureId", "suspensionType");

