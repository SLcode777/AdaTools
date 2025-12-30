import { Button } from "@/components/ui/button";
import {
  formatTime,
  getStateLabel,
  PREDEFINED_BACKGROUNDS,
} from "@/src/lib/pomodoro-utils";
import { cn } from "@/src/lib/utils";
import type { PomodoroSettings, TimerSession } from "@/src/types/pomodoro";
import { Maximize2, Minimize2 } from "lucide-react";
import { useMemo } from "react";

interface TimerDisplayProps {
  session: TimerSession;
  settings: PomodoroSettings;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function TimerDisplay({
  session,
  settings,
  fullscreen,
  onToggleFullscreen,
}: TimerDisplayProps) {
  const backgroundStyle = useMemo(() => {
    if (settings.backgroundType === "none") return {};

    let imageUrl: string | undefined;

    if (settings.backgroundType === "custom" && settings.backgroundImage) {
      imageUrl = settings.backgroundImage;
    } else if (
      settings.backgroundType === "gallery" &&
      settings.backgroundImage
    ) {
      const bg = PREDEFINED_BACKGROUNDS.find(
        (bg) => bg.id === settings.backgroundImage
      );
      imageUrl = bg?.url;
    }

    if (!imageUrl) return {};

    return {
      backgroundImage: `url(${imageUrl})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
    };
  }, [settings.backgroundType, settings.backgroundImage]);

  const progressPercentage = useMemo(() => {
    if (session.totalSeconds === 0) return 0;
    return (
      ((session.totalSeconds - session.remainingSeconds) /
        session.totalSeconds) *
      100
    );
  }, [session.remainingSeconds, session.totalSeconds]);

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden transition-all duration-300",
        fullscreen ? "fixed inset-0 z-50" : "h-80"
      )}
      style={backgroundStyle}
    >
      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Fullscreen toggle button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
        onClick={onToggleFullscreen}
      >
        {fullscreen ? (
          <Minimize2 className="h-5 w-5" />
        ) : (
          <Maximize2 className="h-5 w-5" />
        )}
      </Button>

      {/* Timer Content */}
      <div className="relative z-10 -mt-10 h-full flex flex-col items-center justify-center px-4">
        {/* Progress ring */}
        <div className="relative">
          <svg className="w-64 h-64 -rotate-90" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="4"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={settings.textColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${
                2 * Math.PI * 45 * (1 - progressPercentage / 100)
              }`}
              className="transition-all duration-1000 ease-linear"
              style={{ opacity: session.state === "idle" ? 0.3 : 1 }}
            />
          </svg>

          {/* Timer display in center */}
          <div
            className="absolute inset-0 -mt-12 flex flex-col items-center justify-center"
            style={{ color: settings.textColor }}
          >
            <div
              className={cn(
                "font-mono font-bold tabular-nums",
                fullscreen ? "text-8xl" : "text-6xl"
              )}
            >
              {formatTime(session.remainingSeconds)}
            </div>
          </div>
        </div>

        {/* State label */}
        <div
          className={cn(
            "font-semibold -mt-28",
            fullscreen ? "text-3xl" : "text-2xl"
          )}
          style={{ color: settings.textColor }}
        >
          {getStateLabel(session.state)}
        </div>

        {/* Cycle indicator */}
        {/* <div
          className={cn("mt-14", fullscreen ? "text-lg" : "text-base")}
          style={{ color: settings.textColor, opacity: 0.8 }}
        >
          Cycle {session.currentCycle} of {session.totalCycles}
        </div> */}

        {/* Completed cycles indicator
        {session.completedCycles > 0 && (
          <div
            className="mt-1 text-sm"
            style={{ color: settings.textColor, opacity: 0.6 }}
          >
            {session.completedCycles} cycle
            {session.completedCycles !== 1 ? "s" : ""} completed
          </div>
        )} */}
      </div>
    </div>
  );
}
