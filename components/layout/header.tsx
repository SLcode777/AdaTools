"use client";

import { ModulesNav } from "@/components/layout/modules-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "@/src/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function Header() {
  const { data: session, isPending } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-8">
        <Link href="/" className="text-xl font-bold shrink-0">
          <Image
            src="/logoV2.png"
            alt="logo"
            width={200}
            height={200}
            className="p-4"
          />
        </Link>

        {/* Central navigation - visible only when logged in */}
        {session && (
          <div className="flex items-center gap-4">
            <ModulesNav />
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        )}

        {/* Right navigation */}
        <nav className="flex items-center gap-3 ml-auto">
          <ThemeToggle />
          {isPending ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground hidden md:inline">
                {session.user.email}
              </span>
              <Button
                variant="outline"
                onClick={handleSignOut}
                disabled={isLoading}
              >
                {isLoading ? "Signing out..." : "Sign out"}
              </Button>
            </div>
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
