-- CreateTable
CREATE TABLE "color_palette" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "colors" JSONB NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "color_palette_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "color_palette_userId_idx" ON "color_palette"("userId");

-- AddForeignKey
ALTER TABLE "color_palette" ADD CONSTRAINT "color_palette_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
