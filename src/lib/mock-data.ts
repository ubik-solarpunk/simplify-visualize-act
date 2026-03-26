// ─── HOME FEED ───
export const feedCards = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=600&h=400&fit=crop",
    title: "Mumbai Port — Container Yard 7B",
    subtitle: "Live feed • 3 mins ago",
    tag: "SHIPMENT_TRACKING",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop",
    title: "Rotterdam Cold Storage Facility",
    subtitle: "Inspection scheduled • Tomorrow 09:00",
    tag: "COMPLIANCE",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
    title: "Atlantic Bluefin — Grade A Lot",
    subtitle: "Price alert • $42.80/kg (+2.3%)",
    tag: "MARKET_DATA",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1515552726023-7125c8d07fb3?w=600&h=400&fit=crop",
    title: "Yokohama Auction House",
    subtitle: "Bidding opens • 06:00 JST",
    tag: "PROCUREMENT",
  },
];

export const recentChats = [
  { id: 1, title: "Rate confirmation — Maersk Q2 contract", participants: "You, Sarah K.", time: "12 min ago" },
  { id: 2, title: "Supplier compliance check — Thai Union", participants: "You, Raj M., Compliance Bot", time: "1 hr ago" },
  { id: 3, title: "Budget variance analysis — March", participants: "You, Finance Agent", time: "3 hrs ago" },
];

// ─── QUICK ACTIONS ───
export const quickActions = [
  { id: 1, label: "EMAIL_ANALYSIS", description: "Scan & summarize inbox threads", icon: "Mail" },
  { id: 2, label: "BUDGET_REPORT", description: "Generate financial overview", icon: "BarChart3" },
  { id: 3, label: "DO_RESEARCH", description: "Deep dive on any topic", icon: "Search" },
  { id: 4, label: "PROJECT_STATUS", description: "Get project health check", icon: "Activity" },
];

// ─── TASK TRACKER ───
export const tasks = [
  {
    id: 1,
    title: "Review rate confirmation from Maersk",
    project: "Mumbai-Rotterdam Q2",
    status: "TODO" as const,
    priority: "high",
    duplicatesMerged: 0,
    source: "Email",
  },
  {
    id: 2,
    title: "Approve supplier compliance report",
    project: "Supplier Compliance Audit",
    status: "IN_PROGRESS" as const,
    priority: "high",
    duplicatesMerged: 3,
    source: "Agent",
  },
  {
    id: 3,
    title: "Send updated PO to Thai Union",
    project: "Mumbai-Rotterdam Q2",
    status: "TODO" as const,
    priority: "medium",
    duplicatesMerged: 0,
    source: "Meeting",
  },
  {
    id: 4,
    title: "Finalize cold chain logistics plan",
    project: "Atlantic Fresh Q3",
    status: "DONE" as const,
    priority: "low",
    duplicatesMerged: 2,
    source: "Auto-detected",
  },
  {
    id: 5,
    title: "Schedule port inspection — Rotterdam",
    project: "Supplier Compliance Audit",
    status: "TODO" as const,
    priority: "medium",
    duplicatesMerged: 0,
    source: "Calendar",
  },
];

// ─── PROJECTS ───
export const projects = [
  {
    id: 1,
    name: "Mumbai-Rotterdam Q2",
    progress: 68,
    lastActivity: "Rate confirmation received — 2 hrs ago",
    tasks: { total: 12, done: 8 },
    status: "ON_TRACK" as const,
  },
  {
    id: 2,
    name: "Supplier Compliance Audit",
    progress: 35,
    lastActivity: "Thai Union docs uploaded — 5 hrs ago",
    tasks: { total: 9, done: 3 },
    status: "AT_RISK" as const,
  },
  {
    id: 3,
    name: "Atlantic Fresh Q3",
    progress: 92,
    lastActivity: "Final logistics approved — 1 day ago",
    tasks: { total: 7, done: 6 },
    status: "ON_TRACK" as const,
  },
];

// ─── CONTEXT INTELLIGENCE ───
export const contextIntelligence = {
  activeWorkflows: 4,
  runningWorkflows: 3,
  pendingApprovals: 5,
  urgentApprovals: 2,
  unreadInbox: 12,
  nextMeetings: [
    { id: 1, title: "Supplier Review — Thai Union", time: "10:30 AM", attendees: 4 },
    { id: 2, title: "Logistics Sync — Maersk", time: "2:00 PM", attendees: 3 },
    { id: 3, title: "Q2 Budget Review", time: "4:30 PM", attendees: 6 },
  ],
  insights: [
    "3 rate confirmations pending > 48hrs",
    "Supplier compliance score dropped 12% — Thai Union",
    "Container YB-7221 delayed 6hrs at Mumbai port",
  ],
};

// ─── AGENTS ───
export const agents = [
  {
    id: 1,
    name: "Email Triage Agent",
    description: "Scans incoming email, categorizes by priority, drafts responses for review",
    active: true,
    lastRun: "2 mins ago",
    steps: [
      { id: 1, tool: "Gmail", name: "Read Inbox", status: "connected" as const, icon: "Mail" },
      { id: 2, tool: "UBIK AI", name: "Classify & Summarize", status: "connected" as const, icon: "Brain" },
      { id: 3, tool: "Slack", name: "Notify Team", status: "connected" as const, icon: "MessageSquare" },
    ],
  },
  {
    id: 2,
    name: "Rate Confirmation Agent",
    description: "Monitors shipping rate confirmations, validates against contracts, flags discrepancies",
    active: true,
    lastRun: "15 mins ago",
    steps: [
      { id: 1, tool: "Email", name: "Monitor Inbox", status: "connected" as const, icon: "Mail" },
      { id: 2, tool: "Document AI", name: "Extract Rates", status: "connected" as const, icon: "FileText" },
      { id: 3, tool: "Database", name: "Compare Contracts", status: "connected" as const, icon: "Database" },
      { id: 4, tool: "Slack", name: "Alert if Mismatch", status: "connected" as const, icon: "AlertTriangle" },
    ],
  },
  {
    id: 3,
    name: "Design Review Pipeline",
    description: "Pulls Figma designs, runs browser preview, captures screenshots for approval",
    active: false,
    lastRun: "2 days ago",
    steps: [
      { id: 1, tool: "Figma MCP", name: "Fetch Design", status: "connected" as const, icon: "Figma" },
      { id: 2, tool: "Browser Use", name: "Render Preview", status: "connected" as const, icon: "Globe" },
      { id: 3, tool: "Computer Use", name: "Screenshot", status: "disconnected" as const, icon: "Monitor" },
      { id: 4, tool: "Slack", name: "Send for Review", status: "connected" as const, icon: "Send" },
    ],
  },
  {
    id: 4,
    name: "Meeting Follow-up Agent",
    description: "Extracts action items from meeting transcripts, creates tasks, sends follow-ups",
    active: true,
    lastRun: "1 hr ago",
    steps: [
      { id: 1, tool: "Calendar", name: "Get Transcript", status: "connected" as const, icon: "Calendar" },
      { id: 2, tool: "UBIK AI", name: "Extract Actions", status: "connected" as const, icon: "Brain" },
      { id: 3, tool: "Task Manager", name: "Create Tasks", status: "connected" as const, icon: "CheckSquare" },
      { id: 4, tool: "Email", name: "Send Follow-up", status: "connected" as const, icon: "Send" },
    ],
  },
];

// ─── APPROVALS ───
export const approvals = [
  {
    id: 1,
    agent: "Rate Confirmation Agent",
    action: "Flag rate discrepancy: Maersk invoice #MK-4421 shows $3,200 vs contract rate $2,850",
    confidence: 94,
    urgent: true,
    context: "Contract MK-2024-Q2 specifies $2,850/TEU for Mumbai-Rotterdam. Invoice received at $3,200/TEU. Difference: +$350 (12.3%)",
    timestamp: "5 mins ago",
  },
  {
    id: 2,
    agent: "Email Triage Agent",
    action: "Draft reply to Thai Union regarding delayed compliance documents",
    confidence: 87,
    urgent: true,
    context: "Thai Union requested extension for compliance submission. Agent drafted professional follow-up referencing contract clause 4.2",
    timestamp: "22 mins ago",
  },
  {
    id: 3,
    agent: "Meeting Follow-up Agent",
    action: "Create 3 tasks from Logistics Sync meeting transcript",
    confidence: 91,
    urgent: false,
    context: "Extracted: 1) Update container tracking for YB-7221, 2) Confirm cold chain specs with Rotterdam, 3) Schedule port inspection",
    timestamp: "1 hr ago",
  },
  {
    id: 4,
    agent: "Design Review Pipeline",
    action: "Send dashboard mockup v3 to #design-review channel",
    confidence: 78,
    urgent: false,
    context: "Figma frame 'Dashboard v3' rendered and captured. 2 visual regressions detected vs v2. Awaiting human review before sharing.",
    timestamp: "3 hrs ago",
  },
];

// ─── CONNECTED APPS ───
export const connectedApps = [
  { id: 1, name: "Gmail", status: "connected" as const, icon: "Mail", permissions: { read: true, write: true, execute: false } },
  { id: 2, name: "Slack", status: "connected" as const, icon: "MessageSquare", permissions: { read: true, write: true, execute: false } },
  { id: 3, name: "WhatsApp", status: "connected" as const, icon: "Phone", permissions: { read: true, write: false, execute: false } },
  { id: 4, name: "Figma", status: "connected" as const, icon: "Figma", permissions: { read: true, write: false, execute: true } },
  { id: 5, name: "Google Calendar", status: "connected" as const, icon: "Calendar", permissions: { read: true, write: true, execute: false } },
  { id: 6, name: "Telegram", status: "disconnected" as const, icon: "Send", permissions: { read: false, write: false, execute: false } },
];

export const agentPreferences = {
  aggressiveness: "balanced" as "conservative" | "balanced" | "autonomous",
  autoApproveThreshold: 95,
  notifications: {
    urgent: true,
    routine: false,
    digest: true,
  },
};
