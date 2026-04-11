import { ArrowUpRight, Users } from "lucide-react";

import { SectionHeading, SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { projects } from "@/lib/ubik-data";

export default function Projects() {
  const { openDrawer } = useShellState();
  const [selectedProjectId, setSelectedProjectId] = useWorkbenchState<string>("project-id", projects[0].id);
  const project = projects.find((item) => item.id === selectedProjectId) ?? projects[0];

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeading
          eyebrow="Operational Workstreams"
          title="Projects keep the workstream, context, and next actions in one place."
          description="Connect chats, approvals, workflows, files, and milestones without losing the executive scanning pattern."
        />

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Surface className="overflow-hidden">
            <div className="border-b border-border px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Project Index</p>
            </div>
            <div className="divide-y divide-border">
              {projects.map((item) => (
                <button
                  key={item.id}
                  className={`w-full px-4 py-4 text-left ${item.id === project.id ? "bg-background" : "bg-card"}`}
                  onClick={() => setSelectedProjectId(item.id)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{item.code}</p>
                    <StatusPill tone={item.status === "At risk" || item.status === "Needs attention" ? "alert" : "default"}>
                      {item.status}
                    </StatusPill>
                  </div>
                  <p className="mt-2 font-mono text-base font-semibold">{item.name}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                  <div className="mt-4 h-2 bg-border">
                    <div className="h-full bg-primary" style={{ width: `${item.progress}%` }} />
                  </div>
                </button>
              ))}
            </div>
          </Surface>

          <div className="space-y-4">
            <Surface className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{project.code}</p>
                  <h2 className="mt-2 font-mono text-2xl font-semibold">{project.name}</h2>
                  <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{project.summary}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill>{project.owner}</StatusPill>
                  <StatusPill tone={project.status === "On track" ? "success" : "alert"}>{project.status}</StatusPill>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="border border-border p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Milestones</p>
                  <div className="mt-4 space-y-3">
                    {project.milestones.map((milestone) => (
                      <div key={milestone.label} className="flex items-center justify-between gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                        <p className="text-sm">{milestone.label}</p>
                        <StatusPill tone={milestone.state === "Active" ? "alert" : milestone.state === "Done" ? "success" : "muted"}>
                          {milestone.state}
                        </StatusPill>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-border p-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Team</p>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {project.team.map((member) => (
                      <StatusPill key={member}>{member}</StatusPill>
                    ))}
                  </div>
                  <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Next actions</p>
                  <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {project.nextActions.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </Surface>

            <Surface className="p-5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Linked Context</p>
                <SmallButton
                  onClick={() =>
                    openDrawer({
                      title: project.name,
                      eyebrow: "Linked context",
                      description: "Projects should connect workflows, chats, approvals, and reports without hiding provenance.",
                      metadata: [
                        { label: "Owner", value: project.owner },
                        { label: "Progress", value: `${project.progress}%` },
                      ],
                      actions: project.linked.map((item) => item.label),
                    })
                  }
                >
                  Inspect
                </SmallButton>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {project.linked.map((item) => (
                  <div key={item.label} className="border border-border bg-background p-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{item.kind}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-sm">{item.label}</p>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </div>
    </div>
  );
}
