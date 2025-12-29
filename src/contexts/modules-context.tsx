"use client";

import { AuthRequiredModal } from "@/components/auth/auth-required-modal";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
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
  isAuthenticated: boolean;
  onAuthRequired: () => void;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export function ModulesProvider({
  children,
  session,
}: {
  children: ReactNode;
  session: any;
}) {
  const isAuthenticated = !!session;
  const { getPinnedModules, togglePin, isToggling, isLoading } =
    useModule(isAuthenticated);

  // tempOpenModules for visitors only
  const [tempOpenModules, setTempOpenModules] = useState<string[]>([
    "youtube-embed",
    "webpConverter",
    "lorem-ipsum",
  ]);

  //load collapsed sidebar state from localStorage
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    return savedState === "true";
  });

  const [authModalOpen, setAuthModalOpen] = useState(false);

  //handle open modules based on "isAuthenticated"
  const prevIsAuthenticated = useRef(isAuthenticated);

  useEffect(() => {
    //visitor → authenticated : empty tempOpenModules
    if (!prevIsAuthenticated.current && isAuthenticated) {
      setTempOpenModules([]);

      //authenticated → visitor : set back default modules
    } else if (prevIsAuthenticated.current && !isAuthenticated) {
      setTempOpenModules(["youtube-embed", "webpConverter", "lorem-ipsum"]);
    }
    prevIsAuthenticated.current = isAuthenticated;
  }, [isAuthenticated]);

  const setSidebarCollapsed = (collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  };

  const handleTogglePin = (moduleId: string) => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    togglePin({ moduleId });
  };

  const onAuthRequired = () => {
    setAuthModalOpen(true);
  };

  const isPinned = (moduleId: string) => {
    if (!isAuthenticated) return false;
    return getPinnedModules?.includes(moduleId) ?? false;
  };

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
        pinnedModules: isAuthenticated ? getPinnedModules ?? [] : [],
        handleTogglePin,
        isPinned,
        isLoading: isAuthenticated ? isLoading : false,
        isToggling,
        tempOpenModules,
        toggleTempOpen,
        isTempOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
        isAuthenticated,
        onAuthRequired,
      }}
    >
      {children}
      <AuthRequiredModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        action="pin modules"
      />
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
