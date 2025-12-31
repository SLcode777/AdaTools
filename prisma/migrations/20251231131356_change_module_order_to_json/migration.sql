/*
  Warnings:

  - The `moduleOrder` column on the `Workspace` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Workspace" DROP COLUMN "moduleOrder",
ADD COLUMN     "moduleOrder" JSONB;
