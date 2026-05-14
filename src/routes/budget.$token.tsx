import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Wrench, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { orders, vehicleById, formatBRL } from "@/lib/mock-data";

export const Route = createFileRoute("/budget/$token")({ component: BudgetPage });

function BudgetPage() {
  const { token } = Route.useParams();
  const order = orders.find((o) => o.id === token) ?? orders[0];
  const veh = vehicleById(order.vehicleId);
  const total = order.items.reduce((acc, it) => acc + it.qty * it.unitPrice - it.discount, 0);
  const [decision, setDecision] = useState<"approved" | "refused" | null>(null);

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary"><Wrench className="h-5 w-5 text-primary-foreground" /></div>
          <div><div className="text-sm font-semibold">Auto Center Silva</div><div className="text-xs text-muted-foreground">Aprovação de Orçamento</div></div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl space-y-4 p-4">
        <Card><CardContent className="pt-6"><h3 className="text-sm font-semibold">Veículo</h3><p className="text-sm">{veh?.brand} {veh?.model} ({veh?.year}) • Placa {veh?.plate}</p></CardContent></Card>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader><TableRow><TableHead>Item</TableHead><TableHead className="text-right">Qtd</TableHead><TableHead className="text-right">Unit.</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader>
              <TableBody>
                {order.items.map((it) => (
                  <TableRow key={it.id}>
                    <TableCell>{it.name}</TableCell>
                    <TableCell className="text-right">{it.qty}</TableCell>
                    <TableCell className="text-right">{formatBRL(it.unitPrice)}</TableCell>
                    <TableCell className="text-right">{formatBRL(it.qty * it.unitPrice - it.discount)}</TableCell>
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
            <Button size="lg" className="bg-success text-success-foreground hover:bg-success/90" onClick={() => setDecision("approved")}>
              <Check className="mr-2 h-5 w-5" /> Aprovar Orçamento
            </Button>
            <Button size="lg" variant="outline" className="border-destructive text-destructive hover:bg-destructive/10" onClick={() => setDecision("refused")}>
              <X className="mr-2 h-5 w-5" /> Recusar
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
