"use client";

import { Module } from "../dashboard/module";
import { Clock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { api } from "@/src/lib/trpc/client";
import { toast } from "sonner";
import {
  DEFAULT_POMODORO_SETTINGS,
  loadSettingsFromStorage,
  saveSettingsToStorage,
} from "@/src/lib/pomodoro-utils";
import type { PomodoroSettings } from "@/src/types/pomodoro";
import { usePomodoro } from "@/src/hooks/usePomodoro";
import { TimerDisplay } from "../pomodoro/timer-display";
import { TimerControls } from "../pomodoro/timer-controls";
import { ProgressIndicator } from "../pomodoro/progress-indicator";
import { TimerSettingsDialog } from "../pomodoro/timer-settings-dialog";

interface PomodoroTimerModuleProps {
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
  onAuthRequired?: () => void;
}

export function PomodoroTimerModule({
  isPinned,
  onTogglePin,
  isAuthenticated = false,
  onAuthRequired,
}: PomodoroTimerModuleProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const prevAuthRef = useRef(isAuthenticated);

  // Load settings from database (authenticated users)
  const { data: dbSettings, isLoading: loadingDbSettings } =
    api.pomodoro.getSettings.useQuery(undefined, {
      enabled: isAuthenticated,
    });

  // Local settings state (for visitors)
  const [localSettings, setLocalSettings] = useState<PomodoroSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_POMODORO_SETTINGS;
    return loadSettingsFromStorage() || DEFAULT_POMODORO_SETTINGS;
  });

  // Determine which settings to use
  const settings: PomodoroSettings = isAuthenticated
    ? (dbSettings as PomodoroSettings) || DEFAULT_POMODORO_SETTINGS
    : localSettings;

  // TRPC utils for cache invalidation
  const utils = api.useUtils();

  // Update mutation (authenticated users)
  const updateMutation = api.pomodoro.updateSettings.useMutation({
    onSuccess: () => {
      // Invalidate cache to refetch settings
      utils.pomodoro.getSettings.invalidate();
      toast.success("Settings saved successfully");
    },
    onError: (error) => {
      toast.error(`Failed to save settings: ${error.message}`);
    },
  });

  // Timer hook
  const { session, start, pause, reset, skip, isRunning } = usePomodoro({
    settings,
    isAuthenticated,
    onCycleComplete: () => {
      toast.success("Cycle completed! Time for a break.");
    },
    onSessionComplete: () => {
      toast.success("🎉 Session complete! Great work!");
    },
  });

  // Handle settings save
  const handleSaveSettings = (newSettings: Partial<PomodoroSettings>) => {
    if (isAuthenticated) {
      // Save to database
      updateMutation.mutate(newSettings);
    } else {
      // Save to localStorage
      const updated = { ...localSettings, ...newSettings };
      setLocalSettings(updated);
      saveSettingsToStorage(updated);
      toast.success("Settings saved locally");
    }
  };

  // Migrate localStorage settings to database when user logs in
  useEffect(() => {
    if (isAuthenticated && !prevAuthRef.current) {
      const stored = loadSettingsFromStorage();
      if (stored) {
        // User just logged in, migrate their settings
        updateMutation.mutate(stored);
        toast.info("Syncing your settings...");
      }
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, updateMutation]);

  // Handle fullscreen body overflow
  useEffect(() => {
    if (fullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [fullscreen]);

  if (loadingDbSettings && isAuthenticated) {
    return (
      <Module
        title="Pomodoro Timer"
        description="Stay focused with the Pomodoro Technique"
        icon={<Clock className="h-5 w-5 text-primary" />}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
        isAuthenticated={isAuthenticated}
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading settings...</div>
        </div>
      </Module>
    );
  }

  return (
    <>
      <Module
        title="Pomodoro Timer"
        description="Stay focused with the Pomodoro Technique"
        icon={<Clock className="h-5 w-5 text-primary" />}
        isPinned={isPinned}
        onTogglePin={onTogglePin}
        isAuthenticated={isAuthenticated}
      >
        <div className="space-y-6">
          {/* Timer Display */}
          <TimerDisplay
            session={session}
            settings={settings}
            fullscreen={fullscreen}
            onToggleFullscreen={() => setFullscreen(!fullscreen)}
          />

          {/* Controls */}
          <TimerControls
            state={session.state}
            isRunning={isRunning}
            completedCycles={session.completedCycles}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSkip={skip}
            onSettings={() => setSettingsOpen(true)}
          />

          {/* Progress Indicator */}
          <ProgressIndicator
            currentCycle={session.currentCycle}
            totalCycles={session.totalCycles}
            completedCycles={session.completedCycles}
          />
        </div>
      </Module>

      {/* Settings Dialog */}
      <TimerSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
        isAuthenticated={isAuthenticated}
        onAuthRequired={onAuthRequired}
      />
    </>
  );
}
