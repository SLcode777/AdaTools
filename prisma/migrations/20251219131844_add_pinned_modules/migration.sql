-- AlterTable
ALTER TABLE "Workspace" ADD COLUMN     "pinnedModules" TEXT[] DEFAULT ARRAY[]::TEXT[];
