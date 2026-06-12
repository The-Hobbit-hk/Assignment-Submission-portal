import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CitationStandingsTable } from "@/components/citations/citation-standings-table";
import { canViewCitationStandings } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "Citation Standings" };

export default async function CitationStandingsPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (!canViewCitationStandings(role)) {
    redirect("/dashboard");
  }

  return <CitationStandingsTable />;
}
