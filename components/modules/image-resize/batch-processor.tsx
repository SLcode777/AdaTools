"use client";

import { Button } from "../../ui/button";
import {
  X,
  Trash2,
  Download,
  Archive,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

export interface BatchFile {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  processedSize?: number;
  processedDataUrl?: string;
  status: "pending" | "processing" | "completed" | "error";
  error?: string;
}

export interface BatchProcessorProps {
  files: BatchFile[];
  onRemoveFile: (fileId: string) => void;
  onClearAll: () => void;
  onProcessAll: () => void;
  onDownloadFile: (fileId: string) => void;
  onDownloadAllAsZip: () => void;
  isProcessing: boolean;
  currentProcessingIndex: number;
  disabled?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function BatchProcessor({
  files,
  onRemoveFile,
  onClearAll,
  onProcessAll,
  onDownloadFile,
  onDownloadAllAsZip,
  isProcessing,
  currentProcessingIndex,
  disabled = false,
}: BatchProcessorProps) {
  return (
    <div className="space-y-4">
      {/* Header with Clear All */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          {files.length} file{files.length !== 1 ? "s" : ""} selected
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          disabled={disabled || isProcessing}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Progress Bar (when processing) */}
      {isProcessing && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>Processing...</span>
            <span>
              {currentProcessingIndex + 1} of {files.length}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{
                width: `${((currentProcessingIndex + 1) / files.length) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* File List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className="flex items-center gap-3 p-2 border rounded-md"
          >
            {/* Thumbnail placeholder */}
            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
              {file.status === "processing" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {file.status === "completed" && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
              {file.status === "error" && (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm truncate">{file.name}</div>
              <div className="text-xs text-muted-foreground">
                {formatFileSize(file.originalSize)}
                {file.processedSize &&
                  ` → ${formatFileSize(file.processedSize)}`}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {file.status === "completed" && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onDownloadFile(file.id)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onRemoveFile(file.id)}
                disabled={isProcessing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onProcessAll}
          className="flex-1"
          disabled={disabled || isProcessing || files.length === 0}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            "Process All"
          )}
        </Button>
        <Button
          variant="outline"
          onClick={onDownloadAllAsZip}
          disabled={
            disabled ||
            isProcessing ||
            !files.some((f) => f.status === "completed")
          }
        >
          <Archive className="h-4 w-4 mr-2" />
          Download ZIP
        </Button>
      </div>
    </div>
  );
}
