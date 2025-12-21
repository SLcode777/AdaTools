"use client";

import { AVAILABLE_MODULES } from "@/src/config/modules";
import { useModuleContext } from "@/src/contexts/modules-context";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pin, PinOff, SquareChevronDown } from "lucide-react";

export function ModulesNav() {
  const { isPinned, handleTogglePin, toggleTempOpen } = useModuleContext();

  const modulesByCategory = AVAILABLE_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_MODULES>);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex flex-row gap-2 hover:bg-muted dark:hover:bg-muted/50 aria-expanded:bg-muted aria-expanded:text-foreground hover:text-primary hover:cursor-pointer px-2 items-center">
        <p className="">Modules</p>
        <SquareChevronDown className="" size={16} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="flex flex-col w-64">
        {Object.entries(modulesByCategory).map(([category, modules]) => (
          <div key={category}>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{category}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {modules.map((module) => {
              const pinned = isPinned(module.id);
              return (
                <DropdownMenuItem
                  key={module.id}
                  className="flex flex-row justify-between"
                  onSelect={() => {
                    toggleTempOpen(module.id);
                  }}
                >
                  <div>{module.name}</div>
                  <Button
                    variant="ghost"
                    // size="icon"
                    className="h-4 w-4 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation(); // Empêche la propagation au parent
                      handleTogglePin(module.id);
                    }}
                  >
                    {!pinned ? (
                      <PinOff className="text-muted-foreground" size={"xs"} />
                    ) : (
                      <Pin className="text-primary" />
                    )}
                  </Button>
                </DropdownMenuItem>
              );
            })}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
