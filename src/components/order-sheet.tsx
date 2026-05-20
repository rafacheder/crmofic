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
import { useOrder } from "@/hooks/useOrder";
import { useKanban } from "@/hooks/useKanban";
import { useOsItens } from "@/hooks/useOsItens";
import { useOsFotos } from "@/hooks/useOsFotos";
import { AddOsItemDialog } from "@/components/add-os-item-dialog";
import {
  priorityMeta, budgetMeta,
  formatBRL, initials, timeSince,
} from "@/lib/mock-data";
import { Send, ImagePlus, Plus, Trash2, X, Loader2 } from "lucide-react";

export function OrderSheet({ orderId, onClose }: { orderId: string | null; onClose: () => void }) {
  const { order, isLoading, updateOrder, moveOrder } = useOrder(orderId);
  const { itens, removeItem } = useOsItens(orderId);
  const { columns } = useKanban();
  const [tab, setTab] = useState("detalhes");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  if (!orderId) return null;
  if (isLoading) return null;
  if (!order) return null;

  const prio = (order.prioridade ?? "NORMAL") as keyof typeof priorityMeta;
  const budgetStatus = (order.status_orcamento ?? "PENDENTE") as keyof typeof budgetMeta;
  const subTotal = itens.reduce((acc, it) => acc + Number(it.total), 0);

  return (
    <Sheet open={!!orderId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <span className="font-mono text-sm text-muted-foreground">{order.numero}</span>
                <Badge className={priorityMeta[prio]?.className} variant="secondary">
                  {priorityMeta[prio]?.label ?? order.prioridade}
                </Badge>
              </SheetTitle>
              <SheetDescription className="mt-1">
                {order.cliente?.nome} • {order.veiculo?.marca} {order.veiculo?.modelo} ({order.veiculo?.placa})
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
              <Field label="Cliente" value={order.cliente?.nome} />
              <Field label="Telefone" value={order.cliente?.telefone} />
              <Field label="Veículo" value={`${order.veiculo?.marca} ${order.veiculo?.modelo} ${order.veiculo?.ano ?? ""}`} />
              <Field label="Placa" value={order.veiculo?.placa} />
              <Field label="KM Entrada" value={order.km_entrada?.toLocaleString("pt-BR")} />
              <Field label="Coluna atual" value={columns.find((c) => c.id === order.coluna_id)?.nome} />
              <Field label="Tempo na coluna" value={order.updated_at ? timeSince(order.updated_at) : "—"} />
            </div>
            <Separator />
            <div>
              <div className="mb-1 text-xs text-muted-foreground">Reclamação do cliente</div>
              <p className="text-sm">{order.reclamacao || "—"}</p>
            </div>
            <Separator />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => { updateOrder({ status_orcamento: "ENVIADO" }); toast.success("Orçamento enviado"); }}>
                <Send className="mr-1 h-4 w-4" /> Enviar Orçamento
              </Button>
              <Select onValueChange={(v) => moveOrder({ fromId: order.coluna_id, toId: v })}>
                <SelectTrigger className="w-48"><SelectValue placeholder="Mover coluna..." /></SelectTrigger>
                <SelectContent>
                  {columns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="mb-2 text-xs text-muted-foreground">Total</div>
              <div className="text-2xl font-bold">{formatBRL(order.valor_total ?? 0)}</div>
              <Badge className={`mt-1 ${budgetMeta[budgetStatus]?.className}`} variant="secondary">
                Orçamento {budgetStatus}
              </Badge>
            </div>
          </TabsContent>

          <TabsContent value="itens" className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setAddDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Adicionar item
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Preço</TableHead>
                  <TableHead className="text-right">Desc.</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground italic">
                      Nenhum item adicionado à OS.
                    </TableCell>
                  </TableRow>
                ) : (
                  itens.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>
                        <div className="font-medium">{it.nome}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {it.tipo === "servico" ? "Serviço" : "Peça"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{it.quantidade}</TableCell>
                      <TableCell className="text-right">{formatBRL(it.preco_unitario)}</TableCell>
                      <TableCell className="text-right text-destructive">{it.desconto > 0 ? `-${formatBRL(it.desconto)}` : "—"}</TableCell>
                      <TableCell className="text-right font-medium">{formatBRL(it.total)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeItem(it.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                <TableRow>
                  <TableCell colSpan={4} className="text-right font-semibold">Subtotal</TableCell>
                  <TableCell className="text-right font-bold">{formatBRL(subTotal)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="fotos">
            <div className="grid grid-cols-2 gap-2">
              {(order.fotos ?? []).map((f: any) => (
                <div key={f.id} className="aspect-square rounded-md overflow-hidden border">
                   <img src={f.url} alt="Foto da OS" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed py-12 text-center mt-2">
              <ImagePlus className="h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Adicionar novas fotos.</p>
              <Button variant="outline" size="sm">Adicionar foto</Button>
            </div>
          </TabsContent>

          <TabsContent value="historico">
            <ol className="relative space-y-4 border-l pl-4">
              {(order.historico ?? []).map((h: any, i: number) => (
                <li key={h.id} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="text-sm">
                    {h.coluna_origem_id
                      ? `Movida de ${columns.find((c) => c.id === h.coluna_origem_id)?.nome} para ${columns.find((c) => c.id === h.coluna_destino_id)?.nome}`
                      : `Criada em ${columns.find((c) => c.id === h.coluna_destino_id)?.nome}`}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px]">{h.usuario?.nome ? initials(h.usuario.nome) : "??"}</AvatarFallback>
                    </Avatar>
                    {h.usuario?.nome ?? "Sistema"} • {new Date(h.created_at).toLocaleString("pt-BR")}
                  </div>
                </li>
              ))}
            </ol>
          </TabsContent>
        </Tabs>
        <AddOsItemDialog 
          osId={orderId} 
          open={addDialogOpen} 
          onOpenChange={setAddDialogOpen} 
        />
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
