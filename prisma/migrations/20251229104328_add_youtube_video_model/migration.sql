-- CreateTable
CREATE TABLE "youtube_video" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "youtube_video_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "youtube_video_userId_idx" ON "youtube_video"("userId");

-- CreateIndex
CREATE INDEX "youtube_video_createdAt_idx" ON "youtube_video"("createdAt");

-- AddForeignKey
ALTER TABLE "youtube_video" ADD CONSTRAINT "youtube_video_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
