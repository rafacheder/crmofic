import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { toast } from "sonner";
import {
  Wrench, Kanban, FileText, Users, Calendar, Bell,
  MessageSquare, Package, Settings, LogOut, User,
  LayoutDashboard, Building2, CreditCard
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader,
  SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

const adminItems = [
  { title: "Admin Dashboard", url: "/admin", icon: LayoutDashboard, exact: true },
  { title: "Oficinas", url: "/admin/oficinas", icon: Building2 },
  { title: "Planos", url: "/admin/planos", icon: CreditCard },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const path = useRouterState({ select: (r) => r.location.pathname });
  const navigate = useNavigate();
  const { usuario, signOut } = useAuth();
  const { isSuperAdmin } = useAdmin();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Sessão encerrada");
      navigate({ to: "/login" });
    } catch (e) {
      toast.error("Erro ao sair");
    }
  };

  const getIniciais = (nome: string) => {
    if (!nome) return "??";
    const parts = nome.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  const formatCargo = (cargo: string | null) => {
    if (!cargo) return "";
    const map: Record<string, string> = {
      DONO: "Dono",
      GERENTE: "Gerente",
      TECNICO: "Técnico",
      RECEPCAO: "Recepção",
    };
    return map[cargo] || cargo;
  };

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

        {isSuperAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Administração</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => {
                  const active = item.exact 
                    ? path === item.url 
                    : path.startsWith(item.url);
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
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-2 rounded-md p-2 hover:bg-sidebar-accent">
              <Avatar className="h-8 w-8">
                {usuario?.avatar_url && <AvatarImage src={usuario.avatar_url} />}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {usuario?.nome ? getIniciais(usuario.nome) : "??"}
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <div className="flex flex-1 flex-col items-start leading-tight">
                  <span className="text-sm font-medium text-sidebar-foreground truncate max-w-[140px]">
                    {usuario?.nome || "Carregando..."}
                  </span>
                  <span className="text-[10px] text-sidebar-foreground/60">{formatCargo(usuario?.cargo || null)}</span>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="right" className="w-48">
            <DropdownMenuItem asChild>
              <Link to="/settings" search={{ tab: "profile" }}>
                <User className="mr-2 h-4 w-4" /> Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/settings"><Settings className="mr-2 h-4 w-4" /> Configurações</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut}><LogOut className="mr-2 h-4 w-4" /> Sair</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
