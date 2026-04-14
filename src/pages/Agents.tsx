import { Bot, CirclePause, ShieldCheck, Sparkles } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { SectionHeading, StatusPill, Surface } from "@/components/ubik-primitives";
import { agents } from "@/lib/ubik-data";

export default function Agents() {
  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-6">
        <SectionHeading
          eyebrow="Specialists"
          title="Agents are specialist operators, not the primary product frame."
          description="Keep them monitored, inspectable, and clearly linked to workflows and approval modes rather than presenting them as a generic automation wall."
        />

        <div className="grid gap-4 lg:grid-cols-3">
          {agents.map((agent) => (
            <Surface key={agent.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{agent.lastRun}</p>
                  <h2 className="mt-2 font-mono text-lg font-semibold">{agent.name}</h2>
                </div>
                <StatusPill tone={agent.status === "Healthy" ? "success" : agent.status === "Paused" ? "muted" : "alert"}>
                  {agent.status}
                </StatusPill>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{agent.summary}</p>
              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Linked workflow: {agent.linkedWorkflow}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {agent.status === "Paused" ? <CirclePause className="h-4 w-4 text-muted-foreground" /> : <ShieldCheck className="h-4 w-4 text-primary" />}
                  Approval mode remains inspectable from the linked run surface.
                </div>
              </div>
            </Surface>
          ))}
        </div>

        <Surface className="p-5">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Monitoring Notes</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="border border-border bg-background p-4 text-sm text-muted-foreground">Agents stay secondary to business outcomes and never replace the main operator shell.</div>
            <div className="border border-border bg-background p-4 text-sm text-muted-foreground">Health, last run, linked workflow, and approval mode are the primary scan points.</div>
            <div className="border border-border bg-background p-4 text-sm text-muted-foreground">Execution detail belongs in workflow traces and approval surfaces, not decorative canvases.</div>
          </div>
        </Surface>
      </PageContainer>
    </div>
  );
}
