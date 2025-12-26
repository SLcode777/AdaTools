"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { AVAILABLE_MODULES } from "@/src/config/modules";
import { useModuleContext } from "@/src/contexts/modules-context";
import { cn } from "@/src/lib/utils";
import { ChevronDown, Menu, Pin, PinOff, X } from "lucide-react";
import { useState } from "react";

interface ModulesSidebarProps {
  className?: string;
}

function SidebarContent() {
  const { isPinned, handleTogglePin, toggleTempOpen } = useModuleContext();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => {
      // Toutes les catégories ouvertes par défaut
      const categories = AVAILABLE_MODULES.reduce((acc, module) => {
        acc[module.category] = true;
        return acc;
      }, {} as Record<string, boolean>);
      return categories;
    }
  );

  const modulesByCategory = AVAILABLE_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) {
      acc[module.category] = [];
    }
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_MODULES>);

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto">
      <div className="px-4 pt-4">
        <h2 className="text-lg font-semibold">Modules</h2>
        <p className="text-sm text-muted-foreground">Pin your favorite tools</p>
      </div>

      <div className="flex-1 px-2">
        {Object.entries(modulesByCategory).map(([category, modules]) => {
          const isOpen = openCategories[category];
          return (
            <div key={category} className="mb-4">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-2 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{category}</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    !isOpen && "-rotate-90"
                  )}
                />
              </button>
              {isOpen && (
                <div className="space-y-1 mt-1">
                  {modules.map((module) => {
                    const pinned = isPinned(module.id);
                    return (
                      <button
                        key={module.id}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1 rounded-md text-xs transition-colors text-nowrap",
                          "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        )}
                        onClick={() => toggleTempOpen(module.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-muted-foreground">
                            {module.icon}
                          </div>
                          <span>{module.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePin(module.id);
                          }}
                        >
                          {pinned ? (
                            <Pin className="h-4 w-4 text-primary" />
                          ) : (
                            <PinOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ModulesSidebar({ className }: ModulesSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex w-64 border-r bg-background flex-col",
          className
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sheet */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {mobileOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Modules</SheetTitle>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
