import { HomePage } from "@/components/site/home-page";

// Static: middleware already redirects logged-in users from "/" to /dashboard,
// so rendering can be fully cached instead of running auth() per visit.
export const dynamic = "force-static";

export default function Home() {
  return <HomePage />;
}
