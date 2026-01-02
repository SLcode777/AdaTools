"use client";

import { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Plus, Trash2 } from "lucide-react";
import {
  SOCIAL_MEDIA_PRESETS,
  COMMON_PRESETS,
  loadCustomPresets,
  saveCustomPreset,
  deleteCustomPreset,
  type ImagePreset,
} from "@/src/lib/image-resize-presets";

interface PresetSelectorProps {
  onPresetSelect: (width: number, height: number) => void;
  selectedPresetId?: string;
  disabled?: boolean;
}

export function PresetSelector({
  onPresetSelect,
  selectedPresetId,
  disabled = false,
}: PresetSelectorProps) {
  const [customPresets, setCustomPresets] = useState<ImagePreset[]>(() =>
    loadCustomPresets(),
  );
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [newPresetWidth, setNewPresetWidth] = useState("");
  const [newPresetHeight, setNewPresetHeight] = useState("");

  const handlePresetClick = (preset: ImagePreset) => {
    if (disabled) return;
    onPresetSelect(preset.width, preset.height);
  };

  const handleSaveCustomPreset = () => {
    const width = parseInt(newPresetWidth, 10);
    const height = parseInt(newPresetHeight, 10);

    if (
      !newPresetName.trim() ||
      isNaN(width) ||
      isNaN(height) ||
      width <= 0 ||
      height <= 0
    ) {
      return;
    }

    const newPreset = saveCustomPreset({
      name: newPresetName.trim(),
      width,
      height,
    });

    setCustomPresets([...customPresets, newPreset]);
    setNewPresetName("");
    setNewPresetWidth("");
    setNewPresetHeight("");
    setShowAddDialog(false);
  };

  const handleDeleteCustomPreset = (presetId: string) => {
    deleteCustomPreset(presetId);
    setCustomPresets(customPresets.filter((p) => p.id !== presetId));
  };

  const renderPresetButton = (preset: ImagePreset) => {
    const aspectRatio = preset.width / preset.height;
    const visualWidth = Math.min(40, 40 * aspectRatio);
    const visualHeight = Math.min(40, 40 / aspectRatio);

    return (
      <Button
        key={preset.id}
        variant={selectedPresetId === preset.id ? "default" : "outline"}
        className="h-auto py-2 flex items-center gap-2"
        onClick={() => handlePresetClick(preset)}
        disabled={disabled}
      >
        <div
          className="bg-primary/20 rounded"
          style={{
            width: `${visualWidth}px`,
            height: `${visualHeight}px`,
          }}
        />
        <div className="text-left">
          <div className="text-xs font-medium">{preset.name}</div>
          <div className="text-xs text-muted-foreground">
            {preset.width}×{preset.height}
          </div>
        </div>
      </Button>
    );
  };

  return (
    <div className="space-y-4">
      {/* Social Media Section */}
      <div>
        <h4 className="text-sm font-medium mb-2">Social Media</h4>
        <div className="grid grid-cols-2 gap-2">
          {SOCIAL_MEDIA_PRESETS.map(renderPresetButton)}
        </div>
      </div>

      {/* Common Sizes Section */}
      <div>
        <h4 className="text-sm font-medium mb-2">Common Sizes</h4>
        <div className="grid grid-cols-2 gap-2">
          {COMMON_PRESETS.map(renderPresetButton)}
        </div>
      </div>

      {/* Custom Presets Section */}
      <div>
        <h4 className="text-sm font-medium mb-2">Custom Presets</h4>

        {customPresets.length > 0 && (
          <div className="space-y-2 mb-2">
            {customPresets.map((preset) => (
              <div key={preset.id} className="flex items-center gap-2">
                <div className="flex-1">{renderPresetButton(preset)}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() => handleDeleteCustomPreset(preset.id)}
                  disabled={disabled}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {!showAddDialog ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowAddDialog(true)}
            disabled={disabled}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Preset
          </Button>
        ) : (
          <div className="space-y-3 p-3 border rounded-md">
            <div>
              <Label htmlFor="preset-name" className="text-xs">
                Preset Name
              </Label>
              <Input
                id="preset-name"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="My Custom Size"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="preset-width" className="text-xs">
                  Width
                </Label>
                <Input
                  id="preset-width"
                  type="number"
                  value={newPresetWidth}
                  onChange={(e) => setNewPresetWidth(e.target.value)}
                  placeholder="800"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="preset-height" className="text-xs">
                  Height
                </Label>
                <Input
                  id="preset-height"
                  type="number"
                  value={newPresetHeight}
                  onChange={(e) => setNewPresetHeight(e.target.value)}
                  placeholder="600"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={handleSaveCustomPreset}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setShowAddDialog(false);
                  setNewPresetName("");
                  setNewPresetWidth("");
                  setNewPresetHeight("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
