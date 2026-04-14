import { CheckCheck, FileSearch, XCircle } from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { SectionHeading, SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { approvals } from "@/lib/ubik-data";

type ApprovalFilter = "All" | "Urgent" | "Review";

export default function Approvals() {
  const { openDrawer, openRuntime } = useShellState();
  const [filter, setFilter] = useWorkbenchState<ApprovalFilter>("approval-filter", "All");
  const [selectedId, setSelectedId] = useWorkbenchState<string>("approval-id", approvals[0].id);
  const filtered = approvals.filter((item) => filter === "All" || item.status === filter);
  const approval = filtered.find((item) => item.id === selectedId) ?? filtered[0] ?? approvals[0];

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-6">
        <SectionHeading
          eyebrow="Human In The Loop"
          title="Approvals keep recommendations direct, auditable, and easy to inspect."
          description="Make the queue readable, keep the recommendation explicit, and show the source context without turning the page into a dashboard."
        />

        <div className="flex flex-wrap gap-2">
          {(["All", "Urgent", "Review"] as ApprovalFilter[]).map((item) => (
            <SmallButton key={item} active={item === filter} onClick={() => setFilter(item)}>
              {item}
            </SmallButton>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
          <Surface className="overflow-hidden">
            <div className="border-b border-border px-4 py-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Queue</p>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((item) => (
                <button key={item.id} className={`w-full px-4 py-4 text-left ${item.id === approval.id ? "bg-background" : "bg-card"}`} onClick={() => setSelectedId(item.id)}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{item.workflow}</p>
                    <StatusPill tone={item.status === "Urgent" ? "alert" : "default"}>{item.status}</StatusPill>
                  </div>
                  <p className="mt-2 font-mono text-sm">{item.title}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{item.inputSummary}</p>
                </button>
              ))}
            </div>
          </Surface>

          <div className="space-y-4">
            <Surface className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{approval.workflow}</p>
                  <h2 className="mt-2 font-mono text-2xl font-semibold">{approval.title}</h2>
                </div>
                <StatusPill tone={approval.status === "Urgent" ? "alert" : "default"}>{approval.confidence}% confidence</StatusPill>
              </div>
              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="border border-border p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recommendation</p>
                  <p className="mt-3 text-sm text-muted-foreground">{approval.recommendation}</p>
                </div>
                <div className="border border-border p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Input summary</p>
                  <p className="mt-3 text-sm text-muted-foreground">{approval.inputSummary}</p>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <SmallButton active onClick={() => openRuntime({
                  title: approval.title,
                  status: "Ready for review",
                  lines: [
                    `Workflow: ${approval.workflow}`,
                    `Confidence: ${approval.confidence}%`,
                    "",
                    approval.recommendation,
                  ],
                  artifactLabel: "Approval packet",
                })}>
                  <CheckCheck className="mr-2 h-3.5 w-3.5" />
                  Approve
                </SmallButton>
                <SmallButton>
                  <XCircle className="mr-2 h-3.5 w-3.5" />
                  Reject
                </SmallButton>
                <SmallButton
                  onClick={() =>
                    openDrawer({
                      title: approval.title,
                      eyebrow: "Provenance",
                      description: "Approvals should always explain why the system extracted, transformed, or recommended something.",
                      timeline: approval.provenance,
                      actions: approval.actions,
                    })
                  }
                >
                  <FileSearch className="mr-2 h-3.5 w-3.5" />
                  Inspect
                </SmallButton>
              </div>
            </Surface>

            <Surface className="p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Available actions</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {approval.actions.map((item) => (
                  <StatusPill key={item}>{item}</StatusPill>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
