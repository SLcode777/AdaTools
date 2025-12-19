"use client";

import { api } from "@/src/lib/trpc/client";

export default function TestTRPCPage() {
  const greeting = api.test.greeting.useQuery();

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold mb-8">Test tRPC</h1>

      <div className="border rounded-lg p-6">
        {greeting ? (
          <div>
            <p className="text-lg">✅ tRPC fonctionne !</p>
            <p className="text-muted-foreground mt-2">
              Réponse du serveur :{" "}
              <span className="font-mono">{greeting.data}</span>
            </p>
          </div>
        ) : (
          <div>TRPC NOT WORKING</div>
        )}
      </div>
    </div>
  );
}
