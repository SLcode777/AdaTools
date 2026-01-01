"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { ZoomIn, ZoomOut, Maximize2, Eye, EyeOff } from "lucide-react";

interface ImagePreviewProps {
  canvas: HTMLCanvasElement | null;
  originalImage: HTMLImageElement | null;
  originalWidth: number;
  originalHeight: number;
  newWidth: number;
  newHeight: number;
  originalFileSize?: number;
  estimatedFileSize?: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImagePreview({
  canvas,
  originalImage,
  originalWidth,
  originalHeight,
  newWidth,
  newHeight,
  originalFileSize,
  estimatedFileSize,
}: ImagePreviewProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  const zoomLevels = [25, 50, 75, 100, 150, 200];

  const zoomIn = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex < zoomLevels.length - 1) {
      setZoom(zoomLevels[currentIndex + 1]);
    }
  };

  const zoomOut = () => {
    const currentIndex = zoomLevels.indexOf(zoom);
    if (currentIndex > 0) {
      setZoom(zoomLevels[currentIndex - 1]);
    }
  };

  const fitToView = () => {
    setZoom(100);
  };

  const toggleView = () => {
    setShowOriginal(!showOriginal);
  };

  useEffect(() => {
    if (!previewCanvasRef.current) return;

    const previewCanvas = previewCanvasRef.current;
    const ctx = previewCanvas.getContext("2d");
    if (!ctx) return;

    if (showOriginal && originalImage) {
      // Show original image
      previewCanvas.width = originalWidth;
      previewCanvas.height = originalHeight;
      ctx.drawImage(originalImage, 0, 0);
    } else if (canvas) {
      // Show resized image
      previewCanvas.width = newWidth;
      previewCanvas.height = newHeight;
      ctx.drawImage(canvas, 0, 0);
    }
  }, [
    canvas,
    originalImage,
    showOriginal,
    originalWidth,
    originalHeight,
    newWidth,
    newHeight,
  ]);

  return (
    <div className="space-y-4">
      {/* Preview Container */}
      <div className="relative border rounded-md overflow-hidden bg-muted/30">
        {/* Zoom controls - positioned top-right */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-background/80 rounded-md p-1">
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={zoomOut}
            disabled={zoom === zoomLevels[0]}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs w-12 text-center">{zoom}%</span>
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={zoomIn}
            disabled={zoom === zoomLevels[zoomLevels.length - 1]}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button size="icon-sm" variant="ghost" onClick={fitToView}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Canvas container - scrollable if zoomed */}
        <div className="overflow-auto max-h-64">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "center",
            }}
          >
            <canvas ref={previewCanvasRef} className="mx-auto block" />
          </div>
        </div>
      </div>

      {/* Controls and Info */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={toggleView}>
          {showOriginal ? (
            <Eye className="h-4 w-4 mr-2" />
          ) : (
            <EyeOff className="h-4 w-4 mr-2" />
          )}
          {showOriginal ? "Original" : "Resized"}
        </Button>

        <div className="text-xs text-muted-foreground space-x-4">
          <span>
            Original: {originalWidth}×{originalHeight}
          </span>
          <span>
            New: {newWidth}×{newHeight}
          </span>
        </div>
      </div>

      {/* File size comparison */}
      {originalFileSize && estimatedFileSize && (
        <div className="text-xs text-muted-foreground">
          Size: {formatFileSize(originalFileSize)} →{" "}
          {formatFileSize(estimatedFileSize)}
        </div>
      )}
    </div>
  );
}
