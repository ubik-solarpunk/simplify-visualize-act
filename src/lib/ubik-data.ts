import type {
  AgentRecord,
  ApprovalItem,
  ArchiveRecord,
  HelpResource,
  InboxThread,
  IntelligenceRecord,
  MeetingRecord,
  NavigationItem,
  PinnedItem,
  ProjectRecord,
  QuickConnection,
  RecentItem,
  RouteMeta,
  SettingsSection,
  SignalItem,
  StarterAction,
  WorkbenchTab,
  WorkflowDefinition,
  WorkflowRun,
} from "@/lib/ubik-types";

export const routeMetas: RouteMeta[] = [
  {
    key: "chat",
    title: "Know Anything",
    path: "/",
    description: "Ask across organization, inbox, meetings, projects or internet, when you need them.",
    actions: [{ label: "New Thread", kind: "primary" }, { label: "Share", kind: "secondary" }],
  },
  {
    key: "inbox",
    title: "Inbox",
    path: "/inbox",
    description: "Unified thread intelligence across inbound channels and extracted tasks.",
    actions: [{ label: "Sort", kind: "secondary" }, { label: "Filter", kind: "secondary" }],
  },
  {
    key: "meetings",
    title: "Meetings",
    path: "/meetings",
    description: "Meeting continuity, decisions, and follow-through.",
    actions: [{ label: "Schedule", kind: "primary" }, { label: "Prep", kind: "secondary" }],
  },
  {
    key: "projects",
    title: "Projects",
    path: "/projects",
    description: "Operational workstreams connected to people, files, and approvals.",
    actions: [{ label: "New Project", kind: "primary" }, { label: "Review", kind: "secondary" }],
  },
  {
    key: "intelligence",
    title: "Intelligence",
    path: "/intelligence",
    description: "Research, monitoring, policy watch, and saved briefings.",
    actions: [{ label: "Research", kind: "primary" }, { label: "Monitor", kind: "secondary" }],
  },
  {
    key: "approvals",
    title: "Approvals",
    path: "/approvals",
    description: "Human-in-the-loop review queue with auditable recommendations.",
    actions: [{ label: "Review", kind: "primary" }, { label: "Filter", kind: "secondary" }],
  },
  {
    key: "workflows",
    title: "Workflows",
    path: "/workflows",
    description: "Deployable playbooks with runs, schedules, and queue visibility.",
    actions: [{ label: "New Workflow", kind: "primary" }, { label: "Queue", kind: "secondary" }],
  },
  {
    key: "agents",
    title: "Agents",
    path: "/agents",
    description: "Specialist agents monitored for health, outcomes, and approval mode.",
    actions: [{ label: "New Agent", kind: "primary" }, { label: "Inspect", kind: "secondary" }],
  },
  {
    key: "archive",
    title: "Archive",
    path: "/archive",
    description: "Historical records, completed runs, and prior conversations.",
    actions: [{ label: "Browse", kind: "secondary" }],
  },
  {
    key: "settings",
    title: "Settings",
    path: "/settings",
    description: "Workspace preferences, connectors, and environment details.",
    actions: [{ label: "Preferences", kind: "secondary" }],
  },
  {
    key: "help",
    title: "Help",
    path: "/help",
    description: "Operator guides, escalation paths, and implementation notes.",
    actions: [{ label: "Support", kind: "secondary" }],
  },
];

export const navigationItems: NavigationItem[] = [
  { key: "chat", title: "Know Anything", path: "/", section: "navigate" },
  { key: "inbox", title: "Inbox", path: "/inbox", section: "navigate", badge: "12" },
  { key: "meetings", title: "Meetings", path: "/meetings", section: "navigate" },
  { key: "projects", title: "Projects", path: "/projects", section: "navigate" },
  { key: "intelligence", title: "Intelligence", path: "/intelligence", section: "navigate", status: "watching" },
  { key: "approvals", title: "Approvals", path: "/approvals", section: "navigate", badge: "4", status: "urgent" },
  { key: "workflows", title: "Workflows", path: "/workflows", section: "playbooks", status: "live" },
  { key: "agents", title: "Agents", path: "/agents", section: "playbooks", status: "healthy" },
  { key: "archive", title: "Archive", path: "/archive", section: "support" },
  { key: "settings", title: "Settings", path: "/settings", section: "support" },
  { key: "help", title: "Help", path: "/help", section: "support" },
];

export const initialWorkbenchTabs: WorkbenchTab[] = [
  { id: "chat-home", routeKey: "chat", title: "Know Anything", path: "/", pinned: true, closable: false },
  { id: "inbox-main", routeKey: "inbox", title: "Inbox", path: "/inbox", pinned: true, closable: true },
  { id: "meetings-main", routeKey: "meetings", title: "Meetings", path: "/meetings", pinned: true, closable: true },
  { id: "projects-main", routeKey: "projects", title: "Projects", path: "/projects", pinned: true, closable: true },
];

export const workbenchLauncherRoutes = routeMetas.filter((route) =>
  ["/", "/inbox", "/meetings", "/projects", "/intelligence", "/approvals"].includes(route.path),
);

export const pinnedItems: PinnedItem[] = [
  { id: "pin-1", title: "Rate confirmation response", type: "chat", subtitle: "Awaiting legal sign-off" },
  { id: "pin-2", title: "Mumbai-Rotterdam Q2", type: "project", subtitle: "18 days remaining" },
  { id: "pin-3", title: "Daily pricing workflow", type: "workflow", subtitle: "Runs at 06:00 UTC" },
  { id: "pin-4", title: "Thai Union exception", type: "approval", subtitle: "Urgent review" },
  { id: "pin-5", title: "Supplier review sync", type: "meeting", subtitle: "Today · 10:30 AM" },
];

export const recentItems: RecentItem[] = [
  { id: "recent-1", title: "Thai Union response draft", type: "chat", time: "12 min ago" },
  { id: "recent-2", title: "Supplier review sync", type: "meeting", time: "34 min ago" },
  { id: "recent-3", title: "Pricing monitor run 842", type: "workflow", time: "1 hr ago" },
  { id: "recent-4", title: "Atlantic Fresh Q3", type: "project", time: "2 hrs ago" },
  { id: "recent-5", title: "Container handoff note", type: "file", time: "Today" },
  { id: "recent-6", title: "Morning operator brief", type: "chat", time: "Yesterday" },
];

export const quickConnections: QuickConnection[] = [
  { id: "gmail", label: "Gmail", state: "connected" },
  { id: "slack", label: "Slack", state: "connected" },
  { id: "whatsapp", label: "WhatsApp", state: "connected" },
  { id: "erp", label: "ERP", state: "watching" },
  { id: "crm", label: "CRM", state: "connected" },
  { id: "drive", label: "Drive", state: "connected" },
  { id: "calendar", label: "Calendar", state: "connected" },
];

export const starterActions: StarterAction[] = [
  { id: "start-1", title: "Analyze recent emails", description: "Assemble context and flag what needs a response now." },
  { id: "start-2", title: "Continue project thread", description: "Reopen the last project conversation with linked files and approvals." },
  { id: "start-3", title: "Review pending approvals", description: "Open the human review queue with recommendations and provenance." },
  { id: "start-4", title: "Start market research", description: "Create a fresh research thread with saved monitors attached." },
];

export const chatSignals: SignalItem[] = [
  { id: "signal-1", label: "Inbox requiring response", value: "12 items", tone: "alert" },
  { id: "signal-2", label: "Approvals waiting", value: "4 reviews", tone: "alert" },
  { id: "signal-3", label: "Meetings today", value: "3 sessions" },
  { id: "signal-4", label: "Workflow runs live", value: "2 executing" },
];

export const chatRecentWork = [
  {
    id: "work-1",
    title: "Thai Union compliance thread",
    summary: "Context assembled from email, WhatsApp, and prior meeting notes.",
  },
  {
    id: "work-2",
    title: "Pricing monitor daily brief",
    summary: "Watchlist refreshed with margin anomalies across three suppliers.",
  },
  {
    id: "work-3",
    title: "Rotterdam inspection prep",
    summary: "Meeting prep packet and approval checklist generated for operator review.",
  },
];

export const inboxThreads: InboxThread[] = [
  {
    id: "thread-1",
    source: "Email",
    sender: "Sarah Kim",
    subject: "Q2 rate confirmation requires executive response",
    preview: "The forwarder accepted the revised rate, but legal language on detention still needs your approval before we release the reply.",
    priority: "Critical",
    owner: "Hemanth",
    status: "Action required",
    time: "08:42",
    extractedTasks: [
      "Approve the reply draft",
      "Confirm detention clause language with legal",
      "Update the project thread after send",
    ],
    recommendedReply: "Approve with clause 4.2 preserved and copy legal on the outbound note.",
    provenance: [
      "Email thread: Sarah Kim -> You (today 08:42)",
      "Linked workflow: Sales PI to PO",
      "Reference: Contract MR-Q2 rev 3",
    ],
    attachments: ["Contract redline.pdf", "Rate summary.xlsx"],
    approvalRequired: true,
  },
  {
    id: "thread-2",
    source: "Slack",
    sender: "Raj Mehta",
    subject: "Cold-chain delay at Mumbai port",
    preview: "Customs hold has shifted the handoff window by six hours. Ops wants a decision on whether we inform the buyer now or wait for the inspection note.",
    priority: "High",
    owner: "Ops desk",
    status: "Action required",
    time: "09:15",
    extractedTasks: ["Decide if buyer is notified now", "Link the delay to the project timeline"],
    recommendedReply: "Notify the buyer now with a provisional ETA and append inspection details once cleared.",
    provenance: [
      "Slack channel: logistics-ops",
      "System alert: container YB-7221",
      "Meeting note: Logistics sync from yesterday",
    ],
    attachments: ["Port status note"],
  },
  {
    id: "thread-3",
    source: "WhatsApp",
    sender: "Thai Union Ops",
    subject: "Compliance documents uploaded late",
    preview: "Supplier asks for a 24-hour extension to upload the remaining HACCP certificates and wants confirmation that the workflow will not block the PO.",
    priority: "High",
    owner: "Compliance",
    status: "Waiting",
    time: "10:07",
    extractedTasks: ["Review extension request", "Decide whether to unblock PO"],
    recommendedReply: "Allow the extension but keep the workflow in manual approval mode until files are validated.",
    provenance: [
      "WhatsApp contact: Thai Union Ops",
      "Approval queue item: supplier exception",
      "Linked project: Supplier Compliance Audit",
    ],
    attachments: ["HACCP renewal screenshot"],
    approvalRequired: true,
  },
  {
    id: "thread-4",
    source: "System",
    sender: "Workflow monitor",
    subject: "Daily pricing workflow completed",
    preview: "The monitor finished normally and flagged two margin anomalies in the Atlantic Fresh lane. Review is optional unless action is required.",
    priority: "Medium",
    owner: "Automations",
    status: "Reviewed",
    time: "06:00",
    extractedTasks: ["Review anomalies if margin dips continue"],
    recommendedReply: "No outbound response required.",
    provenance: [
      "Workflow run 842",
      "Artifact: Daily pricing brief",
      "Source systems: ERP, supplier feeds",
    ],
    attachments: ["pricing-brief.html"],
  },
];

export const meetings: MeetingRecord[] = [
  {
    id: "meeting-1",
    title: "Supplier review - Thai Union",
    time: "Today · 10:30 AM PST",
    stage: "Upcoming",
    owner: "Hemanth",
    participants: ["Raj Mehta", "Thai Union Ops", "Compliance Bot"],
    summary: "Prep review for delayed documentation and exception handling before PO release.",
    agenda: [
      "Confirm missing compliance documents",
      "Decide extension terms",
      "Set follow-up owner and deadline",
    ],
    decisions: ["Pending live meeting"],
    actionItems: ["Carry forward current approval recommendation into the meeting"],
  },
  {
    id: "meeting-2",
    title: "Logistics sync - Maersk",
    time: "Today · 2:00 PM PST",
    stage: "Upcoming",
    owner: "Ops desk",
    participants: ["Sarah Kim", "Port ops", "Logistics Bot"],
    summary: "Review container delays, revised arrival windows, and customer notification cadence.",
    agenda: ["Validate revised ETA", "Confirm customer comms", "Check inspection timing"],
    decisions: ["Pending live meeting"],
    actionItems: ["Bring open inbox threads related to YB-7221"],
  },
  {
    id: "meeting-3",
    title: "Morning operator brief",
    time: "Today · 8:15 AM PST",
    stage: "Completed",
    owner: "Ubik",
    participants: ["Hemanth", "Pricing monitor", "Inbox triage agent"],
    summary: "Reviewed top risk items, upcoming meetings, and overnight workflow outcomes.",
    agenda: ["Inbox risk", "Approvals", "Pricing monitor"],
    decisions: [
      "Escalate Thai Union exception to approval queue",
      "Keep pricing monitor in daily cadence",
    ],
    actionItems: ["Reply to Sarah on rate confirmation", "Prepare supplier review packet"],
  },
];

export const projects: ProjectRecord[] = [
  {
    id: "project-1",
    name: "Mumbai-Rotterdam Q2",
    code: "MR-Q2",
    status: "On track",
    owner: "Hemanth",
    progress: 68,
    summary: "Main shipping lane workstream covering rate confirmation, container release, and buyer updates.",
    milestones: [
      { label: "Contract revision approved", state: "Done" },
      { label: "Rate confirmation sent", state: "Active" },
      { label: "Cargo loaded", state: "Upcoming" },
    ],
    linked: [
      { label: "Sales PI to PO workflow", kind: "workflow" },
      { label: "Rate confirmation thread", kind: "chat" },
      { label: "Detention exception approval", kind: "approval" },
    ],
    team: ["Sarah Kim", "Raj Mehta", "Logistics Bot"],
    nextActions: ["Approve legal wording", "Confirm customer note", "Update project timeline"],
  },
  {
    id: "project-2",
    name: "Supplier Compliance Audit",
    code: "SCA-26",
    status: "At risk",
    owner: "Compliance",
    progress: 41,
    summary: "Audit workstream focused on supplier certificate freshness and exception handling.",
    milestones: [
      { label: "Document collection", state: "Active" },
      { label: "Risk review", state: "Upcoming" },
      { label: "Audit closure", state: "Upcoming" },
    ],
    linked: [
      { label: "Thai Union exception", kind: "approval" },
      { label: "Policy watch brief", kind: "report" },
      { label: "Supplier review sync", kind: "meeting" },
    ],
    team: ["Raj Mehta", "Compliance Bot"],
    nextActions: ["Confirm extension window", "Validate new uploads", "Decide PO release posture"],
  },
  {
    id: "project-3",
    name: "Atlantic Fresh Q3",
    code: "AF-Q3",
    status: "Needs attention",
    owner: "Finance",
    progress: 84,
    summary: "Margin-sensitive lane where pricing watch signals have started trending below threshold.",
    milestones: [
      { label: "Inventory allocation", state: "Done" },
      { label: "Margin review", state: "Active" },
      { label: "Commercial approval", state: "Upcoming" },
    ],
    linked: [
      { label: "Daily pricing workflow", kind: "workflow" },
      { label: "Pricing anomaly brief", kind: "report" },
    ],
    team: ["Finance Agent", "Sales ops"],
    nextActions: ["Review pricing brief", "Decide escalation path"],
  },
];

export const approvals: ApprovalItem[] = [
  {
    id: "approval-1",
    title: "Approve rate confirmation reply",
    workflow: "Sales PI to PO",
    status: "Urgent",
    confidence: 94,
    recommendation: "Approve the reply draft with the detention clause preserved and send today.",
    inputSummary: "The system aligned the latest forwarder reply, contract revision, and prior negotiation thread.",
    provenance: [
      "Email thread with Sarah Kim",
      "Contract MR-Q2 rev 3",
      "Legal note from March 28",
    ],
    actions: ["Approve and send", "Edit response", "Reject recommendation"],
  },
  {
    id: "approval-2",
    title: "Supplier extension exception",
    workflow: "Compliance monitoring",
    status: "Urgent",
    confidence: 89,
    recommendation: "Allow the extension but keep PO release behind manual review until the HACCP files are verified.",
    inputSummary: "The system traced the request to the supplier audit, PO timing, and prior exceptions for the same vendor.",
    provenance: [
      "WhatsApp note from Thai Union Ops",
      "Supplier Compliance Audit project",
      "Policy watch brief on document freshness",
    ],
    actions: ["Approve exception", "Hold PO", "Request more context"],
  },
  {
    id: "approval-3",
    title: "Publish pricing anomaly digest",
    workflow: "Daily pricing workflow",
    status: "Review",
    confidence: 82,
    recommendation: "Share the digest internally only and wait one more run before alerting customers.",
    inputSummary: "Two margin anomalies were detected, but both are within the temporary variance threshold.",
    provenance: ["Workflow run 842", "ERP landed costs", "Supplier feed delta"],
    actions: ["Share internally", "Escalate externally", "Dismiss"],
  },
];

export const workflowDefinitions: WorkflowDefinition[] = [
  {
    id: "wf-1",
    name: "Sales PI to PO",
    owner: "Commercial ops",
    cadence: "Manual trigger",
    approvalMode: "Required",
    outcomes: "Turns customer threads into approved outbound responses and internal tasks.",
  },
  {
    id: "wf-2",
    name: "Daily pricing workflow",
    owner: "Pricing",
    cadence: "Daily · 06:00 UTC",
    approvalMode: "Only on anomalies",
    outcomes: "Assembles landed cost changes and produces a margin watch brief.",
  },
  {
    id: "wf-3",
    name: "Compliance monitoring",
    owner: "Compliance",
    cadence: "Hourly watch",
    approvalMode: "Required",
    outcomes: "Monitors certificate freshness and routes supplier exceptions into review.",
  },
];

export const workflowRuns: WorkflowRun[] = [
  {
    id: "run-1",
    name: "Sales PI to PO · MR-Q2",
    status: "Awaiting approval",
    startedAt: "Today · 08:39",
    owner: "Commercial ops",
    summary: "Context assembled from inbound email, contract, and prior thread. Draft reply is ready for human review.",
    steps: [
      { id: "step-1", label: "Assemble thread context", status: "done" },
      { id: "step-2", label: "Extract tasks and policy checks", status: "done" },
      { id: "step-3", label: "Generate reply draft", status: "done" },
      { id: "step-4", label: "Await approval", status: "running" },
    ],
    artifacts: ["Draft response", "Context packet", "Approval note"],
  },
  {
    id: "run-2",
    name: "Daily pricing workflow · Atlantic Fresh",
    status: "Completed",
    startedAt: "Today · 06:00",
    owner: "Pricing",
    summary: "Completed with two margin anomalies and a new internal digest.",
    steps: [
      { id: "step-5", label: "Pull supplier feeds", status: "done" },
      { id: "step-6", label: "Calculate margin shifts", status: "done" },
      { id: "step-7", label: "Write daily brief", status: "done" },
    ],
    artifacts: ["Pricing digest", "Anomaly trace"],
  },
];

export const agents: AgentRecord[] = [
  {
    id: "agent-1",
    name: "Inbox triage agent",
    status: "Healthy",
    lastRun: "2 min ago",
    linkedWorkflow: "Sales PI to PO",
    summary: "Prioritizes inbound threads and assembles source context before the operator opens them.",
  },
  {
    id: "agent-2",
    name: "Pricing monitor agent",
    status: "Watching",
    lastRun: "12 min ago",
    linkedWorkflow: "Daily pricing workflow",
    summary: "Monitors supplier price movement and flags anomalies before customer impact.",
  },
  {
    id: "agent-3",
    name: "Compliance review agent",
    status: "Paused",
    lastRun: "Yesterday",
    linkedWorkflow: "Compliance monitoring",
    summary: "Tracks certificate freshness and prepares exception packets for human review.",
  },
];

export const intelligenceRecords: IntelligenceRecord[] = [
  {
    id: "intel-1",
    title: "EU cold-chain policy watch",
    freshness: "Updated 42 min ago",
    source: "Policy monitor",
    summary: "No new restrictions, but two wording changes affect inspection lead times for reefers.",
  },
  {
    id: "intel-2",
    title: "Atlantic lane pricing brief",
    freshness: "Updated 2 hrs ago",
    source: "Pricing monitor",
    summary: "Margin pressure concentrated in frozen whitefish lots; two suppliers remain outside threshold.",
  },
  {
    id: "intel-3",
    title: "Competitor watch digest",
    freshness: "Yesterday",
    source: "Research agent",
    summary: "Two competing distributors widened payment terms this week; monitor implications for renewal offers.",
  },
];

export const archiveRecords: ArchiveRecord[] = [
  { id: "archive-1", title: "March operator brief", type: "Brief", updatedAt: "Mar 29", owner: "Ubik" },
  { id: "archive-2", title: "Supplier audit closure pack", type: "Project", updatedAt: "Mar 27", owner: "Compliance" },
  { id: "archive-3", title: "Pricing monitor run 801", type: "Workflow run", updatedAt: "Mar 25", owner: "Pricing" },
];

export const settingsSections: SettingsSection[] = [
  {
    id: "settings-1",
    title: "Workspace",
    description: "Operator defaults for tabs, theme, and shell behavior.",
    values: [
      { label: "Default home", value: "Chat" },
      { label: "Theme", value: "Paper-first light" },
      { label: "Workbench restore", value: "Session only" },
    ],
  },
  {
    id: "settings-2",
    title: "Connectors",
    description: "Connected systems available in the current operator workspace.",
    values: [
      { label: "Messaging", value: "Gmail, Slack, WhatsApp" },
      { label: "Systems", value: "ERP, CRM, Drive" },
      { label: "Calendar", value: "Connected" },
    ],
  },
  {
    id: "settings-3",
    title: "Environment",
    description: "Runtime metadata and deployment visibility.",
    values: [
      { label: "Workspace", value: "Business / Prod" },
      { label: "Version", value: "v1.0.4" },
      { label: "Mode", value: "Desktop + Web" },
    ],
  },
];

export const helpResources: HelpResource[] = [
  {
    id: "help-1",
    title: "Inbox to approval flow",
    description: "How Ubik assembles thread context, extracts tasks, and routes items into review.",
    action: "Open guide",
  },
  {
    id: "help-2",
    title: "Workflow trace inspection",
    description: "How to read runtime artifacts, provenance, and execution steps.",
    action: "Read docs",
  },
  {
    id: "help-3",
    title: "Operator support",
    description: "Escalation paths, release notes, and implementation caveats.",
    action: "Contact support",
  },
];

export function getRouteMeta(pathname: string) {
  return routeMetas.find((route) => route.path === pathname) ?? routeMetas.find((route) => route.path === "/");
}
