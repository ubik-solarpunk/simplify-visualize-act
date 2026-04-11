import { createContext } from "react";

import type { DrawerContent, RuntimeContent, WorkbenchTab } from "@/lib/ubik-types";

type PageStateMap = Record<string, unknown>;

export type ShellStateContextValue = {
  activeTabId: string;
  tabs: WorkbenchTab[];
  closedTabs: WorkbenchTab[];
  drawerContent: DrawerContent | null;
  runtimeContent: RuntimeContent | null;
  selectTab: (id: string) => void;
  closeTab: (id: string) => void;
  duplicateTab: (id: string) => void;
  moveTab: (id: string, direction: "left" | "right") => void;
  togglePin: (id: string) => void;
  reopenTab: (id: string) => void;
  openDrawer: (content: DrawerContent | null) => void;
  openRuntime: (content: RuntimeContent | null) => void;
  getPageState: <T>(key: string, fallback: T) => T;
  setPageState: <T>(key: string, value: T) => void;
};

export type ShellPageStateMap = PageStateMap;

export const ShellStateContext = createContext<ShellStateContextValue | null>(null);
