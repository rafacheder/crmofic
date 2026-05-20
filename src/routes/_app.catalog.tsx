import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2, Package, Pencil } from "lucide-react";
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
import { useCatalogo } from "@/hooks/useCatalogo";
import { formatBRL } from "@/lib/mock-data";
import { CatalogoServico, CatalogoProduto } from "@/types/database";

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
  const { services, createService, updateService, deleteService, isLoading } = useCatalogo();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogoServico | null>(null);
  const [form, setForm] = useState<Partial<CatalogoServico>>({ ativo: true });

  const handleOpen = (item?: CatalogoServico) => {
    if (item) {
      setEditingItem(item);
      setForm(item);
    } else {
      setEditingItem(null);
      setForm({ ativo: true });
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nome: form.nome || "",
      categoria: form.categoria || "Geral",
      preco: Number(form.preco) || 0,
      tempo_minutos: Number(form.tempo_minutos) || 30,
      ativo: form.ativo ?? true,
    };

    if (editingItem) {
      await updateService({ id: editingItem.id, ...payload });
    } else {
      await createService(payload);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button onClick={() => handleOpen()}><Plus className="mr-1 h-4 w-4" /> Novo Serviço</Button>
      </div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Categoria</TableHead><TableHead>Preço</TableHead><TableHead>Tempo</TableHead><TableHead>Status</TableHead><TableHead className="w-20"></TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Carregando...</TableCell></TableRow>
            ) : services.length === 0 ? (
              <TableRow><TableCell colSpan={6}><div className="flex flex-col items-center gap-2 py-10 text-muted-foreground"><Package className="h-8 w-8" /> Nenhum serviço</div></TableCell></TableRow>
            ) : services.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.nome}</TableCell>
                <TableCell>{s.categoria}</TableCell>
                <TableCell>{formatBRL(s.preco)}</TableCell>
                <TableCell>{s.tempo_minutos} min</TableCell>
                <TableCell><Badge variant={s.ativo ? "default" : "secondary"}>{s.ativo ? "Ativo" : "Inativo"}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpen(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ConfirmDelete onConfirm={() => deleteService(s.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
            <DialogDescription>Adicione um serviço ao catálogo para usar nas ordens de serviço.</DialogDescription>
          </DialogHeader>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-2"><Label>Nome</Label><Input value={form.nome ?? ""} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Categoria</Label><Input value={form.categoria ?? ""} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>Preço</Label><Input type="number" step="0.01" value={form.preco ?? ""} onChange={(e) => setForm({ ...form, preco: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Tempo (min)</Label><Input type="number" value={form.tempo_minutos ?? ""} onChange={(e) => setForm({ ...form, tempo_minutos: +e.target.value })} /></div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input type="checkbox" id="ativo" checked={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.checked })} />
              <Label htmlFor="ativo">Serviço Ativo</Label>
            </div>
            <DialogFooter><Button type="submit">Salvar</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductsTab() {
  const { products, createProduct, updateProduct, deleteProduct, isLoading } = useCatalogo();
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CatalogoProduto | null>(null);
  const [form, setForm] = useState<Partial<CatalogoProduto>>({});

  const handleOpen = (item?: CatalogoProduto) => {
    if (item) {
      setEditingItem(item);
      setForm(item);
    } else {
      setEditingItem(null);
      setForm({});
    }
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      nome: form.nome || "",
      sku: form.sku || "",
      preco: Number(form.preco) || 0,
      estoque: Number(form.estoque) || 0,
      estoque_minimo: Number(form.estoque_minimo) || 0,
      unidade: form.unidade || "un",
    };

    if (editingItem) {
      await updateProduct({ id: editingItem.id, ...payload });
    } else {
      await createProduct(payload);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button onClick={() => handleOpen()}><Plus className="mr-1 h-4 w-4" /> Novo Produto</Button></div>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>SKU</TableHead><TableHead>Preço</TableHead><TableHead>Estoque</TableHead><TableHead>Mín.</TableHead><TableHead>Un.</TableHead><TableHead className="w-20"></TableHead></TableRow></TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-10">Carregando...</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={7}><div className="flex flex-col items-center gap-2 py-10 text-muted-foreground"><Package className="h-8 w-8" /> Nenhum produto</div></TableCell></TableRow>
            ) : products.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.nome}</TableCell>
                <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                <TableCell>{formatBRL(p.preco)}</TableCell>
                <TableCell>
                  {p.estoque}
                  {(p.estoque ?? 0) < (p.estoque_minimo ?? 0) && <Badge variant="secondary" className="ml-2 bg-destructive/15 text-destructive">Estoque Baixo</Badge>}
                </TableCell>
                <TableCell>{p.estoque_minimo}</TableCell>
                <TableCell>{p.unidade}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleOpen(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ConfirmDelete onConfirm={() => deleteProduct(p.id)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingItem ? "Editar Produto" : "Novo Produto"}</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-2"><Label>Nome</Label><Input value={form.nome ?? ""} onChange={(e) => setForm({ ...form, nome: e.target.value })} required /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2"><Label>SKU</Label><Input value={form.sku ?? ""} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
              <div className="space-y-2"><Label>Unidade</Label><Input placeholder="un" value={form.unidade ?? ""} onChange={(e) => setForm({ ...form, unidade: e.target.value })} /></div>
              <div className="space-y-2"><Label>Preço</Label><Input type="number" step="0.01" value={form.preco ?? ""} onChange={(e) => setForm({ ...form, preco: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Estoque Atual</Label><Input type="number" value={form.estoque ?? ""} onChange={(e) => setForm({ ...form, estoque: +e.target.value })} /></div>
              <div className="space-y-2"><Label>Estoque Mínimo</Label><Input type="number" value={form.estoque_minimo ?? ""} onChange={(e) => setForm({ ...form, estoque_minimo: +e.target.value })} /></div>
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
