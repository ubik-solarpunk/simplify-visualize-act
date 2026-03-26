import { useLocation } from "react-router-dom";

const labels: Record<string, string> = {
  "/inbox": "INBOX",
  "/projects": "PROJECTS",
  "/meetings": "MEETINGS",
  "/settings": "SETTINGS",
};

export default function Placeholder() {
  const location = useLocation();
  const label = labels[location.pathname] || "PAGE";

  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h1 className="font-mono text-2xl font-bold tracking-tight">
          {label}<span className="text-primary">.</span>
        </h1>
        <p className="font-mono text-[11px] tracking-wider text-muted-foreground mt-2">
          COMING_SOON — PHASE_2
        </p>
      </div>
    </div>
  );
}
