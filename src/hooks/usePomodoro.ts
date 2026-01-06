import { useCallback, useEffect, useRef, useState } from "react";
import type { PomodoroSettings, TimerSession, TimerState } from "@/src/types/pomodoro";
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

function createInitialSession(settings: PomodoroSettings): TimerSession {
  return {
    currentCycle: 1,
    totalCycles: settings.cycles,
    completedCycles: 0,
    state: "idle",
    phase: "work",
    remainingSeconds: settings.workDuration * 60,
    totalSeconds: settings.workDuration * 60,
    endTime: null,
  };
}

export function usePomodoro({
  settings,
  isAuthenticated,
  onCycleComplete,
  onSessionComplete,
}: UsePomodoroOptions) {
  const [session, setSession] = useState<TimerSession>(() => {
    const savedSession = loadSessionFromStorage();
    if (savedSession && savedSession.lastUpdated) {
      const elapsed = Math.floor((Date.now() - savedSession.lastUpdated) / 1000);
      const remaining = Math.max(0, savedSession.remainingSeconds - elapsed);
      if (remaining > 0 && savedSession.state !== "idle") {
        return {
          currentCycle: savedSession.currentCycle,
          totalCycles: settings.cycles,
          completedCycles: savedSession.completedCycles,
          state: "paused" as TimerState,
          phase: (savedSession as TimerSession).phase || "work",
          remainingSeconds: remaining,
          totalSeconds: savedSession.totalSeconds,
          endTime: null,
        };
      }
    }
    return createInitialSession(settings);
  });

  const [displayTime, setDisplayTime] = useState(session.remainingSeconds);
  const intervalRef = useRef<number | null>(null);
  const endTimeRef = useRef<number | null>(null);

  // Refs for callbacks and settings
  const settingsRef = useRef(settings);
  const onCycleCompleteRef = useRef(onCycleComplete);
  const onSessionCompleteRef = useRef(onSessionComplete);
  const audioManagerRef = useRef<AudioManager | null>(null);
  const hasPlayedStartSoundRef = useRef(false);
  const startIntervalRef = useRef<((endTime: number) => void) | null>(null);

  // Update refs in effects to satisfy ESLint
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { onCycleCompleteRef.current = onCycleComplete; }, [onCycleComplete]);
  useEffect(() => { onSessionCompleteRef.current = onSessionComplete; }, [onSessionComplete]);

  // Init audio manager once
  useEffect(() => {
    audioManagerRef.current = new AudioManager();
    audioManagerRef.current.preloadAll(PREDEFINED_SOUNDS);
    return () => {
      audioManagerRef.current?.stopAll();
    };
  }, []);

  // Sync display time when not running
  useEffect(() => {
    if (session.state !== "running") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayTime(session.remainingSeconds);
    }
  }, [session.state, session.remainingSeconds]);

  // Update settings when idle
  useEffect(() => {
    if (session.state === "idle") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSession(prev => ({
        ...prev,
        totalCycles: settings.cycles,
        remainingSeconds: settings.workDuration * 60,
        totalSeconds: settings.workDuration * 60,
      }));
    }
  }, [settings.workDuration, settings.breakDuration, settings.cycles, session.state]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    endTimeRef.current = null;
  }, []);

  const playSound = useCallback((soundId: string) => {
    const s = settingsRef.current;
    if (s.soundEnabled && audioManagerRef.current) {
      audioManagerRef.current.playSound(soundId, 0.5);
    }
  }, []);

  const doTransition = useCallback((fromPhase: "work" | "break", currentSession: TimerSession) => {
    const s = settingsRef.current;

    if (fromPhase === "work") {
      if (currentSession.currentCycle === currentSession.totalCycles) {
        // Session complete
        playSound(s.sessionEndSound);
        onSessionCompleteRef.current?.();
        hasPlayedStartSoundRef.current = false;
        return createInitialSession(s);
      } else {
        // Go to break
        playSound(s.breakStartSound);
        const breakDuration = s.breakDuration * 60;
        return {
          ...currentSession,
          state: (s.autoStartBreaks ? "running" : "idle") as TimerState,
          phase: "break" as const,
          remainingSeconds: breakDuration,
          totalSeconds: breakDuration,
          endTime: s.autoStartBreaks ? Date.now() + breakDuration * 1000 : null,
        };
      }
    } else {
      // Break complete, go to next work cycle
      playSound(s.breakEndSound);
      onCycleCompleteRef.current?.();
      const workDuration = s.workDuration * 60;
      return {
        ...currentSession,
        completedCycles: currentSession.completedCycles + 1,
        currentCycle: currentSession.currentCycle + 1,
        state: (s.autoStartPomodoros ? "running" : "idle") as TimerState,
        phase: "work" as const,
        remainingSeconds: workDuration,
        totalSeconds: workDuration,
        endTime: s.autoStartPomodoros ? Date.now() + workDuration * 1000 : null,
      };
    }
  }, [playSound]);

  // Start timer interval
  const startInterval = useCallback((endTime: number) => {
    clearTimer();
    endTimeRef.current = endTime;

    const tick = () => {
      const target = endTimeRef.current;
      if (target === null) return;

      const remaining = Math.max(0, Math.ceil((target - Date.now()) / 1000));

      if (remaining <= 0) {
        clearTimer();
        setSession(prev => {
          const newSession = doTransition(prev.phase, prev);
          // If auto-starting next phase, schedule new interval
          if (newSession.state === "running" && newSession.endTime) {
            // Use ref to avoid circular dependency
            setTimeout(() => startIntervalRef.current?.(newSession.endTime!), 0);
          }
          return newSession;
        });
      } else {
        setDisplayTime(remaining);
      }
    };

    tick(); // Initial tick
    intervalRef.current = window.setInterval(tick, 1000);
  }, [clearTimer, doTransition]);

  // Keep ref in sync
  useEffect(() => { startIntervalRef.current = startInterval; }, [startInterval]);

  // Handle session state changes
  useEffect(() => {
    if (session.state === "running" && session.endTime) {
      // Only start if not already running
      if (intervalRef.current === null) {
        startInterval(session.endTime);
      }
    } else {
      clearTimer();
    }
  }, [session.state, session.endTime, startInterval, clearTimer]);

  // Save to storage
  useEffect(() => {
    if (isAuthenticated) return;
    if (session.state === "idle") {
      clearSessionFromStorage();
    } else {
      const remaining = session.endTime
        ? Math.max(0, Math.ceil((session.endTime - Date.now()) / 1000))
        : session.remainingSeconds;
      saveSessionToStorage({ ...session, remainingSeconds: remaining, lastUpdated: Date.now() });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.state, session.phase, session.currentCycle, isAuthenticated]);

  // Cleanup
  useEffect(() => {
    return clearTimer;
  }, [clearTimer]);

  const start = useCallback(() => {
    const s = settingsRef.current;
    const now = Date.now();

    setSession(prev => {
      if (prev.state === "idle") {
        const duration = prev.phase === "work" ? s.workDuration * 60 : s.breakDuration * 60;
        const remaining = prev.remainingSeconds > 0 ? prev.remainingSeconds : duration;

        if (prev.phase === "work" && prev.currentCycle === 1 && !hasPlayedStartSoundRef.current) {
          playSound(s.sessionStartSound);
          hasPlayedStartSoundRef.current = true;
        }

        return {
          ...prev,
          state: "running" as TimerState,
          remainingSeconds: remaining,
          totalSeconds: duration,
          endTime: now + remaining * 1000,
        };
      }
      if (prev.state === "paused") {
        return {
          ...prev,
          state: "running" as TimerState,
          endTime: now + prev.remainingSeconds * 1000,
        };
      }
      return prev;
    });
  }, [playSound]);

  const pause = useCallback(() => {
    clearTimer();
    setSession(prev => {
      const remaining = prev.endTime
        ? Math.max(0, Math.ceil((prev.endTime - Date.now()) / 1000))
        : prev.remainingSeconds;
      return {
        ...prev,
        state: "paused" as TimerState,
        remainingSeconds: remaining,
        endTime: null,
      };
    });
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    hasPlayedStartSoundRef.current = false;
    clearSessionFromStorage();
    setSession(createInitialSession(settingsRef.current));
  }, [clearTimer]);

  const skip = useCallback(() => {
    clearTimer();
    setSession(prev => doTransition(prev.phase, prev));
  }, [clearTimer, doTransition]);

  return {
    session: { ...session, remainingSeconds: displayTime },
    start,
    pause,
    reset,
    skip,
    isRunning: session.state === "running",
  };
}
