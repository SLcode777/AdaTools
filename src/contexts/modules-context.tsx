"use client";

import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useModule } from "../hooks/useModule";

interface ModulesContextType {
  pinnedModules: string[];
  handleTogglePin: (moduleId: string) => void;
  isPinned: (moduleId: string) => boolean;
  isLoading: boolean;
  isToggling: boolean;
  tempOpenModules: string[];
  toggleTempOpen: (moduleId: string) => void;
  isTempOpen: (moduleId: string) => boolean;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export function ModulesProvider({ children }: { children: ReactNode }) {
  const { getPinnedModules, togglePin, isToggling, isLoading } = useModule();
  const [tempOpenModules, setTempOpenModules] = useState<string[]>([]);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(false);

  // Charger l'état collapsed depuis localStorage au montage
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setSidebarCollapsedState(savedState === "true");
    }
  }, []);

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  };

  const handleTogglePin = (moduleId: string) => {
    togglePin({ moduleId });
  };

  const isPinned = (moduleId: string) =>
    getPinnedModules?.includes(moduleId) ?? false;

  const toggleTempOpen = (moduleId: string) => {
    setTempOpenModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const isTempOpen = (moduleId: string) => tempOpenModules.includes(moduleId);

  return (
    <ModulesContext.Provider
      value={{
        pinnedModules: getPinnedModules ?? [],
        handleTogglePin,
        isPinned,
        isLoading,
        isToggling,
        tempOpenModules,
        toggleTempOpen,
        isTempOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </ModulesContext.Provider>
  );
}

export function useModuleContext() {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error("useModuleContext must be used within ModulesProvider");
  }
  return context;
}
