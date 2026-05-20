import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Calendar as CalendarIcon, Check, X } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore, store } from "@/lib/store";
import { useClients, useVehicles } from "@/hooks/useOrders";
import { type Appointment } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/appointments")({ component: AppointmentsPage });

const statusColor: Record<Appointment["status"], string> = {
  PENDENTE: "bg-muted text-muted-foreground",
  CONFIRMADO: "bg-primary/15 text-primary",
  "EM ANDAMENTO": "bg-warning/20 text-warning-foreground",
  CONCLUÍDO: "bg-success/15 text-success",
  CANCELADO: "bg-destructive/15 text-destructive",
  "NÃO COMPARECEU": "bg-destructive/10 text-destructive",
};

function AppointmentsPage() {
  const items = useStore((s) => s.appointments);
  const { data: clients = [] } = useClients();
  const [status, setStatus] = useState("ALL");
  const [open, setOpen] = useState(false);

  const filtered = items.filter((a) => status === "ALL" || a.status === status);

  return (
    <>
      <AppHeader title="Agendamentos" />
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos status</SelectItem>
              {(Object.keys(statusColor) as Appointment["status"][]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="ml-auto" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> Novo Agendamento</Button>
        </div>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Serviços</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                    <CalendarIcon className="h-8 w-8" /> Nenhum agendamento
                  </div>
                </TableCell></TableRow>
              ) : filtered.map((a) => {
                const cli = clients.find((c: any) => c.id === a.clientId) as any;
                return (
                  <TableRow key={a.id}>
                    <TableCell>{new Date(a.datetime).toLocaleString("pt-BR")}</TableCell>
                    <TableCell>{cli?.nome ?? "—"}</TableCell>
                    <TableCell>{a.vehicleId}</TableCell>
                    <TableCell>{a.services.join(", ")}</TableCell>
                    <TableCell><Badge variant="secondary" className={statusColor[a.status]}>{a.status}</Badge></TableCell>
                    <TableCell className="flex gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { store.updateAppointment(a.id, { status: "CONFIRMADO" }); toast.success("Confirmado"); }}>
                        <Check className="h-4 w-4 text-success" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { store.updateAppointment(a.id, { status: "CANCELADO" }); toast.success("Cancelado"); }}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <NewAppointmentDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function NewAppointmentDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: clients = [] } = useClients();
  const [clientId, setClientId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const { data: vehicles = [] } = useVehicles(clientId);
  const [datetime, setDatetime] = useState("");
  const [svc, setSvc] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo Agendamento</DialogTitle></DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!clientId || !vehicleId || !datetime) return toast.error("Preencha todos os campos");
            store.addAppointment({
              id: `a${Date.now()}`, datetime: new Date(datetime).toISOString(),
              clientId, vehicleId, services: svc.split(",").map((s) => s.trim()).filter(Boolean),
              status: "PENDENTE",
            });
            toast.success("Agendamento criado");
            onOpenChange(false);
          }}
        >
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={(v) => { setClientId(v); setVehicleId(""); }}>
              <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
              <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Veículo</Label>
            <Select value={vehicleId} onValueChange={setVehicleId} disabled={!clientId}>
              <SelectTrigger><SelectValue placeholder="Veículo" /></SelectTrigger>
              <SelectContent>{vehicles.map((v: any) => <SelectItem key={v.id} value={v.id}>{v.placa} — {v.modelo}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>Data/Hora</Label><Input type="datetime-local" value={datetime} onChange={(e) => setDatetime(e.target.value)} /></div>
          <div className="space-y-2"><Label>Serviços (separados por vírgula)</Label><Input value={svc} onChange={(e) => setSvc(e.target.value)} placeholder="Troca de óleo, alinhamento" /></div>
          <DialogFooter><Button type="submit">Criar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
