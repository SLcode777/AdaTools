"use client";

import { AuthRequiredModal } from "@/components/auth/auth-required-modal";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useModule } from "../hooks/useModule";
import { useBreakpoint } from "../hooks/useBreakpoint";
import {
  type ModuleOrder,
  type ColumnId,
  type ColumnCount,
  type ModuleLayouts,
  DEFAULT_MODULE_ORDER,
  DEFAULT_MODULE_LAYOUTS,
  getVisibleColumnIds,
  getLayoutForColumnCount,
  updateLayoutInLayouts,
} from "../types/module-order";

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
  moduleOrder: ModuleOrder;
  handleReorderModules: (newOrder: ModuleOrder) => void;
  columnCount: number;
  visibleColumns: ColumnId[];
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

  // Detect current breakpoint/column count
  const columnCount = useBreakpoint();
  const visibleColumns = useMemo(
    () => getVisibleColumnIds(columnCount),
    [columnCount]
  );

  const {
    getPinnedModules,
    togglePin,
    isToggling,
    isLoading,
    getModuleOrder,
    updateModuleOrder,
  } = useModule(isAuthenticated, columnCount as ColumnCount);

  // tempOpenModules for visitors only
  const [tempOpenModules, setTempOpenModules] = useState<string[]>([
    "youtube-embed",
    "webpConverter",
    "lorem-ipsum",
    "pomodoro-timer",
  ]);

  // moduleLayouts for visitors (localStorage) - multi-breakpoint storage
  const [visitorModuleLayouts, setVisitorModuleLayouts] = useState<ModuleLayouts>(
    () => {
      if (typeof window === "undefined") return DEFAULT_MODULE_LAYOUTS;
      const saved = localStorage.getItem("module-layouts");
      return saved ? JSON.parse(saved) : DEFAULT_MODULE_LAYOUTS;
    }
  );

  //load collapsed sidebar state from localStorage
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => {
    if (typeof window === "undefined") return false;
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

  // Unified module order state - extract layout for current columnCount
  const moduleOrder = useMemo(() => {
    if (isAuthenticated) {
      return getModuleOrder ?? DEFAULT_MODULE_ORDER;
    } else {
      return getLayoutForColumnCount(visitorModuleLayouts, columnCount as ColumnCount);
    }
  }, [isAuthenticated, getModuleOrder, visitorModuleLayouts, columnCount]);

  // Handle reordering modules
  const handleReorderModules = useCallback(
    (newOrder: ModuleOrder) => {
      if (isAuthenticated) {
        // Save to database via tRPC mutation with columnCount
        updateModuleOrder({ moduleOrder: newOrder, columnCount });
      } else {
        // Update only the current columnCount's layout for visitors
        const updatedLayouts = updateLayoutInLayouts(
          visitorModuleLayouts,
          columnCount as ColumnCount,
          newOrder
        );
        setVisitorModuleLayouts(updatedLayouts);
        localStorage.setItem("module-layouts", JSON.stringify(updatedLayouts));
      }
    },
    [isAuthenticated, updateModuleOrder, columnCount, visitorModuleLayouts]
  );

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
        moduleOrder,
        handleReorderModules,
        columnCount,
        visibleColumns,
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
