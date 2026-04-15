import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  EyeOff,
  MessageSquare,
  MoreHorizontal,
  Plus,
  ShieldAlert,
  Trash2,
  Workflow,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageContainer } from "@/components/page-container";
import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import {
  activeOrders,
  approvals,
  cargoMovements,
  contactCards,
  homeActivityFeed,
  inboxThreads,
  meetings,
} from "@/lib/ubik-data";

type WidgetAction = "chat" | "hide" | "delete";

type WidgetKind = "spark" | "progress" | "bars" | "meter";

type Widget = {
  id: string;
  label: string;
  domain: string;
  value: string;
  delta: string;
  detailA: string;
  detailB: string;
  tone?: "alert";
  chartKind: WidgetKind;
  chartData: number[];
};

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - ((value - min) / Math.max(max - min, 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="h-16 w-full" viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="trend">
      <polyline fill="none" points={points} stroke="hsl(var(--foreground))" strokeWidth="2" />
      {data.map((value, index) => {
        const x = (index / Math.max(data.length - 1, 1)) * 100;
        const y = 100 - ((value - min) / Math.max(max - min, 1)) * 100;
        return <circle key={`${value}-${index}`} cx={x} cy={y} fill="hsl(var(--foreground))" r="1.8" />;
      })}
    </svg>
  );
}

function ProgressRows({ data }: { data: number[] }) {
  return (
    <div className="space-y-2">
      {data.slice(0, 3).map((value, index) => (
        <div key={`${value}-${index}`}>
          <div className="h-2 w-full bg-muted">
            <div className="h-full bg-foreground" style={{ width: `${Math.max(8, Math.min(100, value))}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniBars({ data }: { data: number[] }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-16 items-end gap-1">
      {data.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="w-full bg-foreground"
          style={{ height: `${Math.max(12, (value / Math.max(max, 1)) * 100)}%` }}
        />
      ))}
    </div>
  );
}

function SegmentedMeter({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const normalized = data.map((item) => Math.max(0.12, item / Math.max(max, 1)));

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {normalized.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className="h-2.5 flex-1 bg-foreground"
            style={{ opacity: Math.min(1, value) }}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
        <p>Scope</p>
        <p className="text-center">Risk</p>
        <p className="text-right">Due</p>
      </div>
    </div>
  );
}

function WidgetChart({ kind, data }: { kind: WidgetKind; data: number[] }) {
  if (kind === "spark") return <Sparkline data={data} />;
  if (kind === "progress") return <ProgressRows data={data} />;
  if (kind === "bars") return <MiniBars data={data} />;
  return <SegmentedMeter data={data} />;
}

export default function Home() {
  const navigate = useNavigate();
  const { createTab, setPageState } = useShellState();
  const [hiddenWidgets, setHiddenWidgets] = useWorkbenchState<string[]>("home-hidden-widgets", []);
  const [deletedWidgets, setDeletedWidgets] = useWorkbenchState<string[]>("home-deleted-widgets", []);
  const [quickNotesByMeeting, setQuickNotesByMeeting] = useWorkbenchState<Record<string, string[]>>(
    "meeting-quick-notes",
    {},
  );
  const [menu, setMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  const delayedFleet = cargoMovements.filter((cargo) => cargo.delayDays > 3).length;
  const urgentApprovals = approvals.filter((item) => item.status === "Urgent").length;
  const nextMeeting = meetings.find((meeting) => meeting.stage === "Upcoming");
  const actionRequiredCount = inboxThreads.filter(
    (thread) =>
      thread.priorityBand === "needs_attention" ||
      thread.priorityBand === "waiting_on_you" ||
      thread.followUpStatus === "due_soon" ||
      thread.followUpStatus === "overdue" ||
      thread.followUpStatus === "blocked_by_approval",
  ).length;

  const widgets = useMemo<Widget[]>(
    () => [
      {
        id: "revenue-pulse",
        label: "Revenue Pulse",
        domain: "Sales",
        value: `$${(activeOrders.reduce((sum, order) => sum + order.value, 0) / 1000).toFixed(1)}K`,
        delta: "+12%",
        detailA: `${activeOrders.length} active orders`,
        detailB: "Weekly trend",
        chartKind: "spark",
        chartData: [18, 24, 22, 29, 31, 35, 39],
      },
      {
        id: "account-health",
        label: "Account Reliability",
        domain: "Account Mgmt",
        value: "91%",
        delta: "+4 pts",
        detailA: "Renewal readiness",
        detailB: "Top 3 accounts",
        chartKind: "progress",
        chartData: [91, 84, 76],
      },
      {
        id: "fleet-health",
        label: "Fleet Continuity",
        domain: "Plant Ops",
        value: `${cargoMovements.length - delayedFleet}/${cargoMovements.length}`,
        delta: delayedFleet ? `${delayedFleet} delayed` : "On track",
        detailA: "Container movements",
        detailB: "Last 7 checks",
        tone: delayedFleet ? "alert" : undefined,
        chartKind: "bars",
        chartData: [72, 78, 74, 83, 88, 84, 86],
      },
      {
        id: "compliance-risk",
        label: "Packaging & Finance",
        domain: "Sustainability / Finance",
        value: `${urgentApprovals}`,
        delta: urgentApprovals ? "Needs action" : "Stable",
        detailA: "Expiring certs + approvals",
        detailB: `${actionRequiredCount} follow-ups`,
        tone: urgentApprovals ? "alert" : undefined,
        chartKind: "meter",
        chartData: [9, 8, 7, 6, 7, 8, 9],
      },
    ],
    [actionRequiredCount, delayedFleet, urgentApprovals],
  );

  const visibleWidgets = widgets.filter(
    (widget) => !hiddenWidgets.includes(widget.id) && !deletedWidgets.includes(widget.id),
  );

  const contactsByName = useMemo(() => {
    return contactCards.reduce<Record<string, (typeof contactCards)[number]>>((acc, card) => {
      acc[card.name] = card;
      return acc;
    }, {});
  }, []);

  const launchWidgetCreator = (widget: Widget) => {
    const tabId = createTab("/");
    if (!tabId) return;

    const prompt = `/widget creator ${widget.label} for ${widget.domain}. Build a clean operator card with chart, key risk, and one action.`;
    setPageState(`${tabId}:chat-composer`, prompt);
    setPageState(`${tabId}:chat-mode`, "speed");
    setPageState(`${tabId}:chat-sources`, ["org_knowledge", "files"]);
    setPageState(`${tabId}:chat-widget-context`, {
      widgetId: widget.id,
      metric: widget.value,
      domain: widget.domain,
      window: "7d",
    });
  };

  const onWidgetAction = (widgetId: string, action: WidgetAction) => {
    const widget = widgets.find((item) => item.id === widgetId);
    if (!widget) return;

    if (action === "chat") {
      launchWidgetCreator(widget);
      return;
    }
    if (action === "hide") {
      if (!hiddenWidgets.includes(widgetId)) setHiddenWidgets([...hiddenWidgets, widgetId]);
      return;
    }
    if (!deletedWidgets.includes(widgetId)) setDeletedWidgets([...deletedWidgets, widgetId]);
  };

  const addQuickNote = (meetingId: string) => {
    const notes = quickNotesByMeeting[meetingId] ?? [];
    const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setQuickNotesByMeeting({
      ...quickNotesByMeeting,
      [meetingId]: [`Quick note ${stamp}`, ...notes].slice(0, 5),
    });
  };

  const heroItems = homeActivityFeed.filter((item) => item.displayMode === "hero");
  const rowItems = homeActivityFeed.filter((item) => item.displayMode !== "hero");

  const renderFeedAction = (item: (typeof homeActivityFeed)[number], linkedMeetingId?: string) => {
    if (item.type === "meeting" && linkedMeetingId) {
      return (
        <>
          <SmallButton active onClick={() => navigate(`/meetings/${linkedMeetingId}`)}>
            Join now <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
          </SmallButton>
          <SmallButton onClick={() => addQuickNote(linkedMeetingId)}>
            <Plus className="mr-2 h-3.5 w-3.5" /> Quick note
          </SmallButton>
        </>
      );
    }

    if (item.type === "artifact") {
      return (
        <SmallButton active onClick={() => navigate("/workflows")}>
          <Workflow className="mr-2 h-3.5 w-3.5" /> {item.ctaLabel}
        </SmallButton>
      );
    }

    if (item.type === "approval") {
      return (
        <SmallButton active onClick={() => navigate(item.linkedThreadId ? `/inbox/${item.linkedThreadId}` : "/approvals")}>
          <ShieldAlert className="mr-2 h-3.5 w-3.5" /> {item.ctaLabel}
        </SmallButton>
      );
    }

    return (
      <SmallButton active onClick={() => navigate(item.linkedThreadId ? `/inbox/${item.linkedThreadId}` : "/inbox")}>
        <MessageSquare className="mr-2 h-3.5 w-3.5" /> {item.ctaLabel}
      </SmallButton>
    );
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-6">
        <section>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Operator Brief</p>
          <h1 className="mt-2 text-4xl text-primary">Back at it, Hemanth</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {actionRequiredCount} inbox actions, {urgentApprovals} urgent approvals, next meeting {nextMeeting?.time ?? "Not scheduled"}.
          </p>
        </section>

        <Surface className="overflow-hidden">
          <div className="grid gap-0 xl:grid-cols-4">
            {visibleWidgets.map((widget) => (
              <div
                key={widget.id}
                className="border-r border-border p-4 last:border-r-0"
                onContextMenu={(event) => {
                  event.preventDefault();
                  setMenu({ id: widget.id, x: event.clientX, y: event.clientY });
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{widget.domain}</p>
                    <p className="mt-1 text-[15px] text-foreground">{widget.label}</p>
                  </div>
                  <button
                    className="inline-flex h-6 w-6 items-center justify-center border border-border bg-card"
                    onClick={(event) => {
                      event.stopPropagation();
                      setMenu({ id: widget.id, x: event.clientX, y: event.clientY });
                    }}
                    type="button"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-3 flex items-end justify-between gap-2">
                  <p className="font-mono text-3xl text-foreground">{widget.value}</p>
                  <p
                    className={`font-mono text-[11px] uppercase tracking-[0.12em] ${
                      widget.tone === "alert" ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {widget.delta}
                  </p>
                </div>
                <div className="mt-3 pt-2">
                  <WidgetChart kind={widget.chartKind} data={widget.chartData} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px] text-muted-foreground">
                  <span>{widget.detailA}</span>
                  <span>{widget.detailB}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border px-4 py-3">
            <SmallButton
              className="mr-2"
              onClick={() =>
                launchWidgetCreator({
                  id: "new-widget",
                  label: "Custom Widget",
                  domain: "Operator",
                  value: "",
                  delta: "",
                  detailA: "",
                  detailB: "",
                  chartKind: "spark",
                  chartData: [1, 2, 3],
                })
              }
            >
              <Plus className="mr-2 h-3.5 w-3.5" /> New
            </SmallButton>
          </div>
        </Surface>

        <Surface className="p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-foreground">Activity Feed</p>
            <SmallButton onClick={() => navigate("/inbox")}>Open Inbox</SmallButton>
          </div>

          <div className="mt-5 space-y-7">
            {["Today", "Yesterday"].map((group) => {
              const groupHeroes = heroItems.filter((item) => item.dayGroup === group);
              const groupRows = rowItems.filter((item) => item.dayGroup === group);
              if (!groupHeroes.length && !groupRows.length) return null;

              return (
                <section key={group}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{group}</p>

                  {groupHeroes.length ? (
                    <div className="mt-3 grid gap-2 md:grid-cols-2">
                      {groupHeroes.map((item) => {
                        return (
                          <article key={item.id} className="relative border border-border/80 bg-background px-4 py-4">
                            <span className="absolute left-0 top-0 h-full w-1 bg-primary" />
                            <div className="flex items-start justify-between gap-2">
                              <p className="line-clamp-2 text-[19px] leading-7 text-foreground">{item.title}</p>
                              {item.priority === "Critical" ? <StatusPill tone="alert">Critical</StatusPill> : null}
                            </div>

                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-foreground/80">{item.insight}</p>

                            <div className="mt-4 flex flex-wrap items-center gap-1.5">
                              <span className="inline-flex items-center border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.11em] text-foreground/70">
                                {item.source}
                              </span>
                              <span className="inline-flex items-center border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.11em] text-foreground/70">
                                {item.owner}
                              </span>
                              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/65">{item.time}</span>
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              {renderFeedAction(item, item.linkedMeetingId)}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  ) : null}

                  {groupRows.length ? (
                    <div className="mt-3 border border-border/80 bg-background">
                      {groupRows.map((item) => {
                        return (
                          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-border/80 px-3 py-3 first:border-t-0">
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="line-clamp-1 text-sm text-foreground">{item.title}</p>
                                {item.priority === "Critical" ? <StatusPill tone="alert">Critical</StatusPill> : null}
                              </div>
                              <p className="mt-1 line-clamp-1 text-sm text-foreground/75">{item.insight}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.11em] text-foreground/70">
                                {item.source}
                              </span>
                              <span className="inline-flex items-center border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.11em] text-foreground/70">
                                {item.owner}
                              </span>
                              <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/65">{item.time}</span>
                              {renderFeedAction(item, item.linkedMeetingId)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </section>
              );
            })}
          </div>
        </Surface>
      </PageContainer>

      {menu ? (
        <div className="fixed z-50 border border-border bg-card" style={{ left: menu.x, top: menu.y }}>
          <button
            className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-sm text-foreground"
            onClick={() => {
              onWidgetAction(menu.id, "chat");
              setMenu(null);
            }}
            type="button"
          >
            <MessageSquare className="h-3.5 w-3.5" /> Chat
          </button>
          <button
            className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-sm text-foreground"
            onClick={() => {
              onWidgetAction(menu.id, "hide");
              setMenu(null);
            }}
            type="button"
          >
            <EyeOff className="h-3.5 w-3.5" /> Hide
          </button>
          <button
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground"
            onClick={() => {
              onWidgetAction(menu.id, "delete");
              setMenu(null);
            }}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      ) : null}
    </div>
  );
}
