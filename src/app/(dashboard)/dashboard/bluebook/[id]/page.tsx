import { BluebookTaskDetail } from "@/components/bluebook/bluebook-task-detail";

export const metadata = { title: "Bluebook Task" };

interface PageProps { params: Promise<{ id: string }> }

export default async function BluebookTaskPage({ params }: PageProps) {
  const { id } = await params;
  return <BluebookTaskDetail taskId={id} />;
}
