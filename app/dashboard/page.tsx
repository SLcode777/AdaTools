"use client";

import { ModuleGrid } from "@/components/dashboard/module-grid";
import { ModulesSidebar } from "@/components/layout/modules-sidebar";
import { getModuleById } from "@/src/config/modules";
import { useModuleContext } from "@/src/contexts/modules-context";
import { useSession } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { pinnedModules, handleTogglePin, tempOpenModules, toggleTempOpen } = useModuleContext();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/signin");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Loading...
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  // Combiner les modules pinnés et temporaires (sans doublons)
  const allModules = Array.from(new Set([...pinnedModules, ...tempOpenModules]));

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <ModulesSidebar />
      <div className="flex-1 container mx-auto px-4 py-8">
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
                    if (isPinned) {
                      // Module pinné → unpinner
                      handleTogglePin(moduleId);
                    } else if (isTemp) {
                      // Module temporaire → pinner définitivement et retirer des temporaires
                      handleTogglePin(moduleId);
                      toggleTempOpen(moduleId);
                    }
                  }}
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
    </div>
  );
}
