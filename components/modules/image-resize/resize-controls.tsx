"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { Link2, Link2Off, ArrowDownUp } from "lucide-react";

interface ResizeControlsProps {
  width: number;
  height: number;
  originalWidth: number;
  originalHeight: number;
  onWidthChange: (width: number) => void;
  onHeightChange: (height: number) => void;
  aspectRatioLocked: boolean;
  onAspectRatioLockedChange: (locked: boolean) => void;
  disabled?: boolean;
}

export function ResizeControls({
  width,
  height,
  originalWidth,
  originalHeight,
  onWidthChange,
  onHeightChange,
  aspectRatioLocked,
  onAspectRatioLockedChange,
  disabled = false,
}: ResizeControlsProps) {
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(
    null,
  );

  const aspectRatio = originalWidth / originalHeight;

  const handleWidthChange = (newWidth: number) => {
    onWidthChange(newWidth);
    if (aspectRatioLocked) {
      const newHeight = Math.round(newWidth / aspectRatio);
      onHeightChange(newHeight);
    }
  };

  const handleHeightChange = (newHeight: number) => {
    onHeightChange(newHeight);
    if (aspectRatioLocked) {
      const newWidth = Math.round(newHeight * aspectRatio);
      onWidthChange(newWidth);
    }
  };

  const handleSwapDimensions = () => {
    const tempWidth = width;
    onWidthChange(height);
    onHeightChange(tempWidth);
  };

  const handlePercentageChange = (percentage: number) => {
    setSelectedPercentage(percentage);
    const newWidth = Math.round((originalWidth * percentage) / 100);
    const newHeight = Math.round((originalHeight * percentage) / 100);
    onWidthChange(newWidth);
    onHeightChange(newHeight);
  };

  const percentages = [25, 50, 75, 100, 150, 200];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="dimensions">
        <TabsList>
          <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
          <TabsTrigger value="percentage">Percentage</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
        </TabsList>

        <TabsContent value="dimensions" className="space-y-4 mt-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 space-y-2">
              <Label htmlFor="width">Width</Label>
              <div className="flex items-center gap-1">
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) =>
                    handleWidthChange(parseInt(e.target.value) || 0)
                  }
                  disabled={disabled}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">px</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={handleSwapDimensions}
              disabled={disabled}
              className="mt-6"
              title="Swap dimensions"
            >
              <ArrowDownUp className="h-4 w-4" />
            </Button>

            <div className="flex-1 space-y-2">
              <Label htmlFor="height">Height</Label>
              <div className="flex items-center gap-1">
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) =>
                    handleHeightChange(parseInt(e.target.value) || 0)
                  }
                  disabled={disabled}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">px</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={aspectRatioLocked ? "default" : "outline"}
              size="sm"
              onClick={() => onAspectRatioLockedChange(!aspectRatioLocked)}
              disabled={disabled}
              className="gap-2"
            >
              {aspectRatioLocked ? (
                <Link2 className="h-4 w-4" />
              ) : (
                <Link2Off className="h-4 w-4" />
              )}
              {aspectRatioLocked ? "Locked" : "Unlocked"}
            </Button>
            <span className="text-xs text-muted-foreground">
              Aspect ratio {aspectRatioLocked ? "locked" : "unlocked"}
            </span>
          </div>
        </TabsContent>

        <TabsContent value="percentage" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Scale percentage</Label>
            <div className="grid grid-cols-3 gap-2">
              {percentages.map((percentage) => (
                <Button
                  key={percentage}
                  variant={
                    selectedPercentage === percentage ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => handlePercentageChange(percentage)}
                  disabled={disabled}
                >
                  {percentage}%
                </Button>
              ))}
            </div>
          </div>

          {selectedPercentage !== null && (
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Calculated dimensions:</div>
              <div>
                Width: {Math.round((originalWidth * selectedPercentage) / 100)}
                px
              </div>
              <div>
                Height:{" "}
                {Math.round((originalHeight * selectedPercentage) / 100)}px
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="presets" className="mt-4">
          <div className="text-sm text-muted-foreground">
            Select a preset from below
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
