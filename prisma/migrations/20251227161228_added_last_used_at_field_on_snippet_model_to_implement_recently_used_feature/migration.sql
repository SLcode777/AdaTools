-- AlterTable
ALTER TABLE "snippet" ADD COLUMN     "lastUsedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "snippet_lastUsedAt_idx" ON "snippet"("lastUsedAt");
