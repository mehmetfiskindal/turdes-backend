-- DropForeignKey
ALTER TABLE "AidRequest" DROP CONSTRAINT "AidRequest_locationId_fkey";

-- AlterTable
ALTER TABLE "AidRequest" ADD COLUMN     "helpCode" VARCHAR(255),
ALTER COLUMN "locationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "AidRequest" ADD CONSTRAINT "AidRequest_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
