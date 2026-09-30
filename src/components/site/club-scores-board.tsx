import Link from "next/link";
import type { PublicClubScore } from "@/lib/club-live-scores";

export function ClubScoresBoard({
  clubs,
  label,
  preview,
}: {
  clubs: PublicClubScore[];
  label: string;
  preview?: boolean;
}) {
  const rows = preview ? clubs.slice(0, 8) : clubs;

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-end justify-between gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            RIY {label}
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-zinc-900">
            Club live scores
          </h2>
        </div>
        {preview && (
          <Link href="/clubs/scores" className="text-sm font-semibold text-accent hover:underline">
            All clubs
          </Link>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-zinc-500">No club scores yet.</p>
      ) : (
        <ol>
          {rows.map((club) => (
            <li
              key={club.clubId}
              className="flex items-center gap-4 border-b border-zinc-100 px-5 py-3 last:border-b-0"
            >
              <span className="w-8 text-sm font-bold text-zinc-400">{club.rank ?? "—"}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-zinc-900">{club.name}</p>
                <p className="text-xs text-zinc-500">{club.zone ?? "District"}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-accent">{club.score}</p>
                {club.badge && <p className="text-[10px] uppercase text-zinc-400">{club.badge}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
