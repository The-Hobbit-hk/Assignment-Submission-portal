import { siteConfig } from "@/config/site";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h2>
        <p className="text-zinc-600">{subtitle}</p>
      </div>
      {children}
      <p className="text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} {siteConfig.organization} {siteConfig.district}
      </p>
    </div>
  );
}
