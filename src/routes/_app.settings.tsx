import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Trash2, Plus, MessageSquare, Bot, Zap, Loader2, UserPlus, Check, X } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { useStore, store } from "@/lib/store";
import { toast } from "sonner";
import { ColumnAutomationsDialog } from "@/components/column-automations-dialog";
import { type KanbanColumn } from "@/lib/mock-data";
import { useSettings } from "@/hooks/useSettings";
import { useUsuariosOficina } from "@/hooks/useUsuariosOficina";
import { useAuth } from "@/contexts/AuthContext";

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage });

const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function SettingsPage() {
  return (
    <>
      <AppHeader title="Configurações" />
      <Tabs defaultValue="general" className="p-4">
        <TabsList className="flex w-full flex-wrap">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4"><GeneralTab /></TabsContent>
        <TabsContent value="kanban" className="mt-4"><KanbanTab /></TabsContent>
        <TabsContent value="integrations" className="mt-4"><IntegrationsTab /></TabsContent>
        <TabsContent value="templates" className="mt-4"><TemplatesTab /></TabsContent>
        <TabsContent value="users" className="mt-4"><UsersTab /></TabsContent>
      </Tabs>
    </>
  );
}

function GeneralTab() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Dados da Oficina</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2"><Label>Nome</Label><Input defaultValue="Auto Center Silva" /></div>
          <div className="space-y-2"><Label>CNPJ</Label><Input defaultValue="12.345.678/0001-90" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>Telefone</Label><Input defaultValue="(11) 4444-5555" /></div>
            <div className="space-y-2"><Label>Email</Label><Input defaultValue="contato@oficina.com" /></div>
          </div>
          <div className="space-y-2"><Label>Endereço</Label><Input defaultValue="Av. Paulista, 1000" /></div>
          <div className="space-y-2"><Label>Logo</Label><Input type="file" /></div>
          <Button onClick={() => toast.success("Salvo")}>Salvar</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Horários de Funcionamento</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {days.map((d) => (
            <div key={d} className="flex items-center gap-3">
              <Switch defaultChecked={d !== "Dom"} />
              <span className="w-12 text-sm font-medium">{d}</span>
              <Input className="flex-1" defaultValue="08:00" />
              <span>—</span>
              <Input className="flex-1" defaultValue="18:00" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function KanbanTab() {
  const cols = useStore((s) => s.columns);
  const [selectedCol, setSelectedCol] = useState<KanbanColumn | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Colunas do Kanban</CardTitle>
            <CardDescription>Reordene, edite ou adicione colunas e automações.</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" /> Adicionar coluna
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {cols.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-md border bg-card p-3">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
            <span className="flex-1 text-sm font-medium">{c.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCol(c);
                setDialogOpen(true);
              }}
            >
              Automações
              {c.automations && c.automations.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {c.automations.length}
                </Badge>
              )}
            </Button>
            <Button variant="outline" size="sm">
              Editar
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </CardContent>

      <ColumnAutomationsDialog
        column={selectedCol}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}

function IntegrationsTab() {
  const { settings, updateSettings, isUpdating } = useSettings();
  const [evolution, setEvolution] = useState({
    url: "",
    key: "",
    instance: ""
  });
  const [typebot, setTypebot] = useState({
    url: "",
    name: ""
  });

  useEffect(() => {
    if (settings) {
      setEvolution({
        url: settings.evolution_api_url || "",
        key: settings.evolution_api_key || "",
        instance: settings.evolution_instance_name || ""
      });
      setTypebot({
        url: settings.typebot_url || "",
        name: settings.typebot_name || ""
      });
    }
  }, [settings]);

  const handleSaveEvolution = async () => {
    await updateSettings({
      evolution_api_url: evolution.url,
      evolution_api_key: evolution.key,
      evolution_instance_name: evolution.instance
    });
  };

  const handleSaveTypebot = async () => {
    await updateSettings({
      typebot_url: typebot.url,
      typebot_name: typebot.name
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <CardTitle>Evolution API</CardTitle>
          </div>
          <CardDescription>Configure o Evolution API para disparar automações via WhatsApp.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL da API</Label>
            <Input 
              value={evolution.url} 
              onChange={(e) => setEvolution({ ...evolution, url: e.target.value })} 
              placeholder="https://api.evolution.com" 
            />
          </div>
          <div className="space-y-2">
            <Label>API Key</Label>
            <Input 
              value={evolution.key} 
              onChange={(e) => setEvolution({ ...evolution, key: e.target.value })} 
              type="password" 
              placeholder="apikey" 
            />
          </div>
          <div className="space-y-2">
            <Label>Nome da Instância</Label>
            <Input 
              value={evolution.instance} 
              onChange={(e) => setEvolution({ ...evolution, instance: e.target.value })} 
              placeholder="oficina_01" 
            />
          </div>
          <Button onClick={handleSaveEvolution} disabled={isUpdating}>
            {isUpdating ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <CardTitle>Typebot</CardTitle>
          </div>
          <CardDescription>Configure o Typebot para criar fluxos de autoatendimento.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL do Servidor</Label>
            <Input 
              value={typebot.url} 
              onChange={(e) => setTypebot({ ...typebot, url: e.target.value })} 
              placeholder="https://typebot.io" 
            />
          </div>
          <div className="space-y-2">
            <Label>Nome do Bot (Slug)</Label>
            <Input 
              value={typebot.name} 
              onChange={(e) => setTypebot({ ...typebot, name: e.target.value })} 
              placeholder="atendimento-oficina" 
            />
          </div>
          <Button onClick={handleSaveTypebot} disabled={isUpdating}>
            {isUpdating ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function TemplatesTab() {
  const templates = [
    { id: 1, name: "Boas-vindas", channel: "WhatsApp", preview: "Olá {{clienteName}}, recebemos seu veículo..." },
    { id: 2, name: "Orçamento aprovado", channel: "WhatsApp", preview: "Seu orçamento de {{valorTotal}} foi aprovado..." },
    { id: 3, name: "Pronto para retirada", channel: "Email", preview: "Olá {{clienteName}}, seu {{modelo}} está pronto..." },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader><CardTitle>Templates</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {templates.map((t) => (
            <button key={t.id} className="w-full rounded-md border p-3 text-left hover:bg-accent">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">{t.name}</span><Badge variant="secondary">{t.channel}</Badge></div>
              <p className="mt-1 truncate text-xs text-muted-foreground">{t.preview}</p>
            </button>
          ))}
        </CardContent>
      </Card>
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Editor</CardTitle><CardDescription>Variáveis: {`{{clienteName}}`}, {`{{placa}}`}, {`{{modelo}}`}, {`{{valorTotal}}`}</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2"><Label>Nome</Label><Input defaultValue="Boas-vindas" /></div>
          <div className="space-y-2"><Label>Mensagem</Label><Textarea rows={6} defaultValue="Olá {{clienteName}}, recebemos seu {{modelo}} (placa {{placa}}). Em breve enviaremos novidades!" /></div>
          <Button onClick={() => toast.success("Template salvo")}>Salvar</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function UsersTab() {
  const { usuarios, isLoading, invite, isInviting, updateUsuario, removeUsuario } = useUsuariosOficina();
  const { usuario: currentUser } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ nome: "", email: "", cargo: "TECNICO" });

  const isAdmin = currentUser?.cargo === "DONO" || currentUser?.cargo === "GERENTE";

  const handleInvite = async () => {
    if (!newUserData.nome || !newUserData.email) return;
    try {
      await invite(newUserData);
      setInviteDialogOpen(false);
      setNewUserData({ nome: "", email: "", cargo: "TECNICO" });
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Equipe da Oficina</CardTitle>
            <CardDescription>Gerencie quem tem acesso ao sistema e seus níveis de permissão.</CardDescription>
          </div>
          {isAdmin && (
            <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
              <UserPlus className="mr-1 h-4 w-4" /> Convidar Usuário
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Status</TableHead>
              {isAdmin && <TableHead className="w-10"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {usuarios.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.nome}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  {isAdmin && u.id !== currentUser?.id ? (
                    <Select 
                      defaultValue={u.cargo || "TECNICO"} 
                      onValueChange={(v) => updateUsuario({ id: u.id, cargo: v })}
                    >
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DONO">Dono</SelectItem>
                        <SelectItem value="GERENTE">Gerente</SelectItem>
                        <SelectItem value="TECNICO">Técnico</SelectItem>
                        <SelectItem value="RECEPCAO">Recepção</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="secondary">{u.cargo}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {isAdmin && u.id !== currentUser?.id ? (
                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={u.ativo ?? false} 
                        onCheckedChange={(checked) => updateUsuario({ id: u.id, ativo: checked })} 
                      />
                      <span className="text-xs">{u.ativo ? "Ativo" : "Inativo"}</span>
                    </div>
                  ) : (
                    <Badge variant={u.ativo ? "default" : "secondary"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
                  )}
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {u.id !== currentUser?.id && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          if (confirm(`Remover ${u.nome} da oficina?`)) {
                            removeUsuario(u.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Convidar Membro</DialogTitle>
            <DialogDescription>
              Enviaremos um convite por e-mail para que a pessoa possa criar sua senha e acessar a oficina.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input 
                id="name" 
                value={newUserData.nome} 
                onChange={(e) => setNewUserData({ ...newUserData, nome: e.target.value })} 
                placeholder="Ex: João Silva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email"
                value={newUserData.email} 
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })} 
                placeholder="exemplo@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select 
                value={newUserData.cargo} 
                onValueChange={(v) => setNewUserData({ ...newUserData, cargo: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DONO">Dono</SelectItem>
                  <SelectItem value="GERENTE">Gerente</SelectItem>
                  <SelectItem value="TECNICO">Técnico</SelectItem>
                  <SelectItem value="RECEPCAO">Recepção</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleInvite} disabled={isInviting || !newUserData.nome || !newUserData.email}>
              {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar Convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
