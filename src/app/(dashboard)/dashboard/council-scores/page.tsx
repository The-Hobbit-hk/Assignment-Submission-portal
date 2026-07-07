import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CouncilContent } from "@/components/council/council-content";
import { canViewCouncilStandings } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "Council Live Scores" };

export default async function CouncilScoresPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (!canViewCouncilStandings(role)) {
    redirect("/dashboard");
  }

  return <CouncilContent />;
}
