import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, List, ListOrdered, Minus, Pilcrow, Quote, Shapes, Type } from "lucide-react";

import { SmallButton } from "@/components/ubik-primitives";
import { cn } from "@/lib/utils";

type EditorCommand = {
  key: string;
  label: string;
  trigger: string;
  aliases: string[];
  icon: React.ReactNode;
  template: string;
};

type SlashState = {
  start: number;
  end: number;
  query: string;
};

const commands: EditorCommand[] = [
  {
    key: "heading",
    label: "Heading",
    trigger: "heading",
    aliases: ["heading", "h1", "title"],
    icon: <Type className="h-3.5 w-3.5" />,
    template: "## Heading\n",
  },
  {
    key: "subheading",
    label: "Subheading",
    trigger: "subheading",
    aliases: ["subheading", "h2", "subtitle"],
    icon: <Pilcrow className="h-3.5 w-3.5" />,
    template: "### Subheading\n",
  },
  {
    key: "bullet",
    label: "Bulleted List",
    trigger: "bullet",
    aliases: ["bullet", "list", "ul"],
    icon: <List className="h-3.5 w-3.5" />,
    template: "- Item\n",
  },
  {
    key: "numbered",
    label: "Numbered List",
    trigger: "numbered",
    aliases: ["numbered", "list", "ol", "number"],
    icon: <ListOrdered className="h-3.5 w-3.5" />,
    template: "1. Item\n",
  },
  {
    key: "quote",
    label: "Quote",
    trigger: "quote",
    aliases: ["quote", "callout"],
    icon: <Quote className="h-3.5 w-3.5" />,
    template: "> Note\n",
  },
  {
    key: "divider",
    label: "Divider",
    trigger: "divider",
    aliases: ["divider", "line", "separator"],
    icon: <Minus className="h-3.5 w-3.5" />,
    template: "---\n",
  },
  {
    key: "diagram",
    label: "Diagram Block",
    trigger: "diagram",
    aliases: ["diagram", "mermaid", "flow"],
    icon: <Shapes className="h-3.5 w-3.5" />,
    template: "```mermaid\ngraph LR\nA[Start] --> B[Decision]\n```\n",
  },
];

function toDocsSafeText(text: string) {
  const lines = text.split("\n");
  const out: string[] = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      out.push(line.replace(/^###\s+/, "").trim());
      out.push("");
      continue;
    }
    if (line.startsWith("## ")) {
      out.push(line.replace(/^##\s+/, "").trim());
      out.push("");
      continue;
    }
    if (line.startsWith("# ")) {
      out.push(line.replace(/^#\s+/, "").trim());
      out.push("");
      continue;
    }
    if (line === "---") {
      out.push("────────");
      continue;
    }
    out.push(line);
  }

  return out.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

function findSlashState(text: string, cursor: number): SlashState | null {
  const lineStart = text.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  const lineText = text.slice(lineStart, cursor);
  const slashOnLine = lineText.lastIndexOf("/");

  if (slashOnLine < 0) return null;

  const beforeSlash = slashOnLine === 0 ? "" : lineText[slashOnLine - 1];
  if (beforeSlash && !/\s/.test(beforeSlash)) return null;

  const query = lineText.slice(slashOnLine + 1);
  if (/\s/.test(query)) return null;

  return {
    start: lineStart + slashOnLine,
    end: cursor,
    query: query.toLowerCase(),
  };
}

export function RichOperatorEditor({
  value,
  onChange,
  placeholder,
  minHeight = 150,
  showInsertBlock = true,
  showMarkdownCopy = true,
  compactCopyActions = false,
  className,
}: {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  minHeight?: number;
  showInsertBlock?: boolean;
  showMarkdownCopy?: boolean;
  compactCopyActions?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  const [cursor, setCursor] = useState(0);
  const [highlighted, setHighlighted] = useState(0);
  const [menuSuppressed, setMenuSuppressed] = useState(false);

  const slashState = useMemo(() => findSlashState(value, cursor), [value, cursor]);

  const filteredCommands = useMemo(() => {
    if (!slashState) return commands;
    if (!slashState.query) return commands;

    return commands.filter((command) => {
      return command.trigger.startsWith(slashState.query) || command.aliases.some((alias) => alias.startsWith(slashState.query));
    });
  }, [slashState]);

  const menuOpen = Boolean(slashState && !menuSuppressed);

  useEffect(() => {
    setHighlighted(0);
  }, [slashState?.query]);

  const syncCursorFromTarget = (target: HTMLTextAreaElement) => {
    setCursor(target.selectionStart ?? 0);
    setMenuSuppressed(false);
  };

  const replaceRange = (start: number, end: number, text: string) => {
    const nextValue = `${value.slice(0, start)}${text}${value.slice(end)}`;
    onChange(nextValue);

    requestAnimationFrame(() => {
      if (!ref.current) return;
      const nextCursor = start + text.length;
      ref.current.focus();
      ref.current.selectionStart = nextCursor;
      ref.current.selectionEnd = nextCursor;
      setCursor(nextCursor);
    });
  };

  const applyCommand = (command: EditorCommand) => {
    if (slashState) {
      replaceRange(slashState.start, slashState.end, command.template);
    } else {
      const end = value.length;
      const prefixed = end > 0 && !value.endsWith("\n") ? `\n${command.template}` : command.template;
      replaceRange(end, end, prefixed);
    }
    setMenuSuppressed(false);
  };

  const copyText = async (mode: "docs" | "markdown") => {
    const text = mode === "docs" ? toDocsSafeText(value) : value;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Ignore clipboard failures.
    }
  };

  return (
    <div className={cn("border border-border bg-card", className)}>
      <div className="flex items-center justify-end gap-2 border-b border-border px-2 py-2">
        <button
          aria-label="Copy draft"
          className={cn(
            "inline-flex items-center gap-1 border border-border bg-background px-2 py-1 text-xs text-muted-foreground",
            compactCopyActions ? "h-7 w-7 justify-center rounded-full border-border/70 p-0" : "",
          )}
          onClick={() => copyText("docs")}
          title="Copy draft"
          type="button"
        >
          <Copy className="h-3.5 w-3.5" />
          {!compactCopyActions ? "Copy Docs-safe" : null}
        </button>
        {showMarkdownCopy ? (
          <button
            aria-label="Copy markdown"
            className="inline-flex items-center gap-1 border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
            onClick={() => copyText("markdown")}
            type="button"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy Markdown
          </button>
        ) : null}
      </div>

      <div className="relative">
        <textarea
          ref={ref}
          className="w-full resize-none bg-background px-3 py-3 text-sm text-foreground outline-none"
          onChange={(event) => {
            onChange(event.target.value);
            syncCursorFromTarget(event.target);
          }}
          onClick={(event) => syncCursorFromTarget(event.currentTarget)}
          onKeyDown={(event) => {
            if (!menuOpen || filteredCommands.length === 0) {
              if (event.key === "Escape") setMenuSuppressed(true);
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setHighlighted((current) => (current + 1) % filteredCommands.length);
              return;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setHighlighted((current) => (current - 1 + filteredCommands.length) % filteredCommands.length);
              return;
            }

            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              const selected = filteredCommands[Math.min(highlighted, filteredCommands.length - 1)];
              if (selected) applyCommand(selected);
              return;
            }

            if (event.key === "Escape") {
              event.preventDefault();
              setMenuSuppressed(true);
            }
          }}
          onSelect={(event) => syncCursorFromTarget(event.currentTarget)}
          placeholder={placeholder ?? "Type / for headings, lists, quotes, dividers, or diagrams."}
          style={{ minHeight }}
          value={value}
        />

        {menuOpen ? (
          <div className="absolute left-3 right-3 top-3 z-20 border border-border bg-card">
            <div className="border-b border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Commands
            </div>
            <div className="max-h-48 overflow-y-auto py-1">
              {filteredCommands.map((command, index) => {
                const active = index === highlighted;
                return (
                  <button
                    key={command.key}
                    className={cn(
                      "flex w-full items-center justify-between px-2 py-1.5 text-left text-sm",
                      active ? "bg-background text-foreground" : "text-muted-foreground",
                    )}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      applyCommand(command);
                    }}
                    type="button"
                  >
                    <span className="inline-flex items-center gap-2">
                      {command.icon}
                      {command.label}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">/{command.trigger}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      {showInsertBlock ? (
        <div className="border-t border-border px-2 py-2">
          <SmallButton
            className="text-[10px]"
            onClick={() => {
              const el = ref.current;
              if (!el) return;
              const nextValue = `${value.slice(0, el.selectionStart)}/${value.slice(el.selectionEnd)}`;
              onChange(nextValue);
              const nextCursor = (el.selectionStart ?? 0) + 1;
              requestAnimationFrame(() => {
                if (!ref.current) return;
                ref.current.focus();
                ref.current.selectionStart = nextCursor;
                ref.current.selectionEnd = nextCursor;
                setCursor(nextCursor);
                setMenuSuppressed(false);
                setHighlighted(0);
              });
            }}
            type="button"
          >
            / Insert block
          </SmallButton>
        </div>
      ) : null}
    </div>
  );
}
