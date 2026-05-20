import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Bell } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useStore, store } from "@/lib/store";
import { useClients } from "@/hooks/useOrders";
import { type Reminder } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reminders")({ component: RemindersPage });

const statusColor: Record<Reminder["status"], string> = {
  PENDENTE: "bg-muted text-muted-foreground",
  ENVIADO: "bg-success/15 text-success",
  FALHOU: "bg-destructive/15 text-destructive",
  CANCELADO: "bg-muted text-muted-foreground",
};

function RemindersPage() {
  const items = useStore((s) => s.reminders);
  const { data: clients = [] } = useClients();
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [open, setOpen] = useState(false);

  const filtered = items.filter((r) => (type === "ALL" || r.type === type) && (status === "ALL" || r.status === status));

  return (
    <>
      <AppHeader title="Lembretes" />
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos tipos</SelectItem>
              {["Troca de Óleo", "Revisão Geral", "Rodízio", "Alinhamento", "Filtro", "Aniversário", "Personalizado"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              {(Object.keys(statusColor) as Reminder["status"][]).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button className="ml-auto" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> Novo Lembrete</Button>
        </div>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Veículo</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Quando</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow><TableCell colSpan={6}>
                  <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                    <Bell className="h-8 w-8" /> Nenhum lembrete
                  </div>
                </TableCell></TableRow>
              ) : filtered.map((r) => {
                const cli = clients.find((c: any) => c.id === r.clientId) as any;
                return (
                  <TableRow key={r.id}>
                    <TableCell>{r.type}</TableCell>
                    <TableCell>{cli?.nome ?? "—"}</TableCell>
                    <TableCell>{r.vehicleId ?? "—"}</TableCell>
                    <TableCell>{r.channel}</TableCell>
                    <TableCell>{r.scheduledAt ? new Date(r.scheduledAt).toLocaleDateString("pt-BR") : `KM ${r.targetKm?.toLocaleString("pt-BR")}`}</TableCell>
                    <TableCell><Badge variant="secondary" className={statusColor[r.status]}>{r.status}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <NewReminderDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function NewReminderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { data: clients = [] } = useClients();
  const [form, setForm] = useState<Partial<Reminder>>({ type: "Troca de Óleo", channel: "WhatsApp", status: "PENDENTE" });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo Lembrete</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={(e) => {
          e.preventDefault();
          if (!form.clientId) return toast.error("Selecione cliente");
          store.addReminder({
            id: `r${Date.now()}`, type: form.type as Reminder["type"], clientId: form.clientId,
            channel: form.channel as Reminder["channel"], scheduledAt: form.scheduledAt,
            targetKm: form.targetKm, status: "PENDENTE",
          });
          toast.success("Lembrete criado"); onOpenChange(false);
        }}>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Reminder["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Troca de Óleo", "Revisão Geral", "Rodízio", "Alinhamento", "Filtro", "Aniversário", "Personalizado"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={form.clientId} onValueChange={(v) => setForm({ ...form, clientId: v })}>
              <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
              <SelectContent>{clients.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Canal</Label>
            <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v as Reminder["channel"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Data agendada</Label><Input type="date" onChange={(e) => setForm({ ...form, scheduledAt: e.target.value ? new Date(e.target.value).toISOString() : undefined })} /></div>
            <div className="space-y-2"><Label>OU KM alvo</Label><Input type="number" onChange={(e) => setForm({ ...form, targetKm: +e.target.value })} /></div>
          </div>
          <DialogFooter><Button type="submit">Criar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
