import { createFileRoute } from "@tanstack/react-router";
import { useAdmin } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export const Route = createFileRoute("/_admin/planos")({ component: AdminPlanos });

const featLabels: Record<string, string> = {
  kanban: "Kanban",
  clientes: "Clientes",
  veiculos: "Veículos",
  ordens: "Ordens de Serviço",
  lembretes: "Lembretes",
  agendamentos: "Agendamentos",
  portal: "Portal do Cliente",
  whatsapp: "WhatsApp / Whaticket",
  catalogo: "Catálogo",
  automacoes: "Automações Kanban",
  api: "Acesso à API",
  relatorios: "Relatórios avançados",
};

export default function AdminPlanos() {
  const { planos } = useAdmin();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Planos</h1>
        <p className="text-sm text-zinc-500">Configuração dos planos disponíveis</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {planos.map((p) => (
          <Card key={p.id} className="border-zinc-700 bg-zinc-900">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-zinc-100">{p.nome}</CardTitle>
                <Badge
                  variant="outline"
                  className={p.ativo
                    ? "border-emerald-500/50 text-emerald-400"
                    : "border-zinc-600 text-zinc-500"}
                >
                  {p.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-zinc-100 mt-2">
                {p.preco === 0
                  ? "Grátis"
                  : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.preco)}
                {p.preco > 0 && <span className="text-sm font-normal text-zinc-500">/mês</span>}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1 text-xs text-zinc-400">
                <p>👤 {p.limite_usuarios ?? "∞"} usuário(s)</p>
                <p>📋 {p.limite_ordens_mes ?? "∞"} OS/mês</p>
              </div>
              <div className="mt-3 space-y-1.5">
                {(p.funcionalidades as string[]).map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                    <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                    {featLabels[f] ?? f}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-xs text-zinc-600">
        Para editar os planos, use o Supabase SQL Editor na tabela <code className="text-zinc-500">planos</code>.
      </p>
    </div>
  );
}
