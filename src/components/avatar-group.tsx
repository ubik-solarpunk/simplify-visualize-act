import { cn } from "@/lib/utils";

export type AvatarGroupItem = {
  id: string;
  name: string;
  avatarSrc?: string;
  fallback: string;
};

export function AvatarGroup({
  items,
  className,
}: {
  items: AvatarGroupItem[];
  className?: string;
}) {
  return (
    <div className={cn("flex items-center", className)}>
      {items.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "group relative inline-flex h-7 w-7 items-center justify-center border border-border bg-background transition-transform",
            index === 0 ? "" : "-ml-2",
          )}
          title={item.name}
        >
          {item.avatarSrc ? (
            <img alt={item.name} className="h-full w-full object-cover" src={item.avatarSrc} />
          ) : (
            <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-foreground">{item.fallback}</span>
          )}
        </div>
      ))}
    </div>
  );
}
