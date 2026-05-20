import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Check, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { usePublicOrder } from "@/hooks/usePublicOrder";
import { formatBRL } from "@/lib/mock-data";

export const Route = createFileRoute("/budget/$token")({ component: BudgetPage });

function BudgetPage() {
  const { token } = Route.useParams();
  const { order, isLoading, error, approve, refuse, isUpdating } = usePublicOrder(token);

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
            <h2 className="text-xl font-bold mb-2">Orçamento não encontrado</h2>
            <p className="text-muted-foreground">O link pode ter expirado ou estar incorreto.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const veh = order.veiculo;
  const items = order.itens || [];
  const total = items.reduce((acc, it) => acc + (Number(it.total) || 0), 0);
  const decision = order.status_orcamento === "APROVADO" ? "approved" : order.status_orcamento === "RECUSADO" ? "refused" : null;

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"><Wrench className="h-5 w-5 text-primary-foreground" /></div>
          <div><div className="text-sm font-semibold">Oficina</div><div className="text-xs text-muted-foreground">Aprovação de Orçamento</div></div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-semibold mb-2">Veículo</h3>
            {veh ? (
              <p className="text-sm">{veh.marca} {veh.modelo} ({veh.ano}) • Placa {veh.placa}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Veículo não identificado</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Qtd</TableHead><TableHead className="text-right">Unit.</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground italic">Nenhum item lançado no orçamento.</TableCell>
                  </TableRow>
                ) : items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>{it.nome}</TableCell>
                    <TableCell className="text-right">{it.quantidade}</TableCell>
                    <TableCell className="text-right">{formatBRL(it.preco_unitario)}</TableCell>
                    <TableCell className="text-right">{formatBRL(it.total)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-3xl font-bold">{formatBRL(total)}</span>
            </div>
          </CardContent>
        </Card>
        {decision ? (
          <div className={`rounded-lg p-4 text-center ${decision === "approved" ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}>
            {decision === "approved" ? "✓ Orçamento aprovado! A oficina foi notificada." : "✗ Orçamento recusado."}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Button size="lg" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => approve()} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Check className="mr-2 h-5 w-5" />} Aprovar Orçamento
            </Button>
            <Button size="lg" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => refuse()} disabled={isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <X className="mr-2 h-5 w-5" />} Recusar
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
