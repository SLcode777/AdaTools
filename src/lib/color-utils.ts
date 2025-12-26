import type { ColorEntry, ExportFormat } from "@/src/types/color-palette";

export function generateExportContent(
  colors: ColorEntry[],
  format: ExportFormat,
  paletteName: string
): string {
  switch (format) {
    case "css":
      return generateCSSVariables(colors);
    case "scss":
      return generateSCSSVariables(colors);
    case "json":
      return generateJSON(colors, paletteName);
    case "tailwind":
      return generateTailwindConfig(colors);
    default:
      return "";
  }
}

function generateCSSVariables(colors: ColorEntry[]): string {
  const vars = colors.map((color) => {
    const name = color.name.toLowerCase().replace(/\s+/g, "-");
    return `  --color-${name}: ${color.hex};`;
  });

  return `:root {\n${vars.join("\n")}\n}`;
}

function generateSCSSVariables(colors: ColorEntry[]): string {
  return colors
    .map((color) => {
      const name = color.name.toLowerCase().replace(/\s+/g, "-");
      return `$color-${name}: ${color.hex};`;
    })
    .join("\n");
}

function generateJSON(colors: ColorEntry[], paletteName: string): string {
  const obj = {
    name: paletteName,
    colors: colors.reduce((acc, color) => {
      const key = color.name
        .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^\w/, (c) => c.toLowerCase());
      acc[key] = color.hex;
      return acc;
    }, {} as Record<string, string>),
  };

  return JSON.stringify(obj, null, 2);
}

function generateTailwindConfig(colors: ColorEntry[]): string {
  const colorObj = colors.reduce((acc, color) => {
    const key = color.name
      .replace(/\s+(.)/g, (_, char) => char.toUpperCase())
      .replace(/^\w/, (c) => c.toLowerCase());
    acc[key] = color.hex;
    return acc;
  }, {} as Record<string, string>);

  return `module.exports = {
  theme: {
    extend: {
      colors: ${JSON.stringify(colorObj, null, 8)}
    }
  }
}`;
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function validateHexColor(hex: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(hex);
}

export function normalizeHexColor(input: string): string | null {
  // Remove # if present
  let hex = input.replace(/^#/, "");

  // Convert 3-digit to 6-digit
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }

  // Validate
  if (!/^[0-9A-F]{6}$/i.test(hex)) {
    return null;
  }

  return "#" + hex.toUpperCase();
}
