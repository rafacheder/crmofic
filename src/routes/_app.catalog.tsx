import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Package } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStore, store } from "@/lib/store";
import { formatBRL, type CatalogService, type CatalogProduct } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/catalog")({ component: CatalogPage });

function CatalogPage() {
  return (
    <>
      <AppHeader title="Catálogo" />
      <Tabs defaultValue="services" className="p-4">
        <TabsList><TabsTrigger value="services">Serviços</TabsTrigger><TabsTrigger value="products">Produtos</TabsTrigger></TabsList>
        <TabsContent value="services" className="mt-4"><ServicesTab /></TabsContent>
        <TabsContent value="products" className="mt-4"><ProductsTab /></TabsContent>
      </Tabs>
    </>
  );
}

function ServicesTab() {
  const items = useStore((s) => s.services);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<CatalogService>>({ active: true });
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> Novo Serviço</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead>Tempo</TableHead><TableHead>Status</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={6}><div className="flex flex-col items-center gap-2 py-10 text-muted-foreground"><Package className="h-8 w-8" /> Nenhum serviço</div></TableCell></TableRow>
            ) : items.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.category}</TableCell>
                <TableCell>{formatBRL(s.price)}</TableCell>
                <TableCell>{s.duration} min</TableCell>
                <TableCell><Badge variant={s.active ? "default" : "secondary"}>{s.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                <TableCell>
                  <ConfirmDelete onConfirm={() => { store.removeService(s.id); toast.success("Serviço removido"); }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Serviço</DialogTitle><DialogDescription>Adicione um serviço ao catálogo.</DialogDescription></DialogHeader>
          <form className="space-y-3" onSubmit={(e) => {
            e.preventDefault();
            store.addService({
              id: `s${Date.now()}`, name: form.name || "", category: form.category || "Geral",
              price: Number(form.price) || 0, duration: Number(form.duration) || 30, active: true,
            });
            toast.success("Serviço criado"); setOpen(false); setForm({ active: true });
          }}>
            <div className="space-y-2"><Label>Nome</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Categoria</Label><Input value={form.category ?? ""} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Preço</Label><Input type="number" step="0.01" onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Tempo (min)</Label><Input type="number" onChange={(e) => setForm({ ...form, duration: +e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="submit">Salvar</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductsTab() {
  const items = useStore((s) => s.products);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<CatalogProduct>>({});
  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> Novo Produto</Button></div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>SKU</TableHead><TableHead>Preço</TableHead><TableHead>Estoque</TableHead><TableHead>Mín.</TableHead><TableHead>Un.</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={7}><div className="flex flex-col items-center gap-2 py-10 text-muted-foreground"><Package className="h-8 w-8" /> Nenhum produto</div></TableCell></TableRow>
            ) : items.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                <TableCell>{formatBRL(p.price)}</TableCell>
                <TableCell>
                  {p.stock}
                  {p.stock < p.minStock && <Badge variant="secondary" className="ml-2 bg-destructive/15 text-destructive">Estoque Baixo</Badge>}
                </TableCell>
                <TableCell>{p.minStock}</TableCell>
                <TableCell>{p.unit}</TableCell>
                <TableCell><ConfirmDelete onConfirm={() => { store.removeProduct(p.id); toast.success("Produto removido"); }} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Produto</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={(e) => {
            e.preventDefault();
            store.addProduct({
              id: `p${Date.now()}`, name: form.name || "", sku: form.sku || "",
              price: Number(form.price) || 0, stock: Number(form.stock) || 0,
              minStock: Number(form.minStock) || 0, unit: form.unit || "un",
            });
            toast.success("Produto criado"); setOpen(false); setForm({});
          }}>
            <div className="space-y-2"><Label>Nome</Label><Input value={form.name ?? ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>SKU</Label><Input value={form.sku ?? ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
              <div className="space-y-2"><Label>Unidade</Label><Input placeholder="un" value={form.unit ?? ""} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
              <div className="space-y-2"><Label>Preço</Label><Input type="number" step="0.01" onChange={(e) => setForm({ ...form, price: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Estoque</Label><Input type="number" onChange={(e) => setForm({ ...form, stock: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Estoque Mín.</Label><Input type="number" onChange={(e) => setForm({ ...form, minStock: +e.target.value })} /></div>
            </div>
            <DialogFooter><Button type="submit">Salvar</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
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
