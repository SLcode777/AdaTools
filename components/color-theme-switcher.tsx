"use client";

import { useColorTheme } from "@/src/contexts/color-theme-context";
import { cn } from "@/src/lib/utils";
import { useEffect, useState } from "react";

export function ColorThemeSwitcher() {
  const { colorTheme, setColorTheme, availableThemes } = useColorTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-2 p-2">
        {availableThemes.map((theme) => (
          <div
            key={theme.id}
            className="size-8 rounded-full border-2 border-border bg-muted animate-pulse"
          />
        ))}
      </div>
    );
  }

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
