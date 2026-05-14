import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useStore, store } from "@/lib/store";
import { vehiclesByClient, type Priority, type Order } from "@/lib/mock-data";

export function NewOrderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const clients = useStore((s) => s.clients);
  const ordersCount = useStore((s) => s.orders.length);
  const [clientId, setClientId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [tech, setTech] = useState("Carlos M.");
  const [complaint, setComplaint] = useState("");
  const [kmIn, setKmIn] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");

  const vehicles = clientId ? vehiclesByClient(clientId) : [];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !vehicleId || !complaint) {
      toast.error("Preencha cliente, veículo e reclamação");
      return;
    }
    const num = `OS-${new Date().getFullYear()}-${String(ordersCount + 1).padStart(4, "0")}`;
    const newOrder: Order = {
      id: `o${Date.now()}`,
      number: num, clientId, vehicleId,
      column: "recepcao", priority, budgetStatus: "PENDENTE",
      technician: tech, total: 0, tags: [], complaint,
      kmIn: Number(kmIn) || 0, scheduledAt: scheduledAt || undefined, notes,
      enteredColumnAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      items: [],
      history: [{ from: null, to: "recepcao", by: "Você", at: new Date().toISOString() }],
      photos: [],
    };
    store.addOrder(newOrder);
    toast.success(`${num} criada`);
    onOpenChange(false);
    setClientId(""); setVehicleId(""); setComplaint(""); setKmIn(""); setScheduledAt(""); setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nova Ordem de Serviço</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={clientId} onValueChange={(v) => { setClientId(v); setVehicleId(""); }}>
              <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>{clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Veículo</Label>
            <Select value={vehicleId} onValueChange={setVehicleId} disabled={!clientId}>
              <SelectTrigger><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
              <SelectContent>{vehicles.map((v) => <SelectItem key={v.id} value={v.id}>{v.plate} — {v.brand} {v.model}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Reclamação do cliente</Label>
            <Textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="LOW">Baixa</SelectItem>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Técnico</Label>
              <Select value={tech} onValueChange={setTech}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Carlos M.">Carlos M.</SelectItem>
                  <SelectItem value="Bruno L.">Bruno L.</SelectItem>
                  <SelectItem value="Rafael S.">Rafael S.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>KM de entrada</Label>
              <Input type="number" value={kmIn} onChange={(e) => setKmIn(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Data agendada</Label>
              <Input type="date" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Criar OS</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
