import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { PREDEFINED_SOUNDS, AudioManager } from "@/src/lib/pomodoro-utils";
import { useRef, useEffect } from "react";
import type { PomodoroSettings } from "@/src/types/pomodoro";

interface SoundSelectorProps {
  settings: PomodoroSettings;
  onChange: (key: keyof PomodoroSettings, value: string) => void;
}

export function SoundSelector({ settings, onChange }: SoundSelectorProps) {
  const audioManager = useRef(new AudioManager());

  // Preload all sounds on mount
  useEffect(() => {
    audioManager.current.preloadAll(PREDEFINED_SOUNDS);
  }, []);

  const handleTestSound = (soundId: string) => {
    audioManager.current.playSound(soundId, 0.5);
  };

  const soundEvents = [
    {
      key: "sessionStartSound" as const,
      label: "Session Start",
      description: "Plays when you start a new focus session",
    },
    {
      key: "breakStartSound" as const,
      label: "Break Start",
      description: "Plays when a break begins",
    },
    {
      key: "breakEndSound" as const,
      label: "Break End",
      description: "Plays when it's time to get back to work",
    },
    {
      key: "sessionEndSound" as const,
      label: "Session Complete",
      description: "Plays when all cycles are completed",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-4">Notification Sounds</h4>
        <p className="text-sm text-muted-foreground mb-6">
          Choose different sounds for each timer event
        </p>
      </div>

      {soundEvents.map((event) => (
        <div key={event.key} className="space-y-2">
          <Label htmlFor={event.key}>
            {event.label}
          </Label>
          <p className="text-xs text-muted-foreground mb-2">
            {event.description}
          </p>
          <div className="flex gap-2">
            <Select
              value={settings[event.key]}
              onValueChange={(value) => onChange(event.key, value)}
            >
              <SelectTrigger id={event.key} className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PREDEFINED_SOUNDS.map((sound) => (
                  <SelectItem key={sound.id} value={sound.id}>
                    {sound.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleTestSound(settings[event.key])}
              type="button"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
