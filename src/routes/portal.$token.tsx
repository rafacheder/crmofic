import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Check, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { orders, clientById, vehicleById, KANBAN_COLUMNS } from "@/lib/mock-data";

export const Route = createFileRoute("/portal/$token")({ component: PortalPage });

function PortalPage() {
  const { token } = Route.useParams();
  const order = orders.find((o) => o.id === token) ?? orders[0];
  const cli = clientById(order.clientId);
  const veh = vehicleById(order.vehicleId);
  const stages = [
    { id: "recepcao", label: "Recebido" },
    { id: "diagnostico", label: "Diagnóstico" },
    { id: "aprovacao", label: "Aprovação" },
    { id: "execucao", label: "Em Execução" },
    { id: "pronto", label: "Pronto" },
    { id: "entregue", label: "Entregue" },
  ];
  const currentIdx = stages.findIndex((s) => s.id === order.column);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"><Wrench className="h-5 w-5 text-primary-foreground" /></div>
          <div><div className="text-sm font-semibold">Auto Center Silva</div><div className="text-xs text-muted-foreground">Acompanhe seu serviço</div></div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-xs text-muted-foreground">Olá {cli?.name}, status atual:</div>
            <Badge className="mt-2 bg-primary px-4 py-2 text-base">{KANBAN_COLUMNS.find((c) => c.id === order.column)?.name}</Badge>
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
            <p className="text-sm">{veh?.brand} {veh?.model} • Placa {veh?.plate}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-2">
            <h3 className="text-sm font-semibold">O que será feito</h3>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {order.items.filter((i) => i.type === "service").map((i) => <li key={i.id}>{i.name}</li>)}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
