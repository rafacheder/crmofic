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
import { useOrders, useClients, useVehicles } from "@/hooks/useOrders";
import { type Priority } from "@/lib/mock-data";

export function NewOrderDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { createOrder, isCreating } = useOrders();
  const { data: clients = [] } = useClients();
  const [clientId, setClientId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const { data: vehicles = [] } = useVehicles(clientId);
  
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [tech, setTech] = useState("Carlos M.");
  const [complaint, setComplaint] = useState("");
  const [kmIn, setKmIn] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [notes, setNotes] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !vehicleId || !complaint) {
      toast.error("Preencha cliente, veículo e reclamação");
      return;
    }

    try {
      await createOrder({
        cliente_id: clientId,
        veiculo_id: vehicleId,
        prioridade: priority,
        reclamacao: complaint,
        km_entrada: kmIn ? Number(kmIn) : null,
        data_agendada: scheduledAt ? new Date(scheduledAt).toISOString() : null,
        observacoes: notes,
      });

      onOpenChange(false);
      setClientId(""); 
      setVehicleId(""); 
      setComplaint(""); 
      setKmIn(""); 
      setScheduledAt(""); 
      setNotes("");
    } catch (err) {
      // toast is handled by hook
    }
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
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Veículo</Label>
            <Select value={vehicleId} onValueChange={setVehicleId} disabled={!clientId}>
              <SelectTrigger><SelectValue placeholder="Selecione o veículo" /></SelectTrigger>
              <SelectContent>
                {vehicles.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.placa} — {v.marca} {v.modelo}
                  </SelectItem>
                ))}
              </SelectContent>
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
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar OS"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
