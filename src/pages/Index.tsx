import { ArrowUpRight, Link2, Play, Send } from "lucide-react";

import { SectionHeading, SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { chatRecentWork, chatSignals, quickConnections, starterActions } from "@/lib/ubik-data";

export default function Index() {
  const { openDrawer, openRuntime } = useShellState();
  const [composer, setComposer] = useWorkbenchState("chat-composer", "");
  const [chatSearch, setChatSearch] = useWorkbenchState("chat-search", "");

  return (
    <div className="px-4 py-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-5">
        <SectionHeading
          eyebrow="Home"
          title="Know Anything"
          description="Start from a clean thread. Keep the work surface light and pull in context only when needed."
        />

        <Surface className="mx-auto max-w-4xl p-5 lg:p-7">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-mono text-2xl font-semibold uppercase tracking-[0.18em] lg:text-3xl">
              Start with a question or a task.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Inbox, meetings, approvals, and projects can be attached into the thread when you need them.
            </p>
          </div>

          <div className="mx-auto mt-5 max-w-3xl border border-border bg-background p-4">
            <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full md:max-w-[360px]">
                <input
                  value={chatSearch}
                  onChange={(event) => setChatSearch(event.target.value)}
                  placeholder="Search threads, notes, approvals"
                  className="w-full border border-border bg-background px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] outline-none placeholder:text-muted-foreground focus:border-foreground/35"
                />
              </div>
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Search stays attached to the thread surface
              </p>
            </div>
            <textarea
              className="min-h-[180px] w-full resize-none bg-transparent font-mono text-[14px] uppercase tracking-[0.12em] leading-7 outline-none placeholder:text-muted-foreground"
              value={composer}
              onChange={(event) => setComposer(event.target.value)}
              placeholder="Start with an operator task, a thread to continue, or a decision that needs context."
            />
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {quickConnections.map((connection) => (
                  <StatusPill key={connection.id} tone={connection.state === "watching" ? "alert" : "default"}>
                    <Link2 className="h-3 w-3" />
                    {connection.label}
                  </StatusPill>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <SmallButton
                  onClick={() =>
                    openDrawer({
                      title: "Thread context",
                      eyebrow: "Chat",
                      description: "Quick connections are attached near the active composer, not buried in the sidebar.",
                      metadata: [
                        { label: "Connected systems", value: "Gmail, Slack, WhatsApp, ERP" },
                        { label: "State", value: "Ready to attach" },
                      ],
                    })
                  }
                >
                  Attach context
                </SmallButton>
                <SmallButton
                  active
                  onClick={() =>
                    openRuntime({
                      title: "Chat runtime preview",
                      status: "Ready",
                      lines: [
                        "> Context assembly started",
                        "> Pulling linked inbox threads",
                        "> Checking open approvals",
                        "> Preparing operator brief",
                      ],
                      artifactLabel: "Morning operator brief",
                    })
                  }
                >
                  <Send className="mr-2 h-3.5 w-3.5" />
                  Run
                </SmallButton>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {starterActions.map((action) => (
              <button
                key={action.id}
                className="border border-border bg-card p-4 text-left transition-colors hover:border-foreground/35"
                onClick={() => setComposer(action.title)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.16em]">{action.title}</p>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{action.description}</p>
              </button>
            ))}
          </div>
        </Surface>

        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Surface className="p-5">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Recent Work</p>
              <SmallButton onClick={() => setComposer("Continue the last open work context.")}>Continue</SmallButton>
            </div>
            <div className="mt-4 space-y-3">
              {chatRecentWork.map((item) => (
                <button
                  key={item.id}
                  className="w-full border border-border bg-background p-4 text-left hover:border-foreground/35"
                  onClick={() => setComposer(`Continue ${item.title}`)}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-[12px] uppercase tracking-[0.16em]">{item.title}</p>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>
                </button>
              ))}
            </div>
          </Surface>

          <Surface className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Light Signals</p>
            <div className="mt-4 space-y-3">
              {chatSignals.slice(0, 3).map((signal) => (
                <div key={signal.id} className="border border-border bg-background p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{signal.label}</p>
                  <p className={`mt-2 font-mono text-xl ${signal.tone === "alert" ? "text-primary" : "text-foreground"}`}>
                    {signal.value}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>
      </div>
    </div>
  );
}
