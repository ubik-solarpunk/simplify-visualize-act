import { useState } from "react";
import {
  agents,
  approvals,
  connectedApps,
  agentPreferences,
} from "@/lib/mock-data";
import {
  Mail,
  Brain,
  MessageSquare,
  FileText,
  Database,
  AlertTriangle,
  Globe,
  Monitor,
  Send,
  Calendar,
  CheckSquare,
  Phone,
  ChevronDown,
  ChevronRight,
  Plus,
  Check,
  X,
  Edit3,
  Zap,
  Power,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

const toolIcons: Record<string, React.ReactNode> = {
  Mail: <Mail className="h-3.5 w-3.5" />,
  Brain: <Brain className="h-3.5 w-3.5" />,
  MessageSquare: <MessageSquare className="h-3.5 w-3.5" />,
  FileText: <FileText className="h-3.5 w-3.5" />,
  Database: <Database className="h-3.5 w-3.5" />,
  AlertTriangle: <AlertTriangle className="h-3.5 w-3.5" />,
  Globe: <Globe className="h-3.5 w-3.5" />,
  Monitor: <Monitor className="h-3.5 w-3.5" />,
  Send: <Send className="h-3.5 w-3.5" />,
  Calendar: <Calendar className="h-3.5 w-3.5" />,
  CheckSquare: <CheckSquare className="h-3.5 w-3.5" />,
  Phone: <Phone className="h-3.5 w-3.5" />,
  Figma: <Globe className="h-3.5 w-3.5" />,
};

export default function Agents() {
  const [expandedAgent, setExpandedAgent] = useState<number | null>(1);
  const [agentStates, setAgentStates] = useState<Record<number, boolean>>(
    Object.fromEntries(agents.map((a) => [a.id, a.active]))
  );
  const [activeTab, setActiveTab] = useState<"workflows" | "approvals" | "preferences">("workflows");

  const toggleAgent = (id: number) => {
    setAgentStates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-6 overflow-auto">
      <div className="mb-6">
        <h1 className="font-mono text-2xl font-bold tracking-tight">
          AGENTS<span className="text-primary">.</span>
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Configure workflows, review approvals, manage connected tools
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-0 border-b border-border mb-6">
        {(["workflows", "approvals", "preferences"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`font-mono text-[11px] tracking-widest px-4 py-2.5 border-b-2 transition-colors ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent hover:text-foreground/70"
            }`}
          >
            {tab.toUpperCase()}
            {tab === "approvals" && (
              <span className="ml-1.5 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 font-mono">
                {approvals.filter((a) => a.urgent).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* WORKFLOWS TAB */}
      {activeTab === "workflows" && (
        <div className="space-y-3">
          {agents.map((agent) => (
            <div key={agent.id} className="border border-border">
              {/* Agent header */}
              <button
                onClick={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAgent(agent.id);
                    }}
                    className="shrink-0"
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        agentStates[agent.id] ? "bg-primary animate-pulse-dot" : "bg-border"
                      }`}
                    />
                  </button>
                  <div>
                    <span className="font-mono text-xs font-semibold">{agent.name}</span>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{agent.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[9px] text-muted-foreground">{agent.lastRun}</span>
                  <Switch
                    checked={agentStates[agent.id]}
                    onCheckedChange={() => toggleAgent(agent.id)}
                    className="scale-75"
                  />
                  {expandedAgent === agent.id ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  )}
                </div>
              </button>

              {/* Expanded: Pipeline view */}
              {expandedAgent === agent.id && (
                <div className="border-t border-border p-4">
                  <span className="font-mono text-[10px] tracking-widest text-muted-foreground mb-3 block">
                    WORKFLOW_PIPELINE
                  </span>
                  <div className="flex items-center gap-0 overflow-x-auto pb-2">
                    {agent.steps.map((step, i) => (
                      <div key={step.id} className="flex items-center">
                        <div
                          className={`border p-3 min-w-[140px] ${
                            step.status === "connected"
                              ? "border-border"
                              : "border-primary border-dashed"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className={step.status === "connected" ? "text-primary" : "text-muted-foreground"}>
                              {toolIcons[step.icon] || <Zap className="h-3.5 w-3.5" />}
                            </span>
                            <span className="font-mono text-[10px] font-semibold">{step.tool}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground">{step.name}</p>
                          <span
                            className={`font-mono text-[8px] tracking-wider mt-1 inline-block ${
                              step.status === "connected" ? "text-foreground" : "text-primary"
                            }`}
                          >
                            {step.status.toUpperCase()}
                          </span>
                        </div>
                        {i < agent.steps.length - 1 && (
                          <div className="w-6 h-px bg-border shrink-0" />
                        )}
                      </div>
                    ))}
                    <button className="ml-2 h-10 w-10 border border-dashed border-border flex items-center justify-center hover:border-primary hover:text-primary transition-colors shrink-0">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* APPROVALS TAB */}
      {activeTab === "approvals" && (
        <div className="space-y-3">
          {approvals.map((approval) => (
            <div
              key={approval.id}
              className={`border p-4 ${
                approval.urgent
                  ? "border-l-2 border-l-primary border-t border-r border-b border-border"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                      {approval.agent}
                    </span>
                    {approval.urgent && (
                      <span className="font-mono text-[9px] tracking-wider text-primary border border-primary px-1.5 py-0.5">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium">{approval.action}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="font-mono text-lg font-bold">{approval.confidence}%</span>
                  <p className="font-mono text-[9px] text-muted-foreground">CONFIDENCE</p>
                </div>
              </div>

              {/* Context */}
              <div className="bg-accent/5 border border-border p-3 mb-3">
                <span className="font-mono text-[9px] tracking-widest text-muted-foreground block mb-1">
                  CONTEXT
                </span>
                <p className="text-[11px] text-muted-foreground">{approval.context}</p>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{approval.timestamp}</span>
                <div className="flex items-center gap-1.5">
                  <button className="h-7 px-3 bg-primary text-primary-foreground font-mono text-[10px] tracking-wider hover:bg-primary/90 transition-colors flex items-center gap-1.5">
                    <Check className="h-3 w-3" />
                    APPROVE
                  </button>
                  <button className="h-7 px-3 border border-border font-mono text-[10px] tracking-wider hover:border-foreground/30 transition-colors flex items-center gap-1.5">
                    <X className="h-3 w-3" />
                    REJECT
                  </button>
                  <button className="h-7 px-3 border border-border font-mono text-[10px] tracking-wider hover:border-foreground/30 transition-colors flex items-center gap-1.5">
                    <Edit3 className="h-3 w-3" />
                    MODIFY
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PREFERENCES TAB */}
      {activeTab === "preferences" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Connected Apps */}
          <div>
            <h3 className="font-mono text-[11px] tracking-widest font-semibold mb-3">CONNECTED_TOOLS</h3>
            <div className="space-y-1.5">
              {connectedApps.map((app) => (
                <div key={app.id} className="border border-border p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={app.status === "connected" ? "" : "text-muted-foreground"}>
                      {toolIcons[app.icon] || <Zap className="h-3.5 w-3.5" />}
                    </span>
                    <div>
                      <span className="font-mono text-xs font-semibold">{app.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        {app.status === "connected" ? (
                          <>
                            {app.permissions.read && (
                              <span className="font-mono text-[8px] tracking-wider text-muted-foreground">READ</span>
                            )}
                            {app.permissions.write && (
                              <span className="font-mono text-[8px] tracking-wider text-muted-foreground">WRITE</span>
                            )}
                            {app.permissions.execute && (
                              <span className="font-mono text-[8px] tracking-wider text-muted-foreground">EXEC</span>
                            )}
                          </>
                        ) : (
                          <span className="font-mono text-[8px] tracking-wider text-primary">DISCONNECTED</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    className={`h-7 px-3 font-mono text-[10px] tracking-wider transition-colors flex items-center gap-1.5 ${
                      app.status === "connected"
                        ? "border border-border hover:border-primary hover:text-primary"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    <Power className="h-3 w-3" />
                    {app.status === "connected" ? "MANAGE" : "CONNECT"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Behavior */}
          <div>
            <h3 className="font-mono text-[11px] tracking-widest font-semibold mb-3">AGENT_BEHAVIOR</h3>

            {/* Aggressiveness */}
            <div className="border border-border p-4 mb-3">
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground block mb-3">
                AUTONOMY_LEVEL
              </span>
              <div className="flex gap-0">
                {(["conservative", "balanced", "autonomous"] as const).map((level) => (
                  <button
                    key={level}
                    className={`flex-1 py-2 font-mono text-[10px] tracking-wider border transition-colors ${
                      agentPreferences.aggressiveness === level
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto-approve threshold */}
            <div className="border border-border p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                  AUTO_APPROVE_THRESHOLD
                </span>
                <span className="font-mono text-sm font-bold">{agentPreferences.autoApproveThreshold}%</span>
              </div>
              <div className="w-full h-1.5 bg-border">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${agentPreferences.autoApproveThreshold}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                Actions with confidence above this threshold are auto-approved
              </p>
            </div>

            {/* Notification preferences */}
            <div className="border border-border p-4">
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground block mb-3">
                NOTIFICATIONS
              </span>
              <div className="space-y-2.5">
                {Object.entries(agentPreferences.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="font-mono text-xs">{key.toUpperCase()}</span>
                    <Switch checked={value} className="scale-75" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
