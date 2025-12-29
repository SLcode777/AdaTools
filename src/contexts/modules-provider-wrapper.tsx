"use client";

import { useSession } from "@/src/lib/auth-client";
import { ModulesProvider } from "./modules-context";
import { ReactNode } from "react";

export function ModulesProviderWrapper({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  return <ModulesProvider session={session}>{children}</ModulesProvider>;
}
