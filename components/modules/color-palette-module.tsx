"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  generateExportContent,
  normalizeHexColor,
} from "@/src/lib/color-utils";
import { api } from "@/src/lib/trpc/client";
import type {
  ColorEntry,
  ExportFormat,
  FormatVisibility,
} from "@/src/types/color-palette";
import chroma from "chroma-js";
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  Edit,
  FileUp,
  ImageIcon,
  Palette,
  Plus,
  Trash,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Module } from "../dashboard/module";

interface ColorPaletteModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
}

export function ColorPaletteModule({
  isPinned,
  onTogglePin,
}: ColorPaletteModuleProps) {
  // State
  const [activeTab, setActiveTab] = useState<"view" | "edit">("view");
  const [selectedPaletteId, setSelectedPaletteId] = useState<string | null>(
    null
  );
  const [formatVisibility, setFormatVisibility] = useState<FormatVisibility>({
    hex: true,
    rgb: true,
    hsl: false,
    oklch: false,
  });
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  // Edit mode state
  const [editingColors, setEditingColors] = useState<ColorEntry[]>([]);
  const [editingName, setEditingName] = useState("");
  const [newRowData, setNewRowData] = useState({
    name: "",
    hex: "#000000",
    displayValue: "",
  });
  const newRowNameInputRef = useRef<HTMLInputElement>(null);

  // Import state
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importTab, setImportTab] = useState<"image" | "css">("image");
  const [importedColors, setImportedColors] = useState<ColorEntry[]>([]);
  const [importPaletteName, setImportPaletteName] = useState("");
  const [cssContent, setCssContent] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Creating new palette flag
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Export state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>("css");
  const [exportContent, setExportContent] = useState("");

  // Utils for invalidating queries
  const utils = api.useUtils();

  // Queries
  const { data: palettes } = api.colorPalette.getAll.useQuery();
  const { data: selectedPalette } = api.colorPalette.getById.useQuery(
    { id: selectedPaletteId! },
    { enabled: !!selectedPaletteId }
  );

  // Mutations
  const createMutation = api.colorPalette.create.useMutation({
    onSuccess: (data) => {
      toast.success("Palette created successfully");
      utils.colorPalette.invalidate();
      setImportDialogOpen(false);
      setImportedColors([]);
      setImportPaletteName("");
      setCssContent("");
      setIsCreatingNew(false);
      setActiveTab("view");
      setSelectedPaletteId(data.id);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create palette");
    },
  });

  const updateMutation = api.colorPalette.update.useMutation({
    onSuccess: () => {
      toast.success("Palette updated successfully");
      utils.colorPalette.invalidate();
      setActiveTab("view");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update palette");
    },
  });

  const deleteMutation = api.colorPalette.delete.useMutation({
    onMutate: ({ id }) => {
      // Get current palettes from cache
      const currentPalettes = utils.colorPalette.getAll.getData();

      // Immediately select the next available palette
      if (currentPalettes) {
        const remainingPalettes = currentPalettes.filter((p) => p.id !== id);
        if (remainingPalettes.length > 0) {
          setSelectedPaletteId(remainingPalettes[0].id);
        } else {
          setSelectedPaletteId(null);
        }
      }
    },
    onSuccess: () => {
      toast.success("Palette deleted successfully");
      utils.colorPalette.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete palette");
      // Rollback on error - refetch to get correct state
      utils.colorPalette.invalidate();
    },
  });

  const importImageMutation = api.colorPalette.importFromImage.useMutation({
    onSuccess: (data) => {
      setImportedColors(data.colors);
      setImportPaletteName(data.suggestedName || "");
      toast.success(`Extracted ${data.colors.length} colors from image`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to extract colors from image");
    },
  });

  const importCSSMutation = api.colorPalette.importFromCSS.useMutation({
    onSuccess: (data) => {
      setImportedColors(data.colors);
      setImportPaletteName(data.suggestedName || "");
      toast.success(`Extracted ${data.colors.length} colors from CSS`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to parse CSS");
    },
  });

  // Load last selected palette from localStorage
  useEffect(() => {
    if (palettes && palettes.length > 0 && !selectedPaletteId) {
      const lastSelected = localStorage.getItem("color-palette-last-selected");

      // Check if the last selected palette still exists
      if (lastSelected && palettes.some((p) => p.id === lastSelected)) {
        setSelectedPaletteId(lastSelected);
      } else {
        // Otherwise select the first palette
        setSelectedPaletteId(palettes[0].id);
      }
    }
  }, [palettes, selectedPaletteId]);

  // Save selected palette to localStorage whenever it changes
  useEffect(() => {
    if (selectedPaletteId) {
      localStorage.setItem("color-palette-last-selected", selectedPaletteId);
    }
  }, [selectedPaletteId]);

  // Initialize edit mode when switching
  useEffect(() => {
    if (activeTab === "edit" && selectedPalette && !isCreatingNew) {
      setEditingColors([...selectedPalette.colors]);
      setEditingName(selectedPalette.name);
    }
  }, [activeTab, selectedPalette, isCreatingNew]);

  // Generate export content when format changes
  useEffect(() => {
    if (selectedPalette && exportDialogOpen) {
      const content = generateExportContent(
        selectedPalette.colors,
        exportFormat,
        selectedPalette.name
      );
      setExportContent(content);
    }
  }, [selectedPalette, exportFormat, exportDialogOpen]);

  // Handlers
  const handleCopy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedValue(value);
      setTimeout(() => setCopiedValue(null), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      importImageMutation.mutate({ imageBase64: base64 });
    };
    reader.readAsDataURL(file);
  };

  const handleCSSImport = () => {
    if (!cssContent.trim()) {
      toast.error("Please enter CSS content");
      return;
    }
    importCSSMutation.mutate({ cssContent });
  };

  const handleSaveImport = () => {
    if (!importPaletteName.trim()) {
      toast.error("Please enter a palette name");
      return;
    }
    if (importedColors.length === 0) {
      toast.error("No colors to import");
      return;
    }
    createMutation.mutate({
      name: importPaletteName,
      colors: importedColors,
    });
  };

  const handleCancelImport = () => {
    setImportedColors([]);
    setImportPaletteName("");
    setCssContent("");
  };

  const handleCreateNewPalette = () => {
    setIsCreatingNew(true);
    setEditingName("");
    setEditingColors([]);
    setActiveTab("edit");
  };

  const handleSaveEdit = () => {
    if (!editingName.trim()) {
      toast.error("Please enter a palette name");
      return;
    }
    const validColors = editingColors.filter((c) => c.name.trim() !== "");
    if (validColors.length === 0) {
      toast.error("Palette must have at least one color");
      return;
    }

    if (isCreatingNew) {
      createMutation.mutate({
        name: editingName,
        colors: validColors,
      });
    } else {
      updateMutation.mutate({
        id: selectedPaletteId!,
        name: editingName,
        colors: validColors,
      });
    }
  };

  const handleCancelEdit = () => {
    if (isCreatingNew) {
      setIsCreatingNew(false);
      setEditingColors([]);
      setEditingName("");
    }
    setNewRowData({ name: "", hex: "#000000", displayValue: "" });
    setActiveTab("view");
  };

  const handleCommitNewRow = (
    overrideHex?: string,
    overrideDisplayValue?: string
  ) => {
    const finalHex = overrideHex || newRowData.hex;
    const finalDisplayValue = overrideDisplayValue || newRowData.displayValue;
    if (newRowData.name.trim() || finalHex !== "#000000") {
      const newColor: ColorEntry = {
        id: crypto.randomUUID(),
        name: newRowData.name,
        hex: finalHex,
        ...(finalDisplayValue && { displayValue: finalDisplayValue }),
      };
      setEditingColors([...editingColors, newColor]);
      setNewRowData({ name: "", hex: "#000000", displayValue: "" });

      // Focus on the name input of the new empty row
      setTimeout(() => {
        newRowNameInputRef.current?.focus();
      }, 0);
    }
  };

  const handleAddColor = () => {
    setEditingColors([
      ...editingColors,
      {
        id: crypto.randomUUID(),
        name: "",
        hex: "#000000",
      },
    ]);
  };

  const handleUpdateColor = (
    index: number,
    updates: Partial<Pick<ColorEntry, "name" | "hex" | "displayValue">>
  ) => {
    const updated = [...editingColors];
    if (updates.hex !== undefined) {
      const normalized = normalizeHexColor(updates.hex);
      if (normalized) {
        updated[index].hex = normalized;
      }
    }
    if (updates.name !== undefined) {
      updated[index].name = updates.name;
    }
    if (updates.displayValue !== undefined) {
      updated[index].displayValue = updates.displayValue;
    }
    setEditingColors(updated);
  };

  const handleDeleteColor = (index: number) => {
    setEditingColors(editingColors.filter((_, i) => i !== index));
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Enter" && index === editingColors.length - 1) {
      handleAddColor();
    }
  };

  const handleDeletePalette = () => {
    if (!selectedPaletteId) return;
    if (
      !confirm(
        `Delete "${selectedPalette?.name}"? This action cannot be undone.`
      )
    ) {
      return;
    }
    deleteMutation.mutate({ id: selectedPaletteId });
  };

  const handleDownloadExport = () => {
    const ext = exportFormat === "tailwind" ? "js" : exportFormat;
    const filename = `${selectedPalette?.name
      .toLowerCase()
      .replace(/\s+/g, "-")}.${ext}`;
    const mimeType =
      exportFormat === "json"
        ? "application/json"
        : exportFormat === "tailwind"
        ? "application/javascript"
        : "text/plain";

    const blob = new Blob([exportContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File downloaded");
  };

  const handleCopyExport = async () => {
    await handleCopy(exportContent);
    toast.success("Copied to clipboard");
  };

  // Render content based on state
  const renderContent = () => {
    // Empty state
    if (!palettes || palettes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Palette className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            Create your first color palette to get started
          </p>
          <div className="flex gap-2">
            <Button onClick={handleCreateNewPalette}>
              <Plus className="h-4 w-4 mr-2" />
              Create Palette
            </Button>
            <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>
      );
    }

    // Main content with palettes
    return (
      <div className="space-y-4">
        {activeTab === "view" ? (
          <>
            {/* VIEW MODE */}
            <div className="flex items-center gap-2">
              <Select
                value={selectedPaletteId || ""}
                onValueChange={(value) => {
                  if (value === "__create_new__") {
                    handleCreateNewPalette();
                  } else {
                    setSelectedPaletteId(value);
                  }
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select palette" />
                </SelectTrigger>
                <SelectContent>
                  {palettes?.map((palette) => (
                    <SelectItem key={palette.id} value={palette.id}>
                      {palette.name}
                    </SelectItem>
                  ))}
                  <SelectItem
                    value="__create_new__"
                    className="text-primary font-medium"
                  >
                    + Create New Palette
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  setActiveTab("edit");
                  if (!isCreatingNew && selectedPalette) {
                    setEditingColors([...selectedPalette.colors]);
                    setEditingName(selectedPalette.name);
                  }
                }}
                title="Edit palette"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setImportDialogOpen(true)}
                title="Import from image or CSS"
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>

            {/* Format visibility toggles */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Show formats:</Label>
              <div className="flex flex-wrap gap-4">
                {(["hex", "rgb", "hsl", "oklch"] as const).map((format) => (
                  <div key={format} className="flex items-center space-x-2">
                    <Checkbox
                      id={format}
                      checked={formatVisibility[format]}
                      onCheckedChange={(checked) =>
                        setFormatVisibility((prev) => ({
                          ...prev,
                          [format]: checked as boolean,
                        }))
                      }
                    />
                    <label
                      htmlFor={format}
                      className="text-sm font-medium uppercase cursor-pointer"
                    >
                      {format}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Colors list */}
            {selectedPalette && (
              <div>
                {selectedPalette.colors.map((color) => (
                  <ColorRowView
                    key={color.id}
                    color={color}
                    formatVisibility={formatVisibility}
                    copiedValue={copiedValue}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Dialog
                open={exportDialogOpen}
                onOpenChange={setExportDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Palette</DialogTitle>
                    <DialogDescription>
                      Choose a format to export your color palette
                    </DialogDescription>
                  </DialogHeader>
                  <RadioGroup
                    value={exportFormat}
                    onValueChange={(v) => setExportFormat(v as ExportFormat)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="css" id="css" />
                      <Label htmlFor="css">CSS Variables</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="scss" id="scss" />
                      <Label htmlFor="scss">SCSS Variables</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="json" id="json" />
                      <Label htmlFor="json">JSON</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="tailwind" id="tailwind" />
                      <Label htmlFor="tailwind">Tailwind Config</Label>
                    </div>
                  </RadioGroup>
                  <Textarea
                    value={exportContent}
                    readOnly
                    className="font-mono text-xs"
                    rows={12}
                  />
                  <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={handleCopyExport}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                    <Button onClick={handleDownloadExport}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="destructive"
                onClick={handleDeletePalette}
                disabled={!selectedPaletteId}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* EDIT MODE */}
            <div>
              <Input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Palette name"
                className="text-base font-base"
              />
            </div>

            <div className="space-y-2">
              {editingColors.map((color, index) => (
                <EditColorRow
                  key={color.id}
                  color={color}
                  index={index}
                  onUpdate={handleUpdateColor}
                  onDelete={handleDeleteColor}
                  onKeyDown={handleKeyDown}
                  onAddColor={handleAddColor}
                  canDelete={editingColors.length > 1}
                  isNewRow={false}
                />
              ))}

              {/* Empty row for adding new color */}
              <EditColorRow
                key="new-row"
                color={{
                  id: "temp",
                  name: newRowData.name,
                  hex: newRowData.hex,
                  displayValue: newRowData.displayValue,
                }}
                index={editingColors.length}
                onUpdate={(_, updates) => {
                  setNewRowData((prev) => ({
                    ...prev,
                    ...updates,
                  }));
                }}
                onDelete={() => {}}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCommitNewRow();
                  }
                }}
                onAddColor={handleCommitNewRow}
                canDelete={false}
                isNewRow={true}
                nameInputRef={newRowNameInputRef}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Module
      title="Color Palettes"
      description="Manage your color palettes"
      icon={<Palette className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      {renderContent()}

      {/* Import Dialog - always rendered */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Import Color Palette</DialogTitle>
            <DialogDescription>
              Create a new palette from an image or CSS file
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={importTab}
            onValueChange={(v) => setImportTab(v as "image" | "css")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image">
                <ImageIcon className="h-4 w-4 mr-2" />
                From Image
              </TabsTrigger>
              <TabsTrigger value="css">
                <FileUp className="h-4 w-4 mr-2" />
                From CSS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="space-y-4">
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                  disabled={importImageMutation.isPending}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {importImageMutation.isPending
                    ? "Extracting colors..."
                    : "Upload Image"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="css" className="space-y-4">
              <div>
                <Label htmlFor="css-input">CSS Content</Label>
                <Textarea
                  id="css-input"
                  value={cssContent}
                  onChange={(e) => setCssContent(e.target.value)}
                  placeholder="Paste your CSS here..."
                  rows={8}
                  className="font-mono text-xs"
                />
              </div>
              <Button
                onClick={handleCSSImport}
                disabled={importCSSMutation.isPending}
                className="w-full"
              >
                {importCSSMutation.isPending
                  ? "Parsing CSS..."
                  : "Extract Colors"}
              </Button>
            </TabsContent>
          </Tabs>

          {importedColors.length > 0 && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Found {importedColors.length} color(s). Review and save as a
                  new palette.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="import-name">Palette Name</Label>
                <Input
                  id="import-name"
                  value={importPaletteName}
                  onChange={(e) => setImportPaletteName(e.target.value)}
                  placeholder="Enter palette name"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {importedColors.map((color) => (
                  <div
                    key={color.id}
                    className="flex items-center gap-2 p-2 border rounded"
                  >
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm font-medium">{color.name}</span>
                    <span className="text-sm text-muted-foreground ml-auto">
                      {color.hex}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCancelImport}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveImport}
                  disabled={createMutation.isPending}
                  className="flex-1"
                >
                  {createMutation.isPending
                    ? "Creating..."
                    : "Save as New Palette"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Module>
  );
}

// Color Row Component for View Mode
function ColorRowView({
  color,
  formatVisibility,
  copiedValue,
  onCopy,
}: {
  color: ColorEntry;
  formatVisibility: FormatVisibility;
  copiedValue: string | null;
  onCopy: (value: string) => void;
}) {
  const { data: converted } = api.colorPalette.convertColor.useQuery({
    hex: color.hex,
    name: color.name,
  });

  return (
    <div className="flex flex-row items-stretch gap-3 px-3 py-2 hover:bg-muted/50">
      <div className="w-5 rounded" style={{ backgroundColor: color.hex }} />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{color.name}</p>
        <div className="flex flex-wrap gap-2 mt-1 ">
          {formatVisibility.hex && converted && (
            <ValueChip
              value={converted.hex}
              isCopied={copiedValue === converted.hex}
              onCopy={onCopy}
            />
          )}
          {formatVisibility.rgb && converted && (
            <ValueChip
              value={converted.rgb}
              isCopied={copiedValue === converted.rgb}
              onCopy={onCopy}
            />
          )}
          {formatVisibility.hsl && converted && (
            <ValueChip
              value={converted.hsl}
              isCopied={copiedValue === converted.hsl}
              onCopy={onCopy}
            />
          )}
          {formatVisibility.oklch && converted && (
            <ValueChip
              value={converted.oklch}
              isCopied={copiedValue === converted.oklch}
              onCopy={onCopy}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Value Chip Component
function ValueChip({
  value,
  isCopied,
  onCopy,
}: {
  value: string;
  isCopied: boolean;
  onCopy: (value: string) => void;
}) {
  return (
    <button
      onClick={() => onCopy(value)}
      className="inline-flex items-center px-2 py-1 text-xs font-mono bg-muted hover:bg-muted/80 hover:cursor-pointer rounded transition-colors"
    >
      {isCopied ? (
        <>
          <Check className="h-3 w-3 mr-1 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <span>{value}</span>
      )}
    </button>
  );
}

// Edit Color Row Component
function EditColorRow({
  color,
  index,
  onUpdate,
  onDelete,
  onKeyDown,
  onAddColor,
  onBlur,
  canDelete,
  isNewRow = false,
  nameInputRef,
}: {
  color: ColorEntry;
  index: number;
  onUpdate: (
    index: number,
    updates: Partial<Pick<ColorEntry, "name" | "hex" | "displayValue">>
  ) => void;
  onDelete: (index: number) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
  onAddColor: (hex?: string, displayValue?: string) => void;
  onBlur?: () => void;
  canDelete: boolean;
  isNewRow?: boolean;
  nameInputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const [colorInputValue, setColorInputValue] = useState(
    color.displayValue || color.hex
  );

  const handleColorInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // Auto-fix common formats
      let displayValue = colorInputValue.trim();
      let hexValue = "#000000";

      if (displayValue) {
        // Try to auto-fix common formats
        if (/^rgb\s+[\d,\s]+$/.test(displayValue)) {
          displayValue = displayValue.replace(/^rgb\s+/, "rgb(") + ")";
        }
        if (/^hsl\s+[\d,\s]+$/.test(displayValue)) {
          const parts = displayValue
            .replace(/^hsl\s+/, "")
            .split(",")
            .map((s) => s.trim());
          if (parts.length === 3) {
            displayValue = `hsl(${parts[0]}, ${parts[1]}%, ${parts[2]}%)`;
          }
        }

        // Parse to get hex value for storage
        try {
          const parsed = chroma(displayValue);
          hexValue = parsed.hex().toUpperCase();
        } catch (error) {
          console.warn("Failed to parse color:", displayValue, error);
          return;
        }

        // Update with both hex (for conversions) and displayValue (for display)
        onUpdate(index, { hex: hexValue, displayValue });
      }

      // Call onAddColor with both values
      if (isNewRow && hexValue && displayValue) {
        setTimeout(() => onAddColor(hexValue, displayValue), 0);
      } else {
        setTimeout(() => onAddColor(), 0);
      }
    }
  };

  return (
    <div className={`flex items-center gap-2 `}>
      <Input
        type="color"
        value={(() => {
          try {
            // Parse color.hex (which can be rgb, hsl, etc.) to get hex for color picker
            const parsed = chroma(color.hex);
            return parsed.hex();
          } catch {
            return "#000000";
          }
        })()}
        onChange={(e) => {
          const newHex = e.target.value.toUpperCase();
          onUpdate(index, { hex: newHex, displayValue: newHex });
          setColorInputValue(newHex);
        }}
        onBlur={onBlur}
        className="w-7 h-8 cursor-pointer p-0 border-none bg-transparent"
      />
      <div className="flex-1 grid grid-cols-2 gap-2 items-center">
        <Input
          ref={nameInputRef}
          value={color.name}
          onChange={(e) => onUpdate(index, { name: e.target.value })}
          onKeyDown={(e) => onKeyDown(e, index)}
          onBlur={onBlur}
          placeholder={isNewRow ? "add new color..." : "color name/role"}
          className="font-medium"
        />
        <Input
          value={colorInputValue}
          onChange={(e) => setColorInputValue(e.target.value)}
          onBlur={(e) => {
            let displayValue = e.target.value.trim();
            if (displayValue) {
              // Auto-fix common formats
              if (/^rgb\s+[\d,\s]+$/.test(displayValue)) {
                displayValue = displayValue.replace(/^rgb\s+/, "rgb(") + ")";
              }
              if (/^hsl\s+[\d,\s]+$/.test(displayValue)) {
                const parts = displayValue
                  .replace(/^hsl\s+/, "")
                  .split(",")
                  .map((s) => s.trim());
                if (parts.length === 3) {
                  displayValue = `hsl(${parts[0]}, ${parts[1]}%, ${parts[2]}%)`;
                }
              }

              // Parse to get hex value
              try {
                const parsed = chroma(displayValue);
                const hexValue = parsed.hex().toUpperCase();
                onUpdate(index, { hex: hexValue, displayValue });
                setColorInputValue(displayValue);
              } catch (error) {
                console.warn(
                  "Failed to parse color on blur:",
                  displayValue,
                  error
                );
              }
            }
            onBlur?.();
          }}
          onFocus={(e) => e.target.select()}
          onKeyDown={handleColorInputKeyDown}
          placeholder="paste any color format (hex/rgb/hsl/oklch)"
          className="font-mono text-sm"
        />
      </div>
      {canDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(index)}
          className="shrink-0"
        >
          <Trash className="text-muted-foreground hover:text-destructive" />
        </Button>
      )}
    </div>
  );
}
