import { ReactNode } from "react";

interface ModuleGridProps {
  children: ReactNode;
}

export function ModuleGrid({ children }: ModuleGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
      {children}
    </div>
  );
}
