import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, RefreshCw, GripVertical } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useKanban } from "@/hooks/useKanban";
import { OrderSheet } from "@/components/order-sheet";
import { NewOrderDialog } from "@/components/new-order-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { OrdemServico } from "@/types/database";

export const Route = createFileRoute("/_app/kanban")({ component: KanbanPage });

function KanbanPage() {
  const { columns, orders, isLoading, moveCard } = useKanban();
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<string>("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [fromColumnId, setFromColumnId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const cli = o.cliente;
        const veh = o.veiculo;
        const term = search.toLowerCase();
        const matchSearch =
          !term ||
          cli?.nome?.toLowerCase().includes(term) ||
          veh?.placa?.toLowerCase().includes(term) ||
          o.numero?.toLowerCase().includes(term);
        const matchP = priority === "ALL" || o.prioridade === priority;
        return matchSearch && matchP;
      }),
    [orders, search, priority]
  );

  const handleDrop = (colId: string) => {
    if (!draggedId || !fromColumnId) return;
    if (fromColumnId !== colId) {
      moveCard(draggedId, fromColumnId, colId);
    }
    setDraggedId(null);
    setFromColumnId(null);
    setDragOver(null);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <AppHeader title="Kanban" />
        <div className="flex gap-4 overflow-x-auto">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-[600px] w-72 shrink-0" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <AppHeader title="Kanban" />
      <div className="flex flex-col gap-3 border-b bg-background px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente, placa ou OS..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Prioridade" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas prioridades</SelectItem>
              <SelectItem value="LOW">Baixa</SelectItem>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="HIGH">Alta</SelectItem>
              <SelectItem value="URGENT">Urgente</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => toast.success("Atualizado")}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button className="ml-auto" onClick={() => setNewOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Nova OS
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-3 overflow-x-auto p-4">
        {columns.map((col) => {
          const cards = filtered.filter((o) => o.coluna_id === col.id);
          return (
            <div
              key={col.id}
              className={`flex h-[calc(100vh-10rem)] w-72 shrink-0 flex-col rounded-lg border bg-muted/40 ${dragOver === col.id ? "ring-2 ring-primary" : ""}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
              onDragLeave={() => setDragOver((v) => (v === col.id ? null : v))}
              onDrop={() => handleDrop(col.id)}
            >
              <div className="flex items-center justify-between border-b bg-background/60 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ background: col.cor ?? "#6b7280" }} />
                  <span className="text-sm font-medium">{col.nome}</span>
                  <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">{cards.length}</Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setNewOpen(true)}>
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto p-2">
                {cards.map((o) => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    onClick={() => setOpenId(o.id)}
                    onDragStart={() => {
                      setDraggedId(o.id);
                      setFromColumnId(o.coluna_id);
                    }}
                  />
                ))}
                {cards.length === 0 && (
                  <div className="flex h-24 items-center justify-center rounded-md border border-dashed text-xs text-muted-foreground">
                    Sem OS
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <OrderSheet orderId={openId} onClose={() => setOpenId(null)} />
      <NewOrderDialog open={newOpen} onOpenChange={setNewOpen} />
    </>
  );
}

function OrderCard({
  order, onClick, onDragStart,
}: { order: OrdemServico; onClick: () => void; onDragStart: () => void }) {
  const cli = order.cliente;
  const veh = order.veiculo;

  const priorityColors: Record<string, string> = {
    LOW: "bg-blue-100 text-blue-700",
    NORMAL: "bg-green-100 text-green-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  const prio = (order.prioridade ?? "NORMAL").toUpperCase();
  const cliNome = cli?.nome ?? "—";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="group cursor-pointer rounded-md border bg-card p-3 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-mono text-muted-foreground">{order.numero}</span>
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100" />
      </div>
      <div className="mb-1 text-sm font-medium">{cliNome}</div>
      <div className="mb-2 text-xs text-muted-foreground">
        {veh?.placa} • {veh?.marca} {veh?.modelo}
      </div>
      <div className="mb-2 flex items-center gap-1.5">
        <Badge className={`h-5 px-1.5 text-[10px] font-medium ${priorityColors[prio] ?? ""}`} variant="secondary">
          {prio}
        </Badge>
        {order.status_orcamento && (
          <Badge className="h-5 px-1.5 text-[10px] font-medium" variant="outline">
            {order.status_orcamento}
          </Badge>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="bg-primary text-primary-foreground text-[9px]">
              {cliNome.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
        <span className="text-xs font-semibold">
          {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(order.valor_total ?? 0)}
        </span>
      </div>
    </div>
  );
}
