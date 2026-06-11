import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { ScrollToTop } from "@/components/site/scroll-to-top";

export function SiteShell({
  children,
  transparentHeader = false,
}: {
  children: React.ReactNode;
  transparentHeader?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader transparent={transparentHeader} />
      <main>{children}</main>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
