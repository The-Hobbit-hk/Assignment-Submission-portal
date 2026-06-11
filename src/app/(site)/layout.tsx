import { SiteShell } from "@/components/site/site-shell";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell transparentHeader>{children}</SiteShell>;
}
