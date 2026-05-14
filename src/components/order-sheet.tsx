import { useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useStore, store } from "@/lib/store";
import {
  KANBAN_COLUMNS, clientById, vehicleById, priorityMeta, budgetMeta,
  formatBRL, initials, timeSince,
} from "@/lib/mock-data";
import { Send, ImagePlus, Plus } from "lucide-react";

export function OrderSheet({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const order = useStore((s) => s.orders.find((o) => o.id === orderId));
  const [tab, setTab] = useState("detalhes");

  if (!order) return null;
  const cli = clientById(order.clientId);
  const veh = vehicleById(order.vehicleId);
  const subTotal = order.items.reduce((acc, it) => acc + it.qty * it.unitPrice - it.discount, 0);

  return (
    <Sheet open={!!orderId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">{order.number}</span>
                <Badge className={priorityMeta[order.priority].className} variant="secondary">
                  {priorityMeta[order.priority].label}
                </Badge>
              </SheetTitle>
              <SheetDescription className="mt-1">
                {cli?.name} • {veh?.brand} {veh?.model} ({veh?.plate})
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="detalhes">Detalhes</TabsTrigger>
            <TabsTrigger value="itens">Itens</TabsTrigger>
            <TabsTrigger value="fotos">Fotos</TabsTrigger>
            <TabsTrigger value="historico">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="detalhes" className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Cliente" value={cli?.name} />
              <Field label="Telefone" value={cli?.phone} />
              <Field label="Veículo" value={`${veh?.brand} ${veh?.model} ${veh?.year}`} />
              <Field label="Placa" value={veh?.plate} />
              <Field label="KM Entrada" value={order.kmIn.toLocaleString("pt-BR")} />
              <Field label="Técnico" value={order.technician} />
              <Field label="Coluna atual" value={KANBAN_COLUMNS.find((c) => c.id === order.column)?.name} />
              <Field label="Tempo na coluna" value={timeSince(order.enteredColumnAt)} />
            </div>
            <Separator />
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Reclamação do cliente</div>
              <p className="text-sm">{order.complaint}</p>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => { store.updateOrder(order.id, { budgetStatus: "ENVIADO" }); toast.success("Orçamento enviado"); }}>
                <Send className="mr-1 h-4 w-4" /> Enviar Orçamento
              </Button>
              <Select onValueChange={(v) => { store.moveOrder(order.id, v as never); toast.success("OS movida"); }}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Mover coluna..." /></SelectTrigger>
                <SelectContent>
                  {KANBAN_COLUMNS.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-2 text-xs text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{formatBRL(order.total)}</div>
              <Badge className={`mt-1 ${budgetMeta[order.budgetStatus].className}`} variant="secondary">
                Orçamento {order.budgetStatus}
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="itens" className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" /> Adicionar item</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Desc.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">{it.type === "service" ? "Serviço" : "Peça"}</div>
                    </TableCell>
                    <TableCell className="text-right">{it.qty}</TableCell>
                    <TableCell className="text-right">{formatBRL(it.unitPrice)}</TableCell>
                    <TableCell className="text-right">{formatBRL(it.discount)}</TableCell>
                    <TableCell className="text-right font-medium">{formatBRL(it.qty * it.unitPrice - it.discount)}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-semibold">Subtotal</TableCell>
                  <TableCell className="text-right font-bold">{formatBRL(subTotal)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="fotos">
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center">
              <ImagePlus className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Nenhuma foto. Faça upload do check-in.</p>
              <Button variant="outline" size="sm">Adicionar foto</Button>
            </div>
          </TabsContent>

          <TabsContent value="historico">
            <ol className="relative space-y-4 border-l pl-4">
              {order.history.map((h, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="text-sm">
                    {h.from
                      ? `Movida de ${KANBAN_COLUMNS.find((c) => c.id === h.from)?.name} para ${KANBAN_COLUMNS.find((c) => c.id === h.to)?.name}`
                      : `Criada em ${KANBAN_COLUMNS.find((c) => c.id === h.to)?.name}`}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar className="h-4 w-4"><AvatarFallback className="text-[8px]">{initials(h.by)}</AvatarFallback></Avatar>
                    {h.by} • {new Date(h.at).toLocaleString("pt-BR")}
                  </div>
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

function Field({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value ?? "—"}</div>
    </div>
  );
}
