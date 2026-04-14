import { cn } from "@/lib/utils";

export type ContactSummary = {
  avatarSrc?: string;
  fallback: string;
  name: string;
  role: string;
};

export function BasicContactCard({
  contact,
  compact,
  className,
}: {
  contact: ContactSummary;
  compact?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border border-border bg-card px-2 py-1 text-foreground",
        className,
      )}
    >
      {contact.avatarSrc ? (
        <img alt={contact.name} className="h-6 w-6 border border-border object-cover" src={contact.avatarSrc} />
      ) : (
        <span className="inline-flex h-6 w-6 items-center justify-center border border-border bg-background font-mono text-[9px] uppercase tracking-[0.12em]">
          {contact.fallback}
        </span>
      )}
      <span className="flex flex-col leading-tight">
        <span className="text-xs text-foreground">{contact.name}</span>
        {!compact ? <span className="text-[11px] text-muted-foreground">{contact.role}</span> : null}
      </span>
    </span>
  );
}
