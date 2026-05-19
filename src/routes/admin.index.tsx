import { createFileRoute } from "@tanstack/react-router";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, TrendingUp, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/admin-status-badge";
// Removida exportação desnecessária de StatusBadge

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const { oficinas, isLoadingOficinas } = useAdmin();

  const stats = {
    total: oficinas.length,
    ativas: oficinas.filter((o) => o.status === "ativo").length,
    trial: oficinas.filter((o) => o.status === "trial").length,
    suspensas: oficinas.filter((o) => o.status === "suspenso").length,
    mrr: oficinas
      .filter((o) => o.status === "ativo")
      .reduce((sum, o) => sum + (o.plano_preco ?? 0), 0),
  };

  const cards = [
    { label: "Total de Oficinas", value: stats.total, icon: Building2, color: "text-blue-400" },
    { label: "Ativas",            value: stats.ativas, icon: TrendingUp, color: "text-emerald-400" },
    { label: "Em Trial",          value: stats.trial,   icon: Users,     color: "text-amber-400" },
    { label: "Suspensas",         value: stats.suspensas, icon: AlertCircle, color: "text-red-400" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-sm text-zinc-500">Visão geral do sistema</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label} className="border-zinc-800 bg-zinc-900">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-zinc-400">{c.label}</CardTitle>
              <c.icon className={`h-4 w-4 ${c.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-100">
                {isLoadingOficinas ? "—" : c.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300">
            MRR Estimado (oficinas ativas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-emerald-400">
            {isLoadingOficinas
              ? "—"
              : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.mrr)}
          </p>
          <p className="mt-1 text-xs text-zinc-500">Receita mensal recorrente</p>
        </CardContent>
      </Card>

      {/* Últimas oficinas cadastradas */}
      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-sm text-zinc-300">Últimas oficinas cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingOficinas ? (
            <p className="text-sm text-zinc-500">Carregando...</p>
          ) : (
            <div className="space-y-2">
              {oficinas.slice(0, 5).map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-2">
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{o.nome}</p>
                    <p className="text-xs text-zinc-500">{o.total_usuarios} usuário(s) · {o.total_ordens} OS</p>
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

