import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { HomePage } from "@/components/site/home-page";

export default async function Home() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  return <HomePage />;
}
