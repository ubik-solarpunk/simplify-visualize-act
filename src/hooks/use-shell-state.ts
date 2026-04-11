import { useContext } from "react";

import { ShellStateContext } from "@/components/shell-state-context";

export function useShellState() {
  const context = useContext(ShellStateContext);
  if (!context) {
    throw new Error("useShellState must be used within ShellStateProvider");
  }

  return context;
}

export function useWorkbenchState<T>(slot: string, fallback: T) {
  const { activeTabId, getPageState, setPageState } = useShellState();
  const stateKey = `${activeTabId}:${slot}`;
  const value = getPageState(stateKey, fallback);

  return [
    value,
    (nextValue: T) => {
      setPageState(stateKey, nextValue);
    },
  ] as const;
}
