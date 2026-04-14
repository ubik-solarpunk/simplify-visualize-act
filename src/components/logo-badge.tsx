import { useState } from "react";

function initialsFrom(label: string) {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "NA";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function LogoBadge({
  name,
  domain,
  className = "",
}: {
  name: string;
  domain?: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const logoUrl = domain ? `https://img.logo.dev/${domain}?size=64&format=png` : null;

  if (!logoUrl || failed) {
    return (
      <span
        className={`inline-flex h-6 w-6 items-center justify-center border border-border bg-background font-mono text-[9px] uppercase tracking-[0.12em] text-foreground ${className}`}
      >
        {initialsFrom(name)}
      </span>
    );
  }

  return (
    <img
      alt={`${name} logo`}
      className={`h-6 w-6 border border-border bg-background object-contain p-1 ${className}`}
      onError={() => setFailed(true)}
      src={logoUrl}
    />
  );
}
