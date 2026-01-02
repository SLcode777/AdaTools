"use client";

import { api } from "@/src/lib/trpc/client";

export default function RickrollStatsPage() {
  const { data: stats, isLoading } = api.analytics.getStats.useQuery({
    eventType: "rickroll",
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 via-pink-500 to-red-500">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 shadow-2xl border border-white/20">
            <h1 className="text-6xl font-bold mb-4 text-white animate-pulse">
              🎵 Rickroll Stats 🎵
            </h1>

            <p className="text-xl text-white/90 mb-8">
              Never gonna give you up statistics
            </p>

            {isLoading ? (
              <div className="text-white/80 text-lg">Loading stats...</div>
            ) : (
              <div className="space-y-6">
                <div className="bg-white/20 rounded-xl p-8 backdrop-blur">
                  <div className="text-8xl font-black text-white mb-4">
                    {stats?.count || 0}
                  </div>
                  <div className="text-2xl text-white/90 font-semibold">
                    People have been Rickrolled
                  </div>
                </div>

                {stats && stats.count > 0 && (
                  <p className="text-white/80 text-lg italic">
                    {stats.count === 1
                      ? "One brave soul fell for it!"
                      : `${stats.count} brave souls fell for it!`}
                  </p>
                )}

                <div className="pt-8 text-white/60 text-sm">
                  <p>Never gonna let you down</p>
                  <p>Never gonna run around and desert you</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
