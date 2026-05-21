import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAdmin, OficinaAdmin } from "@/hooks/useAdmin";
import { StatusBadge } from "@/components/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, CheckCircle, XCircle, Clock, CreditCard, ChevronDown, Package, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/oficinas")({ component: AdminOficinas });

function AdminOficinas() {
  const { oficinas, isLoadingOficinas, planos, atualizarOficina, registrarPagamento, excluirOficina, isUpdating } = useAdmin();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [pagamentoDialog, setPagamentoDialog] = useState<OficinaAdmin | null>(null);
  const [planoDialog, setPlanoDialog] = useState<OficinaAdmin | null>(null);
  const [excluirDialog, setExcluirDialog] = useState<OficinaAdmin | null>(null);
  const [novoPlanoId, setNovoPlanoId] = useState<string>("");

  // Form pagamento
  const [formPgto, setFormPgto] = useState({
    plano_id: "", valor: "", forma: "pix", obs: "", meses: "1",
  });

  const filtered = oficinas.filter((o) => {
    const matchSearch = !search ||
      o.nome.toLowerCase().includes(search.toLowerCase()) ||
      (o.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "todos" || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatus = async (o: OficinaAdmin, status: string) => {
    await atualizarOficina({ oficina_id: o.id, status });
  };

  const handlePagamento = async () => {
    if (!pagamentoDialog || !formPgto.plano_id || !formPgto.valor) return;
    await registrarPagamento({
      oficina_id: pagamentoDialog.id,
      plano_id: formPgto.plano_id,
      valor_cobrado: parseFloat(formPgto.valor),
      forma_pagamento: formPgto.forma,
      observacoes: formPgto.obs,
      meses: parseInt(formPgto.meses),
    });
    setPagamentoDialog(null);
    setFormPgto({ plano_id: "", valor: "", forma: "pix", obs: "", meses: "1" });
  };

  const handleTrial = async (o: OficinaAdmin, dias: number) => {
    const trial_ate = new Date();
    trial_ate.setDate(trial_ate.getDate() + dias);
    await atualizarOficina({ oficina_id: o.id, status: "trial", trial_ate: trial_ate.toISOString() });
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Oficinas</h1>
          <p className="text-sm text-zinc-500">{oficinas.length} oficinas cadastradas</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Buscar por nome ou email..."
            className="pl-9 border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-36 border-zinc-700 bg-zinc-900 text-zinc-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-zinc-700 bg-zinc-900">
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="trial">Trial</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50 text-xs text-zinc-500">
              <th className="px-4 py-3 text-left font-medium">Oficina</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Plano</th>
              <th className="px-4 py-3 text-center font-medium">Usuários</th>
              <th className="px-4 py-3 text-center font-medium">OS</th>
              <th className="px-4 py-3 text-left font-medium">Cadastro</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoadingOficinas ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Carregando...</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">Nenhuma oficina encontrada</td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="border-b border-zinc-800/60 bg-zinc-900 hover:bg-zinc-800/40 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-zinc-200">{o.nome}</p>
                    <p className="text-xs text-zinc-500">{o.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.status} />
                    {o.status === "trial" && o.trial_ate && (
                      <p className="mt-1 text-[10px] text-zinc-500">
                        até {new Date(o.trial_ate).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{o.plano_nome ?? "—"}</td>
                  <td className="px-4 py-3 text-center text-zinc-300">{o.total_usuarios}</td>
                  <td className="px-4 py-3 text-center text-zinc-300">{o.total_ordens}</td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(o.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                          Ações <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="border-zinc-700 bg-zinc-900 text-zinc-200">
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 focus:bg-zinc-800"
                          onClick={() => { setPagamentoDialog(o); setFormPgto((f) => ({ ...f, plano_id: "", valor: String(o.plano_preco ?? ""), })); }}
                        >
                          <CreditCard className="h-4 w-4 text-emerald-400" /> Registrar pagamento
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        {o.status !== "ativo" && (
                          <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-zinc-800" onClick={() => handleStatus(o, "ativo")}>
                            <CheckCircle className="h-4 w-4 text-emerald-400" /> Ativar
                          </DropdownMenuItem>
                        )}
                        {o.status !== "suspenso" && (
                          <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-zinc-800" onClick={() => handleStatus(o, "suspenso")}>
                            <XCircle className="h-4 w-4 text-red-400" /> Suspender
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-zinc-800" onClick={() => handleTrial(o, 7)}>
                          <Clock className="h-4 w-4 text-amber-400" /> +7 dias trial
                        </DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2 focus:bg-zinc-800" onClick={() => handleTrial(o, 30)}>
                          <Clock className="h-4 w-4 text-amber-400" /> +30 dias trial
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialog: Registrar Pagamento */}
      <Dialog open={!!pagamentoDialog} onOpenChange={() => setPagamentoDialog(null)}>
        <DialogContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <p className="text-sm text-zinc-400">{pagamentoDialog?.nome}</p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Plano</Label>
              <Select value={formPgto.plano_id} onValueChange={(v) => setFormPgto((f) => ({ ...f, plano_id: v }))}>
                <SelectTrigger className="border-zinc-700 bg-zinc-800">
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900">
                  {planos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome} — R$ {p.preco}/mês
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Valor cobrado (R$)</Label>
                <Input
                  type="number"
                  value={formPgto.valor}
                  onChange={(e) => setFormPgto((f) => ({ ...f, valor: e.target.value }))}
                  className="border-zinc-700 bg-zinc-800 text-zinc-100"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-zinc-300">Meses</Label>
                <Select value={formPgto.meses} onValueChange={(v) => setFormPgto((f) => ({ ...f, meses: v }))}>
                  <SelectTrigger className="border-zinc-700 bg-zinc-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-zinc-900">
                    {[1,2,3,6,12].map((m) => (
                      <SelectItem key={m} value={String(m)}>{m} {m === 1 ? "mês" : "meses"}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Forma de pagamento</Label>
              <Select value={formPgto.forma} onValueChange={(v) => setFormPgto((f) => ({ ...f, forma: v }))}>
                <SelectTrigger className="border-zinc-700 bg-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-zinc-700 bg-zinc-900">
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-zinc-300">Observações</Label>
              <Textarea
                value={formPgto.obs}
                onChange={(e) => setFormPgto((f) => ({ ...f, obs: e.target.value }))}
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPagamentoDialog(null)} className="text-zinc-400">
              Cancelar
            </Button>
            <Button
              onClick={handlePagamento}
              disabled={isUpdating || !formPgto.plano_id || !formPgto.valor}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUpdating ? "Salvando..." : "Confirmar pagamento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
