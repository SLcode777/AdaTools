import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Pin, X } from "lucide-react";
import { ReactNode } from "react";

interface ModuleProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  isPinned?: boolean;
  onTogglePin?: () => void;
  isAuthenticated?: boolean;
  children: ReactNode;
}

export function Module({
  title,
  description,
  icon,
  isPinned = false,
  onTogglePin,
  isAuthenticated = true,
  children,
}: ModuleProps) {
  return (
    <Card className="flex flex-col w-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-4 flex-1">
            {icon && <div className="text-2xl">{icon}</div>}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base">{title}</CardTitle>
              {description && (
                <CardDescription className="mt-">{description}</CardDescription>
              )}
            </div>
          </div>
          {onTogglePin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePin}
              className="shrink-0"
            >
              {!isAuthenticated || isPinned ? (
                <X className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">{children}</CardContent>
    </Card>
  );
}
