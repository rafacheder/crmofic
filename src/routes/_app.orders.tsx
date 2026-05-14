import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileText, Plus } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useStore } from "@/lib/store";
import {
  KANBAN_COLUMNS, clientById, vehicleById, priorityMeta, formatBRL,
} from "@/lib/mock-data";
import { OrderSheet } from "@/components/order-sheet";
import { NewOrderDialog } from "@/components/new-order-dialog";

export const Route = createFileRoute("/_app/orders")({ component: OrdersPage });

function OrdersPage() {
  const orders = useStore((s) => s.orders);
  const [tech, setTech] = useState("ALL");
  const [col, setCol] = useState("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const filtered = orders.filter(
    (o) => (tech === "ALL" || o.technician === tech) && (col === "ALL" || o.column === col)
  );

  return (
    <>
      <AppHeader title="Ordens de Serviço" />
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={col} onValueChange={setCol}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Coluna" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todas colunas</SelectItem>
              {KANBAN_COLUMNS.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={tech} onValueChange={setTech}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Técnico" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos técnicos</SelectItem>
              <SelectItem value="Carlos M.">Carlos M.</SelectItem>
              <SelectItem value="Bruno L.">Bruno L.</SelectItem>
            </SelectContent>
          </Select>
          <Button className="ml-auto" onClick={() => setNewOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Nova OS
          </Button>
        </div>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Coluna</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Técnico</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Criação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      Nenhum registro encontrado
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.map((o) => {
                const cli = clientById(o.clientId);
                const veh = vehicleById(o.vehicleId);
                return (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => setOpenId(o.id)}>
                    <TableCell className="font-mono text-xs">{o.number}</TableCell>
                    <TableCell>{cli?.name}</TableCell>
                    <TableCell>{veh?.plate} • {veh?.model}</TableCell>
                    <TableCell>{KANBAN_COLUMNS.find((c) => c.id === o.column)?.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={priorityMeta[o.priority].className}>
                        {priorityMeta[o.priority].label}
                      </Badge>
                    </TableCell>
                    <TableCell>{o.technician}</TableCell>
                    <TableCell className="text-right">{formatBRL(o.total)}</TableCell>
                    <TableCell>{new Date(o.createdAt).toLocaleDateString("pt-BR")}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <OrderSheet orderId={openId} onClose={() => setOpenId(null)} />
      <NewOrderDialog open={newOpen} onOpenChange={setNewOpen} />
    </>
  );
}
