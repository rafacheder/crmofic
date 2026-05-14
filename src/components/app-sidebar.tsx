import { Link, useRouterState } from "@tanstack/react-router";
import {
  Wrench, Kanban, FileText, Users, Calendar, Bell,
  MessageSquare, Package, Settings, LogOut, User,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const items = [
  { title: "Kanban", url: "/kanban", icon: Kanban },
  { title: "Ordens de Serviço", url: "/orders", icon: FileText },
  { title: "Clientes", url: "/clients", icon: Users },
  { title: "Agendamentos", url: "/appointments", icon: Calendar },
  { title: "Lembretes", url: "/reminders", icon: Bell },
  { title: "Inbox WhatsApp", url: "/inbox", icon: MessageSquare },
  { title: "Catálogo", url: "/catalog", icon: Package },
  { title: "Configurações", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/kanban" className="flex items-center gap-2 px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary">
            <Wrench className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold text-sidebar-foreground">CRM Oficinas</span>
              <span className="text-[10px] text-sidebar-foreground/60">Gestão automotiva</span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = path.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">AR</AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-1 flex-col items-start leading-tight">
                  <span className="text-sm text-sidebar-foreground">Ana Ribeiro</span>
                  <span className="text-[10px] text-sidebar-foreground/60">Dono</span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-48">
            <DropdownMenuItem><User className="mr-2 h-4 w-4" /> Perfil</DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/settings"><Settings className="mr-2 h-4 w-4" /> Configurações</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/login"><LogOut className="mr-2 h-4 w-4" /> Sair</Link></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
