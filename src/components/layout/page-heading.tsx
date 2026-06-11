import { cn } from "@/lib/utils";

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeading({ title, subtitle, action, className }: PageHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4", className)}>
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight text-foreground sm:text-xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">{action}</div>}
    </div>
  );
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2 className={cn("text-xs font-semibold uppercase tracking-widest text-foreground", className)}>
      {children}
    </h2>
  );
}
