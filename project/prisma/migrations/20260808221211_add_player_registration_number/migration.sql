-- AlterTable
ALTER TABLE "Player" ADD COLUMN     "idNumber" TEXT,
ADD COLUMN     "height" DOUBLE PRECISION,
ADD COLUMN     "weight" DOUBLE PRECISION,
ADD COLUMN     "county" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "leagueManagerApproved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "platformOwnerApproved" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Player_registrationNumber_key" ON "Player"("registrationNumber");

-- Sequence backing sequential KNSCL### registration numbers, assigned only
-- once a player has both League Manager and Platform Owner approval.
CREATE SEQUENCE IF NOT EXISTS player_registration_seq START 1;
