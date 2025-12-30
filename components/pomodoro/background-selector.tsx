import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  PREDEFINED_BACKGROUNDS,
  compressImage,
  validateImageSize,
} from "@/src/lib/pomodoro-utils";
import { cn } from "@/src/lib/utils";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface BackgroundSelectorProps {
  backgroundImage: string | null;
  backgroundType: "gallery" | "custom" | "none";
  onChange: (image: string | null, type: "gallery" | "custom" | "none") => void;
  isAuthenticated: boolean;
  onAuthRequired?: () => void;
}

export function BackgroundSelector({
  backgroundImage,
  backgroundType,
  onChange,
  isAuthenticated,
  onAuthRequired,
}: BackgroundSelectorProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGallerySelect = (imageId: string) => {
    onChange(imageId, "gallery");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB raw limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Maximum 5MB.");
      return;
    }

    setUploading(true);

    try {
      // Compress image
      const compressed = await compressImage(file);

      // Validate compressed size
      if (!validateImageSize(compressed)) {
        toast.error(
          "Compressed image still too large. Try a simpler image (max 500KB after compression)."
        );
        return;
      }

      onChange(compressed, "custom");
      toast.success("Background image uploaded successfully");
    } catch (error) {
      console.error("Failed to compress image:", error);
      toast.error("Failed to process image. Please try another one.");
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveCustom = () => {
    onChange(null, "gallery");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-4">Background Image</h4>
        <p className="text-sm text-muted-foreground mb-6">
          Customize your timer background for better focus
        </p>
      </div>

      {/* Gallery Images */}
      <div className="space-y-3">
        <Label>Predefined Backgrounds</Label>
        <RadioGroup
          value={
            backgroundType === "gallery" ? backgroundImage || "none" : ""
          }
          onValueChange={handleGallerySelect}
          className="grid grid-cols-2 gap-2"
        >
          {PREDEFINED_BACKGROUNDS.map((bg) => (
            <div key={bg.id} className="relative">
              <RadioGroupItem
                value={bg.id}
                id={bg.id}
                className="peer sr-only"
              />
              <Label
                htmlFor={bg.id}
                className={cn(
                  "flex flex-col items-center justify-center  min-h-42 w-full border border-muted bg-popover p-2 hover:bg-primary/10 hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                  bg.id === "none" && "aspect-video"
                )}
              >
                {bg.url ? (
                  <div
                    className="w-full h-24 rounded bg-cover bg-center"
                    style={{ backgroundImage: `url(${bg.url})` }}
                  />
                ) : (
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                )}
                <span className="mt-2 text-xs font-medium">{bg.name}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Custom Upload */}
      <div className="space-y-3">
        <Label>Custom Background</Label>
        <p className="text-xs text-muted-foreground">
          Upload your own image (max 5MB, will be compressed to 500KB)
          {!isAuthenticated && " - Stored in browser localStorage"}
        </p>

        {backgroundType === "custom" && backgroundImage ? (
          <div className="relative rounded-lg border-2 border-primary p-2">
            <div
              className="w-full h-32 rounded bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImage})` }}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-4 right-4"
              onClick={handleRemoveCustom}
            >
              <X className="h-4 w-4" />
            </Button>
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Custom image uploaded
            </p>
          </div>
        ) : (
          <>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
              id="background-upload"
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
          </>
        )}

        {!isAuthenticated && (
          <p className="text-xs text-amber-600 dark:text-amber-500">
            ℹ️ Custom images are stored locally. Sign in to sync across devices.
          </p>
        )}
      </div>
    </div>
  );
}
