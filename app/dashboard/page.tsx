"use client";

import { ModuleGrid } from "@/components/dashboard/module-grid";
import { ModulesSidebar } from "@/components/layout/modules-sidebar";
import { MarketingSections } from "@/components/marketing/marketing-sections";
import { getModuleById } from "@/src/config/modules";
import { useModuleContext } from "@/src/contexts/modules-context";
import { useSession } from "@/src/lib/auth-client";

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
  } = useModuleContext();

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  //modules to display :
  //Visitors = tempOpenModules (3 default modules + the ones the visitor chooses to open)
  //Auth users : pinnedModules + tempOpenModules
  const allModules = isAuthenticated
    ? Array.from(new Set([...pinnedModules, ...tempOpenModules]))
    : tempOpenModules;

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
            <ModuleGrid>
              {allModules.map((moduleId) => {
                const moduleConfig = getModuleById(moduleId);
                if (!moduleConfig) return null;
                const ModuleComponent = moduleConfig.component;
                const isPinned = pinnedModules.includes(moduleId);
                const isTemp = tempOpenModules.includes(moduleId);

                return (
                  <ModuleComponent
                    key={moduleId}
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
                );
              })}
            </ModuleGrid>
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
