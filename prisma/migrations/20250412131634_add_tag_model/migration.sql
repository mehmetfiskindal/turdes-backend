/*
  Warnings:

  - The primary key for the `Campaign` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `targetAmount` on the `Campaign` table. All the data in the column will be lost.
  - The primary key for the `Donation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `userId` on the `Donation` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `Donation` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - Added the required column `type` to the `Campaign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `Donation` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CREDIT_CARD', 'BANK_TRANSFER', 'CASH', 'ONLINE_PLATFORM', 'SMS');

-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('ONLINE', 'EVENT', 'CROWDFUNDING', 'PEER_TO_PEER', 'SMS', 'GRANT');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "StakeholderType" AS ENUM ('INDIVIDUAL_DONOR', 'CORPORATE_SPONSOR', 'FOUNDATION', 'BENEFICIARY', 'OTHER');

-- CreateEnum
CREATE TYPE "EngagementLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "InteractionType" AS ENUM ('EMAIL', 'PHONE_CALL', 'MEETING', 'EVENT', 'OTHER');

-- CreateEnum
CREATE TYPE "CustomFieldType" AS ENUM ('TEXT', 'NUMBER', 'DATE', 'BOOLEAN', 'SELECT');

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_donorId_fkey";

-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_userId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_campaignId_fkey";

-- AlterTable
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_pkey",
DROP COLUMN "targetAmount",
ADD COLUMN     "goalAmount" DECIMAL(65,30),
ADD COLUMN     "startDate" TIMESTAMP(3),
ADD COLUMN     "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
ADD COLUMN     "type" "CampaignType" NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "name" SET DATA TYPE TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ADD CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Campaign_id_seq";

-- AlterTable
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_pkey",
DROP COLUMN "userId",
ADD COLUMN     "campaignId" TEXT,
ADD COLUMN     "donationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "legacyDonorId" INTEGER,
ADD COLUMN     "legacyUserId" INTEGER,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "status" "DonationStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "donorId" DROP NOT NULL,
ALTER COLUMN "donorId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Donation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Donation_id_seq";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "campaignId" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "Stakeholder" (
    "id" TEXT NOT NULL,
    "type" "StakeholderType" NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "donationHistory" JSONB,
    "preferences" JSONB,
    "lastContacted" TIMESTAMP(3),
    "engagementLevel" "EngagementLevel",

    CONSTRAINT "Stakeholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interaction" (
    "id" TEXT NOT NULL,
    "type" "InteractionType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT NOT NULL,
    "recordedByUserId" TEXT,
    "stakeholderId" TEXT NOT NULL,

    CONSTRAINT "Interaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomFieldDefinition" (
    "id" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldType" "CustomFieldType" NOT NULL,
    "options" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomFieldDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StakeholderCustomField" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "stakeholderId" TEXT NOT NULL,
    "fieldDefinitionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StakeholderCustomField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StakeholderTag" (
    "stakeholderId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StakeholderTag_pkey" PRIMARY KEY ("stakeholderId","tagId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stakeholder_email_key" ON "Stakeholder"("email");

-- CreateIndex
CREATE UNIQUE INDEX "CustomFieldDefinition_fieldName_key" ON "CustomFieldDefinition"("fieldName");

-- CreateIndex
CREATE INDEX "StakeholderCustomField_stakeholderId_idx" ON "StakeholderCustomField"("stakeholderId");

-- CreateIndex
CREATE INDEX "StakeholderCustomField_fieldDefinitionId_idx" ON "StakeholderCustomField"("fieldDefinitionId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "StakeholderTag_stakeholderId_idx" ON "StakeholderTag"("stakeholderId");

-- CreateIndex
CREATE INDEX "StakeholderTag_tagId_idx" ON "StakeholderTag"("tagId");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Stakeholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_legacyDonorId_fkey" FOREIGN KEY ("legacyDonorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_legacyUserId_fkey" FOREIGN KEY ("legacyUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interaction" ADD CONSTRAINT "Interaction_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakeholderCustomField" ADD CONSTRAINT "StakeholderCustomField_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakeholderCustomField" ADD CONSTRAINT "StakeholderCustomField_fieldDefinitionId_fkey" FOREIGN KEY ("fieldDefinitionId") REFERENCES "CustomFieldDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakeholderTag" ADD CONSTRAINT "StakeholderTag_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StakeholderTag" ADD CONSTRAINT "StakeholderTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
