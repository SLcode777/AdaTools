"use client";

import { ModuleGrid } from "@/components/dashboard/module-grid";
import { getModuleById } from "@/src/config/modules";
import { useModuleContext } from "@/src/contexts/modules-context";
import { useSession } from "@/src/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const { pinnedModules } = useModuleContext();

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

  return (
    <div className="container mx-auto px-4 py-8">
      {pinnedModules.length > 0 ? (
        <ModuleGrid>
          {pinnedModules.map((moduleId) => {
            const moduleConfig = getModuleById(moduleId);
            if (!moduleConfig) return null;
            const ModuleComponent = moduleConfig.component;
            return <ModuleComponent key={moduleId} />;
          })}
        </ModuleGrid>
      ) : (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <p className="text-muted-foreground mb-2">No pinned modules</p>
          <p className="text-sm text-muted-foreground">
            Use the "Modules" menu to pin tools
          </p>
        </div>
      )}
    </div>
  );
}
