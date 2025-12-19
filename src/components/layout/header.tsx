"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/src/components/theme-toggle";
import { signOut, useSession } from "@/src/lib/auth-client";
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
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          ada-tools
        </Link>

        <nav className="flex items-center gap-3">
          <ThemeToggle />
          {isPending ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
              <Button
                variant="outline"
                onClick={handleSignOut}
                disabled={isLoading}
              >
                {isLoading ? "Déconnexion..." : "Se déconnecter"}
              </Button>
            </div>
          ) : (
            <Button asChild>
              <Link href="/signin">Connexion</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
