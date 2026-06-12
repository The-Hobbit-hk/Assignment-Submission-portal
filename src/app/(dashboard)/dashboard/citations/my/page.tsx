import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CitationsMyContent } from "@/components/citations/citations-my-content";
import { canSubmitCitations } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "My Citations" };

export default async function CitationsMyPage() {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (!canSubmitCitations(role)) {
    redirect("/dashboard");
  }

  return <CitationsMyContent />;
}
