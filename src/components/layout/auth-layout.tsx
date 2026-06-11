import { BrandLogo } from "@/components/brand/brand-logo";
import { siteConfig } from "@/config/site";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="auth-gradient flex min-h-screen">
      <div className="relative hidden flex-1 flex-col justify-between overflow-hidden p-10 lg:flex">
        <BrandLogo variant="full" size="md" />

        <div className="max-w-lg space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground">
            Empowering{" "}
            <span className="text-accent">Rotaract leadership</span> across
            District 3131
          </h1>
          <p className="text-lg text-muted-foreground">
            A unified platform to manage clubs, members, events, finances, and
            district operations — built for scale and clarity.
          </p>
          <div className="flex gap-8 pt-4">
            <div>
              <p className="text-3xl font-bold text-accent">50+</p>
              <p className="text-sm text-muted-foreground">Active Clubs</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">2,500+</p>
              <p className="text-sm text-muted-foreground">Members</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-accent">100+</p>
              <p className="text-sm text-muted-foreground">Annual Events</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.organization}{" "}
          {siteConfig.district}. All rights reserved.
        </p>

        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <div className="mb-6 flex justify-center lg:hidden">
              <BrandLogo variant="full" size="md" linked={false} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {title}
            </h2>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
