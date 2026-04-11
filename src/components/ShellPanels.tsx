import { Monitor, X } from "lucide-react";

import { Surface, StatusPill } from "@/components/ubik-primitives";
import { useShellState } from "@/hooks/use-shell-state";

export function RightDrawer() {
  const { drawerContent, openDrawer } = useShellState();
  if (!drawerContent) return null;

  return (
    <aside className="hidden w-[340px] shrink-0 border-l border-border bg-card xl:flex xl:flex-col">
      <div className="flex items-start justify-between border-b border-border px-4 py-4">
        <div>
          {drawerContent.eyebrow ? (
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {drawerContent.eyebrow}
            </p>
          ) : null}
          <h3 className="mt-1 font-mono text-lg font-semibold">{drawerContent.title}</h3>
          {drawerContent.description ? <p className="mt-2 text-sm text-muted-foreground">{drawerContent.description}</p> : null}
        </div>
        <button className="border border-border p-2" onClick={() => openDrawer(null)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-auto p-4">
        {drawerContent.metadata?.length ? (
          <Surface className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Metadata</p>
            <div className="mt-3 space-y-3">
              {drawerContent.metadata.map((item) => (
                <div key={item.label} className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{item.label}</span>
                  <span className="text-right text-sm">{item.value}</span>
                </div>
              ))}
            </div>
          </Surface>
        ) : null}

        {drawerContent.timeline?.length ? (
          <Surface className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Trace</p>
            <div className="mt-3 space-y-3">
              {drawerContent.timeline.map((item) => (
                <div key={item} className="border-l border-border pl-3 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </Surface>
        ) : null}

        {drawerContent.actions?.length ? (
          <Surface className="p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recommended Actions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {drawerContent.actions.map((item) => (
                <StatusPill key={item}>{item}</StatusPill>
              ))}
            </div>
          </Surface>
        ) : null}
      </div>
    </aside>
  );
}

export function RuntimePanel() {
  const { runtimeContent, openRuntime } = useShellState();
  if (!runtimeContent) return null;

  return (
    <aside className="hidden w-[360px] shrink-0 border-l border-border bg-background 2xl:flex 2xl:flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">My Computer</p>
          <h3 className="mt-1 font-mono text-lg font-semibold">{runtimeContent.title}</h3>
        </div>
        <button className="border border-border p-2" onClick={() => openRuntime(null)}>
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <Surface className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4 text-primary" />
              <span className="font-mono text-[11px] uppercase tracking-[0.14em]">Runtime</span>
            </div>
            <StatusPill tone="alert">{runtimeContent.status}</StatusPill>
          </div>

          <div className="mt-4 space-y-3 bg-[#111315] p-4 font-mono text-[12px] text-[#F8F9FA]">
            {runtimeContent.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>

          {runtimeContent.artifactLabel ? (
            <div className="mt-4 border border-border p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Artifact</p>
              <p className="mt-2 text-sm">{runtimeContent.artifactLabel}</p>
            </div>
          ) : null}
        </Surface>
      </div>
    </aside>
  );
}
