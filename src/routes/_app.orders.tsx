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
import { useOrders } from "@/hooks/useOrders";
import { useKanban } from "@/hooks/useKanban";
import { priorityMeta, formatBRL } from "@/lib/mock-data";
import { OrderSheet } from "@/components/order-sheet";
import { NewOrderDialog } from "@/components/new-order-dialog";

export const Route = createFileRoute("/_app/orders")({ component: OrdersPage });

function OrdersPage() {
  const { orders, isLoading: isLoadingOrders } = useOrders();
  const { columns } = useKanban();
  const [col, setCol] = useState("ALL");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const filtered = orders.filter(
    (o) => (col === "ALL" || o.coluna_id === col)
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
              {columns.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
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
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Criação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingOrders ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">Carregando...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      Nenhum registro encontrado
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.map((o) => {
                const prio = (o.prioridade ?? "NORMAL") as keyof typeof priorityMeta;
                const colName = columns.find((c) => c.id === o.coluna_id)?.nome ?? "—";
                return (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => setOpenId(o.id)}>
                    <TableCell className="font-mono text-xs">{o.numero}</TableCell>
                    <TableCell>{o.cliente?.nome ?? "—"}</TableCell>
                    <TableCell>{o.veiculo?.placa ?? "—"} • {o.veiculo?.modelo ?? "—"}</TableCell>
                    <TableCell>{colName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={priorityMeta[prio]?.className}>
                        {priorityMeta[prio]?.label ?? o.prioridade}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatBRL(o.valor_total ?? 0)}</TableCell>
                    <TableCell>{o.created_at ? new Date(o.created_at).toLocaleDateString("pt-BR") : "—"}</TableCell>
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
