"use client";

import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface ThemeOption {
  id: string;
  name: string;
  primaryColor: string;
}

interface ColorThemeContextType {
  colorTheme: string;
  setColorTheme: (theme: string) => void;
  availableThemes: ThemeOption[];
}

const availableThemes: ThemeOption[] = [
  { id: "cyan", name: "Cyan", primaryColor: "oklch(0.61 0.11 222)" },
  { id: "lime", name: "Lime", primaryColor: "oklch(0.65 0.18 132)" },
  { id: "amber", name: "Amber", primaryColor: "oklch(0.67 0.16 58)" },
  { id: "blue", name: "Blue", primaryColor: "oklch(0.488 0.243 264.376)" },
  { id: "emerald", name: "Emerald", primaryColor: "oklch(0.60 0.13 163)" },
  { id: "fuschia", name: "Fuschia", primaryColor: "oklch(0.59 0.26 323)" },
  { id: "indigo", name: "Indigo", primaryColor: "oklch(0.51 0.23 277)" },
  { id: "orange", name: "Orange", primaryColor: "oklch(0.646 0.222 41.116)" },
  { id: "pink", name: "Pink", primaryColor: "oklch(0.59 0.22 1)" },
];

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(
  undefined
);

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorThemeState] = useState<string>("cyan");
  const [mounted, setMounted] = useState(false);

  // Hydration
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("color-theme");
    if (saved && availableThemes.find((t) => t.id === saved)) {
      setColorThemeState(saved);
    }
  }, []);

  // Apply to HTML
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-color-theme", colorTheme);
    }
  }, [colorTheme, mounted]);

  const setColorTheme = (theme: string) => {
    setColorThemeState(theme);
    localStorage.setItem("color-theme", theme);
  };

  return (
    <ColorThemeContext.Provider
      value={{ colorTheme, setColorTheme, availableThemes }}
    >
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (!context) {
    throw new Error("useColorTheme must be used within ColorThemeProvider");
  }
  return context;
}
