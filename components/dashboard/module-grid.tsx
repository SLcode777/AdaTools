import { ReactNode } from "react";

interface ModuleGridProps {
  children: ReactNode;
}

export function ModuleGrid({ children }: ModuleGridProps) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 3xl:columns-4 4xl:columns-5 gap-6 space-y-6">
      {children}
    </div>
  );
}
