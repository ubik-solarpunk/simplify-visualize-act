import { useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

const routeLabels: Record<string, string> = {
  "/": "UBIK_HOME",
  "/inbox": "UBIK_INBOX",
  "/projects": "UBIK_PROJECTS",
  "/meetings": "UBIK_MEETINGS",
  "/agents": "UBIK_AGENTS",
  "/settings": "UBIK_SETTINGS",
};

export function TopBar() {
  const location = useLocation();
  const label = routeLabels[location.pathname] || "UBIK";

  return (
    <header className="h-12 flex items-center justify-between border-b border-border px-4 bg-background">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="h-8 w-8" />
        <span className="font-mono text-xs tracking-widest font-semibold">{label}</span>
      </div>
      <ThemeToggle />
    </header>
  );
}
