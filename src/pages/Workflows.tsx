import { ArrowRight, Play, TimerReset } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { Metric, SectionHeading, SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { workflowDefinitions, workflowRuns } from "@/lib/ubik-data";

export default function Workflows() {
  const { openRuntime, openDrawer } = useShellState();
  const [selectedRunId, setSelectedRunId] = useWorkbenchState<string>("workflow-run", workflowRuns[0].id);
  const run = workflowRuns.find((item) => item.id === selectedRunId) ?? workflowRuns[0];

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-6">
        <SectionHeading
          eyebrow="Playbooks"
          title="Workflows are reusable operating playbooks with visible execution."
          description="Treat queue management and execution trace as first-class, while keeping the library readable and easy to inspect."
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Metric label="Library" value={`${workflowDefinitions.length}`} />
          <Metric label="Runs live" value={`${workflowRuns.filter((item) => item.status !== "Completed").length}`} tone="alert" />
          <Metric label="Awaiting approval" value={`${workflowRuns.filter((item) => item.status === "Awaiting approval").length}`} tone="alert" />
        </div>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <Surface className="p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Workflow library</p>
              <div className="mt-4 space-y-3">
                {workflowDefinitions.map((workflow) => (
                  <div key={workflow.id} className="border border-border bg-background p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[12px] uppercase tracking-[0.16em]">{workflow.name}</p>
                      <StatusPill tone={workflow.approvalMode === "Required" ? "alert" : "default"}>{workflow.approvalMode}</StatusPill>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{workflow.outcomes}</p>
                    <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{workflow.cadence}</p>
                  </div>
                ))}
              </div>
            </Surface>
            <Surface className="p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Run queue</p>
              <div className="mt-4 space-y-3">
                {workflowRuns.map((item) => (
                  <button key={item.id} className={`w-full border p-4 text-left ${item.id === run.id ? "border-primary bg-background" : "border-border bg-card"}`} onClick={() => setSelectedRunId(item.id)}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[12px] uppercase tracking-[0.16em]">{item.name}</p>
                      <StatusPill tone={item.status === "Completed" ? "success" : "alert"}>{item.status}</StatusPill>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{item.startedAt}</p>
                  </button>
                ))}
              </div>
            </Surface>
          </div>

          <Surface className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{run.owner}</p>
                <h2 className="mt-2 font-mono text-2xl font-semibold">{run.name}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{run.summary}</p>
              </div>
              <StatusPill tone={run.status === "Completed" ? "success" : "alert"}>{run.status}</StatusPill>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="border border-border p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Execution trace</p>
                <div className="mt-4 space-y-3">
                  {run.steps.map((step) => (
                    <div key={step.id} className="flex items-center gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0">
                      <StatusPill tone={step.status === "running" ? "alert" : step.status === "done" ? "success" : "muted"}>
                        {step.status}
                      </StatusPill>
                      <span className="text-sm">{step.label}</span>
                      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="border border-border p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Artifacts</p>
                <div className="mt-4 space-y-2">
                  {run.artifacts.map((item) => (
                    <StatusPill key={item}>{item}</StatusPill>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <SmallButton active onClick={() => openRuntime({
                    title: run.name,
                    status: run.status,
                    lines: run.steps.map((step) => `> ${step.label} [${step.status}]`),
                    artifactLabel: run.artifacts[0],
                  })}>
                    <Play className="mr-2 h-3.5 w-3.5" />
                    Open runtime
                  </SmallButton>
                  <SmallButton
                    onClick={() =>
                      openDrawer({
                        title: run.name,
                        eyebrow: "Queue detail",
                        description: "Task queue and multi-run management live inside Workflows without adding a new top-level route.",
                        metadata: [
                          { label: "Started", value: run.startedAt },
                          { label: "Owner", value: run.owner },
                        ],
                        actions: run.artifacts,
                      })
                    }
                  >
                    <TimerReset className="mr-2 h-3.5 w-3.5" />
                    Inspect queue
                  </SmallButton>
                </div>
              </div>
            </div>
          </Surface>
        </div>
      </PageContainer>
    </div>
  );
}
