"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/src/lib/trpc/client";
import {
  AlertCircle,
  Edit,
  ListVideo,
  Play,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Module } from "../dashboard/module";

interface YouTubeEmbedModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

interface VideoFormData {
  url: string;
  title: string;
}

export function YouTubeEmbedModule({
  isPinned,
  onTogglePin,
  isAuthenticated = true,
  onAuthRequired,
}: YouTubeEmbedModuleProps) {
  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const [hasUserInteracted, setHasUserInteracted] = useState<boolean>(false);

  const [formData, setFormData] = useState<VideoFormData>({
    url: "",
    title: "",
  });

  //default videos for non-authenticated users
  const DEFAULT_VIDEOS = [
    {
      id: "default-1",
      title: "Lofi Girl - beats to relax/study to",
      url: "https://www.youtube.com/watch?v=jfKfPfyJRdk",
      videoId: "jfKfPfyJRdk",
      playlistId: null,
      isPlaylist: false,
      userId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "default-2",
      title:
        "3-HOUR STUDY WITH ME🏡 / calm lofi / A Rainy Evening in Tokyo / with countdown+alarm",
      url: "https://www.youtube.com/watch?v=grBFMP3HDZA",
      videoId: "grBFMP3HDZA",
      playlistId: null,
      isPlaylist: false,
      userId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: "default-3",
      title: "3Deep Focus - Music For Studying, Concentration and Work",
      url: "https://www.youtube.com/watch?v=oPVte6aMprI",
      videoId: "oPVte6aMprI",
      playlistId: null,
      isPlaylist: false,
      userId: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  
  const { data: videos, isLoading } = api.youtubeVideos.getAll.useQuery(
    undefined,
    {
      enabled: isAuthenticated,
    }
  );

  //use default videos for non-authenticated users
  const displayVideos = !isAuthenticated ? DEFAULT_VIDEOS : videos;

  //mutations
  const utils = api.useUtils();

  const createMutation = api.youtubeVideos.create.useMutation({
    onSuccess: () => {
      toast.success("Video added successfully");
      utils.youtubeVideos.getAll.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add video");
    },
  });

  const updateMutation = api.youtubeVideos.update.useMutation({
    onSuccess: () => {
      toast.success("Video updated successfully");
      utils.youtubeVideos.getAll.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update video");
    },
  });

  const deleteMutation = api.youtubeVideos.delete.useMutation({
    onSuccess: () => {
      toast.success("Video deleted successfully");
      utils.youtubeVideos.getAll.invalidate();
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
      //reset to first video if current was deleted
      setCurrentVideoIndex(0);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete video");
    },
  });

  //handlers
  const handleOpenDialog = (videoId?: string) => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    if (videoId) {
      const video = videos?.find((v) => v.id === videoId);
      if (video) {
        setFormData({
          url: video.url,
          title: video.title,
        });
        setEditingVideo(videoId);
      }
    } else {
      setFormData({
        url: "",
        title: "",
      });
      setEditingVideo(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingVideo(null);
    setFormData({
      url: "",
      title: "",
    });
  };

  const handleSubmit = () => {
    if (!formData.url.trim()) {
      toast.error("URL is required");
      return;
    }
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (editingVideo) {
      updateMutation.mutate({
        id: editingVideo,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDeleteClick = (id: string) => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    setVideoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (videoToDelete) {
      deleteMutation.mutate({ id: videoToDelete });
    }
  };

  const handlePlayVideo = (index: number) => {
    setCurrentVideoIndex(index);
    setHasUserInteracted(true);
  };

  //get current video to display
  const currentVideo =
    displayVideos && displayVideos.length > 0
      ? displayVideos[currentVideoIndex]
      : null;

  //generate YouTube embed URL based on video type
  const getEmbedUrl = (video: typeof currentVideo) => {
    if (!video) return null;

    const autoplay = hasUserInteracted ? 1 : 0;

    //for playlists
    if (video.isPlaylist && video.playlistId) {
      if (video.videoId) {
        //playlist with starting video
        return `https://www.youtube.com/embed/${video.videoId}?list=${video.playlistId}&autoplay=${autoplay}&rel=0`;
      } else {
        //pure playlist
        return `https://www.youtube.com/embed/videoseries?list=${video.playlistId}&autoplay=${autoplay}&rel=0`;
      }
    } else {
      //regular video
      return `https://www.youtube.com/embed/${video.videoId}?autoplay=${autoplay}&rel=0`;
    }
  };

  const embedUrl = getEmbedUrl(currentVideo);

  return (
    <Module
      title="YouTube Embed"
      description="Easily launch your favorite focus videos"
      icon={<Video className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      isAuthenticated={isAuthenticated}
    >
      <div className="space-y-4">
        {/* YouTube Player */}
        {embedUrl ? (
          <div className="relative w-full pb-[56.25%] bg-black rounded-lg overflow-hidden">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="relative w-full pb-[56.25%] bg-muted rounded-lg flex items-center justify-center">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Video className="h-12 w-12 mb-2 opacity-50" />
              <p className="text-sm">No videos added yet</p>
            </div>
          </div>
        )}

        {/* Add New Video Button */}
        <Button
          onClick={() => handleOpenDialog()}
          variant="ghost"
          className="w-full justify-start text-primary hover:text-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add new video link
        </Button>

        {/* Videos List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-4">
              Loading videos...
            </div>
          ) : displayVideos && displayVideos.length > 0 ? (
            displayVideos.map((video, index) => {
              const isDefaultVideo = video.id.startsWith("default-");
              return (
                <div
                  key={video.id}
                  className={`border p-3 rounded-lg flex items-center justify-between gap-2 transition-colors hover:border-primary/50 ${
                    currentVideoIndex === index
                      ? "border-primary bg-primary/5"
                      : "bg-card"
                  }`}
                >
                  <button
                    onClick={() => handlePlayVideo(index)}
                    className="flex-1 flex items-center gap-3 text-left min-w-0"
                  >
                    {video.isPlaylist ? (
                      <ListVideo
                        className={`h-4 w-4 shrink-0 ${
                          currentVideoIndex === index
                            ? "text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    ) : (
                      <Play
                        className={`h-4 w-4 shrink-0 ${
                          currentVideoIndex === index
                            ? "text-primary fill-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    )}
                    <span className="text-sm truncate">{video.title}</span>
                  </button>
                  {!isDefaultVideo && (
                    <div className="flex gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDialog(video.id)}
                        className="h-7 w-7 p-0"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(video.id)}
                        className="h-7 w-7 p-0 text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No videos saved. Click &quot;Add new video link&quot; to get
                started!
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingVideo ? "Edit Video" : "Add Video"}
              </DialogTitle>
              <DialogDescription>
                {editingVideo
                  ? "Update your video information"
                  : "Add a new YouTube video to your collection"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">
                  YouTube URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Custom Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Lofi Girl - Synthwave radio - beats to chill/game to"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingVideo ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Video</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this video? This action cannot
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Module>
  );
}
