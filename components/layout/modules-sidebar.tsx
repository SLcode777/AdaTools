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
  Github,
  Lock,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Pin,
  PinOff,
  X,
} from "lucide-react";
import Link from "next/link";
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
  const {
    isPinned,
    handleTogglePin,
    toggleTempOpen,
    isTempOpen,
    isAuthenticated,
  } = useModuleContext();
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
    <div className="flex flex-col h-full bg-sidebar">
      {/* fixed header */}
      <div
        className={cn(
          "px-4 py-2 z-50",
          collapsed && "self-center py-5",
          !collapsed &&
            "bg-background drop-shadow-b drop-shadow-sm drop-shadow-primary/15"
        )}
      >
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div>
              <h2 className="text-lg font-semibold">Modules</h2>
              {isAuthenticated ? (
                <p className="text-sm text-muted-foreground">
                  Pin your favorite tools
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Browse our tools
                </p>
              )}
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

      {/* scrollable */}
      {!collapsed && (
        <div
          className={cn(
            "flex-1 px-2 overflow-y-auto [&::-webkit-scrollbar]:w-0.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-primary",
            !isAuthenticated && "pb-64"
          )}
        >
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
                      const tempOpen = isTempOpen(module.id);
                      const requiresAuth = module.requiresAuth;
                      const showLock = requiresAuth && !isAuthenticated;
                      return (
                        <button
                          key={module.id}
                          className={cn(
                            !isAuthenticated && tempOpen && "bg-primary/10",
                            "w-full flex items-center justify-between px-3 py-1 ml-1  text-xs transition-colors text-nowrap",
                            "hover:bg-primary/10 hover:text-primary hover:cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          )}
                          onClick={() => toggleTempOpen(module.id)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="">{module.icon}</div>
                            <span className="text-xs">{module.name}</span>
                            {showLock && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          {isAuthenticated && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 shrink-0"
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
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {!collapsed && (
            <div
              className={cn(
                "border-t py-4",
                !isAuthenticated && "fixed bottom-0 left-0 bg-card",
                !isAuthenticated && (collapsed ? "w-16" : "w-64")
              )}
            >
              <div className="container mx-auto px-4">
                <div className="text-center items-center flex flex-col">
                  <h2 className="text-lg font-bold mb-4">
                    Want to add your own modules?
                  </h2>
                  <p className="text-muted-foreground mb-2 text-pretty max-w-2xl flex justify-center text-sm">
                    AdaTools is an OpenSource project so we can build together
                    the most useful and customizable tool for devs!
                  </p>
                  <Link href="https://github.com/SLcode777/AdaTools">
                    <div className="flex flex-row gap-2 border border-primary p-2 mt-4 hover:cursor-pointer bg-primary/10 hover:bg-primary/20">
                      <Github />
                      <p>See the repository</p>
                    </div>
                  </Link>
                  <p className="text-sm text-muted-foreground mt-2">
                    don&apos;t forget to drop a ⭐ :)
                  </p>
                </div>
              </div>
            </div>
          )}
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
          "hidden lg:flex fixed left-0 top-0 h-screen  bg-background flex-col transition-all duration-300 z-40",
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
