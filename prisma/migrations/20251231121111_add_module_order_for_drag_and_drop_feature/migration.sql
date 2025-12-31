/*
  Warnings:

  - You are about to drop the column `layout` on the `Workspace` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "layout",
ADD COLUMN     "moduleOrder" TEXT[] DEFAULT ARRAY[]::TEXT[];
