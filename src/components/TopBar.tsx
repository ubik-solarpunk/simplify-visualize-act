import { Bell, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";

import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useShellState } from "@/hooks/use-shell-state";
import { getRouteMeta } from "@/lib/ubik-data";

export function TopBar() {
  const location = useLocation();
  const { openDrawer } = useShellState();
  const route = getRouteMeta(location.pathname);

  return (
    <header className="border-b border-border bg-card">
      <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <SidebarTrigger className="border border-border md:hidden" />
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Ubik Workspace</p>
            <h1 className="mt-1 font-mono text-2xl font-semibold tracking-tight">{route?.title ?? "Ubik"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{route?.description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          {route?.actions.map((action) => (
            <button
              key={action.label}
              className={`border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] ${
                action.kind === "primary"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-foreground"
              }`}
              onClick={() =>
                openDrawer({
                  title: action.label,
                  eyebrow: route.title,
                  description: `Action surface for ${action.label.toLowerCase()} on the ${route.title} page.`,
                  metadata: [
                    { label: "Page", value: route.title },
                    { label: "Mode", value: "Frontend seeded" },
                  ],
                })
              }
            >
              {action.label}
            </button>
          ))}

          <button
            className="relative border border-border p-2"
            onClick={() =>
              openDrawer({
                title: "Notifications",
                eyebrow: "Top Right Header",
                description: "Global notifications remain in the top-right header per the PRD.",
                timeline: [
                  "Thai Union exception waiting on review",
                  "Pricing monitor finished run 842",
                  "Supplier review meeting starts in 43 minutes",
                ],
              })
            }
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1 top-1 h-2 w-2 bg-primary" />
          </button>
          <ThemeToggle />
          <button className="border border-border bg-foreground px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-background">
            <Sparkles className="mr-2 inline h-3.5 w-3.5" />
            Create
          </button>
        </div>
      </div>
    </header>
  );
}
