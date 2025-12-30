export type TimerState = "idle" | "work" | "break" | "paused";

export type SoundEvent =
  | "sessionStart"
  | "breakStart"
  | "breakEnd"
  | "sessionEnd";

export interface PomodoroSound {
  id: string;
  name: string;
  path: string;
}

export interface BackgroundImage {
  id: string;
  name: string;
  url: string;
  thumbnail?: string;
}

export interface PomodoroSettings {
  workDuration: number; // minutes
  breakDuration: number; // minutes
  cycles: number;

  sessionStartSound: string;
  breakStartSound: string;
  breakEndSound: string;
  sessionEndSound: string;

  backgroundImage: string | null;
  backgroundType: "gallery" | "custom" | "none";
  textColor: string;

  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

export interface TimerSession {
  currentCycle: number;
  totalCycles: number;
  completedCycles: number;
  state: TimerState;
  remainingSeconds: number;
  totalSeconds: number;
}

export interface LocalStorageTimerState extends PomodoroSettings {
  // Runtime state - NOT persisted
  lastUpdated?: number;
}
