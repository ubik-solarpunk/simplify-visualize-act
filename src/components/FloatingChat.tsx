import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Send, Paperclip, ChevronDown } from "lucide-react";

const contextChips = [
  { id: "home", label: "HOME", path: "/" },
  { id: "inbox", label: "INBOX", path: "/inbox" },
  { id: "projects", label: "PROJECTS", path: "/projects" },
  { id: "meetings", label: "MEETINGS", path: "/meetings" },
  { id: "agents", label: "AGENTS", path: "/agents" },
];

export function FloatingChat() {
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  const currentChip = contextChips.find((c) => {
    if (c.path === "/") return location.pathname === "/";
    return location.pathname.startsWith(c.path);
  });

  const effectiveChip = activeChip ?? currentChip?.id ?? null;

  const toggleChip = (chipId: string) => {
    setActiveChip((prev) => (prev === chipId ? null : chipId));
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[640px] px-4">
      {/* Context chips */}
      <div className="flex items-center gap-1.5 mb-2 justify-center">
        {contextChips.map((chip) => (
          <button
            key={chip.id}
            onClick={() => toggleChip(chip.id)}
            className={`font-mono text-[10px] tracking-wider px-2.5 py-1 border transition-all ${
              effectiveChip === chip.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background/80 hover:border-foreground/30"
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat input */}
      <div className="border border-border bg-background shadow-[0_-4px_24px_-8px_hsl(var(--foreground)/0.08)] backdrop-blur-sm">
        <div className="flex items-end gap-2 p-3">
          <button className="h-8 w-8 flex items-center justify-center border border-border hover:bg-accent/10 transition-colors shrink-0 mb-0.5">
            <Paperclip className="h-3.5 w-3.5" />
          </button>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask anything..."
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground font-mono min-h-[32px] max-h-[120px] py-1.5"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                setMessage("");
              }
            }}
          />

          <div className="flex items-center gap-1.5 shrink-0 mb-0.5">
            <button className="h-8 flex items-center gap-1 px-2 border border-border font-mono text-[10px] tracking-wider hover:bg-accent/10 transition-colors">
              <span>GPT-4</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            <button
              className="h-8 w-8 flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              onClick={() => setMessage("")}
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
