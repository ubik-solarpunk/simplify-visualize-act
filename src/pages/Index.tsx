import { useMemo, useRef, type ReactNode } from "react";
import {
  ArrowUp,
  Brain,
  FolderOpen,
  Globe,
  LibraryBig,
  Mail,
  Paperclip,
  Plus,
  Radio,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { PageContainer } from "@/components/page-container";
import { SmallButton, Surface } from "@/components/ubik-primitives";
import { useShellState, useWorkbenchState } from "@/hooks/use-shell-state";
import { askAnythingPrompts } from "@/lib/ubik-data";

type ChatMode = "light" | "speed" | "max";
type ChatSource =
  | "org_knowledge"
  | "files"
  | "internet"
  | "gmail"
  | "zoho"
  | "salesforce"
  | "linear"
  | "slack"
  | "google_drive"
  | "outlook_drive"
  | "deep_research"
  | "agent_mode";

const primarySources: { key: ChatSource; label: string; icon: ReactNode }[] = [
  { key: "org_knowledge", label: "Organization", icon: <LibraryBig className="h-3.5 w-3.5" /> },
  { key: "files", label: "Files", icon: <Paperclip className="h-3.5 w-3.5" /> },
  { key: "internet", label: "Internet", icon: <Globe className="h-3.5 w-3.5" /> },
];

const optionalSources: { key: ChatSource; label: string; icon: ReactNode }[] = [
  { key: "gmail", label: "Gmail", icon: <Mail className="h-3.5 w-3.5" /> },
  { key: "slack", label: "Slack", icon: <Mail className="h-3.5 w-3.5" /> },
  { key: "linear", label: "Linear", icon: <LibraryBig className="h-3.5 w-3.5" /> },
  { key: "google_drive", label: "Drive", icon: <FolderOpen className="h-3.5 w-3.5" /> },
  { key: "salesforce", label: "Salesforce", icon: <Radio className="h-3.5 w-3.5" /> },
  { key: "zoho", label: "Zoho", icon: <FolderOpen className="h-3.5 w-3.5" /> },
  { key: "outlook_drive", label: "Outlook Drive", icon: <FolderOpen className="h-3.5 w-3.5" /> },
  { key: "deep_research", label: "Deep Research", icon: <Brain className="h-3.5 w-3.5" /> },
  { key: "agent_mode", label: "Agent Mode", icon: <WandSparkles className="h-3.5 w-3.5" /> },
];

const modeItems: { key: ChatMode; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "speed", label: "Speed" },
  { key: "max", label: "Max" },
];

const sourceLabels: Record<ChatSource, string> = {
  org_knowledge: "Organization",
  files: "Files",
  internet: "Internet",
  gmail: "Gmail",
  zoho: "Zoho",
  salesforce: "Salesforce",
  linear: "Linear",
  slack: "Slack",
  google_drive: "Google Drive",
  outlook_drive: "Outlook Drive",
  deep_research: "Deep Research",
  agent_mode: "Agent Mode",
};

export default function Index() {
  const { openDrawer, openRuntime } = useShellState();
  const [showMoreSources, setShowMoreSources] = useWorkbenchState<boolean>("chat-more-sources-open", false);
  const [composer, setComposer] = useWorkbenchState("chat-composer", "");
  const [mode, setMode] = useWorkbenchState<ChatMode>("chat-mode", "speed");
  const [sources, setSources] = useWorkbenchState<ChatSource[]>("chat-sources", ["org_knowledge"]);
  const [attachments, setAttachments] = useWorkbenchState<string[]>("chat-attachments", []);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const toggleSource = (source: ChatSource) => {
    setSources(sources.includes(source) ? sources.filter((item) => item !== source) : [...sources, source]);
  };

  const handleFileSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).map((file) => file.name);
    const next = Array.from(new Set([...attachments, ...files]));
    setAttachments(next);
    if (files.length && !sources.includes("files")) {
      setSources([...sources, "files"]);
    }
    event.target.value = "";
  };

  const removeAttachment = (file: string) => {
    const next = attachments.filter((item) => item !== file);
    setAttachments(next);
    if (!next.length) {
      setSources(sources.filter((item) => item !== "files"));
    }
  };

  const selectedLabels = useMemo(() => sources.map((source) => sourceLabels[source]), [sources]);

  const runPrompt = () => {
    const selectedSources = selectedLabels.join(", ") || "None";

    openRuntime({
      title: "Ubik runtime",
      status: "Ready",
      lines: [
        `> Mode: ${mode.toUpperCase()}`,
        `> Sources: ${selectedSources}`,
        "",
        composer || "Start with an operator task, a thread to continue, or a decision that needs context.",
      ],
      artifactLabel: "Prepared answer surface",
    });

    openDrawer({
      title: "Query context",
      eyebrow: "Ubik",
      description: "Seeded context assembly preview.",
      metadata: [
        { label: "Mode", value: mode.toUpperCase() },
        { label: "Sources", value: selectedSources },
        { label: "Attachments", value: attachments.length ? attachments.join(", ") : "None" },
      ],
    });
  };

  return (
    <div className="px-4 py-6 lg:px-8">
      <PageContainer className="flex min-h-[calc(100vh-17rem)] items-center justify-center">
        <div className="w-full max-w-[860px]">
          <div className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Ubik</p>
            <h2 className="mt-2 text-4xl text-foreground">Good afternoon, Hemanth</h2>
            <p className="mt-2 text-sm text-muted-foreground">Ask across inbox, meetings, projects, docs, and internet.</p>
          </div>

          <Surface className="mt-5 bg-background p-4">
            <div className="flex flex-wrap items-center gap-2">
              {primarySources.map((item) => {
                const active = sources.includes(item.key);
                return (
                  <button
                    key={item.key}
                    className={`inline-flex h-9 items-center gap-2 border px-3 py-2 text-xs ${active ? "border-foreground bg-foreground text-background" : "border-border bg-background text-foreground"}`}
                    onClick={() => {
                      if (item.key === "files") {
                        fileInputRef.current?.click();
                        return;
                      }
                      toggleSource(item.key);
                    }}
                    type="button"
                  >
                    {item.icon}
                    {item.label}
                  </button>
                );
              })}

              <div className="ml-auto inline-flex border border-border bg-background p-1">
                {modeItems.map((item) => (
                  <button
                    key={item.key}
                    className={`px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.1em] ${mode === item.key ? "bg-foreground text-background" : "text-foreground"}`}
                    onClick={() => setMode(item.key)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-3 border border-border bg-background">
              <textarea
                className="min-h-[124px] w-full resize-none bg-transparent px-4 py-4 text-sm leading-6 text-foreground outline-none"
                onChange={(event) => setComposer(event.target.value)}
                placeholder="How can I help you today?"
                value={composer}
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                className="inline-flex h-9 items-center gap-2 border border-border bg-background px-3 py-2 text-xs text-foreground"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <Plus className="h-3.5 w-3.5" /> Add file
              </button>
              <SmallButton onClick={() => setShowMoreSources((current) => !current)}>
                {showMoreSources ? "Hide sources" : "More sources"}
              </SmallButton>
            </div>

            {showMoreSources ? (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {optionalSources.map((item) => {
                  const active = sources.includes(item.key);
                  return (
                    <button
                      key={item.key}
                      className={`inline-flex h-9 items-center gap-2 border px-3 py-2 text-xs ${active ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}
                      onClick={() => toggleSource(item.key)}
                      type="button"
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {attachments.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {attachments.map((file) => (
                  <span key={file} className="inline-flex items-center gap-2 border border-border bg-background px-2 py-1 text-xs text-foreground">
                    {file}
                    <button
                      aria-label={`Remove ${file}`}
                      className="inline-flex h-4 w-4 items-center justify-center border border-border"
                      onClick={() => removeAttachment(file)}
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                {selectedLabels.length ? selectedLabels.join(" · ") : "No sources selected"}
              </div>
              <button
                aria-label="Run prompt"
                className="inline-flex h-9 w-9 items-center justify-center bg-primary text-primary-foreground"
                onClick={runPrompt}
                type="button"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            </div>
          </Surface>

          <Surface className="mt-4 bg-background p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Try one</p>
            <div className="mt-2 grid gap-2">
              {askAnythingPrompts.slice(0, 4).map((prompt) => (
                <button
                  key={prompt}
                  className="border border-border bg-background px-3 py-2 text-left text-sm text-foreground"
                  onClick={() => setComposer(prompt)}
                  type="button"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </Surface>

          <input ref={fileInputRef} className="hidden" multiple type="file" onChange={handleFileSelection} />
        </div>
      </PageContainer>
    </div>
  );
}
