"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/src/lib/trpc";

export default function TestTRPCPage() {
  const trpc = useTRPC();
  const { data, isLoading, error } = useQuery(trpc.greeting.queryOptions());

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Test tRPC</h1>

      <div className="border rounded-lg p-6">
        {isLoading && <p>Chargement...</p>}
        {error && <p className="text-destructive">Erreur : {error.message}</p>}
        {data && (
          <div>
            <p className="text-lg">✅ tRPC fonctionne !</p>
            <p className="text-muted-foreground mt-2">
              Réponse du serveur : <span className="font-mono">{data}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
