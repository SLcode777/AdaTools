"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Module } from "../dashboard/module";
import { Button } from "../ui/button";
import {
  ImageIcon,
  Upload,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Layers,
} from "lucide-react";
import { ResizeControls } from "./image-resize/resize-controls";
import { PresetSelector } from "./image-resize/preset-selector";
import { ImagePreview } from "./image-resize/image-preview";
import { OutputSettings } from "./image-resize/output-settings";
import { BatchProcessor, type BatchFile } from "./image-resize/batch-processor";
import {
  loadImageFromFile,
  resizeImage,
  convertToFormat,
  estimateFileSize,
  rotateImage,
  flipImage,
  type ImageFormat,
} from "@/src/lib/image-resize-utils";

interface ImageResizeModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

export function ImageResizeModule({
  isPinned,
  onTogglePin,
  isAuthenticated = true,
}: ImageResizeModuleProps) {
  // Mode state
  const [batchMode, setBatchMode] = useState(false);

  // Single mode state
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(
    null,
  );
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [aspectRatioLocked, setAspectRatioLocked] = useState(true);
  const [format, setFormat] = useState<ImageFormat>("png");
  const [quality, setQuality] = useState(92);
  const [processedCanvas, setProcessedCanvas] =
    useState<HTMLCanvasElement | null>(null);
  const [estimatedSize, setEstimatedSize] = useState(0);
  const [originalFileSize, setOriginalFileSize] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  // Batch mode state
  const [batchFiles, setBatchFiles] = useState<BatchFile[]>([]);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Process image (with debouncing)
  const processImage = useCallback(
    async (
      img: HTMLImageElement,
      newWidth: number,
      newHeight: number,
      outputFormat: ImageFormat,
      outputQuality: number,
    ) => {
      try {
        const canvas = await resizeImage(img, {
          width: newWidth,
          height: newHeight,
          maintainAspectRatio: false,
        });

        const qualityDecimal = outputQuality / 100;
        const dataUrl = await convertToFormat(
          canvas,
          outputFormat,
          qualityDecimal,
        );
        const size = estimateFileSize(dataUrl);

        setProcessedCanvas(canvas);
        setEstimatedSize(size);
      } catch (error) {
        console.error("Error processing image:", error);
      }
    },
    [],
  );

  // Debounced image processing
  useEffect(() => {
    if (!originalImage || width <= 0 || height <= 0) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      processImage(originalImage, width, height, format, quality);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [originalImage, width, height, format, quality, processImage]);

  // Handle file selection
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const {
        image,
        width: imgWidth,
        height: imgHeight,
      } = await loadImageFromFile(file);

      setOriginalImage(image);
      setOriginalWidth(imgWidth);
      setOriginalHeight(imgHeight);
      setWidth(imgWidth);
      setHeight(imgHeight);
      setOriginalFileSize(file.size);
    } catch {
      console.error("Error loading image");
    }
  };

  // Handle drag and drop
  const handleDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;

    try {
      const {
        image,
        width: imgWidth,
        height: imgHeight,
      } = await loadImageFromFile(file);

      setOriginalImage(image);
      setOriginalWidth(imgWidth);
      setOriginalHeight(imgHeight);
      setWidth(imgWidth);
      setHeight(imgHeight);
      setOriginalFileSize(file.size);
    } catch {
      console.error("Error loading image");
    }
  };

  // Handle paste from clipboard
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (!file) continue;

          try {
            const {
              image,
              width: imgWidth,
              height: imgHeight,
            } = await loadImageFromFile(file);

            setOriginalImage(image);
            setOriginalWidth(imgWidth);
            setOriginalHeight(imgHeight);
            setWidth(imgWidth);
            setHeight(imgHeight);
            setOriginalFileSize(file.size);
          } catch (error) {
            console.error("Error loading pasted image:", error);
          }
          break;
        }
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, []);

  // Handle rotation
  const handleRotate = (degrees: 90 | 180 | 270) => {
    if (!processedCanvas) return;

    try {
      const rotatedCanvas = rotateImage(processedCanvas, degrees);
      setProcessedCanvas(rotatedCanvas);

      // Update dimensions if rotated 90 or 270
      if (degrees === 90 || degrees === 270) {
        const newWidth = height;
        const newHeight = width;
        setWidth(newWidth);
        setHeight(newHeight);
      }
    } catch (error) {
      console.error("Error rotating image:", error);
    }
  };

  // Handle flip
  const handleFlip = (direction: "horizontal" | "vertical") => {
    if (!processedCanvas) return;

    try {
      const flippedCanvas = flipImage(processedCanvas, direction);
      setProcessedCanvas(flippedCanvas);
    } catch (error) {
      console.error("Error flipping image:", error);
    }
  };

  // Handle download
  const handleDownload = async () => {
    if (!processedCanvas) return;

    try {
      const qualityDecimal = quality / 100;
      const dataUrl = await convertToFormat(
        processedCanvas,
        format,
        qualityDecimal,
      );

      const link = document.createElement("a");
      link.download = `resized-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    if (!processedCanvas) return;

    try {
      processedCanvas.toBlob(async (blob) => {
        if (!blob) return;

        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);

        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };

  // Handle reset
  const handleReset = () => {
    setOriginalImage(null);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setWidth(0);
    setHeight(0);
    setProcessedCanvas(null);
    setEstimatedSize(0);
    setOriginalFileSize(0);
    setFormat("png");
    setQuality(92);
    setAspectRatioLocked(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle preset selection
  const handlePresetSelect = (presetWidth: number, presetHeight: number) => {
    setWidth(presetWidth);
    setHeight(presetHeight);
  };

  // Batch mode handlers
  const handleRemoveBatchFile = (fileId: string) => {
    setBatchFiles(batchFiles.filter((f) => f.id !== fileId));
  };

  const handleClearAllBatch = () => {
    setBatchFiles([]);
  };

  const handleProcessAllBatch = async () => {
    setIsProcessingBatch(true);

    for (let i = 0; i < batchFiles.length; i++) {
      setCurrentBatchIndex(i);
      const file = batchFiles[i];

      try {
        // Update status to processing
        setBatchFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: "processing" as const } : f,
          ),
        );

        // Process the file
        const { image } = await loadImageFromFile(file.file);
        const canvas = await resizeImage(image, {
          width,
          height,
          maintainAspectRatio: aspectRatioLocked,
        });

        const qualityDecimal = quality / 100;
        const dataUrl = await convertToFormat(canvas, format, qualityDecimal);
        const size = estimateFileSize(dataUrl);

        // Update status to completed
        setBatchFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "completed" as const,
                  processedDataUrl: dataUrl,
                  processedSize: size,
                }
              : f,
          ),
        );
      } catch {
        // Update status to error
        setBatchFiles((prev) =>
          prev.map((f) =>
            f.id === file.id
              ? {
                  ...f,
                  status: "error" as const,
                  error: "Failed to process",
                }
              : f,
          ),
        );
      }
    }

    setIsProcessingBatch(false);
  };

  const handleDownloadBatchFile = (fileId: string) => {
    const file = batchFiles.find((f) => f.id === fileId);
    if (!file || !file.processedDataUrl) return;

    const link = document.createElement("a");
    link.download = `resized-${file.name}`;
    link.href = file.processedDataUrl;
    link.click();
  };

  const handleDownloadAllAsZip = async () => {
    // This would require a zip library like JSZip
    console.log("Download all as ZIP - not yet implemented");
  };

  const imageLoaded = originalImage !== null;

  return (
    <Module
      title="Image Resize"
      description="Resize images with presets and custom dimensions"
      icon={<ImageIcon className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      isAuthenticated={isAuthenticated}
    >
      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex gap-2">
          <Button
            variant={!batchMode ? "default" : "outline"}
            size="sm"
            onClick={() => setBatchMode(false)}
          >
            Single
          </Button>
          <Button
            variant={batchMode ? "default" : "outline"}
            size="sm"
            onClick={() => setBatchMode(true)}
          >
            <Layers className="h-4 w-4 mr-2" />
            Batch
          </Button>
        </div>

        {/* Upload Zone (when no image and not in batch mode) */}
        {!imageLoaded && !batchMode && (
          <div
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Drop image here or click to upload
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, WebP, GIF supported
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Main Content (when image loaded and not in batch mode) */}
        {imageLoaded && !batchMode && (
          <div className="space-y-4">
            {/* Transformation Controls */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRotate(90)}
              >
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFlip("horizontal")}
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFlip("vertical")}
              >
                <FlipVertical className="h-4 w-4" />
              </Button>
            </div>

            {/* Preview */}
            <ImagePreview
              canvas={processedCanvas}
              originalImage={originalImage}
              originalWidth={originalWidth}
              originalHeight={originalHeight}
              newWidth={width}
              newHeight={height}
              originalFileSize={originalFileSize}
              estimatedFileSize={estimatedSize}
            />

            {/* Controls */}
            <ResizeControls
              width={width}
              height={height}
              originalWidth={originalWidth}
              originalHeight={originalHeight}
              onWidthChange={setWidth}
              onHeightChange={setHeight}
              aspectRatioLocked={aspectRatioLocked}
              onAspectRatioLockedChange={setAspectRatioLocked}
            />

            {/* Preset Selector */}
            <PresetSelector onPresetSelect={handlePresetSelect} />

            {/* Output Settings */}
            <OutputSettings
              format={format}
              quality={quality}
              onFormatChange={setFormat}
              onQualityChange={setQuality}
              estimatedFileSize={estimatedSize}
              originalFileSize={originalFileSize}
              onDownload={handleDownload}
              onCopyToClipboard={handleCopyToClipboard}
              onReset={handleReset}
              isCopied={isCopied}
            />
          </div>
        )}

        {/* Batch Mode */}
        {batchMode && (
          <BatchProcessor
            files={batchFiles}
            onRemoveFile={handleRemoveBatchFile}
            onClearAll={handleClearAllBatch}
            onProcessAll={handleProcessAllBatch}
            onDownloadFile={handleDownloadBatchFile}
            onDownloadAllAsZip={handleDownloadAllAsZip}
            isProcessing={isProcessingBatch}
            currentProcessingIndex={currentBatchIndex}
          />
        )}
      </div>
    </Module>
  );
}
