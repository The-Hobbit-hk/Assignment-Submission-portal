import { SiteShell } from "@/components/site/site-shell";

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteShell>
      <div className="flex min-h-[calc(100vh-4.25rem)] items-center justify-center bg-white px-4 py-12">
        {children}
      </div>
    </SiteShell>
  );
}
