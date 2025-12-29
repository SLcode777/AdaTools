"use client";

import { SettingsDialog } from "@/components/settings-dialog";
import { Button } from "@/components/ui/button";
import { useColorTheme } from "@/src/contexts/color-theme-context";
import { useModuleContext } from "@/src/contexts/modules-context";
import { signOut, useSession } from "@/src/lib/auth-client";
import { cn } from "@/src/lib/utils";
import { LogOut, Settings } from "lucide-react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function Header() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();
  const { colorTheme } = useColorTheme();
  const { sidebarCollapsed } = useModuleContext();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      router.push("/");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const isDashboard = pathname === "/dashboard";

  return (
    <header className="border-b w-full bg-background z-40 fixed drop-shadow-sm drop-shadow-primary/15">
      <div
        className={cn(
          "w-full px-4 h-16 flex items-center justify-between gap-8 transition-all duration-300",
          isDashboard &&
            (sidebarCollapsed
              ? "lg:pl-[calc(64px+1rem)]"
              : "lg:pl-[calc(256px+1rem)]")
        )}
      >
        <Link href="/" className="text-xl font-bold shrink-0">
          <Image
            src={
              !mounted
                ? "/logo-cyan-dark.webp"
                : `/logo-${colorTheme}-${
                    theme === "dark" ? "dark" : "light"
                  }.webp`
            }
            alt="AdaTools logo"
            width={200}
            height={73}
            className="p-4"
          />
        </Link>

        {/* Central navigation - visible only when logged in */}
        {session && (
          <div className="flex items-center gap-4">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className={cn(
                pathname === "/dashboard"
                  ? "text-base text-primary"
                  : "text-base"
              )}
            >
              <Link href="/dashboard">
                <p className="text-base">Dashboard</p>
              </Link>
            </Button>
          </div>
        )}

        {/* Right navigation */}
        <nav className="flex items-center gap-3 ml-auto">
          {isPending ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-3 border border-muted hover:bg-muted hover:cursor-pointer px-4 py-1 ">
                <Image
                  src={session.user.image || "/globe.svg"}
                  alt="user-avatar"
                  height={24}
                  width={24}
                  className="rounded-full"
                />
                <span className="text-sm hidden md:inline">
                  {session.user.name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="flex flex-col w-fit">
                <SettingsDialog>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </SettingsDialog>

                <DropdownMenuSeparator />

                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="m-1 flex-1 py-1 text-destructive"
                >
                  <LogOut />
                  {isLoading ? "Signing out..." : "Sign out"}
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
