import { createFileRoute } from "@tanstack/react-router";
import { useAdmin, Plano } from "@/hooks/useAdmin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Plus, Pencil, Save, X, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export const Route = createFileRoute("/admin/planos")({ component: AdminPlanos });

const featLabels: Record<string, string> = {
  kanban: "Kanban",
  clientes: "Clientes",
  veiculos: "Veículos",
  ordens: "Ordens de Serviço",
  lembretes: "Lembretes",
  agendamentos: "Agendamentos",
  portal: "Portal do Cliente",
  whatsapp: "WhatsApp / Whaticket",
  catalogo: "Catálogo",
  automacoes: "Automações Kanban",
  api: "Acesso à API",
  relatorios: "Relatórios avançados",
};

const allFeatures = Object.keys(featLabels);

export default function AdminPlanos() {
  const { planos, upsertPlano, excluirPlano, isUpdating } = useAdmin();
  const [editingPlano, setEditingPlano] = useState<Partial<Plano> | null>(null);
  const [planoParaExcluir, setPlanoParaExcluir] = useState<Plano | null>(null);


  const handleOpenDialog = (plano?: Plano) => {
    if (plano) {
      setEditingPlano({ ...plano });
    } else {
      setEditingPlano({
        nome: "",
        preco: 0,
        limite_usuarios: 3,
        limite_ordens_mes: 100,
        funcionalidades: ["kanban", "clientes", "veiculos", "ordens"],
        ativo: true,
      });
    }
  };

  const handleSave = async () => {
    if (!editingPlano || !editingPlano.nome) return;
    await upsertPlano(editingPlano);
    setEditingPlano(null);
  };

  const toggleFeature = (feat: string) => {
    if (!editingPlano) return;
    const current = editingPlano.funcionalidades || [];
    const next = current.includes(feat)
      ? current.filter((f) => f !== feat)
      : [...current, feat];
    setEditingPlano({ ...editingPlano, funcionalidades: next });
  };

  const handleExcluir = async () => {
    if (!planoParaExcluir) return;
    await excluirPlano(planoParaExcluir.id);
    setPlanoParaExcluir(null);
  };


  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Planos</h1>
          <p className="text-sm text-zinc-500">Configuração dos planos disponíveis</p>
        </div>
        <Button 
          onClick={() => handleOpenDialog()}
          className="bg-red-600 hover:bg-red-700 text-white gap-2"
        >
          <Plus className="h-4 w-4" /> Novo Plano
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {planos.map((p) => (
          <Card key={p.id} className="border-zinc-700 bg-zinc-900 group relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-zinc-100">{p.nome}</CardTitle>
                <Badge
                  variant="outline"
                  className={p.ativo
                    ? "border-emerald-500/50 text-emerald-400"
                    : "border-zinc-600 text-zinc-500"}
                >
                  {p.ativo ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <p className="text-3xl font-bold text-zinc-100 mt-2">
                {p.preco === 0
                  ? "Grátis"
                  : new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.preco)}
                {p.preco > 0 && <span className="text-sm font-normal text-zinc-500">/mês</span>}
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1 text-xs text-zinc-400">
                <p>👤 {p.limite_usuarios ?? "∞"} usuário(s)</p>
                <p>📋 {p.limite_ordens_mes ?? "∞"} OS/mês</p>
              </div>
              <div className="mt-3 space-y-1.5 pb-8">
                {(p.funcionalidades as string[]).map((f) => (
                  <div key={f} className="flex items-center gap-2 text-xs text-zinc-300">
                    <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                    {featLabels[f] ?? f}
                  </div>
                ))}
              </div>
              <div className="absolute bottom-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-zinc-400 hover:text-white hover:bg-zinc-800 gap-1"
                  onClick={() => handleOpenDialog(p)}
                >
                  <Pencil className="h-3 w-3" /> Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-zinc-500 hover:text-red-400 hover:bg-red-950/30"
                  onClick={() => setPlanoParaExcluir(p)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingPlano} onOpenChange={(open) => !open && setEditingPlano(null)}>
        <DialogContent className="border-zinc-700 bg-zinc-900 text-zinc-100 max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingPlano?.id ? "Editar Plano" : "Novo Plano"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Input 
                  value={editingPlano?.nome || ""} 
                  onChange={(e) => setEditingPlano(prev => ({ ...prev, nome: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="Ex: Pro, Enterprise..."
                />
              </div>
              
              <div className="space-y-2">
                <Label>Preço Mensal (R$)</Label>
                <Input 
                  type="number"
                  value={editingPlano?.preco ?? 0} 
                  onChange={(e) => setEditingPlano(prev => ({ ...prev, preco: parseFloat(e.target.value) || 0 }))}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Limite Usuários</Label>
                  <Input 
                    type="number"
                    value={editingPlano?.limite_usuarios ?? ""} 
                    onChange={(e) => setEditingPlano(prev => ({ ...prev, limite_usuarios: e.target.value ? parseInt(e.target.value) : null }))}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="∞"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Limite OS/mês</Label>
                  <Input 
                    type="number"
                    value={editingPlano?.limite_ordens_mes ?? ""} 
                    onChange={(e) => setEditingPlano(prev => ({ ...prev, limite_ordens_mes: e.target.value ? parseInt(e.target.value) : null }))}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="∞"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
                <div className="space-y-0.5">
                  <Label>Plano Ativo</Label>
                  <p className="text-[10px] text-zinc-500">Disponível para novas assinaturas</p>
                </div>
                <Switch 
                  checked={editingPlano?.ativo ?? true}
                  onCheckedChange={(val) => setEditingPlano(prev => ({ ...prev, ativo: val }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Funcionalidades</Label>
              <div className="grid grid-cols-1 gap-2 p-3 rounded-lg bg-zinc-800/50 border border-zinc-700 max-h-[300px] overflow-y-auto">
                {allFeatures.map((feat) => (
                  <div key={feat} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`feat-${feat}`}
                      checked={editingPlano?.funcionalidades?.includes(feat)}
                      onCheckedChange={() => toggleFeature(feat)}
                      className="border-zinc-600 data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
                    />
                    <label 
                      htmlFor={`feat-${feat}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {featLabels[feat] || feat}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingPlano(null)} className="text-zinc-400">
              Cancelar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isUpdating || !editingPlano?.nome}
              className="bg-red-600 hover:bg-red-700 text-white min-w-[100px]"
            >
              {isUpdating ? "Salvando..." : "Salvar Plano"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!planoParaExcluir} onOpenChange={(open: boolean) => !open && setPlanoParaExcluir(null)}>
        <AlertDialogContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Plano</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir o plano <span className="text-zinc-100 font-semibold">{planoParaExcluir?.nome}</span>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExcluir}
              className="bg-red-600 text-white hover:bg-red-700 border-none"
              disabled={isUpdating}
            >
              {isUpdating ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );
}
