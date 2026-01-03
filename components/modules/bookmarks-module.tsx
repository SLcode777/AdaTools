"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/src/lib/trpc/client";
import {
  AlertCircle,
  Bookmark,
  Download,
  Edit,
  ExternalLink,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Module } from "../dashboard/module";

interface BookmarksModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

interface BookmarkFormData {
  url: string;
  title: string;
  description: string;
  image: string;
  favicon: string;
  tags: string[];
  isFavorite: boolean;
}

export function BookmarksModule({
  isPinned,
  onTogglePin,
  isAuthenticated = true,
  onAuthRequired,
}: BookmarksModuleProps) {
  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<string | null>(null);
  const [bookmarkToDelete, setBookmarkToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [parsedBookmarks, setParsedBookmarks] = useState<
    Array<{
      url: string;
      title: string;
      favicon?: string;
      tags: string[];
      selected: boolean;
    }>
  >([]);
  const [selectAll, setSelectAll] = useState(true);

  // Form state
  const [formData, setFormData] = useState<BookmarkFormData>({
    url: "",
    title: "",
    description: "",
    image: "",
    favicon: "",
    tags: [],
    isFavorite: false,
  });

  // Queries
  const { data: bookmarks, isLoading } = api.bookmarks.getAll.useQuery(
    {
      search: searchQuery || undefined,
      tag: tagFilter || undefined,
      favoritesOnly,
    },
    { enabled: isAuthenticated }
  );

  const { data: tags } = api.bookmarks.getTags.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const displayBookmarks = !isAuthenticated ? [] : bookmarks;
  const displayTags = !isAuthenticated ? [] : tags;

  // Mutations
  const utils = api.useUtils();

  const fetchMetadataMutation = api.bookmarks.fetchMetadata.useMutation({
    onSuccess: (metadata) => {
      // Auto-populate fields but allow manual override
      setFormData((prev) => ({
        ...prev,
        title: metadata.title || prev.title,
        description: metadata.description || prev.description,
        image: metadata.image || prev.image,
        favicon: metadata.favicon || prev.favicon,
      }));
      setIsFetchingMetadata(false);
      toast.success("Metadata fetched successfully");
    },
    onError: (error) => {
      setIsFetchingMetadata(false);
      toast.error("Could not fetch metadata. Please enter manually.");
    },
  });

  const createMutation = api.bookmarks.create.useMutation({
    onSuccess: () => {
      toast.success("Bookmark created successfully");
      utils.bookmarks.getAll.invalidate();
      utils.bookmarks.getTags.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create bookmark");
    },
  });

  const updateMutation = api.bookmarks.update.useMutation({
    onSuccess: () => {
      toast.success("Bookmark updated successfully");
      utils.bookmarks.getAll.invalidate();
      utils.bookmarks.getTags.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update bookmark");
    },
  });

  const deleteMutation = api.bookmarks.delete.useMutation({
    onSuccess: () => {
      toast.success("Bookmark deleted successfully");
      utils.bookmarks.getAll.invalidate();
      utils.bookmarks.getTags.invalidate();
      setDeleteDialogOpen(false);
      setBookmarkToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete bookmark");
    },
  });

  const toggleFavoriteMutation = api.bookmarks.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.bookmarks.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to toggle favorite");
    },
  });

  const parseHTMLMutation = api.bookmarks.parseHTMLFile.useMutation({
    onSuccess: (data) => {
      setParsedBookmarks(data.map((b) => ({ ...b, selected: true })));
      setSelectAll(true);
      setImportDialogOpen(true);
      toast.success(`Found ${data.length} bookmarks`);
    },
    onError: (error) => {
      toast.error("Failed to parse HTML file");
    },
  });

  const importMutation = api.bookmarks.importBookmarks.useMutation({
    onSuccess: (data) => {
      toast.success(`Imported ${data.count} bookmarks successfully`);
      utils.bookmarks.getAll.invalidate();
      utils.bookmarks.getTags.invalidate();
      setImportDialogOpen(false);
      setParsedBookmarks([]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to import bookmarks");
    },
  });

  // Handlers
  const handleFetchMetadata = () => {
    if (!formData.url.trim()) {
      toast.error("Please enter a URL first");
      return;
    }

    try {
      new URL(formData.url); // Validate URL
      setIsFetchingMetadata(true);
      fetchMetadataMutation.mutate({ url: formData.url });
    } catch {
      toast.error("Invalid URL format");
    }
  };

  const handleOpenDialog = (bookmarkId?: string) => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    if (bookmarkId) {
      const bookmark = displayBookmarks?.find((b) => b.id === bookmarkId);
      if (bookmark) {
        setFormData({
          url: bookmark.url,
          title: bookmark.title,
          description: bookmark.description || "",
          image: bookmark.image || "",
          favicon: bookmark.favicon || "",
          tags: bookmark.tags,
          isFavorite: bookmark.isFavorite,
        });
        setEditingBookmark(bookmarkId);
      }
    } else {
      setFormData({
        url: "",
        title: "",
        description: "",
        image: "",
        favicon: "",
        tags: [],
        isFavorite: false,
      });
      setEditingBookmark(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBookmark(null);
    setFormData({
      url: "",
      title: "",
      description: "",
      image: "",
      favicon: "",
      tags: [],
      isFavorite: false,
    });
    setNewTag("");
    setIsFetchingMetadata(false);
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

    if (editingBookmark) {
      updateMutation.mutate({
        id: editingBookmark,
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
    setBookmarkToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (bookmarkToDelete) {
      deleteMutation.mutate({ id: bookmarkToDelete });
    }
  };

  const handleToggleFavorite = (id: string) => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    toggleFavoriteMutation.mutate({ id });
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      parseHTMLMutation.mutate({ html: text });
    } catch (error) {
      toast.error("Failed to read HTML file");
    }

    event.target.value = "";
  };

  const handleExport = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    try {
      const html = await utils.bookmarks.exportHTML.fetch();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `bookmarks-${
        new Date().toISOString().split("T")[0]
      }.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Bookmarks exported successfully");
    } catch (error) {
      toast.error("Failed to export bookmarks");
    }
  };

  const handleToggleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setParsedBookmarks((prev) =>
      prev.map((b) => ({ ...b, selected: newSelectAll }))
    );
  };

  const handleToggleBookmark = (index: number) => {
    setParsedBookmarks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, selected: !b.selected } : b))
    );
  };

  const handleConfirmImport = () => {
    const selectedBookmarks = parsedBookmarks
      .filter((b) => b.selected)
      .map(({ url, title, favicon, tags }) => ({ url, title, favicon, tags }));

    if (selectedBookmarks.length === 0) {
      toast.error("Please select at least one bookmark to import");
      return;
    }

    importMutation.mutate({ bookmarks: selectedBookmarks });
  };

  return (
    <Module
      title="Bookmarks"
      description="Save and organize your favorite links"
      icon={<Bookmark className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      isAuthenticated={isAuthenticated}
    >
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="space-y-2">
          <Button onClick={() => handleOpenDialog()} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Bookmark
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              Export HTML
            </Button>
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  onAuthRequired?.();
                  return;
                }
                document.getElementById("import-html-file")?.click();
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Upload className="h-3.5 w-3.5 mr-2" />
              Import HTML
            </Button>
            <input
              id="import-html-file"
              type="file"
              accept=".html"
              onChange={handleImport}
              className="hidden"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search bookmarks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <Select value={tagFilter} onValueChange={setTagFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                {displayTags?.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {tagFilter && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTagFilter("")}
                className="w-full h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filter
              </Button>
            )}
          </div>

          <Button
            variant={favoritesOnly ? "muted" : "outline"}
            size="sm"
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className="w-full"
          >
            <Star
              className={`h-4 w-4 mr-2 ${favoritesOnly ? "fill-current" : ""}`}
            />
            {favoritesOnly ? "Showing Favorites" : "Show Favorites Only"}
          </Button>
        </div>

        <Separator />

        {/* Bookmarks List */}
        <div className="space-y-2 max-h-100 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary pr-1">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              Loading bookmarks...
            </div>
          ) : displayBookmarks && displayBookmarks.length > 0 ? (
            displayBookmarks.map((bookmark) => (
              <div
                key={bookmark.id}
                className="border p-3 space-y-2 bg-card hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex gap-2 flex-1 min-w-0">
                    {/* Favicon */}
                    {bookmark.favicon && (
                      <img
                        src={bookmark.favicon}
                        alt=""
                        className="h-4 w-4 shrink-0 mt-0.5"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium truncate">
                          {bookmark.title}
                        </h4>
                        <button
                          onClick={() => handleToggleFavorite(bookmark.id)}
                          className="shrink-0"
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              bookmark.isFavorite
                                ? "fill-primary text-transparent"
                                : "text-muted-foreground"
                            }`}
                          />
                        </button>
                      </div>
                      {bookmark.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {bookmark.description}
                        </p>
                      )}
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1 truncate"
                      >
                        <span className="truncate">{bookmark.url}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(bookmark.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(bookmark.id)}
                      className="h-7 w-7 p-0 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Image preview */}
                {bookmark.image && (
                  <div className="overflow-hidden rounded">
                    <img
                      src={bookmark.image}
                      alt={bookmark.title}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}

                {/* Tags */}
                {bookmark.tags.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {bookmark.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No bookmarks found. Create your first bookmark to get started!
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary">
            <DialogHeader>
              <DialogTitle>
                {editingBookmark ? "Edit Bookmark" : "New Bookmark"}
              </DialogTitle>
              <DialogDescription>
                {editingBookmark
                  ? "Update your bookmark"
                  : "Create a new bookmark"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* URL with Fetch Metadata Button */}
              <div className="space-y-2">
                <Label htmlFor="url">
                  URL <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://example.com"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleFetchMetadata}
                    disabled={isFetchingMetadata || !formData.url}
                  >
                    {isFetchingMetadata ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Fetch Metadata"
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Bookmark title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description"
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  value={formData.favicon}
                  onChange={(e) =>
                    setFormData({ ...formData, favicon: e.target.value })
                  }
                  placeholder="https://example.com/favicon.ico"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Add a tag..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddTag}
                  >
                    Add
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="favorite"
                  checked={formData.isFavorite}
                  onChange={(e) =>
                    setFormData({ ...formData, isFavorite: e.target.checked })
                  }
                  className="h-4 w-4"
                />
                <Label htmlFor="favorite" className="cursor-pointer">
                  Mark as favorite
                </Label>
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
                {editingBookmark ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Bookmark</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this bookmark? This action
                cannot be undone.
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

        {/* Import Selection Dialog */}
        <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary">
            <DialogHeader>
              <DialogTitle>Import Bookmarks</DialogTitle>
              <DialogDescription>
                Select the bookmarks you want to import (
                {parsedBookmarks.filter((b) => b.selected).length} of{" "}
                {parsedBookmarks.length} selected)
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 overflow-hidden">
              {/* Select All */}
              <div className="flex items-center gap-2 p-2 border rounded">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectAll}
                  onChange={handleToggleSelectAll}
                  className="h-4 w-4"
                />
                <Label
                  htmlFor="select-all"
                  className="cursor-pointer font-medium"
                >
                  Select All
                </Label>
              </div>

              {/* Bookmarks List */}
              <div className="space-y-2 max-h-96 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary">
                {parsedBookmarks.map((bookmark, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 p-2 border rounded hover:border-primary/50 transition-colors min-w-0"
                  >
                    <input
                      type="checkbox"
                      id={`bookmark-${index}`}
                      checked={bookmark.selected}
                      onChange={() => handleToggleBookmark(index)}
                      className="h-4 w-4 mt-0.5 shrink-0"
                    />
                    <div className="flex-1 min-w-0 overflow-hidden w-0">
                      <Label
                        htmlFor={`bookmark-${index}`}
                        className="cursor-pointer font-medium text-sm block overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {bookmark.title}
                      </Label>
                      <p className="text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                        {bookmark.url}
                      </p>
                      {bookmark.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {bookmark.tags.map((tag, tagIndex) => (
                            <Badge
                              key={tagIndex}
                              variant="secondary"
                              className="text-xs"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setImportDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={
                  importMutation.isPending ||
                  parsedBookmarks.filter((b) => b.selected).length === 0
                }
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import ${
                    parsedBookmarks.filter((b) => b.selected).length
                  } Bookmarks`
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Module>
  );
}
