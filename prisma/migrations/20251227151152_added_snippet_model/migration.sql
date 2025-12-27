-- CreateTable
CREATE TABLE "snippet" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "snippet_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "snippet_userId_idx" ON "snippet"("userId");

-- CreateIndex
CREATE INDEX "snippet_isFavorite_idx" ON "snippet"("isFavorite");

-- AddForeignKey
ALTER TABLE "snippet" ADD CONSTRAINT "snippet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
