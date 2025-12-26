"use client";

import { ColorThemeSwitcher } from "@/components/color-theme-switcher";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Moon, Settings, Sun, SwatchBook } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface SettingsDialogProps {
  children: React.ReactNode;
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl w-fit flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your application preferences and settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="grid w-full grid-cols-1">
            <TabsTrigger value="appearance" className="gap-2">
              <SwatchBook className="h-4 w-4" />
              Appearance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-6 mt-6">
            {/* Color Theme Section */}
            <div className="space-y-3">
              <div>
                <Label className="text-base font-semibold">Color Theme</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Choose your preferred color scheme
                </p>
              </div>
              <ColorThemeSwitcher />
            </div>

            {/* Dark/Light Mode Section */}
            <div className="space-y-3">
              <div>
                <Label className="text-base font-semibold">Mode</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Toggle between light and dark mode
                </p>
              </div>
              <ThemeModeToggle />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function ThemeModeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 h-20" disabled>
          <div className="flex flex-col items-center gap-2">
            <Sun className="h-5 w-5" />
            <span className="text-sm">Light</span>
          </div>
        </Button>
        <Button variant="outline" className="flex-1 h-20" disabled>
          <div className="flex flex-col items-center gap-2">
            <Moon className="h-5 w-5" />
            <span className="text-sm">Dark</span>
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={theme === "light" ? "default" : "outline"}
        className="flex-1 h-20"
        onClick={() => setTheme("light")}
      >
        <div className="flex flex-col items-center gap-2">
          <Sun className="h-5 w-5" />
          <span className="text-sm">Light</span>
        </div>
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "outline"}
        className="flex-1 h-20"
        onClick={() => setTheme("dark")}
      >
        <div className="flex flex-col items-center gap-2">
          <Moon className="h-5 w-5" />
          <span className="text-sm">Dark</span>
        </div>
      </Button>
    </div>
  );
}
