import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Check, Circle, Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { usePublicOrder } from "@/hooks/usePublicOrder";
import { useKanban } from "@/hooks/useKanban";

export const Route = createFileRoute("/portal/$token")({ component: PortalPage });

function PortalPage() {
  const { token } = Route.useParams();
  const { order, isLoading, error } = usePublicOrder(token);
  const { columns } = useKanban();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4 text-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <X className="mx-auto h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-bold mb-2">Página não encontrada</h2>
            <p className="text-muted-foreground">O link pode ter expirado ou estar incorreto.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const cli = order.cliente;
  const veh = order.veiculo;
  const items = order.itens || [];
  const currentColumn = columns.find(c => c.id === order.coluna_id);

  // Mapeamento visual das etapas baseado na ordem das colunas no Kanban real
  const stages = columns.sort((a, b) => a.ordem - b.ordem).map(c => ({
    id: c.id,
    label: c.nome
  }));
  
  const currentIdx = stages.findIndex((s) => s.id === order.coluna_id);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"><Wrench className="h-5 w-5 text-primary-foreground" /></div>
          <div><div className="text-sm font-semibold">Oficina</div><div className="text-xs text-muted-foreground">Acompanhe seu serviço</div></div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">Olá {cli?.nome}, status atual:</div>
            <Badge className="mt-2 bg-primary px-4 py-2 text-base">
              {currentColumn?.nome || "Em processamento"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {stages.map((s, i) => {
                const done = i < currentIdx;
                const current = i === currentIdx;
                return (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full ${done ? "bg-success text-success-foreground" : current ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                      {done ? <Check className="h-4 w-4" /> : <Circle className="h-3 w-3" />}
                    </div>
                    <span className={`text-sm ${current ? "font-semibold" : done ? "" : "text-muted-foreground"}`}>{s.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-2">
            <h3 className="text-sm font-semibold">Veículo</h3>
            {veh ? (
              <p className="text-sm">{veh.marca} {veh.modelo} • Placa {veh.placa}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Veículo não identificado</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-2">
            <h3 className="text-sm font-semibold">O que será feito</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {items.filter((i) => i.tipo === "servico").length === 0 ? (
                <li className="text-muted-foreground italic">Aguardando diagnóstico</li>
              ) : (
                items.filter((i) => i.tipo === "servico").map((i) => <li key={i.id}>{i.nome}</li>)
              )}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
