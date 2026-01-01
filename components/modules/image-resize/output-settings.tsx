"use client";

import { Button } from "../../ui/button";
import { Slider } from "../../ui/slider";
import { Label } from "../../ui/label";
import { Download, Copy, Check, RefreshCw } from "lucide-react";

interface OutputSettingsProps {
  format: "png" | "jpeg" | "webp";
  quality: number;
  onFormatChange: (format: "png" | "jpeg" | "webp") => void;
  onQualityChange: (quality: number) => void;
  estimatedFileSize: number;
  originalFileSize: number;
  onDownload: () => void;
  onCopyToClipboard: () => void;
  onReset: () => void;
  disabled?: boolean;
  isCopied?: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function OutputSettings({
  format,
  quality,
  onFormatChange,
  onQualityChange,
  estimatedFileSize,
  originalFileSize,
  onDownload,
  onCopyToClipboard,
  onReset,
  disabled = false,
  isCopied = false,
}: OutputSettingsProps) {
  const reduction = Math.round(
    ((originalFileSize - estimatedFileSize) / originalFileSize) * 100,
  );

  const formatDescriptions = {
    png: "Lossless compression, supports transparency",
    jpeg: "Lossy compression, smaller file size",
    webp: "Modern format, best compression",
  };

  return (
    <div className="space-y-4">
      {/* Format Selector */}
      <div className="space-y-2">
        <Label>Format</Label>
        <div className="flex gap-2">
          <Button
            variant={format === "png" ? "default" : "outline"}
            onClick={() => onFormatChange("png")}
            disabled={disabled}
          >
            PNG
          </Button>
          <Button
            variant={format === "jpeg" ? "default" : "outline"}
            onClick={() => onFormatChange("jpeg")}
            disabled={disabled}
          >
            JPEG
          </Button>
          <Button
            variant={format === "webp" ? "default" : "outline"}
            onClick={() => onFormatChange("webp")}
            disabled={disabled}
          >
            WebP
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDescriptions[format]}
        </p>
      </div>

      {/* Quality Slider */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label>Quality</Label>
          <span className="text-sm">{quality}%</span>
        </div>
        {format === "png" ? (
          <p className="text-xs text-muted-foreground">
            PNG is lossless - no quality adjustment needed
          </p>
        ) : (
          <Slider
            value={[quality]}
            onValueChange={([val]) => onQualityChange(val)}
            min={1}
            max={100}
            disabled={disabled}
          />
        )}
      </div>

      {/* File Size Display */}
      <div className="p-3 bg-muted/50 rounded-md space-y-1">
        <div className="text-sm font-medium">Estimated Size</div>
        <div className="text-lg font-bold">
          {formatFileSize(estimatedFileSize)}
        </div>
        <div className="text-xs text-muted-foreground">
          Original: {formatFileSize(originalFileSize)} (
          {reduction > 0 ? `${reduction}% smaller` : `${-reduction}% larger`})
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={onDownload} className="flex-1" disabled={disabled}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
        <Button
          variant="outline"
          onClick={onCopyToClipboard}
          disabled={disabled}
        >
          {isCopied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button variant="outline" onClick={onReset} disabled={disabled}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
