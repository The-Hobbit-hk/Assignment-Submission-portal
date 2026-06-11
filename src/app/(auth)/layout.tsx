import { SiteShell } from "@/components/site/site-shell";

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SiteShell>
      <div className="flex min-h-below-header items-center justify-center bg-white px-4 py-8 sm:py-12">
        {children}
      </div>
    </SiteShell>
  );
}
