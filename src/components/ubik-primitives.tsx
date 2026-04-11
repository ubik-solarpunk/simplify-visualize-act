import { cn } from "@/lib/utils";

export function Surface({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <section className={cn("border border-border bg-card", className)}>{children}</section>;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{eyebrow}</p>
        ) : null}
        <h2 className="mt-1 font-mono text-xl font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatusPill({
  tone = "default",
  children,
}: {
  tone?: "default" | "alert" | "success" | "muted";
  children: React.ReactNode;
}) {
  const toneClass = {
    default: "border-border text-foreground",
    alert: "border-primary text-primary",
    success: "border-foreground/40 text-foreground",
    muted: "border-border text-muted-foreground",
  }[tone];

  return (
    <span className={cn("inline-flex items-center gap-2 border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em]", toneClass)}>
      {children}
    </span>
  );
}

export function SmallButton({
  children,
  className,
  active,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
        active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground hover:border-foreground/40",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "alert";
}) {
  return (
    <div className="border border-border bg-card px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={cn("mt-2 font-mono text-2xl font-semibold", tone === "alert" ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}
