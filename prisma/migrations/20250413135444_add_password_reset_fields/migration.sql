-- AlterTable
ALTER TABLE "User" ADD COLUMN     "passwordResetToken" VARCHAR(255),
ADD COLUMN     "passwordResetTokenExpiresAt" TIMESTAMPTZ(6);
