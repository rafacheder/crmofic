import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Users, Car } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useStore, store } from "@/lib/store";
import {
  initials, vehiclesByClient, ordersByClient, type Client, type Vehicle,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/clients")({ component: ClientsPage });

function ClientsPage() {
  const clients = useStore((s) => s.clients);
  const vehicles = useStore((s) => s.vehicles);
  const orders = useStore((s) => s.orders);
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);

  const filtered = clients.filter(
    (c) =>
      !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.doc.includes(search)
  );

  return (
    <>
      <AppHeader title="Clientes" />
      <div className="space-y-4 p-4">
        <div className="flex gap-2">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome, telefone, CPF..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Button className="ml-auto" onClick={() => setNewOpen(true)}>
            <Plus className="mr-1 h-4 w-4" /> Novo Cliente
          </Button>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-16 text-muted-foreground">
            <Users className="h-8 w-8" />
            Nenhum registro encontrado
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((c) => {
              const vehs = vehicles.filter((v) => v.clientId === c.id);
              const ords = orders.filter((o) => o.clientId === c.id);
              return (
                <Card key={c.id} className="cursor-pointer transition hover:shadow-md" onClick={() => setOpenId(c.id)}>
                  <CardContent className="flex flex-col gap-3 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-primary-foreground">{initials(c.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="truncate font-medium">{c.name}</div>
                        <div className="truncate text-xs text-muted-foreground">{c.email}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">{c.phone}</div>
                    <div className="flex gap-2">
                      <Badge variant="secondary" className="text-[10px]">{vehs.length} veíc.</Badge>
                      <Badge variant="secondary" className="text-[10px]">{ords.length} OS</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <NewClientDialog open={newOpen} onOpenChange={setNewOpen} />
      <ClientSheet clientId={openId} onClose={() => setOpenId(null)} />
    </>
  );
}

function NewClientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [form, setForm] = useState({ name: "", doc: "", email: "", phone: "", address: "" });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo Cliente</DialogTitle></DialogHeader>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!form.name) return toast.error("Nome obrigatório");
            store.addClient({ id: `c${Date.now()}`, ...form });
            toast.success("Cliente criado");
            onOpenChange(false);
            setForm({ name: "", doc: "", email: "", phone: "", address: "" });
          }}
        >
          {(["name", "doc", "email", "phone", "address"] as const).map((k) => (
            <div className="space-y-2" key={k}>
              <Label>{k === "name" ? "Nome" : k === "doc" ? "CPF/CNPJ" : k === "email" ? "Email" : k === "phone" ? "Telefone" : "Endereço"}</Label>
              <Input value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} required={k === "name"} />
            </div>
          ))}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit">Criar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ClientSheet({ clientId, onClose }: { clientId: string | null; onClose: () => void }) {
  const client = useStore((s) => s.clients.find((c) => c.id === clientId));
  if (!client) return null;
  const vehs = vehiclesByClient(client.id);
  const ords = ordersByClient(client.id);
  return (
    <Sheet open={!!clientId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-primary text-primary-foreground">{initials(client.name)}</AvatarFallback>
            </Avatar>
            <div>
              <SheetTitle>{client.name}</SheetTitle>
              <p className="text-xs text-muted-foreground">{client.email} • {client.phone}</p>
            </div>
          </div>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          <section>
            <h3 className="mb-2 text-sm font-semibold">Dados pessoais</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><div className="text-xs text-muted-foreground">CPF/CNPJ</div>{client.doc}</div>
              <div><div className="text-xs text-muted-foreground">Aniversário</div>{client.birthday ? new Date(client.birthday).toLocaleDateString("pt-BR") : "—"}</div>
              <div className="col-span-2"><div className="text-xs text-muted-foreground">Endereço</div>{client.address ?? "—"}</div>
            </div>
            {client.tags && (
              <div className="mt-2 flex gap-1">{client.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div>
            )}
          </section>
          <Separator />
          <VehiclesSection clientId={client.id} vehs={vehs} />
          <Separator />
          <section>
            <h3 className="mb-2 text-sm font-semibold">Histórico de OS</h3>
            {ords.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem ordens registradas.</p>
            ) : (
              <Table>
                <TableHeader><TableRow><TableHead>OS</TableHead><TableHead>Veículo</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
                <TableBody>
                  {ords.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.number}</TableCell>
                      <TableCell>{vehs.find((v) => v.id === o.vehicleId)?.plate}</TableCell>
                      <TableCell>{o.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function VehiclesSection({ clientId, vehs }: { clientId: string; vehs: Vehicle[] }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Vehicle>>({ fuel: "Flex" });
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Veículos</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="mr-1 h-4 w-4" /> Adicionar Veículo</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Novo Veículo</DialogTitle></DialogHeader>
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                store.addVehicle({
                  id: `v${Date.now()}`, clientId,
                  plate: form.plate || "", brand: form.brand || "", model: form.model || "",
                  year: Number(form.year) || new Date().getFullYear(),
                  color: form.color || "", fuel: (form.fuel as Vehicle["fuel"]) || "Flex",
                  km: Number(form.km) || 0, notes: form.notes,
                });
                toast.success("Veículo adicionado");
                setOpen(false);
                setForm({ fuel: "Flex" });
              }}
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2"><Label>Placa</Label><Input value={form.plate ?? ""} onChange={(e) => setForm({ ...form, plate: e.target.value })} required /></div>
                <div className="space-y-2"><Label>Ano</Label><Input type="number" value={form.year ?? ""} onChange={(e) => setForm({ ...form, year: +e.target.value })} /></div>
                <div className="space-y-2"><Label>Marca</Label><Input value={form.brand ?? ""} onChange={(e) => setForm({ ...form, brand: e.target.value })} /></div>
                <div className="space-y-2"><Label>Modelo</Label><Input value={form.model ?? ""} onChange={(e) => setForm({ ...form, model: e.target.value })} /></div>
                <div className="space-y-2"><Label>Cor</Label><Input value={form.color ?? ""} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Combustível</Label>
                  <Select value={form.fuel} onValueChange={(v) => setForm({ ...form, fuel: v as Vehicle["fuel"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["Gasolina", "Etanol", "Flex", "Diesel", "Elétrico", "Híbrido"].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>KM Atual</Label><Input type="number" value={form.km ?? ""} onChange={(e) => setForm({ ...form, km: +e.target.value })} /></div>
              </div>
              <DialogFooter><Button type="submit">Adicionar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      {vehs.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum veículo cadastrado.</p>
      ) : (
        <div className="space-y-2">
          {vehs.map((v) => (
            <div key={v.id} className="flex items-center gap-3 rounded-md border p-3">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 text-sm">
                <div className="font-medium">{v.brand} {v.model} ({v.year})</div>
                <div className="text-xs text-muted-foreground">{v.plate} • {v.color} • {v.km.toLocaleString("pt-BR")} km • {v.fuel}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// reuse Client type
type _C = Client;
