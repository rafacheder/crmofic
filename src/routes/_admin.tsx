import { createFileRoute, Navigate, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/hooks/useAdmin";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Building2, CreditCard, Settings, LogOut, ShieldCheck, Menu, X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin")({ component: AdminLayout });

const navItems = [
  { to: "/admin",          label: "Dashboard",  icon: LayoutDashboard, exact: true },
  { to: "/admin/oficinas", label: "Oficinas",   icon: Building2 },
  { to: "/admin/planos",   label: "Planos",     icon: CreditCard },
];

function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const { isSuperAdmin, isCheckingAdmin } = useAdmin();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading || isCheckingAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;
  if (!isSuperAdmin) return <Navigate to="/kanban" />;

  const handleLogout = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-900 transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold leading-none">Super Admin</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">CRM Oficinas</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100 [&.active]:bg-zinc-800 [&.active]:text-white"
              onClick={() => setMobileOpen(false)}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-zinc-800 p-3">
          <div className="mb-2 rounded-lg bg-zinc-800/50 px-3 py-2">
            <p className="text-xs font-medium truncate">{user.email}</p>
            <Badge variant="outline" className="mt-1 h-4 border-red-500/50 text-[10px] text-red-400">
              Super Admin
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-zinc-400 hover:text-red-400"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-3 border-b border-zinc-800 bg-zinc-900 px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="font-semibold">Super Admin</span>
        </header>

        <main className="flex-1 overflow-auto bg-zinc-950 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
