-- AlterTable
ALTER TABLE "Stakeholder" ADD COLUMN     "engagementScore" INTEGER,
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
