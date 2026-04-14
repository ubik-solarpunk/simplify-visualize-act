import { useMemo } from "react";

import { AvatarGroup } from "@/components/avatar-group";
import { PageContainer } from "@/components/page-container";
import { RichOperatorEditor } from "@/components/rich-operator-editor";
import { Separator } from "@/components/ui/separator";
import { SmallButton, StatusPill, Surface } from "@/components/ubik-primitives";
import { useWorkbenchState } from "@/hooks/use-shell-state";
import {
  activeOrders,
  cargoMovements,
  clients,
  contactCards,
  humanTasks,
  openItems,
  pricingHistory,
  projectPresetMeta,
} from "@/lib/ubik-data";
import type { ProjectPreset } from "@/lib/ubik-types";

type TaskStep = "draft" | "context" | "assign";

function TinyTrend({ values }: { values: number[] }) {
  const max = Math.max(...values);
  return (
    <div className="flex h-10 items-end gap-1">
      {values.map((value, index) => (
        <span
          key={`${value}-${index}`}
          className="w-full bg-foreground"
          style={{ height: `${Math.max(8, (value / Math.max(max, 1)) * 100)}%` }}
        />
      ))}
    </div>
  );
}

export default function Projects() {
  const [selectedClientId, setSelectedClientId] = useWorkbenchState<string>("client-id", clients[0].id);
  const [taskTitle, setTaskTitle] = useWorkbenchState<string>("project-task-title", "");
  const [taskStep, setTaskStep] = useWorkbenchState<TaskStep>("project-task-step", "draft");
  const [taskContextType, setTaskContextType] = useWorkbenchState<"client" | "project">("project-task-context-type", "client");
  const [taskContextValue, setTaskContextValue] = useWorkbenchState<string>("project-task-context", clients[0].name);
  const [assignType, setAssignType] = useWorkbenchState<"member" | "app" | "agent">("project-task-assign-type", "member");
  const [assignTarget, setAssignTarget] = useWorkbenchState<string>("project-task-assign-target", "Hemanth Rao");
  const [assignDeadline, setAssignDeadline] = useWorkbenchState<string>("project-task-deadline", "Today");
  const [assignIntent, setAssignIntent] = useWorkbenchState<string>("project-task-intent", "Follow-up required");
  const [projectPreset, setProjectPreset] = useWorkbenchState<ProjectPreset>("project-preset", "sales");

  const selectedClient = clients.find((item) => item.id === selectedClientId) ?? clients[0];
  const presetMeta = projectPresetMeta[projectPreset];
  const clientOrders = activeOrders.filter((item) => item.clientId === selectedClient.id);
  const clientCargo = cargoMovements.filter((item) => item.clientId === selectedClient.id);

  const sku = clientOrders[0]?.sku ?? pricingHistory[0]?.sku ?? "";
  const skuPricing = pricingHistory.filter((item) => item.sku === sku);
  const cheapestBid = Math.min(...skuPricing.map((item) => item.lastBid));

  const orderedOpenItems = [...openItems].sort((a, b) => {
    const rank = { high: 0, medium: 1 } as const;
    return rank[a.urgency as keyof typeof rank] - rank[b.urgency as keyof typeof rank];
  });

  const clientTasks = useMemo(
    () =>
      humanTasks.filter((task) =>
        task.linkedEntity.toLowerCase().includes(selectedClient.name.split(" ")[0].toLowerCase()),
      ),
    [selectedClient.name],
  );

  const team = useMemo(() => {
    const names = ["Hemanth Rao", "Sarah Kim", "Raj Mehta", "Maya Chen"];
    return names.map((name) => {
      const match = contactCards.find((card) => card.name === name);
      return {
        id: name,
        name,
        avatarSrc: match?.avatarSrc,
        fallback: match?.avatarFallback ?? name.slice(0, 2).toUpperCase(),
      };
    });
  }, []);

  const milestones = [
    { label: "Contract", state: "done" },
    { label: "PI", state: "done" },
    { label: "PO", state: "done" },
    { label: "BL", state: "active" },
    { label: "Cargo", state: "pending" },
    { label: "Customs", state: "pending" },
    { label: "Delivery", state: "pending" },
  ] as const;

  const orderStatusTone = (status: string) => {
    if (status === "proforma-sent") return "default";
    if (status === "awaiting-bl") return "alert";
    if (status === "delivered") return "success";
    return "muted";
  };

  const orderStatusLabel = (status: string) => {
    if (status === "proforma-sent") return "Proforma Sent";
    if (status === "awaiting-bl") return "Awaiting BL";
    if (status === "in-transit") return "In Transit";
    if (status === "delivered") return "Delivered";
    return status;
  };

  const presetOrder: ProjectPreset[] = [
    "sales",
    "account_management",
    "plant_ops",
    "packaging_sustainability",
    "finance",
    "custom",
  ];

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="space-y-4">
        <Surface className="p-4 lg:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Project Lens</p>
              <h2 className="mt-2 font-mono text-3xl text-foreground">{presetMeta.label}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{presetMeta.blurb}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill tone={selectedClient.status === "needs-attention" ? "alert" : "success"}>{selectedClient.code}</StatusPill>
              <SmallButton>+ New Client</SmallButton>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {presetOrder.map((preset) => (
              <SmallButton
                key={preset}
                active={projectPreset === preset}
                onClick={() => setProjectPreset(preset)}
              >
                {projectPresetMeta[preset].label}
              </SmallButton>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="grid gap-3 lg:grid-cols-[1.1fr_1fr_240px]">
            <div className="border border-border bg-background p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{presetMeta.spotlightMetricLabel}</p>
              <p className="mt-2 font-mono text-3xl text-foreground">{presetMeta.spotlightMetricValue}</p>
              <p className="mt-2 text-sm text-muted-foreground">Client: {selectedClient.name}</p>
            </div>
            <div className="border border-border bg-background p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{presetMeta.riskLabel}</p>
              <p className="mt-2 font-mono text-3xl text-foreground">{presetMeta.riskValue}</p>
              <p className="mt-2 text-sm text-muted-foreground">Priority board synced</p>
            </div>
            <div className="border border-border bg-background p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Trend</p>
              <div className="mt-2">
                <TinyTrend values={presetMeta.trend} />
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {clients.map((client) => (
                <button
                  key={client.id}
                  className={`border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.14em] ${
                    selectedClient.id === client.id
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card text-foreground"
                  }`}
                  onClick={() => setSelectedClientId(client.id)}
                  type="button"
                >
                  {client.name}
                </button>
              ))}
            </div>
            <AvatarGroup items={team} />
          </div>
        </Surface>

        <Surface className="p-3">
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            <SmallButton active={taskStep === "draft"} onClick={() => setTaskStep("draft")}>Step 1: Draft</SmallButton>
            <SmallButton active={taskStep === "context"} onClick={() => setTaskStep("context")}>Step 2: Context</SmallButton>
            <SmallButton active={taskStep === "assign"} onClick={() => setTaskStep("assign")}>Step 3: Assign</SmallButton>
          </div>

          {taskStep === "draft" ? (
            <div className="mt-3">
              <RichOperatorEditor
                minHeight={120}
                onChange={setTaskTitle}
                placeholder="Draft task text... Use / for heading, list, or diagram blocks."
                value={taskTitle}
              />
              <div className="mt-3 flex justify-end">
                <SmallButton active onClick={() => setTaskStep("context")}>Continue to Context</SmallButton>
              </div>
            </div>
          ) : null}

          {taskStep === "context" ? (
            <div className="mt-3 grid gap-3 md:grid-cols-[180px_minmax(0,1fr)]">
              <select
                className="h-10 border border-border bg-card px-2 text-sm text-foreground outline-none"
                value={taskContextType}
                onChange={(event) => setTaskContextType(event.target.value as "client" | "project")}
              >
                <option value="client">Client</option>
                <option value="project">Project</option>
              </select>
              <input
                className="h-10 border border-border bg-card px-3 text-sm text-foreground outline-none"
                value={taskContextValue}
                onChange={(event) => setTaskContextValue(event.target.value)}
                placeholder={taskContextType === "client" ? "Atlantic Fresh" : "MR-Q2"}
              />
              <div className="md:col-span-2 flex justify-between gap-2">
                <SmallButton onClick={() => setTaskStep("draft")}>Back</SmallButton>
                <SmallButton active onClick={() => setTaskStep("assign")}>Continue to Assign</SmallButton>
              </div>
            </div>
          ) : null}

          {taskStep === "assign" ? (
            <div className="mt-3 space-y-3">
              <div className="grid gap-3 md:grid-cols-3">
                <select
                  className="h-10 border border-border bg-card px-2 text-sm text-foreground outline-none"
                  value={assignType}
                  onChange={(event) => setAssignType(event.target.value as "member" | "app" | "agent")}
                >
                  <option value="member">Member</option>
                  <option value="app">Org App</option>
                  <option value="agent">Agent</option>
                </select>
                <input
                  className="h-10 border border-border bg-card px-3 text-sm text-foreground outline-none"
                  value={assignTarget}
                  onChange={(event) => setAssignTarget(event.target.value)}
                  placeholder="Owner"
                />
                <input
                  className="h-10 border border-border bg-card px-3 text-sm text-foreground outline-none"
                  value={assignDeadline}
                  onChange={(event) => setAssignDeadline(event.target.value)}
                  placeholder="Deadline"
                />
              </div>
              <input
                className="h-10 w-full border border-border bg-card px-3 text-sm text-foreground outline-none"
                value={assignIntent}
                onChange={(event) => setAssignIntent(event.target.value)}
                placeholder="Intent"
              />
              <div className="flex items-center justify-between gap-2">
                <SmallButton onClick={() => setTaskStep("context")}>Back</SmallButton>
                <div className="flex items-center gap-2">
                  <StatusPill tone="muted">{taskContextType}: {taskContextValue || "Unlinked"}</StatusPill>
                  <SmallButton active>Create Task</SmallButton>
                </div>
              </div>
            </div>
          ) : null}
        </Surface>

        <div className="grid gap-4 lg:grid-cols-2">
          <Surface className="h-[240px] overflow-hidden p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">Active Orders</p>
            <Separator className="my-3" />
            <div className="h-[178px] space-y-3 overflow-y-auto pr-1">
              {clientOrders.map((order) => (
                <div key={order.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm">{order.id}</p>
                      <p className="mt-1 text-sm text-foreground">{order.sku} · {order.weight}</p>
                    </div>
                    <p className="font-mono text-sm">${order.value.toLocaleString()}</p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusPill tone={orderStatusTone(order.status)}>{orderStatusLabel(order.status)}</StatusPill>
                  </div>
                  <Separator className="mt-3" />
                </div>
              ))}
              <SmallButton className="w-full">+ New Order</SmallButton>
            </div>
          </Surface>

          <Surface className="h-[240px] overflow-hidden p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">Cargo In Transit</p>
            <Separator className="my-3" />
            <div className="h-[178px] space-y-3 overflow-y-auto pr-1">
              {clientCargo.map((cargo) => (
                <div key={cargo.containerId}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm">{cargo.vessel} · {cargo.containerId}</p>
                      <p className="mt-1 text-sm text-foreground">{cargo.destination}</p>
                    </div>
                    {cargo.delayDays > 3 ? <StatusPill tone="alert">Delay +{cargo.delayDays}d</StatusPill> : null}
                  </div>
                  <p className="mt-2 text-sm text-foreground">ETA: {cargo.etaDate} · {cargo.etaDays} days out</p>
                  <p className="mt-1 text-sm text-foreground">Last update: {cargo.lastEvent}</p>
                  <Separator className="mt-3" />
                </div>
              ))}
            </div>
          </Surface>

          <Surface className="h-[240px] overflow-hidden p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">Pricing History — {sku}</p>
            <Separator className="my-3" />
            <div className="h-[178px] overflow-y-auto pr-1">
              <div className="grid grid-cols-[minmax(0,1fr)_110px_120px] gap-3 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground">
                <p>Vendor</p>
                <p>Last Bid</p>
                <p>Delta</p>
              </div>
              <div className="mt-2 space-y-2">
                {skuPricing.map((price) => {
                  const delta = ((price.lastBid - cheapestBid) / cheapestBid) * 100;
                  const deltaLabel = delta === 0 ? "—" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)}%`;
                  return (
                    <div key={price.vendor} className="grid grid-cols-[minmax(0,1fr)_110px_120px] gap-3 border-t border-border px-1 py-2 text-sm">
                      <p>{price.vendor}</p>
                      <p className="font-mono">${price.lastBid.toFixed(2)}/kg</p>
                      <p className="font-mono text-foreground">{deltaLabel}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Surface>

          <Surface className="h-[240px] overflow-hidden p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">Open Items</p>
            <Separator className="my-3" />
            <div className="h-[178px] space-y-2 overflow-y-auto pr-1">
              {orderedOpenItems.map((item) => (
                <div key={`${item.type}-${item.label}`} className="border-t border-border pt-2 first:border-t-0 first:pt-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-foreground">{item.label}</p>
                    <StatusPill tone={item.urgency === "high" ? "alert" : "muted"}>{item.urgency}</StatusPill>
                  </div>
                  <p className="mt-1 text-sm text-foreground">
                    {item.entity}
                    {item.daysLeft !== null ? ` · ${item.daysLeft} days` : ""}
                  </p>
                </div>
              ))}
            </div>
          </Surface>
        </div>

        <Surface className="px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">Milestones</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {milestones.map((milestone, index) => (
              <div key={milestone.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2.5 w-2.5 border border-border ${
                      milestone.state === "done"
                        ? "bg-foreground"
                        : milestone.state === "active"
                          ? "bg-primary"
                          : "bg-card"
                    }`}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-foreground">{milestone.label}</span>
                </div>
                {index < milestones.length - 1 ? <span className="h-px w-8 bg-border" /> : null}
              </div>
            ))}
          </div>
        </Surface>

        <Surface className="p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-foreground">Priority Tasks</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {clientTasks.length ? (
              clientTasks.map((task) => (
                <div key={task.id} className="border border-border bg-background px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground">{task.title}</p>
                    <StatusPill tone={task.priority === "high" ? "alert" : "default"}>{task.priority.toUpperCase()}</StatusPill>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{task.linkedEntity} · {task.dueDate}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No direct tasks for this client.</p>
            )}
          </div>
        </Surface>
      </PageContainer>
    </div>
  );
}
