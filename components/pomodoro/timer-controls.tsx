import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw, Settings, SkipForward } from "lucide-react";
import type { TimerState } from "@/src/types/pomodoro";

interface TimerControlsProps {
  state: TimerState;
  isRunning: boolean;
  completedCycles: number;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  onSettings: () => void;
}

export function TimerControls({
  state,
  isRunning,
  completedCycles,
  onStart,
  onPause,
  onReset,
  onSkip,
  onSettings,
}: TimerControlsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {/* Play/Pause Button */}
      <Button
        size="lg"
        className="w-24"
        onClick={isRunning ? onPause : onStart}
        disabled={state !== "idle" && state !== "paused" && !isRunning}
      >
        {isRunning ? (
          <>
            <Pause className="mr-2 h-5 w-5" />
            Pause
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            {state === "idle" ? "Start" : "Resume"}
          </>
        )}
      </Button>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="lg"
        onClick={onReset}
        disabled={state === "idle" && completedCycles === 0}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset
      </Button>

      {/* Skip Button */}
      {state !== "idle" && (
        <Button
          variant="outline"
          size="lg"
          onClick={onSkip}
        >
          <SkipForward className="mr-2 h-4 w-4" />
          Skip
        </Button>
      )}

      {/* Settings Button */}
      <Button variant="ghost" size="icon" onClick={onSettings}>
        <Settings className="h-5 w-5" />
      </Button>
    </div>
  );
}
