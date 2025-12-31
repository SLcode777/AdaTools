/*
  Warnings:

  - You are about to drop the column `moduleOrder` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "moduleOrder",
ADD COLUMN     "moduleLayouts" JSONB;
