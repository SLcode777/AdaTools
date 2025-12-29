-- AlterTable
ALTER TABLE "youtube_video" ADD COLUMN     "isPlaylist" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playlistId" TEXT;
