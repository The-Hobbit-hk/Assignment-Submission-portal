import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { SitePageTransition } from "@/components/site/site-page-transition";
import { ScrollToTop } from "@/components/site/scroll-to-top";

export function SiteShell({
  children,
  transparentHeader = false,
  pageTransitions = false,
}: {
  children: React.ReactNode;
  transparentHeader?: boolean;
  pageTransitions?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader transparent={transparentHeader} />
      <main>
        {pageTransitions ? <SitePageTransition>{children}</SitePageTransition> : children}
      </main>
      <SiteFooter />
      <ScrollToTop />
    </div>
  );
}
