import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAdmin, OficinaAdmin } from "@/hooks/useAdmin";
import { StatusBadge } from "@/components/admin-status-badge";
import { WhatsAppIntegrationGuide } from "@/components/whatsapp-integration-guide";
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
import { Search, CheckCircle, XCircle, Clock, CreditCard, ChevronDown, Package, Trash2, Plus, Pencil, Eye } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/oficinas")({ component: AdminOficinas });

type OficinaForm = {
  nome: string;
  email: string;
  telefone: string;
  cnpj: string;
  endereco: string;
  plano_id: string;
  status: string;
  dono_nome: string;
  dono_email: string;
  dono_senha: string;
};

const EMPTY_FORM: OficinaForm = {
  nome: "", email: "", telefone: "", cnpj: "", endereco: "",
  plano_id: "", status: "trial",
  dono_nome: "", dono_email: "", dono_senha: "",
};

function AdminOficinas() {
  const { oficinas, isLoadingOficinas, planos, atualizarOficina, registrarPagamento, excluirOficina, criarOficina, editarOficina, isUpdating } = useAdmin();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [pagamentoDialog, setPagamentoDialog] = useState<OficinaAdmin | null>(null);
  const [planoDialog, setPlanoDialog] = useState<OficinaAdmin | null>(null);
  const [excluirDialog, setExcluirDialog] = useState<OficinaAdmin | null>(null);
  const [novoPlanoId, setNovoPlanoId] = useState<string>("");
  const [novaOpen, setNovaOpen] = useState(false);
  const [editarOpen, setEditarOpen] = useState<OficinaAdmin | null>(null);
  const [detalhesOpen, setDetalhesOpen] = useState<OficinaAdmin | null>(null);
  const [novaForm, setNovaForm] = useState<OficinaForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<OficinaForm>(EMPTY_FORM);

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

  const openEditar = (o: OficinaAdmin) => {
    setEditForm({
      nome: o.nome ?? "",
      email: o.email ?? "",
      telefone: o.telefone ?? "",
      cnpj: o.cnpj ?? "",
      endereco: o.endereco ?? "",
      plano_id: o.plano_id ?? "",
      status: o.status ?? "trial",
      dono_nome: o.dono_nome ?? "",
      dono_email: o.dono_email ?? "",
      dono_senha: "",
    });
    setEditarOpen(o);
  };

  const handleCriar = async () => {
    if (!novaForm.nome || !novaForm.dono_nome || !novaForm.dono_email || novaForm.dono_senha.length < 6) return;
    await criarOficina({
      nome: novaForm.nome,
      email: novaForm.email || undefined,
      telefone: novaForm.telefone || undefined,
      cnpj: novaForm.cnpj || undefined,
      endereco: novaForm.endereco || undefined,
      plano_id: novaForm.plano_id || undefined,
      status: novaForm.status,
      dono_nome: novaForm.dono_nome,
      dono_email: novaForm.dono_email,
      dono_senha: novaForm.dono_senha,
    });
    setNovaOpen(false);
    setNovaForm(EMPTY_FORM);
  };

  const handleEditar = async () => {
    if (!editarOpen || !editForm.nome) return;
    await editarOficina({
      oficina_id: editarOpen.id,
      nome: editForm.nome,
      email: editForm.email,
      telefone: editForm.telefone,
      cnpj: editForm.cnpj,
      endereco: editForm.endereco,
      plano_id: editForm.plano_id || undefined,
      status: editForm.status,
      dono_user_id: editarOpen.dono_id ?? undefined,
      dono_nome: editForm.dono_nome || undefined,
      dono_email: editForm.dono_email || undefined,
      dono_senha: editForm.dono_senha ? editForm.dono_senha : undefined,
    });
    setEditarOpen(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Oficinas</h1>
          <p className="text-sm text-zinc-500">{oficinas.length} oficinas cadastradas</p>
        </div>
        <Button onClick={() => setNovaOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <Plus className="h-4 w-4" /> Nova Oficina
        </Button>
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
                          onClick={() => openEditar(o)}
                        >
                          <Pencil className="h-4 w-4 text-blue-400" /> Editar oficina
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 focus:bg-zinc-800"
                          onClick={() => setDetalhesOpen(o)}
                        >
                          <Eye className="h-4 w-4 text-zinc-400" /> Ver detalhes & Integração
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
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
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 focus:bg-zinc-800"
                          onClick={() => { setPlanoDialog(o); setNovoPlanoId(""); }}
                        >
                          <Package className="h-4 w-4 text-blue-400" /> Mudar plano
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem
                          className="cursor-pointer gap-2 text-red-400 focus:bg-zinc-800 focus:text-red-400"
                          onClick={() => setExcluirDialog(o)}
                        >
                          <Trash2 className="h-4 w-4" /> Excluir oficina
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

      {/* Dialog: Mudar Plano */}
      <Dialog open={!!planoDialog} onOpenChange={() => setPlanoDialog(null)}>
        <DialogContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
          <DialogHeader>
            <DialogTitle>Mudar plano</DialogTitle>
            <p className="text-sm text-zinc-400">
              {planoDialog?.nome} — atual: {planoDialog?.plano_nome ?? "nenhum"}
            </p>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Novo plano</Label>
            <Select value={novoPlanoId} onValueChange={setNovoPlanoId}>
              <SelectTrigger className="border-zinc-700 bg-zinc-800">
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                {planos.filter((p) => p.ativo).map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.nome} — R$ {p.preco}/mês
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="pt-2 text-xs text-zinc-500">
              Apenas altera o plano vinculado. Não gera cobrança nem assinatura.
            </p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPlanoDialog(null)} className="text-zinc-400">
              Cancelar
            </Button>
            <Button
              onClick={async () => {
                if (!planoDialog || !novoPlanoId) return;
                await atualizarOficina({ oficina_id: planoDialog.id, plano_id: novoPlanoId });
                setPlanoDialog(null);
              }}
              disabled={isUpdating || !novoPlanoId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog: Excluir Oficina */}
      <AlertDialog open={!!excluirDialog} onOpenChange={(open) => !open && setExcluirDialog(null)}>
        <AlertDialogContent className="border-zinc-700 bg-zinc-900 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {excluirDialog?.nome}?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Todos os dados desta oficina serão removidos permanentemente: ordens de serviço,
              clientes, veículos, agendamentos, lembretes, catálogo e usuários vinculados. Esta
              ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!excluirDialog) return;
                await excluirOficina(excluirDialog.id);
                setExcluirDialog(null);
              }}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700"
            >
              {isUpdating ? "Excluindo..." : "Excluir definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog: Nova Oficina */}
      <Dialog open={novaOpen} onOpenChange={(o) => { setNovaOpen(o); if (!o) setNovaForm(EMPTY_FORM); }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-700 bg-zinc-900 text-zinc-100 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nova Oficina</DialogTitle>
            <p className="text-sm text-zinc-400">Cadastre uma oficina e seu usuário dono.</p>
          </DialogHeader>
          <OficinaFormFields form={novaForm} setForm={setNovaForm} planos={planos} senhaObrigatoria />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNovaOpen(false)} className="text-zinc-400">Cancelar</Button>
            <Button
              onClick={handleCriar}
              disabled={isUpdating || !novaForm.nome || !novaForm.dono_nome || !novaForm.dono_email || novaForm.dono_senha.length < 6}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isUpdating ? "Criando..." : "Criar oficina"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Editar Oficina */}
      <Dialog open={!!editarOpen} onOpenChange={(o) => !o && setEditarOpen(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-zinc-700 bg-zinc-900 text-zinc-100 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar oficina</DialogTitle>
            <p className="text-sm text-zinc-400">{editarOpen?.nome}</p>
          </DialogHeader>
          <OficinaFormFields form={editForm} setForm={setEditForm} planos={planos} senhaObrigatoria={false} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditarOpen(null)} className="text-zinc-400">Cancelar</Button>
            <Button
              onClick={handleEditar}
              disabled={isUpdating || !editForm.nome}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function OficinaFormFields({
  form, setForm, planos, senhaObrigatoria,
}: {
  form: OficinaForm;
  setForm: React.Dispatch<React.SetStateAction<OficinaForm>>;
  planos: { id: string; nome: string; preco: number; ativo: boolean }[];
  senhaObrigatoria: boolean;
}) {
  const set = <K extends keyof OficinaForm>(k: K, v: OficinaForm[K]) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Dados da oficina</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-zinc-300">Nome *</Label>
            <Input value={form.nome} onChange={(e) => set("nome", e.target.value)} className="border-zinc-700 bg-zinc-800 text-zinc-100" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300">E-mail</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="border-zinc-700 bg-zinc-800 text-zinc-100" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Telefone</Label>
            <Input value={form.telefone} onChange={(e) => set("telefone", e.target.value)} className="border-zinc-700 bg-zinc-800 text-zinc-100" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300">CNPJ</Label>
            <Input value={form.cnpj} onChange={(e) => set("cnpj", e.target.value)} className="border-zinc-700 bg-zinc-800 text-zinc-100" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="border-zinc-700 bg-zinc-800"><SelectValue /></SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                <SelectItem value="trial">Trial</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="suspenso">Suspenso</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-zinc-300">Endereço</Label>
            <Textarea rows={2} value={form.endereco} onChange={(e) => set("endereco", e.target.value)} className="border-zinc-700 bg-zinc-800 text-zinc-100" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-zinc-300">Plano</Label>
            <Select value={form.plano_id || "__none__"} onValueChange={(v) => set("plano_id", v === "__none__" ? "" : v)}>
              <SelectTrigger className="border-zinc-700 bg-zinc-800"><SelectValue placeholder="Sem plano" /></SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-900">
                <SelectItem value="__none__">Sem plano</SelectItem>
                {planos.filter((p) => p.ativo).map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.nome} — R$ {p.preco}/mês</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-3 border-t border-zinc-800 pt-4">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Usuário dono</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Nome {senhaObrigatoria && "*"}</Label>
            <Input value={form.dono_nome} onChange={(e) => set("dono_nome", e.target.value)} className="border-zinc-700 bg-zinc-800 text-zinc-100" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-zinc-300">E-mail {senhaObrigatoria && "*"}</Label>
            <Input type="email" value={form.dono_email} onChange={(e) => set("dono_email", e.target.value)} className="border-zinc-700 bg-zinc-800 text-zinc-100" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label className="text-zinc-300">
              Senha {senhaObrigatoria ? "* (mín. 6 caracteres)" : "(deixe em branco para manter)"}
            </Label>
            <Input
              type="password"
              value={form.dono_senha}
              onChange={(e) => set("dono_senha", e.target.value)}
              className="border-zinc-700 bg-zinc-800 text-zinc-100"
              placeholder={senhaObrigatoria ? "" : "••••••"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
