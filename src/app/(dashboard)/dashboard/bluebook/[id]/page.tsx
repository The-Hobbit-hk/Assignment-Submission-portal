import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BluebookTaskDetail } from "@/components/bluebook/bluebook-task-detail";
import { canViewClubBluebook, canViewMyCouncilBluebook } from "@/lib/roles";
import type { UserRole } from "@/types/auth";

export const metadata = { title: "Bluebook Task" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BluebookTaskPage({ params }: PageProps) {
  const session = await auth();
  const role = (session?.user?.role ?? "MEMBER") as UserRole;

  if (!canViewClubBluebook(role)) {
    redirect("/dashboard");
  }

  if (canViewMyCouncilBluebook(role)) {
    redirect("/dashboard/bluebook/my-tasks");
  }

  const { id } = await params;
  return <BluebookTaskDetail taskId={id} />;
}
