import type { CouncilUserSeed } from "@/lib/council-roster-data";

export function CouncilRosterList({ members }: { members: CouncilUserSeed[] }) {
  if (members.length === 0) return null;

  return (
    <section className="border-t border-zinc-200 bg-zinc-50 py-12">
      <div className="mx-auto max-w-4xl px-4 lg:px-8">
        <h3 className="font-display text-xl font-bold text-zinc-900">
          Council members ({members.length})
        </h3>
        <ul className="mt-6 divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
          {members.map((member) => (
            <li
              key={member.email}
              className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-zinc-900">{member.name}</p>
                <p className="text-sm text-zinc-500">{member.title}</p>
              </div>
              <a
                href={`mailto:${member.email}`}
                className="text-sm text-accent hover:underline"
              >
                {member.email}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
