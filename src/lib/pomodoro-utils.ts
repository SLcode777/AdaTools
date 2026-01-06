import type {
  BackgroundImage,
  PomodoroSettings,
  PomodoroSound,
  TimerPhase,
  TimerState,
} from "@/src/types/pomodoro";

// AudioManager class for handling sound playback
export class AudioManager {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      // Safari requires user interaction before creating AudioContext
      try {
        this.audioContext = new (window.AudioContext ||
          (
            window as typeof window & {
              webkitAudioContext?: typeof AudioContext;
            }
          ).webkitAudioContext)();
      } catch (e) {
        console.warn("Web Audio API not supported", e);
      }
    }
  }

  preloadSound(id: string, path: string): void {
    if (typeof window === "undefined") return;

    const audio = new Audio(path);
    audio.preload = "auto";
    this.sounds.set(id, audio);
  }

  async playSound(id: string, volume: number = 0.5): Promise<void> {
    // Resume audio context if suspended (Safari requirement)
    if (this.audioContext?.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch (e) {
        console.warn("Failed to resume audio context", e);
      }
    }

    const audio = this.sounds.get(id);
    if (!audio) {
      console.warn(`Sound ${id} not found`);
      return;
    }

    audio.volume = Math.max(0, Math.min(1, volume));
    audio.currentTime = 0;

    try {
      await audio.play();
    } catch (error) {
      console.warn("Audio playback failed:", error);
    }
  }

  stopAll(): void {
    this.sounds.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  preloadAll(sounds: PomodoroSound[]): void {
    sounds.forEach((sound) => {
      this.preloadSound(sound.id, sound.path);
    });
  }
}

// Predefined sounds configuration
// Supports: .wav, .mp3, .ogg, .m4a, .flac
export const PREDEFINED_SOUNDS: PomodoroSound[] = [
  {
    id: "8bit-victory",
    name: "8-Bit Victory",
    path: "/sounds/pomodoro/8bit-victory.wav",
  },
  { id: "alert", name: "Alert", path: "/sounds/pomodoro/alert.wav" },
  { id: "bell", name: "Bell", path: "/sounds/pomodoro/bell.mp3" },
  {
    id: "bells-jingling",
    name: "Bells Jingling",
    path: "/sounds/pomodoro/bells-jingling.mp3",
  },
  {
    id: "bright-synth-ping",
    name: "Bright Synth Ping",
    path: "/sounds/pomodoro/bright-synth-ping.wav",
  },
  { id: "chime", name: "Chime", path: "/sounds/pomodoro/chime.wav" },
  {
    id: "completed",
    name: "Completed",
    path: "/sounds/pomodoro/completed.wav",
  },
  {
    id: "confirm-beeps",
    name: "Confirm Beeps",
    path: "/sounds/pomodoro/confirm-beeps.wav",
  },
  { id: "correct", name: "Correct", path: "/sounds/pomodoro/correct.wav" },
  { id: "finished", name: "Finished", path: "/sounds/pomodoro/finished.wav" },
  { id: "flipper", name: "Flipper", path: "/sounds/pomodoro/flipper.wav" },
  { id: "game-win", name: "Game Win", path: "/sounds/pomodoro/game-win.mp3" },
  {
    id: "ghost-bell",
    name: "Ghost Bell",
    path: "/sounds/pomodoro/ghost-bell.wav",
  },
  {
    id: "glockenspiel",
    name: "Glockenspiel",
    path: "/sounds/pomodoro/glockenspiel.mp3",
  },
  {
    id: "happy-ending",
    name: "Happy Ending",
    path: "/sounds/pomodoro/happy-ending.wav",
  },
  {
    id: "high-bell",
    name: "High Bell",
    path: "/sounds/pomodoro/high-bell.wav",
  },
  {
    id: "level-up-01",
    name: "Level Up 01",
    path: "/sounds/pomodoro/level-up-01.mp3",
  },
  {
    id: "level-up-02",
    name: "Level Up 02",
    path: "/sounds/pomodoro/level-up-02.mp3",
  },
  {
    id: "level-up-03",
    name: "Level Up 03",
    path: "/sounds/pomodoro/level-up-03.mp3",
  },
  {
    id: "level-up-piano",
    name: "Level Up Piano",
    path: "/sounds/pomodoro/level-up-piano.mp3",
  },
  {
    id: "medium-bell",
    name: "Medium Bell",
    path: "/sounds/pomodoro/medium-bell.wav",
  },
  {
    id: "old-video-game",
    name: "Old Video Game",
    path: "/sounds/pomodoro/old-video-game.wav",
  },
  {
    id: "puzzle-game",
    name: "Puzzle Game",
    path: "/sounds/pomodoro/puzzle-game.wav",
  },
  {
    id: "rythm-bell",
    name: "Rhythm Bell",
    path: "/sounds/pomodoro/rythm-bell.wav",
  },
  {
    id: "tiny-bell",
    name: "Tiny Bell",
    path: "/sounds/pomodoro/tiny-bell.wav",
  },
  { id: "triangle", name: "Triangle", path: "/sounds/pomodoro/triangle.wav" },
  {
    id: "victory-dance",
    name: "Victory Dance",
    path: "/sounds/pomodoro/victory-dance.wav",
  },
];

// Predefined background images
export const PREDEFINED_BACKGROUNDS: BackgroundImage[] = [
  {
    id: "amber",
    name: "Solitude in radiance",
    url: "/images/pomodoro/backgrounds/amber_solitude-in-radiance.webp",
  },
  {
    id: "blue",
    name: "Elven door",
    url: "/images/pomodoro/backgrounds/blue_elven-door.webp",
  },
  {
    id: "cyan",
    name: "Wildlife landscape",
    url: "/images/pomodoro/backgrounds/cyan_wildlife-landscape.webp",
  },
  {
    id: "emerald",
    name: "Water cabin",
    url: "/images/pomodoro/backgrounds/emerald_water-cabin.webp",
  },
  {
    id: "fuschia",
    name: "Cosmos flowers",
    url: "/images/pomodoro/backgrounds/fuschia_cosmos-flowers.webp",
  },
  {
    id: "indigo",
    name: "Wall heaven",
    url: "/images/pomodoro/backgrounds/indigo_wall-heaven.webp",
  },
  {
    id: "lime",
    name: "Lucky clover",
    url: "/images/pomodoro/backgrounds/lime_lucky-clover.webp",
  },
  {
    id: "orange",
    name: "Autumn maple leaves",
    url: "/images/pomodoro/backgrounds/orange_autumn-maple-leaves.webp",
  },
  {
    id: "pink",
    name: "Lakeside sunset",
    url: "/images/pomodoro/backgrounds/pink_lakeside-sunset.webp",
  },
  { id: "none", name: "No Background", url: "" },
];

// Compress image to base64 with size limit
export async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas context not available"));
          return;
        }

        // Max dimensions
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;

        let width = img.width;
        let height = img.height;

        // Calculate resize ratio if needed
        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to 80% quality JPEG
        const base64 = canvas.toDataURL("image/jpeg", 0.8);
        resolve(base64);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Validate image size (max 500KB)
export function validateImageSize(base64: string): boolean {
  try {
    // Calculate size in bytes from base64 string
    const sizeInBytes = (base64.length * 3) / 4;
    return sizeInBytes <= 500 * 1024; // 500KB limit
  } catch {
    return false;
  }
}

// Format seconds to MM:SS display
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

// Get label for timer state
export function getStateLabel(state: TimerState, phase?: TimerPhase): string {
  switch (state) {
    case "idle":
      return "Ready to start";
    case "running":
      return phase === "break" ? "Break" : "Focus Time";
    case "paused":
      return "Paused";
    default:
      return "";
  }
}

// Default settings
export const DEFAULT_POMODORO_SETTINGS = {
  workDuration: 50,
  breakDuration: 10,
  cycles: 3,
  sessionStartSound: "rythm-bell",
  breakStartSound: "completed",
  breakEndSound: "triangle",
  sessionEndSound: "victory-dance",
  backgroundImage: "cyan",
  backgroundType: "gallery" as const,
  textColor: "#FFFFFF",
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
};

// localStorage keys
export const STORAGE_KEYS = {
  SETTINGS: "pomodoro-settings",
  SESSION: "pomodoro-session",
} as const;

// Load settings from localStorage
export function loadSettingsFromStorage() {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load settings from localStorage", e);
  }

  return null;
}

// Save settings to localStorage
export function saveSettingsToStorage(settings: Partial<PomodoroSettings>) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save settings to localStorage", e);
  }
}

// Load session from localStorage
export function loadSessionFromStorage() {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load session from localStorage", e);
  }

  return null;
}

// Save session to localStorage
export function saveSessionToStorage(session: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  } catch (e) {
    console.error("Failed to save session to localStorage", e);
  }
}

// Clear session from localStorage
export function clearSessionFromStorage() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  } catch (e) {
    console.error("Failed to clear session from localStorage", e);
  }
}
