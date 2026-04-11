import { MoreHorizontal, Pin, Plus, RotateCcw, X } from "lucide-react";

import { SmallButton } from "@/components/ubik-primitives";
import { useShellState } from "@/hooks/use-shell-state";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function WorkbenchTabs() {
  const {
    activeTabId,
    tabs,
    closedTabs,
    selectTab,
    closeTab,
    duplicateTab,
    moveTab,
    togglePin,
    reopenTab,
  } = useShellState();

  return (
    <div className="border-b border-border bg-card/80">
      <div className="flex items-center gap-2 overflow-x-auto px-4 py-2">
        {tabs.map((tab) => {
          const active = tab.id === activeTabId;

          return (
            <div
              key={tab.id}
              className={`flex items-center border ${
                active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground"
              }`}
            >
              <button
                className="flex min-w-[160px] items-center gap-2 px-3 py-2 text-left font-mono text-[11px] uppercase tracking-[0.14em]"
                onClick={() => selectTab(tab.id)}
              >
                {tab.pinned ? <Pin className="h-3.5 w-3.5" /> : null}
                <span className="truncate">{tab.title}</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="border-l border-current/20 px-2 py-2">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 font-mono text-[11px] uppercase tracking-[0.14em]">
                  <DropdownMenuItem onClick={() => togglePin(tab.id)}>
                    {tab.pinned ? "Unpin" : "Pin"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => duplicateTab(tab.id)}>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => moveTab(tab.id, "left")}>Move Left</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => moveTab(tab.id, "right")}>Move Right</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {tab.closable === false ? null : (
                <button className="border-l border-current/20 px-2 py-2" onClick={() => closeTab(tab.id)}>
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          );
        })}

        <div className="ml-auto flex items-center gap-2">
          {closedTabs.length ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SmallButton className="px-2">
                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
                  Reopen
                </SmallButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 font-mono text-[11px] uppercase tracking-[0.14em]">
                {closedTabs.map((tab) => (
                  <DropdownMenuItem key={tab.id} onClick={() => reopenTab(tab.id)}>
                    {tab.title}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <SmallButton onClick={() => duplicateTab(activeTabId)}>
            <Plus className="mr-2 h-3.5 w-3.5" />
            New Tab
          </SmallButton>
        </div>
      </div>
    </div>
  );
}
