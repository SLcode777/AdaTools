"use client";

import chroma from "chroma-js";
import { Copy, Palette, X } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Module } from "../dashboard/module";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ColorConverterModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
}

// Comprehensive Tailwind color palette (v3.x)
const TAILWIND_COLORS: Record<string, string> = {
  // Slate
  "slate-50": "#f8fafc",
  "slate-100": "#f1f5f9",
  "slate-200": "#e2e8f0",
  "slate-300": "#cbd5e1",
  "slate-400": "#94a3b8",
  "slate-500": "#64748b",
  "slate-600": "#475569",
  "slate-700": "#334155",
  "slate-800": "#1e293b",
  "slate-900": "#0f172a",
  "slate-950": "#020617",
  // Gray
  "gray-50": "#f9fafb",
  "gray-100": "#f3f4f6",
  "gray-200": "#e5e7eb",
  "gray-300": "#d1d5db",
  "gray-400": "#9ca3af",
  "gray-500": "#6b7280",
  "gray-600": "#4b5563",
  "gray-700": "#374151",
  "gray-800": "#1f2937",
  "gray-900": "#111827",
  "gray-950": "#030712",
  // Zinc
  "zinc-50": "#fafafa",
  "zinc-100": "#f4f4f5",
  "zinc-200": "#e4e4e7",
  "zinc-300": "#d4d4d8",
  "zinc-400": "#a1a1aa",
  "zinc-500": "#71717a",
  "zinc-600": "#52525b",
  "zinc-700": "#3f3f46",
  "zinc-800": "#27272a",
  "zinc-900": "#18181b",
  "zinc-950": "#09090b",
  // Neutral
  "neutral-50": "#fafafa",
  "neutral-100": "#f5f5f5",
  "neutral-200": "#e5e5e5",
  "neutral-300": "#d4d4d4",
  "neutral-400": "#a3a3a3",
  "neutral-500": "#737373",
  "neutral-600": "#525252",
  "neutral-700": "#404040",
  "neutral-800": "#262626",
  "neutral-900": "#171717",
  "neutral-950": "#0a0a0a",
  // Stone
  "stone-50": "#fafaf9",
  "stone-100": "#f5f5f4",
  "stone-200": "#e7e5e4",
  "stone-300": "#d6d3d1",
  "stone-400": "#a8a29e",
  "stone-500": "#78716c",
  "stone-600": "#57534e",
  "stone-700": "#44403c",
  "stone-800": "#292524",
  "stone-900": "#1c1917",
  "stone-950": "#0c0a09",
  // Red
  "red-50": "#fef2f2",
  "red-100": "#fee2e2",
  "red-200": "#fecaca",
  "red-300": "#fca5a5",
  "red-400": "#f87171",
  "red-500": "#ef4444",
  "red-600": "#dc2626",
  "red-700": "#b91c1c",
  "red-800": "#991b1b",
  "red-900": "#7f1d1d",
  "red-950": "#450a0a",
  // Orange
  "orange-50": "#fff7ed",
  "orange-100": "#ffedd5",
  "orange-200": "#fed7aa",
  "orange-300": "#fdba74",
  "orange-400": "#fb923c",
  "orange-500": "#f97316",
  "orange-600": "#ea580c",
  "orange-700": "#c2410c",
  "orange-800": "#9a3412",
  "orange-900": "#7c2d12",
  "orange-950": "#431407",
  // Amber
  "amber-50": "#fffbeb",
  "amber-100": "#fef3c7",
  "amber-200": "#fde68a",
  "amber-300": "#fcd34d",
  "amber-400": "#fbbf24",
  "amber-500": "#f59e0b",
  "amber-600": "#d97706",
  "amber-700": "#b45309",
  "amber-800": "#92400e",
  "amber-900": "#78350f",
  "amber-950": "#451a03",
  // Yellow
  "yellow-50": "#fefce8",
  "yellow-100": "#fef9c3",
  "yellow-200": "#fef08a",
  "yellow-300": "#fde047",
  "yellow-400": "#facc15",
  "yellow-500": "#eab308",
  "yellow-600": "#ca8a04",
  "yellow-700": "#a16207",
  "yellow-800": "#854d0e",
  "yellow-900": "#713f12",
  "yellow-950": "#422006",
  // Lime
  "lime-50": "#f7fee7",
  "lime-100": "#ecfccb",
  "lime-200": "#d9f99d",
  "lime-300": "#bef264",
  "lime-400": "#a3e635",
  "lime-500": "#84cc16",
  "lime-600": "#65a30d",
  "lime-700": "#4d7c0f",
  "lime-800": "#3f6212",
  "lime-900": "#365314",
  "lime-950": "#1a2e05",
  // Green
  "green-50": "#f0fdf4",
  "green-100": "#dcfce7",
  "green-200": "#bbf7d0",
  "green-300": "#86efac",
  "green-400": "#4ade80",
  "green-500": "#22c55e",
  "green-600": "#16a34a",
  "green-700": "#15803d",
  "green-800": "#166534",
  "green-900": "#14532d",
  "green-950": "#052e16",
  // Emerald
  "emerald-50": "#ecfdf5",
  "emerald-100": "#d1fae5",
  "emerald-200": "#a7f3d0",
  "emerald-300": "#6ee7b7",
  "emerald-400": "#34d399",
  "emerald-500": "#10b981",
  "emerald-600": "#059669",
  "emerald-700": "#047857",
  "emerald-800": "#065f46",
  "emerald-900": "#064e3b",
  "emerald-950": "#022c22",
  // Teal
  "teal-50": "#f0fdfa",
  "teal-100": "#ccfbf1",
  "teal-200": "#99f6e4",
  "teal-300": "#5eead4",
  "teal-400": "#2dd4bf",
  "teal-500": "#14b8a6",
  "teal-600": "#0d9488",
  "teal-700": "#0f766e",
  "teal-800": "#115e59",
  "teal-900": "#134e4a",
  "teal-950": "#042f2e",
  // Cyan
  "cyan-50": "#ecfeff",
  "cyan-100": "#cffafe",
  "cyan-200": "#a5f3fc",
  "cyan-300": "#67e8f9",
  "cyan-400": "#22d3ee",
  "cyan-500": "#06b6d4",
  "cyan-600": "#0891b2",
  "cyan-700": "#0e7490",
  "cyan-800": "#155e75",
  "cyan-900": "#164e63",
  "cyan-950": "#083344",
  // Sky
  "sky-50": "#f0f9ff",
  "sky-100": "#e0f2fe",
  "sky-200": "#bae6fd",
  "sky-300": "#7dd3fc",
  "sky-400": "#38bdf8",
  "sky-500": "#0ea5e9",
  "sky-600": "#0284c7",
  "sky-700": "#0369a1",
  "sky-800": "#075985",
  "sky-900": "#0c4a6e",
  "sky-950": "#082f49",
  // Blue
  "blue-50": "#eff6ff",
  "blue-100": "#dbeafe",
  "blue-200": "#bfdbfe",
  "blue-300": "#93c5fd",
  "blue-400": "#60a5fa",
  "blue-500": "#3b82f6",
  "blue-600": "#2563eb",
  "blue-700": "#1d4ed8",
  "blue-800": "#1e40af",
  "blue-900": "#1e3a8a",
  "blue-950": "#172554",
  // Indigo
  "indigo-50": "#eef2ff",
  "indigo-100": "#e0e7ff",
  "indigo-200": "#c7d2fe",
  "indigo-300": "#a5b4fc",
  "indigo-400": "#818cf8",
  "indigo-500": "#6366f1",
  "indigo-600": "#4f46e5",
  "indigo-700": "#4338ca",
  "indigo-800": "#3730a3",
  "indigo-900": "#312e81",
  "indigo-950": "#1e1b4b",
  // Violet
  "violet-50": "#f5f3ff",
  "violet-100": "#ede9fe",
  "violet-200": "#ddd6fe",
  "violet-300": "#c4b5fd",
  "violet-400": "#a78bfa",
  "violet-500": "#8b5cf6",
  "violet-600": "#7c3aed",
  "violet-700": "#6d28d9",
  "violet-800": "#5b21b6",
  "violet-900": "#4c1d95",
  "violet-950": "#2e1065",
  // Purple
  "purple-50": "#faf5ff",
  "purple-100": "#f3e8ff",
  "purple-200": "#e9d5ff",
  "purple-300": "#d8b4fe",
  "purple-400": "#c084fc",
  "purple-500": "#a855f7",
  "purple-600": "#9333ea",
  "purple-700": "#7e22ce",
  "purple-800": "#6b21a8",
  "purple-900": "#581c87",
  "purple-950": "#3b0764",
  // Fuchsia
  "fuchsia-50": "#fdf4ff",
  "fuchsia-100": "#fae8ff",
  "fuchsia-200": "#f5d0fe",
  "fuchsia-300": "#f0abfc",
  "fuchsia-400": "#e879f9",
  "fuchsia-500": "#d946ef",
  "fuchsia-600": "#c026d3",
  "fuchsia-700": "#a21caf",
  "fuchsia-800": "#86198f",
  "fuchsia-900": "#701a75",
  "fuchsia-950": "#4a044e",
  // Pink
  "pink-50": "#fdf2f8",
  "pink-100": "#fce7f3",
  "pink-200": "#fbcfe8",
  "pink-300": "#f9a8d4",
  "pink-400": "#f472b6",
  "pink-500": "#ec4899",
  "pink-600": "#db2777",
  "pink-700": "#be185d",
  "pink-800": "#9d174d",
  "pink-900": "#831843",
  "pink-950": "#500724",
  // Rose
  "rose-50": "#fff1f2",
  "rose-100": "#ffe4e6",
  "rose-200": "#fecdd3",
  "rose-300": "#fda4af",
  "rose-400": "#fb7185",
  "rose-500": "#f43f5e",
  "rose-600": "#e11d48",
  "rose-700": "#be123c",
  "rose-800": "#9f1239",
  "rose-900": "#881337",
  "rose-950": "#4c0519",
};

// Find nearest Tailwind color using LAB color space for perceptual accuracy
function findNearestTailwindColor(color: chroma.Color): string {
  let nearestColor = "slate-500";
  let minDistance = Infinity;

  const targetLab = color.lab();

  for (const [name, hex] of Object.entries(TAILWIND_COLORS)) {
    const colorLab = chroma(hex).lab();
    const distance = Math.sqrt(
      Math.pow(targetLab[0] - colorLab[0], 2) +
        Math.pow(targetLab[1] - colorLab[1], 2) +
        Math.pow(targetLab[2] - colorLab[2], 2)
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestColor = name;
    }
  }

  return nearestColor;
}

export function ColorConverterModule({
  isPinned,
  onTogglePin,
}: ColorConverterModuleProps) {
  const [currentColor, setCurrentColor] = useState(chroma("#85CC23"));
  const [hexInput, setHexInput] = useState("#85CC23");
  const [rgbInput, setRgbInput] = useState("rgb(133, 204, 35)");
  const [hslInput, setHslInput] = useState("hsl(85, 71%, 47%)");
  const [hwbInput, setHwbInput] = useState("hwb(85 14% 20%)");
  const [lchInput, setLchInput] = useState("lch(75.01% 82.93 123.70)");
  const [cmykInput, setCmykInput] = useState("device-cmyk(35% 0% 83% 20%)");
  const [tailwindInput, setTailwindInput] = useState("lime-800");

  // Error states
  const [hexError, setHexError] = useState("");
  const [rgbError, setRgbError] = useState("");
  const [hslError, setHslError] = useState("");
  const [hwbError, setHwbError] = useState("");
  const [lchError, setLchError] = useState("");
  const [cmykError, setCmykError] = useState("");
  const [tailwindError, setTailwindError] = useState("");

  // Update all inputs when color changes
  const updateAllInputs = (color: chroma.Color) => {
    setCurrentColor(color);

    // Clear all errors when a valid color is set
    setHexError("");
    setRgbError("");
    setHslError("");
    setHwbError("");
    setLchError("");
    setCmykError("");
    setTailwindError("");

    // HEX
    setHexInput(color.hex());

    // RGB
    const [r, g, b] = color.rgb();
    setRgbInput(`rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`);

    // HSL
    const [h, s, l] = color.hsl();
    setHslInput(
      `hsl(${Math.round(h || 0)}, ${Math.round(s * 100)}%, ${Math.round(
        l * 100
      )}%)`
    );

    // HWB
    const rgb2 = color.rgb();
    const max = Math.max(...rgb2);
    const min = Math.min(...rgb2);
    const whiteness = (min / 255) * 100;
    const blackness = (1 - max / 255) * 100;
    const hue = color.hsl()[0] || 0;
    setHwbInput(
      `hwb(${Math.round(hue)} ${Math.round(whiteness)}% ${Math.round(
        blackness
      )}%)`
    );

    // LCH
    const [lchL, lchC, lchH] = color.lch();
    setLchInput(
      `lch(${lchL.toFixed(2)}% ${lchC.toFixed(2)} ${(lchH || 0).toFixed(2)})`
    );

    // CMYK
    const [r2, g2, b2] = color.rgb();
    const k = 1 - Math.max(r2, g2, b2) / 255;
    const c = k === 1 ? 0 : (1 - r2 / 255 - k) / (1 - k);
    const m = k === 1 ? 0 : (1 - g2 / 255 - k) / (1 - k);
    const y = k === 1 ? 0 : (1 - b2 / 255 - k) / (1 - k);
    setCmykInput(
      `device-cmyk(${Math.round(c * 100)}% ${Math.round(m * 100)}% ${Math.round(
        y * 100
      )}% ${Math.round(k * 100)}%)`
    );

    // Nearest Tailwind Color
    const nearestTw = findNearestTailwindColor(color);
    setTailwindInput(nearestTw);
  };

  // Parse and update color from various inputs
  const handleHexChange = (value: string) => {
    setHexInput(value);
    if (!value.trim()) {
      setHexError("");
      return;
    }
    try {
      const color = chroma(value);
      updateAllInputs(color);
    } catch {
      setHexError("Invalid hex format.");
    }
  };

  const handleRgbChange = (value: string) => {
    setRgbInput(value);
    if (!value.trim()) {
      setRgbError("");
      return;
    }
    try {
      const color = chroma(value);
      updateAllInputs(color);
    } catch {
      setRgbError("Invalid rgb format.");
    }
  };

  const handleHslChange = (value: string) => {
    setHslInput(value);
    if (!value.trim()) {
      setHslError("");
      return;
    }
    try {
      const color = chroma(value);
      updateAllInputs(color);
    } catch {
      setHslError("Invalid hsl format.");
    }
  };

  const handleHwbChange = (value: string) => {
    setHwbInput(value);
    if (!value.trim()) {
      setHwbError("");
      return;
    }
    try {
      // Parse HWB manually as chroma.js doesn't support it directly
      const match = value.match(
        /hwb\(\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?\s*\)/
      );
      if (match) {
        const h = parseFloat(match[1]);
        const w = parseFloat(match[2]) / 100;
        const b = parseFloat(match[3]) / 100;

        // Convert HWB to RGB
        const i = Math.floor((h / 60) % 6);
        const f = h / 60 - i;
        const n = w + (1 - w - b) * f;

        let r, g, bl;
        switch (i) {
          case 0:
            [r, g, bl] = [1 - b, n, w];
            break;
          case 1:
            [r, g, bl] = [1 - b - f * (1 - w - b), 1 - b, w];
            break;
          case 2:
            [r, g, bl] = [w, 1 - b, n];
            break;
          case 3:
            [r, g, bl] = [w, 1 - b - f * (1 - w - b), 1 - b];
            break;
          case 4:
            [r, g, bl] = [n, w, 1 - b];
            break;
          default:
            [r, g, bl] = [1 - b, w, 1 - b - f * (1 - w - b)];
        }

        const color = chroma.rgb(r * 255, g * 255, bl * 255);
        updateAllInputs(color);
      } else {
        setHwbError("Invalid hwb format.");
      }
    } catch {
      setHwbError("Invalid hwb format.");
    }
  };

  const handleLchChange = (value: string) => {
    setLchInput(value);
    if (!value.trim()) {
      setLchError("");
      return;
    }
    try {
      // Parse LCH manually
      const match = value.match(
        /lch\(\s*(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*\)/
      );
      if (match) {
        const l = parseFloat(match[1]);
        const c = parseFloat(match[2]);
        const h = parseFloat(match[3]);
        const color = chroma.lch(l, c, h);
        updateAllInputs(color);
      } else {
        setLchError("Invalid lch format.");
      }
    } catch {
      setLchError("Invalid lch format.");
    }
  };

  const handleCmykChange = (value: string) => {
    setCmykInput(value);
    if (!value.trim()) {
      setCmykError("");
      return;
    }
    try {
      // Parse CMYK manually
      const match = value.match(
        /device-cmyk\(\s*(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?\s+(\d+(?:\.\d+)?)%?\s*\)/
      );
      if (match) {
        const c = parseFloat(match[1]) / 100;
        const m = parseFloat(match[2]) / 100;
        const y = parseFloat(match[3]) / 100;
        const k = parseFloat(match[4]) / 100;

        // Convert CMYK to RGB
        const r = 255 * (1 - c) * (1 - k);
        const g = 255 * (1 - m) * (1 - k);
        const b = 255 * (1 - y) * (1 - k);

        const color = chroma.rgb(r, g, b);
        updateAllInputs(color);
      } else {
        setCmykError("Invalid cmyk format.");
      }
    } catch {
      setCmykError("Invalid cmyk format.");
    }
  };

  const handleTailwindChange = (value: string) => {
    setTailwindInput(value);
    if (!value.trim()) {
      setTailwindError("");
      return;
    }
    try {
      // Try to find the Tailwind color
      const hex = TAILWIND_COLORS[value];
      if (hex) {
        const color = chroma(hex);
        updateAllInputs(color);
      } else {
        setTailwindError("Invalid tailwind color.");
      }
    } catch {
      setTailwindError("Invalid tailwind color.");
    }
  };

  const handlePickerChange = (value: string) => {
    try {
      const color = chroma(value);
      updateAllInputs(color);
    } catch {
      // Invalid color
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleClear = (setter: (value: string) => void) => {
    setter("");
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  // Get primary color from theme on mount
  useEffect(() => {
    try {
      const primaryColor = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--primary");
      if (primaryColor) {
        // CSS variables can be in different formats (hsl, rgb, etc.)
        // Try to parse it with chroma
        const color = chroma(primaryColor.trim());
        updateAllInputs(color);
      }
    } catch (error) {
      // Fallback to default color if parsing fails
      console.log("Could not parse primary color, using default");
    }
  }, []);

  return (
    <Module
      title="Color Converter"
      description="Convert between color formats"
      icon={<Palette className="h-5 w-5 text-primary" />}
      isPinned={isPinned}
      onTogglePin={onTogglePin}
    >
      <div className="space-y-4">
        {/* Color Picker */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            color picker:
          </label>
          <div className="relative">
            <input
              type="color"
              value={currentColor.hex()}
              onChange={(e) => handlePickerChange(e.target.value)}
              className="w-full h-8 cursor-pointer"
              style={{
                backgroundColor: currentColor.hex(),
                borderColor: currentColor.hex(),
                WebkitAppearance: "none",
                appearance: "none",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span
                className="text-xs font-medium "
                style={{
                  color: currentColor.luminance() > 0.5 ? "#000000" : "#ffffff",
                }}
              >
                {currentColor.hex().toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* HEX */}
        <div>
          <label className="text-sm font-medium mb-2 block">hex:</label>
          <div className="flex gap-2">
            <Input
              value={hexInput}
              onChange={(e) => handleHexChange(e.target.value)}
              onFocus={handleFocus}
              className={`flex-1 font-sans ${hexError ? "border-red-500" : ""}`}
              placeholder="#000000"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClear(setHexInput)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(hexInput)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {hexError && <p className="text-sm text-red-500 mt-1">{hexError}</p>}
        </div>

        {/* RGB */}
        <div>
          <label className="text-sm font-medium mb-2 block">rgb:</label>
          <div className="flex gap-2">
            <Input
              value={rgbInput}
              onChange={(e) => handleRgbChange(e.target.value)}
              onFocus={handleFocus}
              className={`flex-1 font-sans ${rgbError ? "border-red-500" : ""}`}
              placeholder="rgb(0, 0, 0)"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClear(setRgbInput)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(rgbInput)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {rgbError && <p className="text-sm text-red-500 mt-1">{rgbError}</p>}
        </div>

        {/* HSL */}
        <div>
          <label className="text-sm font-medium mb-2 block">hsl:</label>
          <div className="flex gap-2">
            <Input
              value={hslInput}
              onChange={(e) => handleHslChange(e.target.value)}
              onFocus={handleFocus}
              className={`flex-1 font-sans ${hslError ? "border-red-500" : ""}`}
              placeholder="hsl(0, 0%, 0%)"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClear(setHslInput)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(hslInput)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {hslError && <p className="text-sm text-red-500 mt-1">{hslError}</p>}
        </div>

        {/* HWB */}
        <div>
          <label className="text-sm font-medium mb-2 block">hwb:</label>
          <div className="flex gap-2">
            <Input
              value={hwbInput}
              onChange={(e) => handleHwbChange(e.target.value)}
              onFocus={handleFocus}
              className={`flex-1 font-sans ${hwbError ? "border-red-500" : ""}`}
              placeholder="hwb(0 0% 0%)"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClear(setHwbInput)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(hwbInput)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {hwbError && <p className="text-sm text-red-500 mt-1">{hwbError}</p>}
        </div>

        {/* LCH */}
        <div>
          <label className="text-sm font-medium mb-2 block">lch:</label>
          <div className="flex gap-2">
            <Input
              value={lchInput}
              onChange={(e) => handleLchChange(e.target.value)}
              onFocus={handleFocus}
              className={`flex-1 font-sans ${lchError ? "border-red-500" : ""}`}
              placeholder="lch(0% 0 0)"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClear(setLchInput)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(lchInput)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {lchError && <p className="text-sm text-red-500 mt-1">{lchError}</p>}
        </div>

        {/* CMYK */}
        <div>
          <label className="text-sm font-medium mb-2 block">cmyk:</label>
          <div className="flex gap-2">
            <Input
              value={cmykInput}
              onChange={(e) => handleCmykChange(e.target.value)}
              onFocus={handleFocus}
              className={`flex-1 font-sans ${
                cmykError ? "border-red-500" : ""
              }`}
              placeholder="device-cmyk(0% 0% 0% 0%)"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClear(setCmykInput)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(cmykInput)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {cmykError && (
            <p className="text-sm text-red-500 mt-1">{cmykError}</p>
          )}
        </div>

        {/* Tailwind */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            tailwind color:
          </label>
          <div className="flex gap-2">
            <Input
              value={tailwindInput}
              onChange={(e) => handleTailwindChange(e.target.value)}
              onFocus={handleFocus}
              className={`flex-1 font-sans ${
                tailwindError ? "border-red-500" : ""
              }`}
              placeholder="blue-500"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleClear(setTailwindInput)}
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleCopy(tailwindInput)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          {tailwindError && (
            <p className="text-sm text-red-500 mt-1">{tailwindError}</p>
          )}
        </div>
      </div>
    </Module>
  );
}
