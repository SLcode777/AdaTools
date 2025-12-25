"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/src/lib/trpc/client";
import {
  Code2,
  Eye,
  EyeOff,
  Settings,
  Upload,
  Github,
  Loader2,
  Trash2,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Module } from "../dashboard/module";
import { FileTree, type FileNode } from "../code-reviewer/file-tree";
import { MarkdownViewer } from "../code-reviewer/markdown-viewer";

interface CodeReviewerModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export function CodeReviewerModule({
  isPinned,
  onTogglePin,
}: CodeReviewerModuleProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [inputMode, setInputMode] = useState<"files" | "github">("files");
  const [githubUrl, setGithubUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<Map<string, string>>(
    new Map(),
  );
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [findIssues, setFindIssues] = useState(true);
  const [suggestImprovements, setSuggestImprovements] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [tokenUsage, setTokenUsage] = useState<{
    input: number;
    output: number;
  } | null>(null);

  const { data: apiKeyData, refetch: refetchApiKey } =
    api.codeReviewer.getApiKey.useQuery();
  const saveApiKeyMutation = api.codeReviewer.saveApiKey.useMutation();
  const fetchGitHubMutation = api.codeReviewer.fetchGitHubRepo.useMutation();
  const analyzeCodeMutation = api.codeReviewer.analyzeCode.useMutation();

  useEffect(() => {
    if (apiKeyData?.apiKey) {
      setApiKey(apiKeyData.apiKey);
    }
  }, [apiKeyData?.apiKey]);

  const handleSaveApiKey = async () => {
    try {
      await saveApiKeyMutation.mutateAsync({ apiKey });
      await refetchApiKey();
      setShowSettings(false);
      alert("API key saved successfully!");
    } catch (error) {
      console.error("Error saving API key:", error);
      alert("Failed to save API key. Please try again.");
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    const newFiles = new Map(uploadedFiles);

    for (const file of files) {
      try {
        const content = await readFileAsText(file);
        newFiles.set(file.name, content);
      } catch (error) {
        console.error(`Error reading file ${file.name}:`, error);
      }
    }

    setUploadedFiles(newFiles);
    buildFileTree(newFiles);
    setReport(null);
    setTokenUsage(null);
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const buildFileTree = (files: Map<string, string>) => {
    const tree: FileNode[] = [];

    files.forEach((content, path) => {
      tree.push({
        name: path,
        path: path,
        type: "file",
      });
    });

    setFileTree(tree);
  };

  const handleClearFiles = () => {
    setUploadedFiles(new Map());
    setFileTree([]);
    setSelectedFiles(new Set());
    setReport(null);
    setTokenUsage(null);
  };

  const handleFetchGitHub = async () => {
    if (!githubUrl.trim()) return;

    try {
      const result = await fetchGitHubMutation.mutateAsync({
        repoUrl: githubUrl,
        branch: "main",
      });

      // Convert tree nodes from API format to component format
      const convertTree = (nodes: typeof result.tree): FileNode[] => {
        return nodes.map((node) => ({
          name: node.path.split("/").pop() || node.path,
          path: node.path,
          type: node.type === "file" ? "file" : "directory",
          children: node.children ? convertTree(node.children) : undefined,
        }));
      };

      setFileTree(convertTree(result.tree));
      setReport(null);
      setTokenUsage(null);
    } catch (error) {
      console.error("Error fetching GitHub repo:", error);
      alert(
        "Failed to fetch GitHub repository. Please check the URL and try again.",
      );
    }
  };

  const handleAnalyze = async () => {
    if (selectedFiles.size === 0 || !apiKeyData?.hasApiKey) return;

    setIsAnalyzing(true);
    try {
      const filesToAnalyze: Array<{ path: string; content: string }> = [];

      // If files are uploaded, get content from uploadedFiles
      if (uploadedFiles.size > 0) {
        selectedFiles.forEach((path) => {
          const content = uploadedFiles.get(path);
          if (content) {
            filesToAnalyze.push({ path, content });
          }
        });
      } else {
        // For GitHub files, we need to fetch content using the mutation
        // Note: This is a limitation - we can't use useQuery in a handler
        // For now, we'll show an error. This should be handled by the backend
        // or we need to pre-fetch all file contents when the tree is loaded
        throw new Error(
          "GitHub file analysis not yet implemented. Please upload files directly.",
        );
      }

      // Determine analysis type based on checkboxes
      let analysisType: "issues" | "improvements" | "full";
      if (findIssues && suggestImprovements) {
        analysisType = "full";
      } else if (findIssues) {
        analysisType = "issues";
      } else if (suggestImprovements) {
        analysisType = "improvements";
      } else {
        analysisType = "full"; // Default fallback
      }

      const result = await analyzeCodeMutation.mutateAsync({
        files: filesToAnalyze,
        analysisType,
      });

      setReport(result.report);
      setTokenUsage({
        input: result.usage.inputTokens,
        output: result.usage.outputTokens,
      });
    } catch (error) {
      console.error("Error analyzing code:", error);
      alert("Failed to analyze code. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze =
    selectedFiles.size > 0 && apiKeyData?.hasApiKey && !isAnalyzing;

  return (
    <Module
      title="Code Reviewer"
      description="AI-powered code review with Claude"
      icon={<Code2 className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="space-y-4">
        {/* API Key Settings */}
        {!apiKeyData?.hasApiKey && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please configure your Anthropic API key to use this module.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            className="w-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            {showSettings ? "Hide" : "Show"} API Key Settings
          </Button>

          {showSettings && (
            <div className="space-y-2 p-3 border bg-background/20">
              <Label htmlFor="apiKey">Anthropic API Key</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={handleSaveApiKey}
                  disabled={!apiKey || saveApiKeyMutation.isPending}
                >
                  {saveApiKeyMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Get your API key from{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  Anthropic Console
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Input Section with Tabs */}
        <Tabs
          value={inputMode}
          onValueChange={(v) => setInputMode(v as "files" | "github")}
        >
          <TabsList className="w-full">
            <TabsTrigger value="files" className="flex-1">
              <Upload className="h-4 w-4 mr-2" />
              Files
            </TabsTrigger>
            <TabsTrigger value="github" className="flex-1">
              <Github className="h-4 w-4 mr-2" />
              GitHub
            </TabsTrigger>
          </TabsList>

          <TabsContent value="files" className="mt-4">
            <div className="space-y-4">
              {/* Drag & Drop Zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById("fileInput")?.click()}
                className="border-2 border-dashed py-12 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="h-8 w-8 mb-2" />
                <div className="text-sm">
                  Drop your code files here or click to browse
                </div>
                <div className="text-xs mt-1">
                  You can select multiple files
                </div>
              </div>
              <input
                id="fileInput"
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Uploaded Files List */}
              {uploadedFiles.size > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">
                      Uploaded files ({uploadedFiles.size})
                    </Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearFiles}
                      className="h-6 text-xs"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="github" className="mt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="githubUrl">GitHub Repository URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="githubUrl"
                    type="url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo"
                  />
                  <Button
                    onClick={handleFetchGitHub}
                    disabled={
                      !githubUrl.trim() || fetchGitHubMutation.isPending
                    }
                  >
                    {fetchGitHubMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      "Fetch"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* File Tree Section */}
        {fileTree.length > 0 && (
          <div className="space-y-2">
            <Label>Select files to analyze</Label>
            <FileTree
              nodes={fileTree}
              selectedFiles={selectedFiles}
              onSelectionChange={setSelectedFiles}
            />
            <p className="text-xs text-muted-foreground">
              {selectedFiles.size} file{selectedFiles.size !== 1 ? "s" : ""}{" "}
              selected
            </p>
          </div>
        )}

        {/* Analysis Options */}
        {fileTree.length > 0 && (
          <div className="space-y-3 p-3 border bg-background/20">
            <Label>Analysis Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="findIssues"
                  checked={findIssues}
                  onCheckedChange={(checked) =>
                    setFindIssues(checked as boolean)
                  }
                />
                <Label
                  htmlFor="findIssues"
                  className="text-sm font-normal cursor-pointer"
                >
                  Find Issues (bugs, security vulnerabilities, code smells)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="suggestImprovements"
                  checked={suggestImprovements}
                  onCheckedChange={(checked) =>
                    setSuggestImprovements(checked as boolean)
                  }
                />
                <Label
                  htmlFor="suggestImprovements"
                  className="text-sm font-normal cursor-pointer"
                >
                  Suggest Improvements (features, architecture, best practices)
                </Label>
              </div>
            </div>
          </div>
        )}

        {/* Analyze Button */}
        {fileTree.length > 0 && (
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="h-4 w-4 mr-2" />
                Analyze Code
              </>
            )}
          </Button>
        )}

        {/* Token Usage */}
        {tokenUsage && (
          <div className="bg-primary/10 dark:bg-primary/10 border border-primary dark:border-primary p-3">
            <Label className="text-sm font-medium text-primary dark:text-chart-1">
              Token Usage
            </Label>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">Input:</span>
              <span className="text-xs font-medium">
                {tokenUsage.input.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Output:</span>
              <span className="text-xs font-medium">
                {tokenUsage.output.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-t mt-1 pt-1">
              <span className="text-xs font-medium text-primary dark:text-chart-1">
                Total:
              </span>
              <span className="text-xs font-bold text-primary dark:text-chart-1">
                {(tokenUsage.input + tokenUsage.output).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Report Section */}
        {report && (
          <MarkdownViewer content={report} filename="code-review.md" />
        )}
      </div>
    </Module>
  );
}
