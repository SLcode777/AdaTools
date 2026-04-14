-- AlterTable
ALTER TABLE "bookmark" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "bookmark_isHidden_idx" ON "bookmark"("isHidden");
