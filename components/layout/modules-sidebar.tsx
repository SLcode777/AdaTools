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
import {
  ChevronDown,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  PinOff,
  X,
} from "lucide-react";
import { useState } from "react";

interface ModulesSidebarProps {
  className?: string;
}

interface SidebarContentProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  showToggle?: boolean;
}

function SidebarContent({
  collapsed = false,
  onToggleCollapse,
  showToggle = false,
}: SidebarContentProps) {
  const { isPinned, handleTogglePin, toggleTempOpen } = useModuleContext();
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(
    () => {
      //all categories unfolded by default
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
    <div className="flex flex-col gap-4 h-full overflow-y-auto bg-sidebar">
      <div className={cn("px-4 pt-4", collapsed && "self-center")}>
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold">Modules</h2>
              <p className="text-sm text-muted-foreground">
                Pin your favorite tools
              </p>
            </div>
          )}
          {showToggle && onToggleCollapse && (
            <div
              className=" text-muted-foreground hover:text-primary hover:cursor-pointer"
              onClick={onToggleCollapse}
            >
              {collapsed ? (
                <PanelRightClose
                  size={20}
                  strokeWidth={1.5}
                  className="items-center justify-center text-center"
                />
              ) : (
                <PanelRightOpen
                  size={20}
                  strokeWidth={1.5}
                  className="items-center justify-center text-center"
                />
              )}
            </div>
          )}
        </div>
      </div>

      {!collapsed && (
        <div className="flex-1 px-2">
          {Object.entries(modulesByCategory).map(([category, modules]) => {
            const isOpen = openCategories[category];
            return (
              <div key={category} className="mb-4">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center  px-2 py-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200 mr-2",
                      !isOpen && "-rotate-90"
                    )}
                  />
                  <span className="text-xs">{category}</span>
                </button>
                {isOpen && (
                  <div className="space-y-1 mt-1 border-l border-primary/40 ml-4">
                    {modules.map((module) => {
                      const pinned = isPinned(module.id);
                      return (
                        <button
                          key={module.id}
                          className={cn(
                            "w-full flex items-center justify-between px-3 ml-1  text-xs transition-colors text-nowrap",
                            "hover:bg-primary/10 hover:text-primary hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          )}
                          onClick={() => toggleTempOpen(module.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="">{module.icon}</div>
                            <span className="text-xs">{module.name}</span>
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
      )}
    </div>
  );
}

export function ModulesSidebar({ className }: ModulesSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { sidebarCollapsed, setSidebarCollapsed } = useModuleContext();

  const handleToggleCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex fixed left-0 top-0 h-screen border-r bg-background flex-col transition-all duration-300 z-40",
          sidebarCollapsed ? "w-16" : "w-64",
          className
        )}
      >
        <SidebarContent
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleCollapse}
          showToggle={true}
        />
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
