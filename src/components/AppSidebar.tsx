import { Home, Inbox, FolderKanban, Calendar, Bot, Settings, LogOut } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { title: "HOME", url: "/", icon: Home },
  { title: "INBOX", url: "/inbox", icon: Inbox },
  { title: "PROJECTS", url: "/projects", icon: FolderKanban },
  { title: "MEETINGS", url: "/meetings", icon: Calendar },
  { title: "AGENTS", url: "/agents", icon: Bot },
];

const bottomItems = [
  { title: "SETTINGS", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <div className="h-12 flex items-center px-4 border-b border-border">
        {!collapsed && (
          <span className="font-mono text-sm font-bold tracking-[0.3em]">UBIK</span>
        )}
        {collapsed && (
          <span className="font-mono text-sm font-bold">U</span>
        )}
      </div>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="rounded-none">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className={`flex items-center gap-3 px-4 py-2.5 font-mono text-xs tracking-wider transition-colors hover:text-primary ${
                        isActive(item.url)
                          ? "text-primary border-l-2 border-primary bg-accent/10"
                          : "border-l-2 border-transparent"
                      }`}
                      activeClassName=""
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border">
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild className="rounded-none">
                <NavLink
                  to={item.url}
                  className={`flex items-center gap-3 px-4 py-2.5 font-mono text-xs tracking-wider transition-colors hover:text-primary ${
                    isActive(item.url)
                      ? "text-primary border-l-2 border-primary"
                      : "border-l-2 border-transparent"
                  }`}
                  activeClassName=""
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton className="rounded-none">
              <button className="flex items-center gap-3 px-4 py-2.5 font-mono text-xs tracking-wider transition-colors hover:text-primary border-l-2 border-transparent w-full text-left">
                <LogOut className="h-4 w-4 shrink-0" />
                {!collapsed && <span>SIGN_OUT</span>}
              </button>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
