"use client";
import { useState } from "react";
import { useModuleContext } from "@/src/contexts/modules-context";
import { usePathname } from "next/navigation";
import { cn } from "@/src/lib/utils";

export function Footer() {
  const [copied, setCopied] = useState(false);
  const { sidebarCollapsed } = useModuleContext();
  const pathname = usePathname();

  const handleCopyMail = async () => {
    const email = "sl.code.777@gmail.com";
    await navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isDashboard = pathname === "/dashboard";

  return (
    <footer className="border-t mt-auto">
      <div
        className={cn(
          "w-full px-4 py-8 transition-all duration-300",
          isDashboard && (sidebarCollapsed ? 'lg:pl-[calc(64px+1rem)]' : 'lg:pl-[calc(256px+1rem)]')
        )}
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} AdaTools. All rights reserved.
          </div>

          <div
            className="flex gap-6 text-sm text-muted-foreground hover:text-foreground transition-colors hover:cursor-pointer "
            onClick={handleCopyMail}
          >
            {copied === true ? "Email copié !" : "Contact"}
          </div>
        </div>
      </div>
    </footer>
  );
}
