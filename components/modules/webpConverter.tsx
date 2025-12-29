"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { api } from "@/src/lib/trpc/client";
import { Download, FileImage, Images, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Module } from "../dashboard/module";

interface WebpConverterModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

interface ConversionResult {
  fileName: string;
  originalSize: number;
  convertedSize: number;
  base64: string;
}

export function WebpConverterModule({
  isPinned,
  onTogglePin,
  isAuthenticated = true,
}: WebpConverterModuleProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [quality, setQuality] = useState<number>(80);
  const [lossless, setLossless] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToWebpMutation = api.webpConverter.convertToWebp.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...imageFiles]);
      setResults([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...imageFiles]);
      setResults([]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setResults([]);
  };

  const handleConvertToWebp = async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    const conversionResults: ConversionResult[] = [];

    try {
      for (const file of selectedFiles) {
        try {
          // Read file as base64
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error("Error reading file"));
          });

          const result = await convertToWebpMutation.mutateAsync({
            imageBase64: base64,
            quality,
            lossless,
          });

          conversionResults.push({
            fileName: file.name.replace(/\.[^/.]+$/, ""),
            originalSize: file.size,
            convertedSize: result.size,
            base64: result.base64,
          });
        } catch (error) {
          console.error(`Error converting ${file.name}:`, error);
        }
      }

      setResults(conversionResults);
      setIsProcessing(false);
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Failed to convert images. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <Module
      title="Webp Converter"
      description="Convert a jpg/png image to webp format"
      icon={<Images className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
      isAuthenticated={isAuthenticated}
    >
      <div className="space-y-4">
        {/* File Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed py-12 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="h-8 w-8 mb-2" />
          <div className="text-sm">
            Drop your images here or click to browse
          </div>
          <div className="text-xs mt-1">You can select multiple files</div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">
                Selected files ({selectedFiles.length})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-6 text-xs"
              >
                Clear all
              </Button>
            </div>
            <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-2">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted px-2 py-1 rounded text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileImage size={16} className="shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-muted-foreground shrink-0">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <X
                    size={16}
                    className="cursor-pointer text-destructive hover:text-destructive/80 shrink-0 ml-2"
                    onClick={() => handleRemoveFile(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversion Options */}
        {selectedFiles.length > 0 && (
          <div className="space-y-4 p-3 border">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="quality">Quality: {quality}%</Label>
              </div>
              <Slider
                id="quality"
                min={1}
                max={100}
                step={1}
                value={[quality]}
                onValueChange={(value) => setQuality(value[0])}
                disabled={lossless}
              />
              <p className="text-xs text-muted-foreground">
                {lossless
                  ? "Quality is disabled in lossless mode"
                  : "Higher quality = larger file size"}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lossless"
                checked={lossless}
                onCheckedChange={(checked) => setLossless(checked as boolean)}
              />
              <Label
                htmlFor="lossless"
                className="text-sm font-normal cursor-pointer"
              >
                Lossless compression (larger file size)
              </Label>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleConvertToWebp}
          disabled={selectedFiles.length === 0 || isProcessing}
          className="w-full"
        >
          {isProcessing
            ? "Converting..."
            : `Convert ${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} to WebP`}
        </Button>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Results ({results.length})</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  results.forEach((result) => {
                    const a = document.createElement("a");
                    a.href = result.base64;
                    a.download = `${result.fileName}.webp`;
                    a.click();
                  });
                }}
                className="h-7 text-xs"
              >
                <Download className="h-3 w-3 mr-1" />
                Download all
              </Button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-3">
              {results.map((result, index) => (
                <div key={index} className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate">
                      {result.fileName}.webp
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const a = document.createElement("a");
                        a.href = result.base64;
                        a.download = `${result.fileName}.webp`;
                        a.click();
                      }}
                      className="h-7 text-xs shrink-0"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>

                  {/* File Size Comparison */}
                  <div className="bg-primary/10 border border-primary rounded-lg p-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Original:</span>
                      <span className="font-medium">
                        {(result.originalSize / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">WebP:</span>
                      <span className="font-medium">
                        {(result.convertedSize / 1024).toFixed(2)} KB
                      </span>
                    </div>
                    <div className="flex justify-between text-xs border-t pt-1 mt-1">
                      <span className="text-muted-foreground">Reduction:</span>
                      <span
                        className={`font-bold ${
                          result.convertedSize < result.originalSize
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {result.convertedSize < result.originalSize ? "-" : "+"}
                        {(
                          ((result.originalSize - result.convertedSize) /
                            result.originalSize) *
                          100
                        ).toFixed(1)}
                        %
                      </span>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="relative border rounded-lg overflow-hidden">
                    <Image
                      src={result.base64}
                      alt={result.fileName}
                      width={40}
                      height={40}
                      className="w-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Module>
  );
}
