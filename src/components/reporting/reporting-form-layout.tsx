import { cn } from "@/lib/utils";

export function ReportingFormLayout({
  title,
  subtitle,
  banner,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  banner?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-3xl space-y-8", className)}>
      <div>
        <h1 className="font-display text-xl font-semibold uppercase tracking-wide text-foreground md:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      {banner}

      <div className="space-y-6">{children}</div>
    </div>
  );
}

export function ReportingPanel({
  title,
  children,
  action,
  id,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  id?: string;
}) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-xl border border-border/50 bg-card/50 shadow-sm"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 bg-black/25 px-5 py-3.5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function ReportingFieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-3 border-b border-border/30 pb-6 sm:grid-cols-[200px_1fr] sm:items-start">
      <label className="pt-2 text-sm text-muted-foreground">{label}</label>
      <div>{children}</div>
    </div>
  );
}

export function ReportingSection({
  title,
  children,
  panel = false,
  action,
  id,
}: {
  title: string;
  children: React.ReactNode;
  panel?: boolean;
  action?: React.ReactNode;
  id?: string;
}) {
  if (panel) {
    return (
      <ReportingPanel title={title} action={action} id={id}>
        {children}
      </ReportingPanel>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="space-y-0">{children}</div>
    </div>
  );
}
