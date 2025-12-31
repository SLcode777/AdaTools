-- CreateTable
CREATE TABLE "sticky_note" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sticky_note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sticky_note_userId_key" ON "sticky_note"("userId");

-- CreateIndex
CREATE INDEX "sticky_note_userId_idx" ON "sticky_note"("userId");

-- AddForeignKey
ALTER TABLE "sticky_note" ADD CONSTRAINT "sticky_note_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
