/*
  Warnings:

  - The primary key for the `Task` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `latitude` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Task` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Task` table. All the data in the column will be lost.
  - Added the required column `title` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- DropForeignKey
ALTER TABLE "TaskAssignment" DROP CONSTRAINT "TaskAssignment_taskId_fkey";

-- AlterTable
ALTER TABLE "Task" DROP CONSTRAINT "Task_pkey",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "name",
ADD COLUMN     "assignedUserId" INTEGER,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "stakeholderId" TEXT,
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "title" VARCHAR(255) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "description" DROP NOT NULL,
ADD CONSTRAINT "Task_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Task_id_seq";

-- AlterTable
ALTER TABLE "TaskAssignment" ALTER COLUMN "taskId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "TaskAssignment" ADD CONSTRAINT "TaskAssignment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_stakeholderId_fkey" FOREIGN KEY ("stakeholderId") REFERENCES "Stakeholder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedUserId_fkey" FOREIGN KEY ("assignedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
