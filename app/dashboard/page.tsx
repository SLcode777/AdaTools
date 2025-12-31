"use client";

import { MultiColumnGrid } from "@/components/dashboard/multi-column-grid";
import { SortableModuleItem } from "@/components/dashboard/sortable-module-item";
import { ModulesSidebar } from "@/components/layout/modules-sidebar";
import { MarketingSections } from "@/components/marketing/marketing-sections";
import { getModuleById } from "@/src/config/modules";
import { useModuleContext } from "@/src/contexts/modules-context";
import { useSession } from "@/src/lib/auth-client";
import { useMemo } from "react";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const {
    pinnedModules,
    handleTogglePin,
    tempOpenModules,
    toggleTempOpen,
    sidebarCollapsed,
    isAuthenticated,
    onAuthRequired,
    moduleOrder,
    handleReorderModules,
    visibleColumns,
  } = useModuleContext();

  // Get all modules that should be displayed
  const allModules = useMemo(
    () =>
      isAuthenticated
        ? Array.from(new Set([...pinnedModules, ...tempOpenModules]))
        : tempOpenModules,
    [isAuthenticated, pinnedModules, tempOpenModules]
  );

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  // Render a single module
  const renderModule = (moduleId: string) => {
    const moduleConfig = getModuleById(moduleId);
    if (!moduleConfig) return null;
    const ModuleComponent = moduleConfig.component;
    const isPinned = pinnedModules.includes(moduleId);
    const isTemp = tempOpenModules.includes(moduleId);

    return (
      <SortableModuleItem key={moduleId} id={moduleId}>
        <ModuleComponent
          isPinned={isPinned}
          onTogglePin={() => {
            //visitors : close module
            if (!isAuthenticated) {
              toggleTempOpen(moduleId);

              //auth user
            } else if (isPinned) {
              //pinned module : unpin
              handleTogglePin(moduleId);

              //unpinned module : can pin then can close
            } else if (isTemp) {
              handleTogglePin(moduleId);
              toggleTempOpen(moduleId);
            }
          }}
          isAuthenticated={isAuthenticated}
          onAuthRequired={onAuthRequired}
        />
      </SortableModuleItem>
    );
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <ModulesSidebar />
      <div className="flex flex-col w-full">
        <div
          className={`flex-1 border w-full px-4 py-8 transition-all duration-300 ${
            sidebarCollapsed
              ? "lg:pl-[calc(64px+1rem)]"
              : "lg:pl-[calc(256px+1rem)]"
          }`}
        >
          {allModules.length > 0 ? (
            <MultiColumnGrid
              moduleOrder={moduleOrder}
              visibleColumns={visibleColumns}
              onReorder={handleReorderModules}
              renderModule={renderModule}
              allModules={allModules}
            />
          ) : (
            <div className="border-2 border-dashed rounded-lg p-12 text-center">
              <p className="text-muted-foreground mb-2">No pinned modules</p>
              <p className="text-sm text-muted-foreground">
                Use the sidebar to pin tools
              </p>
            </div>
          )}
        </div>

        {/* Marketing sections only for visitors */}
        {!session && (
          <div
            className={`${
              sidebarCollapsed
                ? "lg:pl-[calc(64px+1rem)]"
                : "lg:pl-[calc(256px+1rem)]"
            }`}
          >
            <MarketingSections />
          </div>
        )}
      </div>
    </div>
  );
}
