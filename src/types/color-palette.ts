export type ColorFormat = "hex" | "rgb" | "hsl" | "oklch" | "css" | "tailwind";

export interface ColorEntry {
  id: string;
  name: string;
  hex: string; // Source of truth for conversions: #RRGGBB format
  displayValue?: string; // Optional: original format typed by user (rgb, hsl, etc.)
}

export interface ColorPalette {
  id: string;
  userId: string;
  name: string;
  colors: ColorEntry[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FormatVisibility {
  hex: boolean;
  rgb: boolean;
  hsl: boolean;
  oklch: boolean;
}

export interface ConvertedColor {
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
  css: string; // CSS variable name
  tailwind: string; // Tailwind color key
}

export type ExportFormat = "css" | "scss" | "json" | "tailwind";

export interface ImportResult {
  colors: ColorEntry[];
  suggestedName?: string;
}
