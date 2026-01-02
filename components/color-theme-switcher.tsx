"use client";

import { useColorTheme } from "@/src/contexts/color-theme-context";
import { cn } from "@/src/lib/utils";

export function ColorThemeSwitcher() {
  const { colorTheme, setColorTheme, availableThemes } = useColorTheme();

  return (
    <div className="flex gap-2 p-2">
      {availableThemes.map((theme) => (
        <button
          key={theme.id}
          onClick={() => setColorTheme(theme.id)}
          className={cn(
            "size-8 rounded-full border-2 transition-all",
            colorTheme === theme.id
              ? "border-primary ring-2 ring-primary/20 scale-110"
              : "border-border hover:scale-105 hover:border-primary/50"
          )}
          style={{ backgroundColor: theme.primaryColor }}
          aria-label={`Switch to ${theme.name} theme`}
          title={theme.name}
        />
      ))}
    </div>
  );
}
