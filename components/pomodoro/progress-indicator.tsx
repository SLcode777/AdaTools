import { cn } from "@/src/lib/utils";
import { Check, Circle } from "lucide-react";

interface ProgressIndicatorProps {
  currentCycle: number;
  totalCycles: number;
  completedCycles: number;
}

export function ProgressIndicator({
  currentCycle,
  totalCycles,
  completedCycles,
}: ProgressIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-sm font-medium text-muted-foreground">
        Progress
      </div>

      <div className="flex items-center gap-2">
        {Array.from({ length: totalCycles }, (_, i) => {
          const cycleNumber = i + 1;
          const isCompleted = cycleNumber <= completedCycles;
          const isCurrent = cycleNumber === currentCycle;

          return (
            <div
              key={i}
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all",
                isCompleted && "bg-primary border-primary text-primary-foreground",
                isCurrent && !isCompleted && "border-primary scale-110",
                !isCompleted && !isCurrent && "border-muted"
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <Circle
                  className={cn(
                    "h-3 w-3",
                    isCurrent ? "fill-primary" : "fill-muted"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="text-xs text-muted-foreground">
        {completedCycles} of {totalCycles} cycles completed
      </div>
    </div>
  );
}
