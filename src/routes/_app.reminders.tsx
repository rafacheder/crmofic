import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Bell, Trash2 } from "lucide-react";
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
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useClientes } from "@/hooks/useClientes";
import { useVehicles } from "@/hooks/useVehicles";
import { useLembretes } from "@/hooks/useLembretes";
import { Lembrete } from "@/types/database";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/reminders")({ component: RemindersPage });

const statusColor: Record<string, string> = {
  PENDENTE: "bg-muted text-muted-foreground",
  ENVIADO: "bg-success/15 text-success",
  FALHOU: "bg-destructive/15 text-destructive",
  CANCELADO: "bg-muted text-muted-foreground",
};

function RemindersPage() {
  const { reminders, isLoading, deleteLembrete } = useLembretes();
  const [type, setType] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [open, setOpen] = useState(false);

  const filtered = reminders.filter((r) => (type === "ALL" || r.tipo === type) && (status === "ALL" || r.status === status));

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
              {Object.keys(statusColor).map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                <TableHead className="w-10 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12">Carregando...</TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7}>
                  <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                    <Bell className="h-8 w-8" /> Nenhum lembrete
                  </div>
                </TableCell></TableRow>
              ) : filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.tipo}</TableCell>
                  <TableCell>{r.cliente?.nome ?? "—"}</TableCell>
                  <TableCell>{r.veiculo_id ?? "—"}</TableCell>
                  <TableCell>{r.canal}</TableCell>
                  <TableCell>{r.data_agendada ? new Date(r.data_agendada).toLocaleDateString("pt-BR") : `KM ${r.km_alvo?.toLocaleString("pt-BR")}`}</TableCell>
                  <TableCell><Badge variant="secondary" className={statusColor[r.status || "PENDENTE"]}>{r.status}</Badge></TableCell>
                  <TableCell>
                    <ConfirmDelete onConfirm={() => deleteLembrete(r.id)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <NewReminderDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

function NewReminderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { clients } = useClientes();
  const { createLembrete } = useLembretes();
  const [clientId, setClientId] = useState("");
  const [type, setType] = useState("Troca de Óleo");
  const [channel, setChannel] = useState("WhatsApp");
  const [scheduledAt, setScheduledAt] = useState("");
  const [targetKm, setTargetKm] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) return toast.error("Selecione cliente");
    
    await createLembrete({
      tipo: type,
      cliente_id: clientId,
      canal: channel,
      data_agendada: scheduledAt ? new Date(scheduledAt).toISOString() : null,
      km_alvo: targetKm ? Number(targetKm) : null,
      mensagem: message,
      status: "PENDENTE",
    });
    
    onOpenChange(false);
    setClientId("");
    setScheduledAt("");
    setTargetKm("");
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo Lembrete</DialogTitle></DialogHeader>
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Troca de Óleo", "Revisão Geral", "Rodízio", "Alinhamento", "Filtro", "Aniversário", "Personalizado"].map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger><SelectValue placeholder="Cliente" /></SelectTrigger>
              <SelectContent>{(clients || []).map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Canal</Label>
            <Select value={channel} onValueChange={setChannel}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="SMS">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Data agendada</Label><Input type="date" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} /></div>
            <div className="space-y-2"><Label>OU KM alvo</Label><Input type="number" value={targetKm} onChange={(e) => setTargetKm(e.target.value)} /></div>
          </div>
          <div className="space-y-2"><Label>Mensagem (opcional)</Label><Input value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <DialogFooter><Button type="submit">Criar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ConfirmDelete({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="h-7 w-7"><Trash2 className="h-4 w-4 text-destructive" /></Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader><AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle><AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
        <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={onConfirm}>Excluir</AlertDialogAction></AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
