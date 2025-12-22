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
}

export function WebpConverterModule({
  isPinned,
  onTogglePin,
}: WebpConverterModuleProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(80);
  const [lossless, setLossless] = useState<boolean>(false);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const convertToWebpMutation = api.webpConverter.convertToWebp.useMutation();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setOriginalSize(file.size);
      setResultUrl(null);
      setConvertedSize(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setOriginalSize(file.size);
      setResultUrl(null);
      setConvertedSize(0);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setResultUrl(null);
    setOriginalSize(0);
    setConvertedSize(0);
  };

  const handleConvertToWebp = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    try {
      // Read file as base64
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);

      reader.onload = async () => {
        try {
          const base64 = reader.result as string;

          const result = await convertToWebpMutation.mutateAsync({
            imageBase64: base64,
            quality,
            lossless,
          });

          setResultUrl(result.base64);
          setConvertedSize(result.size);
          setIsProcessing(false);
        } catch (error) {
          console.error("Conversion error:", error);
          alert("Failed to convert image. Please try again.");
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        console.error("Error reading file");
        alert("Error reading file. Please try again.");
        setIsProcessing(false);
      };
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Failed to convert image. Please try again.");
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
            {selectedFile ? (
              <div className="flex flex-row border border-primary p-1 items-center">
                <FileImage size={20} />
                <p className="ml-2 text-sm">{selectedFile?.name}</p>
                <X
                  className="ml-2"
                  size={20}
                  color="red"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFile();
                  }}
                />
              </div>
            ) : (
              "Drop your image here or click to browse"
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Conversion Options */}
        {selectedFile && (
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
          disabled={!selectedFile || isProcessing}
          className="w-full"
        >
          {isProcessing ? "Converting..." : "Convert to WebP"}
        </Button>

        {/* Result */}
        {resultUrl && (
          <div className="space-y-2">
            <Label>Result</Label>

            {/* File Size Comparison */}
            <div className="bg-primary/10 border border-primary rounded-lg p-3 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Original:</span>
                <span className="font-medium">
                  {(originalSize / 1024).toFixed(2)} KB
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">WebP:</span>
                <span className="font-medium">
                  {(convertedSize / 1024).toFixed(2)} KB
                </span>
              </div>
              <div className="flex justify-between text-sm border-t pt-1 mt-1">
                <span className="text-muted-foreground">Reduction:</span>
                <span
                  className={`font-bold ${
                    convertedSize < originalSize
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {convertedSize < originalSize ? "-" : "+"}
                  {(
                    ((originalSize - convertedSize) / originalSize) *
                    100
                  ).toFixed(1)}
                  %
                </span>
              </div>
            </div>

            <div className="relative border rounded-lg overflow-hidden">
              <Image
                src={resultUrl}
                alt="Result"
                width={40}
                height={40}
                className="w-full"
              />
              <Button
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  const a = document.createElement("a");
                  a.href = resultUrl;
                  const originalName = selectedFile?.name.replace(
                    /\.[^/.]+$/,
                    ""
                  );
                  a.download = `${originalName}.webp`;
                  a.click();
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </Module>
  );
}
