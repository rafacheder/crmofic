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
import { useStore, store } from "@/lib/store";
import {
  KANBAN_COLUMNS, type ColumnId, type Order, type Priority,
  clientById, vehicleById, priorityMeta, budgetMeta, timeSince, initials, formatBRL,
} from "@/lib/mock-data";
import { OrderSheet } from "@/components/order-sheet";
import { NewOrderDialog } from "@/components/new-order-dialog";

export const Route = createFileRoute("/_app/kanban")({ component: KanbanPage });

function KanbanPage() {
  const orders = useStore((s) => s.orders);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState<Priority | "ALL">("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<ColumnId | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        const cli = clientById(o.clientId);
        const veh = vehicleById(o.vehicleId);
        const term = search.toLowerCase();
        const matchSearch =
          !term ||
          cli?.name.toLowerCase().includes(term) ||
          veh?.plate.toLowerCase().includes(term) ||
          o.number.toLowerCase().includes(term);
        const matchP = priority === "ALL" || o.priority === priority;
        return matchSearch && matchP;
      }),
    [orders, search, priority]
  );

  const handleDrop = (col: ColumnId) => {
    if (!draggedId) return;
    const o = orders.find((x) => x.id === draggedId);
    if (o && o.column !== col) {
      store.moveOrder(draggedId, col);
      const colName = KANBAN_COLUMNS.find((c) => c.id === col)?.name;
      toast.success(`${o.number} movido para ${colName}`);
    }
    setDraggedId(null);
    setDragOver(null);
  };

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
          <Select value={priority} onValueChange={(v) => setPriority(v as Priority | "ALL")}>
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
        {KANBAN_COLUMNS.map((col) => {
          const cards = filtered.filter((o) => o.column === col.id);
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
                  <span className="h-2 w-2 rounded-full" style={{ background: col.color }} />
                  <span className="text-sm font-medium">{col.name}</span>
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
                    onDragStart={() => setDraggedId(o.id)}
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
}: { order: Order; onClick: () => void; onDragStart: () => void }) {
  const cli = clientById(order.clientId);
  const veh = vehicleById(order.vehicleId);
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="group cursor-pointer rounded-md border bg-card p-3 shadow-sm transition hover:shadow-md"
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="text-[11px] font-mono text-muted-foreground">{order.number}</span>
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 opacity-0 group-hover:opacity-100" />
      </div>
      <div className="mb-1 text-sm font-medium">{cli?.name}</div>
      <div className="mb-2 text-xs text-muted-foreground">
        {veh?.plate} • {veh?.brand} {veh?.model}
      </div>
      {order.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {order.tags.map((t) => (
            <Badge key={t} variant="outline" className="h-5 px-1.5 text-[10px]">{t}</Badge>
          ))}
        </div>
      )}
      <div className="mb-2 flex items-center gap-1.5">
        <Badge className={`h-5 px-1.5 text-[10px] font-medium ${priorityMeta[order.priority].className}`} variant="secondary">
          {priorityMeta[order.priority].label}
        </Badge>
        <Badge className={`h-5 px-1.5 text-[10px] font-medium ${budgetMeta[order.budgetStatus].className}`} variant="secondary">
          {order.budgetStatus}
        </Badge>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Avatar className="h-5 w-5">
            <AvatarFallback className="bg-primary text-primary-foreground text-[9px]">
              {initials(order.technician)}
            </AvatarFallback>
          </Avatar>
          <span className="text-[11px] text-muted-foreground">{timeSince(order.enteredColumnAt)}</span>
        </div>
        <span className="text-xs font-semibold">{formatBRL(order.total)}</span>
      </div>
    </div>
  );
}
