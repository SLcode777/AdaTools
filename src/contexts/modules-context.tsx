"use client";

import { createContext, ReactNode, useContext } from "react";
import { useModule } from "../hooks/useModule";

interface ModulesContextType {
  pinnedModules: string[];
  handleTogglePin: (moduleId: string) => void;
  isPinned: (moduleId: string) => boolean;
  isLoading: boolean;
  isToggling: boolean;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export function ModulesProvider({ children }: { children: ReactNode }) {
  const { getPinnedModules, togglePin, isToggling, isLoading } = useModule();

  const handleTogglePin = (moduleId: string) => {
    togglePin({ moduleId });
  };

  const isPinned = (moduleId: string) =>
    getPinnedModules?.includes(moduleId) ?? false;

  return (
    <ModulesContext.Provider
      value={{
        pinnedModules: getPinnedModules ?? [],
        handleTogglePin,
        isPinned,
        isLoading,
        isToggling,
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
