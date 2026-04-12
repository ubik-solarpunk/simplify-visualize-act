import { Ghost } from "lucide-react";
import { useLocation } from "react-router-dom";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { useShellState } from "@/hooks/use-shell-state";
import { getRouteMeta } from "@/lib/ubik-data";

export function TopBar() {
  const location = useLocation();
  const { openDrawer, openFreshKnowAnything, openTemporaryKnowAnything } = useShellState();
  const route = getRouteMeta(location.pathname);

  const handleAction = (label: string) => {
    if (route?.key === "chat" && label === "New Thread") {
      openFreshKnowAnything();
      return;
    }

    if (route?.key === "chat" && label === "Share") {
      openDrawer({
        title: "Share thread",
        eyebrow: route.title,
        description: "Seeded sharing surface for internal handoff or public permission links.",
        metadata: [
          { label: "Thread", value: "Current Know Anything tab" },
          { label: "Access", value: "Internal default" },
        ],
        actions: ["Copy internal link", "Create public link", "Restrict access"],
      });
      return;
    }

    openDrawer({
      title: label,
      eyebrow: route?.title,
      description: `Action surface for ${label.toLowerCase()} on the ${route?.title} page.`,
      metadata: [
        { label: "Page", value: route?.title ?? "Workspace" },
        { label: "Mode", value: "Frontend seeded" },
      ],
    });
  };

  return (
    <header className="border-b border-border bg-background">
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="border border-border md:hidden" />
          <p className="max-w-3xl text-sm text-muted-foreground lg:text-[15px]">{route?.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {route?.actions.map((action) => (
            <button
              key={action.label}
              className={`h-9 border px-3.5 font-mono text-[10px] uppercase tracking-[0.14em] ${
                action.kind === "primary"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground"
              }`}
              onClick={() => handleAction(action.label)}
            >
              {action.label}
            </button>
          ))}
          {route?.key === "chat" ? (
            <button
              className="flex h-9 w-9 items-center justify-center border border-border bg-card text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
              onClick={() => openTemporaryKnowAnything()}
              aria-label="Open temporary chat"
              type="button"
            >
              <Ghost className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
