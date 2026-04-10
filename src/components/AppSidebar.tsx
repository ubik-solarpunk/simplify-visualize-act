import { useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  Calendar,
  FolderKanban,
  Radar,
  ShieldCheck,
  Workflow,
  Bot,
  Archive,
  Settings,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Search,
  Plus,
  Bell,
  Pin,
  MessageSquare,
  FlaskConical,
  FileText,
  Clock,
  LogOut,
  Sparkles,
  FolderPlus,
  CalendarPlus,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { pinnedItems, recentItems, type PinnedItemType, type RecentItemType } from "@/lib/mock-data";

// ─── NAV CONFIG ───

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
  statusDot?: "active" | "running" | "healthy" | "warning";
}

const navigateItems: NavItem[] = [
  { title: "Briefing", url: "/", icon: LayoutDashboard },
  { title: "Inbox", url: "/inbox", icon: Inbox, badge: "3" },
  { title: "Meetings", url: "/meetings", icon: Calendar },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Intelligence", url: "/intelligence", icon: Radar, statusDot: "active" },
  { title: "Approvals", url: "/approvals", icon: ShieldCheck, badge: "2" },
];

const executionItems: NavItem[] = [
  { title: "Workflows", url: "/workflows", icon: Workflow, statusDot: "running" },
  { title: "Agents", url: "/agents", icon: Bot, statusDot: "healthy" },
];

const utilityItems: NavItem[] = [
  { title: "Archive", url: "/archive", icon: Archive },
  { title: "Settings", url: "/settings", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

const createMenuItems = [
  { label: "Ask Ubik", icon: Sparkles },
  { label: "Start Research", icon: FlaskConical },
  { label: "New Project", icon: FolderPlus },
  { label: "New Workflow", icon: Workflow },
  { label: "Schedule Monitor", icon: CalendarPlus },
  { label: "Add Note", icon: StickyNote },
];

// ─── ICON MAPS ───

const pinnedTypeIcon: Record<PinnedItemType, LucideIcon> = {
  chat: MessageSquare,
  research: FlaskConical,
  project: FolderKanban,
  workflow: Workflow,
  meeting: Calendar,
};

const recentTypeIcon: Record<RecentItemType, LucideIcon> = {
  chat: MessageSquare,
  research: FlaskConical,
  project: FolderKanban,
  workflow: Workflow,
  meeting: Calendar,
  search: Search,
};

// ─── STATUS DOT ───

function StatusDot({ type }: { type: "active" | "running" | "healthy" | "warning" }) {
  const colors: Record<string, string> = {
    active: "bg-primary animate-pulse-dot",
    running: "bg-primary animate-pulse-dot",
    healthy: "bg-foreground/40",
    warning: "bg-primary",
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${colors[type]}`} />;
}

// ─── SECTION HEADER ───

function SectionLabel({
  label,
  open,
  onToggle,
  collapsed,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  collapsed: boolean;
}) {
  if (collapsed) return null;
  return (
    <button
      onClick={onToggle}
      className="flex w-full items-center justify-between px-4 py-2 font-mono text-[10px] tracking-[0.2em] text-foreground/40 hover:text-foreground/60 transition-colors uppercase"
    >
      <span>{label}</span>
      <ChevronRight
        className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-90" : ""}`}
      />
    </button>
  );
}

// ─── MAIN SIDEBAR ───

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const [navOpen, setNavOpen] = useState(true);
  const [execOpen, setExecOpen] = useState(true);
  const [pinnedOpen, setPinnedOpen] = useState(true);
  const [recentsOpen, setRecentsOpen] = useState(true);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // ─── Render a single nav item ───
  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.url);
    const content = (
      <NavLink
        to={item.url}
        end={item.url === "/"}
        className={`flex items-center gap-3 px-4 py-2 font-mono text-xs tracking-wide transition-colors group relative ${
          active
            ? "text-primary font-semibold"
            : "text-foreground/60 hover:text-foreground"
        }`}
        activeClassName=""
      >
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-5 bg-primary" />
        )}
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && (
              <span className="ml-auto font-mono text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 min-w-[20px] text-center leading-none">
                {item.badge}
              </span>
            )}
            {item.statusDot && <StatusDot type={item.statusDot} />}
          </>
        )}
        {collapsed && item.badge && (
          <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
        )}
        {collapsed && item.statusDot && (
          <span className="absolute top-1 right-1">
            <StatusDot type={item.statusDot} />
          </span>
        )}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip key={item.title}>
          <TooltipTrigger asChild>
            <SidebarMenuItem>{content}</SidebarMenuItem>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-mono text-xs">
            {item.title}
            {item.badge && <span className="ml-2 text-primary">({item.badge})</span>}
          </TooltipContent>
        </Tooltip>
      );
    }
    return <SidebarMenuItem key={item.title}>{content}</SidebarMenuItem>;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      {/* ═══ HEADER ═══ */}
      <div className="border-b border-border">
        {/* Brand + Collapse */}
        <div className="h-12 flex items-center justify-between px-4">
          {!collapsed ? (
            <span className="font-mono text-sm font-bold tracking-[0.3em]">UBIK</span>
          ) : (
            <span className="font-mono text-sm font-bold">U</span>
          )}
        </div>

        {/* Search */}
        {!collapsed ? (
          <div className="px-3 pb-2">
            <button
              onClick={() => {
                const e = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                document.dispatchEvent(e);
              }}
              className="flex w-full items-center gap-2 border border-border bg-sidebar-accent px-3 py-1.5 font-mono text-xs text-foreground/40 hover:text-foreground/60 hover:border-foreground/20 transition-colors"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="flex-1 text-left">Search anything</span>
              <kbd className="font-mono text-[10px] text-foreground/30 border border-border px-1 py-0.5">⌘K</kbd>
            </button>
          </div>
        ) : (
          <div className="px-2 pb-2 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => {
                    const e = new KeyboardEvent("keydown", { key: "k", metaKey: true });
                    document.dispatchEvent(e);
                  }}
                  className="p-1.5 text-foreground/40 hover:text-foreground transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-mono text-xs">Search ⌘K</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* + Create & Bell */}
        <div className={`px-3 pb-3 flex items-center ${collapsed ? "justify-center" : "gap-2"}`}>
          {!collapsed ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 border border-border px-3 py-1.5 font-mono text-xs text-foreground/70 hover:text-foreground hover:border-foreground/30 transition-colors flex-1">
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 font-mono text-xs">
                  {createMenuItems.map((item) => (
                    <DropdownMenuItem key={item.label} className="gap-2 py-2">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 text-foreground/40 hover:text-foreground transition-colors relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 bg-primary rounded-full" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-mono text-xs">Notifications</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 text-foreground/40 hover:text-foreground transition-colors">
                    <Plus className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-mono text-xs">Create</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="p-1.5 text-foreground/40 hover:text-foreground transition-colors relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-0.5 right-0.5 h-1.5 w-1.5 bg-primary rounded-full" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-mono text-xs">Notifications</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </div>

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      <SidebarContent className="overflow-y-auto">
        {/* ── NAVIGATE ── */}
        <div className="pt-1">
          <SectionLabel label="Navigate" open={navOpen} onToggle={() => setNavOpen(!navOpen)} collapsed={collapsed} />
          {(navOpen || collapsed) && (
            <SidebarMenu>{navigateItems.map(renderNavItem)}</SidebarMenu>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 border-b border-border" />

        {/* ── EXECUTION ── */}
        <div>
          <SectionLabel label="Execution" open={execOpen} onToggle={() => setExecOpen(!execOpen)} collapsed={collapsed} />
          {(execOpen || collapsed) && (
            <SidebarMenu>{executionItems.map(renderNavItem)}</SidebarMenu>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 border-b border-border" />

        {/* ── PINNED ── */}
        {!collapsed && (
          <div>
            <SectionLabel label="Pinned" open={pinnedOpen} onToggle={() => setPinnedOpen(!pinnedOpen)} collapsed={collapsed} />
            {pinnedOpen && (
              <div className="px-2 pb-1">
                {pinnedItems.slice(0, 5).map((item) => {
                  const Icon = pinnedTypeIcon[item.type];
                  return (
                    <button
                      key={item.id}
                      className="flex w-full items-center gap-2.5 px-2 py-1.5 text-left font-mono text-[11px] text-foreground/50 hover:text-foreground hover:bg-sidebar-accent transition-colors truncate"
                    >
                      <Pin className="h-3 w-3 shrink-0 text-foreground/25" />
                      <Icon className="h-3 w-3 shrink-0 text-foreground/30" />
                      <span className="truncate">{item.title}</span>
                    </button>
                  );
                })}
                <button className="px-2 py-1 font-mono text-[10px] text-foreground/30 hover:text-primary transition-colors tracking-wide">
                  View all →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Divider */}
        {!collapsed && <div className="mx-4 border-b border-border" />}

        {/* ── RECENTS ── */}
        {!collapsed && (
          <div>
            <SectionLabel label="Recents" open={recentsOpen} onToggle={() => setRecentsOpen(!recentsOpen)} collapsed={collapsed} />
            {recentsOpen && (
              <div className="px-2 pb-1">
                {recentItems.slice(0, 6).map((item) => {
                  const Icon = recentTypeIcon[item.type];
                  return (
                    <button
                      key={item.id}
                      className="flex w-full items-center gap-2.5 px-2 py-1.5 text-left font-mono text-[11px] text-foreground/50 hover:text-foreground hover:bg-sidebar-accent transition-colors group"
                    >
                      <Icon className="h-3 w-3 shrink-0 text-foreground/30" />
                      <span className="truncate flex-1">{item.title}</span>
                      <span className="font-mono text-[9px] text-foreground/20 group-hover:text-foreground/40 shrink-0">
                        {item.time}
                      </span>
                    </button>
                  );
                })}
                <button className="px-2 py-1 font-mono text-[10px] text-foreground/30 hover:text-primary transition-colors tracking-wide">
                  View all →
                </button>
              </div>
            )}
          </div>
        )}
      </SidebarContent>

      {/* ═══ FOOTER ═══ */}
      <SidebarFooter className="border-t border-border p-0">
        {/* Utility links */}
        <SidebarMenu>
          {utilityItems.map((item) => {
            if (collapsed) {
              return (
                <Tooltip key={item.title}>
                  <TooltipTrigger asChild>
                    <SidebarMenuItem>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-4 py-1.5 font-mono text-xs text-foreground/40 hover:text-foreground transition-colors"
                        activeClassName="text-primary"
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                      </NavLink>
                    </SidebarMenuItem>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-mono text-xs">{item.title}</TooltipContent>
                </Tooltip>
              );
            }
            return (
              <SidebarMenuItem key={item.title}>
                <NavLink
                  to={item.url}
                  className="flex items-center gap-3 px-4 py-1.5 font-mono text-xs text-foreground/40 hover:text-foreground transition-colors"
                  activeClassName="text-primary"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        {/* Profile */}
        <div className="border-t border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`flex w-full items-center gap-3 px-4 py-2.5 hover:bg-sidebar-accent transition-colors ${collapsed ? "justify-center" : ""}`}>
                <div className="h-7 w-7 shrink-0 bg-foreground/10 flex items-center justify-center font-mono text-xs font-semibold text-foreground/70">
                  A
                </div>
                {!collapsed && (
                  <>
                    <span className="font-mono text-xs text-foreground/70 flex-1 text-left truncate">Arjun M.</span>
                    <ChevronRight className="h-3 w-3 text-foreground/30" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-40 font-mono text-xs">
              <DropdownMenuItem className="gap-2 py-2">
                <Settings className="h-3.5 w-3.5" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 py-2 text-primary">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {!collapsed && (
            <div className="px-4 pb-2">
              <span className="font-mono text-[9px] text-foreground/20 tracking-wider">
                Business · Prod · v1.0.4
              </span>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
