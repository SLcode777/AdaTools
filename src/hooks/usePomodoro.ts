import { useCallback, useEffect, useRef, useState } from "react";
import type { PomodoroSettings, TimerSession } from "@/src/types/pomodoro";
import {
  AudioManager,
  PREDEFINED_SOUNDS,
  saveSessionToStorage,
  clearSessionFromStorage,
  loadSessionFromStorage,
} from "@/src/lib/pomodoro-utils";

interface UsePomodoroOptions {
  settings: PomodoroSettings;
  isAuthenticated: boolean;
  onCycleComplete?: () => void;
  onSessionComplete?: () => void;
}

export function usePomodoro({
  settings,
  isAuthenticated,
  onCycleComplete,
  onSessionComplete,
}: UsePomodoroOptions) {
  const [session, setSession] = useState<TimerSession>(() => {
    // Try to restore session from localStorage
    const savedSession = loadSessionFromStorage();
    if (savedSession && savedSession.lastUpdated) {
      const elapsed = Math.floor((Date.now() - savedSession.lastUpdated) / 1000);
      const remaining = Math.max(0, savedSession.remainingSeconds - elapsed);

      if (remaining > 0 && savedSession.state !== "idle") {
        return {
          currentCycle: savedSession.currentCycle,
          totalCycles: settings.cycles,
          completedCycles: savedSession.completedCycles,
          state: "paused", // Always start paused when restoring
          remainingSeconds: remaining,
          totalSeconds: savedSession.totalSeconds,
        };
      }
    }

    // Default initial state
    return {
      currentCycle: 1,
      totalCycles: settings.cycles,
      completedCycles: 0,
      state: "idle",
      remainingSeconds: settings.workDuration * 60,
      totalSeconds: settings.workDuration * 60,
    };
  });

  const audioManager = useRef<AudioManager>(new AudioManager());
  const animationFrameRef = useRef<number | null>(null);
  const lastTickRef = useRef<number>(0);
  const hasPlayedSoundRef = useRef<boolean>(false);

  // Initialize lastTickRef on mount
  useEffect(() => {
    lastTickRef.current = Date.now();
  }, []);

  // Update session when settings change (only if idle)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSession((prev) => {
      // Only update if timer is idle to avoid disrupting active sessions
      if (prev.state === "idle") {
        return {
          ...prev,
          totalCycles: settings.cycles,
          remainingSeconds: settings.workDuration * 60,
          totalSeconds: settings.workDuration * 60,
        };
      }
      // If not idle, only update totalCycles
      return {
        ...prev,
        totalCycles: settings.cycles,
      };
    });
  }, [settings.workDuration, settings.breakDuration, settings.cycles]);

  // Preload all sounds on mount and when settings change
  useEffect(() => {
    audioManager.current.preloadAll(PREDEFINED_SOUNDS);
  }, [settings.sessionStartSound, settings.breakStartSound, settings.breakEndSound, settings.sessionEndSound]);

  // Persist session state to localStorage for visitors
  useEffect(() => {
    if (!isAuthenticated && session.state !== "idle") {
      saveSessionToStorage({
        ...session,
        lastUpdated: Date.now(),
      });
    } else if (session.state === "idle") {
      clearSessionFromStorage();
    }
  }, [session, isAuthenticated]);

  // Handle Page Visibility API for background tab handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && session.state !== "idle" && session.state !== "paused") {
        // Tab hidden - save timestamp
        lastTickRef.current = Date.now();
      } else if (!document.hidden && session.state !== "idle" && session.state !== "paused") {
        // Tab visible again - calculate elapsed time
        const now = Date.now();
        const elapsed = Math.floor((now - lastTickRef.current) / 1000);

        if (elapsed > 0) {
          setSession((prev) => {
            const newRemaining = Math.max(0, prev.remainingSeconds - elapsed);
            return {
              ...prev,
              remainingSeconds: newRemaining,
            };
          });
        }

        lastTickRef.current = now;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [session.state]);

  // Save before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (session.state !== "idle") {
        saveSessionToStorage({
          ...session,
          lastUpdated: Date.now(),
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [session]);

  const playSound = useCallback(
    async (soundId: string) => {
      if (settings.soundEnabled) {
        await audioManager.current.playSound(soundId, 0.5);
      }
    },
    [settings.soundEnabled]
  );

  // Define tick first to avoid forward reference
  const tickRef = useRef<() => void>(() => {});

  const handleTimerComplete = useCallback(() => {
    setSession((prev) => {
      const isWorkSession = prev.state === "work";

      if (isWorkSession) {
        // Work session completed
        const isLastCycle = prev.currentCycle === prev.totalCycles;

        if (isLastCycle) {
          // Last work session - session complete
          playSound(settings.sessionEndSound);
          onSessionComplete?.();

          // Reset to idle
          return {
            currentCycle: 1,
            totalCycles: settings.cycles,
            completedCycles: prev.totalCycles,
            state: "idle",
            remainingSeconds: settings.workDuration * 60,
            totalSeconds: settings.workDuration * 60,
          };
        } else {
          // Not the last cycle - start break
          const breakDuration = settings.breakDuration;

          playSound(settings.breakStartSound);

          return {
            ...prev,
            state: settings.autoStartBreaks ? "break" : "idle",
            remainingSeconds: breakDuration * 60,
            totalSeconds: breakDuration * 60,
          };
        }
      } else {
        // Break completed - cycle complete, start next work session
        const newCompletedCycles = prev.completedCycles + 1;
        const newCurrentCycle = prev.currentCycle + 1;

        playSound(settings.breakEndSound);
        onCycleComplete?.();

        return {
          ...prev,
          completedCycles: newCompletedCycles,
          currentCycle: newCurrentCycle,
          state: settings.autoStartPomodoros ? "work" : "idle",
          remainingSeconds: settings.workDuration * 60,
          totalSeconds: settings.workDuration * 60,
        };
      }
    });
  }, [
    settings,
    playSound,
    onCycleComplete,
    onSessionComplete,
  ]);

  const tick = useCallback(() => {
    const now = Date.now();
    const delta = now - lastTickRef.current;

    if (delta >= 1000) {
      lastTickRef.current = now - (delta % 1000); // Drift correction

      setSession((prev) => {
        if (prev.remainingSeconds <= 1) {
          // Timer complete
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          handleTimerComplete();
          return { ...prev, remainingSeconds: 0 };
        }

        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }

    if (animationFrameRef.current !== null) {
      animationFrameRef.current = requestAnimationFrame(tickRef.current!);
    }
  }, [handleTimerComplete]);

  // Store tick in ref to avoid forward reference
  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const start = useCallback(() => {
    if (session.state === "idle") {
      // Starting fresh work session
      setSession((prev) => ({
        ...prev,
        state: "work",
        remainingSeconds: settings.workDuration * 60,
        totalSeconds: settings.workDuration * 60,
      }));

      if (!hasPlayedSoundRef.current) {
        playSound(settings.sessionStartSound);
        hasPlayedSoundRef.current = true;
      }
    } else if (session.state === "paused") {
      // Resuming from pause
      setSession((prev) => ({
        ...prev,
        state: prev.state === "paused" ? "work" : prev.state,
      }));
    }

    lastTickRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(tick);
  }, [session.state, settings, playSound, tick]);

  const pause = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setSession((prev) => ({
      ...prev,
      state: "paused",
    }));
  }, []);

  const reset = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    hasPlayedSoundRef.current = false;
    clearSessionFromStorage();

    setSession({
      currentCycle: 1,
      totalCycles: settings.cycles,
      completedCycles: 0,
      state: "idle",
      remainingSeconds: settings.workDuration * 60,
      totalSeconds: settings.workDuration * 60,
    });
  }, [settings]);

  const skip = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Simulate timer completion
    handleTimerComplete();
  }, [handleTimerComplete]);

  // Cleanup on unmount
  useEffect(() => {
    const manager = audioManager.current;
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      manager.stopAll();
    };
  }, []);

  // Auto-start if configured
  useEffect(() => {
    if (
      session.state !== "idle" &&
      session.state !== "paused" &&
      !animationFrameRef.current
    ) {
      if (
        (session.state === "work" && settings.autoStartPomodoros) ||
        (session.state === "break" && settings.autoStartBreaks)
      ) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        start();
      }
    }
  }, [session.state, settings.autoStartBreaks, settings.autoStartPomodoros, start]);

  return {
    session,
    start,
    pause,
    reset,
    skip,
    isRunning: session.state !== "idle" && session.state !== "paused",
  };
}
