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
  Check,
  Clock,
  Code2,
  Copy,
  Download,
  Edit,
  Plus,
  Search,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import {
  stackoverflowDark,
  stackoverflowLight,
} from "react-syntax-highlighter/dist/esm/styles/hljs";
import { toast } from "sonner";
import { Module } from "../dashboard/module";

interface SnippetManagerModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

interface SnippetFormData {
  title: string;
  description: string;
  language: string;
  code: string;
  tags: string[];
  isFavorite: boolean;
}

const COMMON_LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "HTML",
  "CSS",
  "SQL",
  "Bash",
  "JSON",
  "YAML",
  "Markdown",
  "Other",
];

// Map language names to Prism language identifiers
const getLanguageId = (language: string): string => {
  const languageMap: Record<string, string> = {
    JavaScript: "javascript",
    TypeScript: "typescript",
    Python: "python",
    Java: "java",
    "C++": "cpp",
    "C#": "csharp",
    Go: "go",
    Rust: "rust",
    Ruby: "ruby",
    PHP: "php",
    Swift: "swift",
    Kotlin: "kotlin",
    HTML: "html",
    CSS: "css",
    SQL: "sql",
    Bash: "bash",
    JSON: "json",
    YAML: "yaml",
    Markdown: "markdown",
  };
  return languageMap[language] || "text";
};

export function SnippetManagerModule({
  isPinned,
  onTogglePin,
  isAuthenticated = true,
  onAuthRequired,
}: SnippetManagerModuleProps) {
  // Theme
  const { theme } = useTheme();

  // State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<string | null>(null);
  const [snippetToDelete, setSnippetToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [languageFilter, setLanguageFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");

  // Form state
  const [formData, setFormData] = useState<SnippetFormData>({
    title: "",
    description: "",
    language: "",
    code: "",
    tags: [],
    isFavorite: false,
  });

  // Queries - protégées pour les visiteurs
  const { data: snippets, isLoading } = api.snippets.getAll.useQuery(
    {
      search: searchQuery || undefined,
      language: languageFilter || undefined,
      tag: tagFilter || undefined,
      favoritesOnly,
    },
    { enabled: isAuthenticated }
  );

  const { data: recentlyUsed } = api.snippets.getRecentlyUsed.useQuery(
    {
      limit: 5,
    },
    { enabled: isAuthenticated }
  );

  const { data: languages } = api.snippets.getLanguages.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: tags } = api.snippets.getTags.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Ignore le cache pour les visiteurs - afficher des tableaux vides
  const displaySnippets = !isAuthenticated ? [] : snippets;
  const displayRecentlyUsed = !isAuthenticated ? [] : recentlyUsed;
  const displayLanguages = !isAuthenticated ? [] : languages;
  const displayTags = !isAuthenticated ? [] : tags;

  // Mutations
  const utils = api.useUtils();

  const createMutation = api.snippets.create.useMutation({
    onSuccess: () => {
      toast.success("Snippet created successfully");
      utils.snippets.getAll.invalidate();
      utils.snippets.getLanguages.invalidate();
      utils.snippets.getTags.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create snippet");
    },
  });

  const updateMutation = api.snippets.update.useMutation({
    onSuccess: () => {
      toast.success("Snippet updated successfully");
      utils.snippets.getAll.invalidate();
      utils.snippets.getLanguages.invalidate();
      utils.snippets.getTags.invalidate();
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update snippet");
    },
  });

  const deleteMutation = api.snippets.delete.useMutation({
    onSuccess: () => {
      toast.success("Snippet deleted successfully");
      utils.snippets.getAll.invalidate();
      utils.snippets.getLanguages.invalidate();
      utils.snippets.getTags.invalidate();
      setDeleteDialogOpen(false);
      setSnippetToDelete(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete snippet");
    },
  });

  const toggleFavoriteMutation = api.snippets.toggleFavorite.useMutation({
    onSuccess: () => {
      utils.snippets.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to toggle favorite");
    },
  });

  const markAsUsedMutation = api.snippets.markAsUsed.useMutation({
    onSuccess: () => {
      utils.snippets.getRecentlyUsed.invalidate();
    },
  });

  const importSnippetsMutation = api.snippets.importSnippets.useMutation({
    onSuccess: (data) => {
      toast.success(`Imported ${data.count} snippets successfully`);
      utils.snippets.getAll.invalidate();
      utils.snippets.getLanguages.invalidate();
      utils.snippets.getTags.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to import snippets");
    },
  });

  // Handlers
  const handleOpenDialog = (snippetId?: string) => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    if (snippetId) {
      const snippet = displaySnippets?.find((s) => s.id === snippetId);
      if (snippet) {
        setFormData({
          title: snippet.title,
          description: snippet.description || "",
          language: snippet.language,
          code: snippet.code,
          tags: snippet.tags,
          isFavorite: snippet.isFavorite,
        });
        setEditingSnippet(snippetId);
      }
    } else {
      setFormData({
        title: "",
        description: "",
        language: "",
        code: "",
        tags: [],
        isFavorite: false,
      });
      setEditingSnippet(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSnippet(null);
    setFormData({
      title: "",
      description: "",
      language: "",
      code: "",
      tags: [],
      isFavorite: false,
    });
    setNewTag("");
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.language) {
      toast.error("Language is required");
      return;
    }
    if (!formData.code.trim()) {
      toast.error("Code is required");
      return;
    }

    if (editingSnippet) {
      updateMutation.mutate({
        id: editingSnippet,
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
    setSnippetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (snippetToDelete) {
      deleteMutation.mutate({ id: snippetToDelete });
    }
  };

  const handleCopy = async (code: string, id: string) => {
    await navigator.clipboard.writeText(code);
    markAsUsedMutation.mutate({ id });
    setCopiedId(id);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleFavorite = (id: string) => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    toggleFavoriteMutation.mutate({ id });
  };

  const handleExport = async () => {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }
    try {
      const data = await utils.snippets.exportAll.fetch();
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `snippets-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Snippets exported successfully");
    } catch (error) {
      toast.error("Failed to export snippets");
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
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        toast.error("Invalid JSON format. Expected an array of snippets.");
        return;
      }

      importSnippetsMutation.mutate({ snippets: data });
    } catch (error) {
      toast.error("Failed to parse JSON file");
    }

    event.target.value = "";
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

  return (
    <Module
      title="Snippet Manager"
      description="Store and manage your code snippets"
      icon={<Code2 className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      isAuthenticated={isAuthenticated}
    >
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="space-y-2">
          <Button onClick={() => handleOpenDialog()} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            New Snippet
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Download className="h-3.5 w-3.5 mr-2" />
              Export JSON
            </Button>
            <Button
              onClick={() => {
                if (!isAuthenticated) {
                  onAuthRequired?.();
                  return;
                }
                document.getElementById("import-file")?.click();
              }}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Upload className="h-3.5 w-3.5 mr-2" />
              Import JSON
            </Button>
            <input
              id="import-file"
              type="file"
              accept=".json"
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
              placeholder="Search snippets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-primary/50"
            />
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Languages" />
                </SelectTrigger>
                <SelectContent>
                  {displayLanguages?.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
            </div>

            {(languageFilter || tagFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setLanguageFilter("");
                  setTagFilter("");
                }}
                className="w-full h-8"
              >
                <X className="h-3 w-3 mr-1" />
                Clear Filters
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

        {/* Recently Used Section */}
        {displayRecentlyUsed && displayRecentlyUsed.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium text-muted-foreground">
                Recently Used
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {displayRecentlyUsed.map((snippet) => (
                <button
                  key={snippet.id}
                  onClick={() => handleCopy(snippet.code, snippet.id)}
                  className="text-left border p-2 bg-accent/30 hover:bg-accent/50 transition-colors text-xs group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium truncate">
                      {snippet.title}
                    </span>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {snippet.language}
                    </Badge>
                  </div>
                  {copiedId === snippet.id && (
                    <span className="text-xs text-primary mt-1 block">
                      ✓ Copied!
                    </span>
                  )}
                </button>
              ))}
            </div>
            <Separator />
          </div>
        )}

        {/* Snippets List */}
        <div className="space-y-2 max-h-100 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary pr-1">
          {isLoading ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              Loading snippets...
            </div>
          ) : displaySnippets && displaySnippets.length > 0 ? (
            displaySnippets.map((snippet) => (
              <div
                key={snippet.id}
                className="border p-3 space-y-2 bg-card hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-medium truncate">
                        {snippet.title}
                      </h4>
                      <button
                        onClick={() => handleToggleFavorite(snippet.id)}
                        className="shrink-0"
                      >
                        <Star
                          className={`h-3.5 w-3.5 ${
                            snippet.isFavorite
                              ? "fill-primary text-transparent"
                              : "text-muted-foreground"
                          }`}
                        />
                      </button>
                    </div>
                    {snippet.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {snippet.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(snippet.code, snippet.id)}
                      className="h-7 w-7 p-0"
                    >
                      {copiedId === snippet.id ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(snippet.id)}
                      className="h-7 w-7 p-0"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(snippet.id)}
                      className="h-7 w-7 p-0 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="overflow-hidden [&_pre]:!m-0 [&_pre]:!p-2 [&_pre]:!overflow-x-auto [&_pre::-webkit-scrollbar]:w-0.5 [&_pre::-webkit-scrollbar-track]:bg-transparent [&_pre::-webkit-scrollbar-thumb]:bg-primary/50 [&_pre::-webkit-scrollbar-thumb]:rounded-full [&_pre::-webkit-scrollbar-thumb]:hover:bg-primary">
                  <SyntaxHighlighter
                    language={getLanguageId(snippet.language)}
                    style={
                      theme === "dark" ? stackoverflowDark : stackoverflowLight
                    }
                    customStyle={{
                      margin: 0,
                      fontSize: "0.75rem",
                      maxHeight: "280px",
                      borderRadius: "0",
                    }}
                    wrapLongLines
                  >
                    {snippet.code}
                  </SyntaxHighlighter>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="default" className="text-xs">
                    {snippet.language}
                  </Badge>
                  {snippet.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No snippets found. Create your first snippet to get started!
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary">
            <DialogHeader>
              <DialogTitle>
                {editingSnippet ? "Edit Snippet" : "New Snippet"}
              </DialogTitle>
              <DialogDescription>
                {editingSnippet
                  ? "Update your code snippet"
                  : "Create a new code snippet"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
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
                  placeholder="e.g., Fetch with error handling"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description of your snippet"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">
                  Language <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) =>
                    setFormData({ ...formData, language: value })
                  }
                >
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">
                  Code <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  placeholder="Paste your code here..."
                  className="font-mono text-xs min-h-50"
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
                {editingSnippet ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Snippet</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this snippet? This action cannot
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
