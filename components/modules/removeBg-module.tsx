"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/src/lib/trpc/client";
import {
  Download,
  Eye,
  EyeOff,
  FileImage,
  Settings,
  Upload,
  Wallpaper,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Module } from "../dashboard/module";

type OutputSize =
  | "preview"
  | "small"
  | "regular"
  | "medium"
  | "hd"
  | "4k"
  | "full";
type ImageType = "auto" | "person" | "product" | "car";

const CREDIT_COSTS: Record<OutputSize, number> = {
  preview: 0.25,
  small: 0.25,
  regular: 1,
  medium: 1,
  hd: 1,
  "4k": 1,
  full: 1,
};

interface RemoveBgModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export function RemoveBgModule({ isPinned, onTogglePin }: RemoveBgModuleProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [size, setSize] = useState<OutputSize>("regular");
  const [type, setType] = useState<ImageType>("auto");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: apiKeyData, refetch: refetchApiKey } =
    api.removeBg.getApiKey.useQuery();
  const { data: accountBalance, refetch: refetchBalance } =
    api.removeBg.getAccountBalance.useQuery(undefined, {
      enabled: !!apiKeyData?.hasApiKey,
    });
  const saveApiKeyMutation = api.removeBg.saveApiKey.useMutation();
  const removeBgMutation = api.removeBg.removeBackground.useMutation();

  useEffect(() => {
    if (apiKeyData?.apiKey) {
      setApiKey(apiKeyData.apiKey);
    }
  }, [apiKeyData]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setResultUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setResultUrl(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64Data = base64.split(",")[1];
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSaveApiKey = async () => {
    try {
      await saveApiKeyMutation.mutateAsync({ apiKey });
      await refetchApiKey();
      await refetchBalance();
      setShowSettings(false);
      alert("API key saved successfully!");
    } catch (error) {
      console.error("Error saving API key:", error);
      alert("Failed to save API key. Please try again.");
    }
  };

  const handleRemoveBg = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    try {
      const imageBase64 = await fileToBase64(selectedFile);

      const result = await removeBgMutation.mutateAsync({
        imageBase64,
        size,
        type,
      });

      // Convert base64 back to data URL for display
      setResultUrl(`data:image/png;base64,${result.base64}`);

      // Refetch balance to update remaining credits
      await refetchBalance();
    } catch (error) {
      console.error("Error removing background:", error);
      alert("Failed to remove background. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const creditCost = CREDIT_COSTS[size];

  return (
    <Module
      title="Remove Background"
      description="Remove background from an image file"
      icon={<Wallpaper className="h-5 w-5" color="#00B5D4" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="space-y-4">
        {/* API Key Settings */}
        {!apiKeyData?.hasApiKey && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Please configure your Remove.bg API key to use this module.
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
            <div className="space-y-2 p-3 border rounded-lg">
              <Label htmlFor="apiKey">Remove.bg API Key</Label>
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
                  href="https://www.remove.bg/api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-foreground"
                >
                  remove.bg.
                </a>{" "}
                Your first 50 API calls/month are free.
              </p>
            </div>
          )}
        </div>

        {/* File Upload Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed rounded-lg py-12 flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors"
        >
          <Upload className="h-8 w-8 mb-2" />
          <div className="text-sm">
            {selectedFile ? (
              <div className="flex flex-row border border-primary p-1 items-center">
                <FileImage size={20} />
                <p className=" text-sm">{selectedFile?.name}</p>
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

        {/* Options */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size">Output Size</Label>
            <Select
              value={size}
              onValueChange={(v) => setSize(v as OutputSize)}
            >
              <SelectTrigger id="size" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="preview">Preview (0.25 credit)</SelectItem>
                <SelectItem value="small">Small (0.25 credit)</SelectItem>
                <SelectItem value="regular">Regular (1 credit)</SelectItem>
                <SelectItem value="medium">Medium (1 credit)</SelectItem>
                <SelectItem value="hd">HD (1 credit)</SelectItem>
                <SelectItem value="4k">4K (1 credit)</SelectItem>
                <SelectItem value="full">Full (1 credit)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Image Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as ImageType)}>
              <SelectTrigger id="type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto</SelectItem>
                <SelectItem value="person">Person</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="car">Car</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedFile && (
          <div className="flex flex-col gap-1 w-full">
            {/* Credit Cost Display */}
            <div className="text-sm text-muted-foreground bg-muted p-2 ">
              This operation will cost{" "}
              <span className="font-semibold text-foreground">
                {creditCost} credit{creditCost > 1 ? "s" : ""}
              </span>
            </div>
            {/* Account Balance */}
            {accountBalance && (
              <div className="bg-primary/10 dark:bg-primary/10 border border-primary dark:border-primary  px-3 py-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-primary dark:text-chart-1">
                    Remaining Credits
                  </p>
                  <p className="text-lg font-bold text-primary dark:text-chart-1">
                    {accountBalance.total}
                  </p>
                </div>
                {accountBalance.freeCalls > 0 && (
                  <p className="text-xs text-chart-2  ">
                    + {accountBalance.freeCalls} free calls
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={handleRemoveBg}
          disabled={!selectedFile || isProcessing || !apiKeyData?.hasApiKey}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Remove Background"}
        </Button>

        {/* Result */}
        {resultUrl && (
          <div className="space-y-2">
            <Label>Result</Label>
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
                  a.download = `no-bg-${selectedFile?.name}`;
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
