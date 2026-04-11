import { Filter, Inbox as InboxIcon, SendHorizontal, ShieldCheck } from "lucide-react";

import { SectionHeading, SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { inboxThreads } from "@/lib/ubik-data";

type InboxFilter = "All" | "Action required" | "Waiting" | "Reviewed";

export default function Inbox() {
  const { openDrawer, openRuntime } = useShellState();
  const [filter, setFilter] = useWorkbenchState<InboxFilter>("inbox-filter", "All");
  const [selectedId, setSelectedId] = useWorkbenchState<string>("inbox-thread", inboxThreads[0].id);

  const filteredThreads = inboxThreads.filter((thread) => filter === "All" || thread.status === filter);
  const activeThread = filteredThreads.find((thread) => thread.id === selectedId) ?? filteredThreads[0] ?? inboxThreads[0];

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <SectionHeading
          eyebrow="Thread Intelligence"
          title="Inbox keeps inbound work readable and actionable."
          description="Use list-detail structure for incoming items, extracted tasks, and the recommended next move. Keep source context inspectable and action language direct."
        />

        <div className="flex flex-wrap items-center gap-2">
          {(["All", "Action required", "Waiting", "Reviewed"] as InboxFilter[]).map((item) => (
            <SmallButton key={item} active={item === filter} onClick={() => setFilter(item)}>
              {item}
            </SmallButton>
          ))}
        </div>

        <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
          <Surface className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Incoming</p>
                <p className="mt-1 text-sm text-muted-foreground">{filteredThreads.length} threads in view</p>
              </div>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="divide-y divide-border">
              {filteredThreads.map((thread) => (
                <button
                  key={thread.id}
                  className={`w-full border-l-2 px-4 py-4 text-left ${
                    activeThread.id === thread.id ? "border-l-primary bg-background" : "border-l-transparent bg-card"
                  }`}
                  onClick={() => setSelectedId(thread.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em]">{thread.sender}</p>
                    <span className="text-xs text-muted-foreground">{thread.time}</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">{thread.subject}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{thread.preview}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill tone={thread.priority === "Critical" ? "alert" : "default"}>{thread.priority}</StatusPill>
                    <StatusPill tone="muted">{thread.source}</StatusPill>
                  </div>
                </button>
              ))}
            </div>
          </Surface>

          <div className="space-y-4">
            <Surface className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {activeThread.source} · {activeThread.status}
                  </p>
                  <h2 className="mt-2 font-mono text-xl font-semibold tracking-tight">{activeThread.subject}</h2>
                  <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{activeThread.preview}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {activeThread.approvalRequired ? <StatusPill tone="alert">Approval required</StatusPill> : null}
                  <StatusPill>{activeThread.owner}</StatusPill>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="border border-border p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Extracted tasks</p>
                  <div className="mt-3 space-y-3">
                    {activeThread.extractedTasks.map((task) => (
                      <div key={task} className="flex items-start gap-3">
                        <InboxIcon className="mt-0.5 h-4 w-4 text-primary" />
                        <p className="text-sm">{task}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border border-border p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Recommended reply</p>
                  <p className="mt-3 text-sm text-muted-foreground">{activeThread.recommendedReply}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <SmallButton
                      active
                      onClick={() =>
                        openRuntime({
                          title: "Reply preview",
                          status: "Draft ready",
                          lines: [
                            `To: ${activeThread.sender}`,
                            `Subject: ${activeThread.subject}`,
                            "",
                            activeThread.recommendedReply,
                          ],
                          artifactLabel: "Outbound draft",
                        })
                      }
                    >
                      <SendHorizontal className="mr-2 h-3.5 w-3.5" />
                      Preview
                    </SmallButton>
                    <SmallButton
                      onClick={() =>
                        openDrawer({
                          title: "Thread provenance",
                          eyebrow: activeThread.sender,
                          description: "Where the thread summary and recommendations came from.",
                          timeline: activeThread.provenance,
                          metadata: [
                            { label: "Source", value: activeThread.source },
                            { label: "Priority", value: activeThread.priority },
                          ],
                          actions: activeThread.attachments,
                        })
                      }
                    >
                      <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                      Provenance
                    </SmallButton>
                  </div>
                </div>
              </div>
            </Surface>

            <Surface className="p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Attachments</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {activeThread.attachments.map((item) => (
                  <StatusPill key={item}>{item}</StatusPill>
                ))}
              </div>
            </Surface>
          </div>
        </div>
      </div>
    </div>
  );
}
