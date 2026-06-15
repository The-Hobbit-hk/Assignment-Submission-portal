import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { canViewClubBluebook } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export default async function BluebookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (!canViewClubBluebook(role)) {
    redirect("/dashboard");
  }

  return children;
}
