import Link from "next/link";
import { PodiumCard } from "@/components/council/podium-card";
import { SectionLabel } from "@/components/layout/page-heading";
import type { LeaderboardEntry } from "@/types/dashboard";

interface LeaderboardProps {
  entries: LeaderboardEntry[];
}

export function Leaderboard({ entries }: LeaderboardProps) {
  const top3 = entries.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionLabel>Leaderboard</SectionLabel>
        <Link href="/dashboard/council-scores" className="text-xs text-accent hover:underline">
          View all
        </Link>
      </div>

      {top3.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No rankings yet</p>
      ) : (
        <div className="space-y-3">
          {top3.map((entry) => (
            <Link key={entry.memberId} href={`/dashboard/members/${entry.memberId}`}>
              <PodiumCard
                rank={entry.rank}
                name={entry.name}
                score={entry.points}
                avatar={entry.avatar}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
