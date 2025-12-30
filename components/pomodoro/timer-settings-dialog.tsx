import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { PomodoroSettings } from "@/src/types/pomodoro";
import { useState } from "react";
import { BackgroundSelector } from "./background-selector";
import { SoundSelector } from "./sound-selector";

interface TimerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: PomodoroSettings;
  onSave: (settings: Partial<PomodoroSettings>) => void;
  isAuthenticated: boolean;
  onAuthRequired?: () => void;
}

export function TimerSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSave,
  isAuthenticated,
  onAuthRequired,
}: TimerSettingsDialogProps) {
  const [formData, setFormData] = useState<PomodoroSettings>(settings);

  const handleChange = (
    key: keyof PomodoroSettings,
    value: string | number | boolean | null
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setFormData(settings); // Reset to original
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Reset form data to current settings when opening
      setFormData(settings);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Pomodoro Settings</DialogTitle>
          <DialogDescription>
            Customize your Pomodoro timer to match your workflow
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-3 dark:bg-card">
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="sounds">Sounds</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* Timer Settings Tab */}
          <TabsContent value="timer" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="workDuration">Work Duration (minutes)</Label>
                <Input
                  id="workDuration"
                  type="number"
                  min={1}
                  max={120}
                  value={formData.workDuration}
                  onChange={(e) =>
                    handleChange("workDuration", parseInt(e.target.value) || 1)
                  }
                  onFocus={(e) => e.target.select()}
                />
                <p className="text-xs text-muted-foreground">
                  How long each focus session lasts
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="breakDuration">Break Duration (minutes)</Label>
                <Input
                  id="breakDuration"
                  type="number"
                  min={1}
                  max={60}
                  value={formData.breakDuration}
                  onChange={(e) =>
                    handleChange("breakDuration", parseInt(e.target.value) || 1)
                  }
                  onFocus={(e) => e.target.select()}
                />
                <p className="text-xs text-muted-foreground">
                  Break between cycles
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cycles">Number of Cycles</Label>
                <Input
                  id="cycles"
                  type="number"
                  min={1}
                  max={10}
                  value={formData.cycles}
                  onChange={(e) =>
                    handleChange("cycles", parseInt(e.target.value) || 1)
                  }
                  onFocus={(e) => e.target.select()}
                />
                <p className="text-xs text-muted-foreground">
                  How many work sessions before long break
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h4 className="text-sm font-medium">Automation</h4>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoStartBreaks">Auto-start Breaks</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically start break timer after work session
                  </p>
                </div>
                <Switch
                  id="autoStartBreaks"
                  checked={formData.autoStartBreaks}
                  onCheckedChange={(checked) =>
                    handleChange("autoStartBreaks", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="autoStartPomodoros">
                    Auto-start Work Sessions
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically start work timer after break
                  </p>
                </div>
                <Switch
                  id="autoStartPomodoros"
                  checked={formData.autoStartPomodoros}
                  onCheckedChange={(checked) =>
                    handleChange("autoStartPomodoros", checked)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="soundEnabled">Enable Sounds</Label>
                  <p className="text-xs text-muted-foreground">
                    Play notification sounds for timer events
                  </p>
                </div>
                <Switch
                  id="soundEnabled"
                  checked={formData.soundEnabled}
                  onCheckedChange={(checked) =>
                    handleChange("soundEnabled", checked)
                  }
                />
              </div>
            </div>
          </TabsContent>

          {/* Sounds Tab */}
          <TabsContent value="sounds" className="mt-6">
            <SoundSelector settings={formData} onChange={handleChange} />
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 mt-6">
            <BackgroundSelector
              backgroundImage={formData.backgroundImage}
              backgroundType={formData.backgroundType}
              onChange={(image, type) => {
                handleChange("backgroundImage", image);
                handleChange("backgroundType", type);
              }}
              isAuthenticated={isAuthenticated}
              onAuthRequired={onAuthRequired}
            />

            <div className="space-y-3 pt-6 border-t">
              <Label htmlFor="textColor">Timer Text Color</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Choose a color that contrasts well with your background
              </p>
              <div className="flex gap-3 items-center">
                <Input
                  id="textColor"
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => handleChange("textColor", e.target.value)}
                  className="w-20 h-12 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={formData.textColor}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(value)) {
                      handleChange("textColor", value);
                    }
                  }}
                  className="flex-1 font-mono"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
