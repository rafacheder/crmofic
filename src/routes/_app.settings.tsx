import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Trash2, Plus, MessageSquare, Bot, Zap, Loader2, UserPlus, Check, X, Pencil, RefreshCw, User as UserIcon, Camera } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useStore, store } from "@/lib/store";
import { toast } from "sonner";
import { ColumnAutomationsDialog } from "@/components/column-automations-dialog";
import { type KanbanColumn } from "@/lib/mock-data";
import { useSettings } from "@/hooks/useSettings";
import { useUsuariosOficina } from "@/hooks/useUsuariosOficina";
import { useAuth } from "@/contexts/AuthContext";
import { testEvolutionConnection } from "@/lib/evolution.functions";
import { useServerFn } from "@tanstack/react-start";
import { cn } from "@/lib/utils";
import { useTemplates, type TemplateMensagem } from "@/hooks/useTemplates";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/settings")({ 
  component: SettingsPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "profile",
    };
  },
});

const days = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

function SettingsPage() {
  const { tab } = Route.useSearch();

  return (
    <>
      <AppHeader title="Configurações" />
      <Tabs defaultValue={tab} className="p-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
          <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="integrations">Integrações</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="mt-4"><ProfileTab /></TabsContent>
        <TabsContent value="general" className="mt-4"><GeneralTab /></TabsContent>
        <TabsContent value="kanban" className="mt-4"><KanbanTab /></TabsContent>
        <TabsContent value="integrations" className="mt-4"><IntegrationsTab /></TabsContent>
        <TabsContent value="templates" className="mt-4"><TemplatesTab /></TabsContent>
        <TabsContent value="users" className="mt-4"><UsersTab /></TabsContent>
      </Tabs>
    </>
  );
}

function ProfileTab() {
  const { usuario, refreshUsuario } = useAuth();
  const [nome, setNome] = useState(usuario?.nome || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (usuario?.nome) setNome(usuario.nome);
  }, [usuario]);

  const handleSave = async () => {
    if (!nome.trim()) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ nome })
        .eq("id", usuario?.id || "");

      if (error) throw error;
      await refreshUsuario();
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 2MB");
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${usuario.id}/${Math.random()}.${fileExt || 'jpg'}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from("usuarios")
        .update({ avatar_url: publicUrl })
        .eq("id", usuario.id);

      if (updateError) throw updateError;

      await refreshUsuario();
      toast.success("Foto de perfil atualizada!");
    } catch (error) {
      toast.error("Erro ao enviar foto");
    } finally {
      setIsUploading(false);
    }
  };

  const getIniciais = (nome: string) => {
    if (!nome) return "??";
    const parts = nome.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0].substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Meu Perfil</CardTitle>
          <CardDescription>Gerencie suas informações pessoais e foto de perfil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-zinc-800">
                {usuario?.avatar_url && <AvatarImage src={usuario.avatar_url} />}
                <AvatarFallback className="bg-zinc-800 text-xl text-zinc-400">
                  {usuario?.nome ? getIniciais(usuario.nome) : "??"}
                </AvatarFallback>
              </Avatar>
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
              >
                {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <Camera className="h-6 w-6 text-white" />}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="font-medium text-slate-800">{usuario?.nome || "Carregando..."}</h3>
              <p className="text-sm text-zinc-500">{usuario?.email}</p>
              <Badge variant="outline" className="mt-1 border-zinc-700 text-zinc-400">
                {usuario?.cargo}
              </Badge>
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome completo</Label>
              <Input 
                id="nome"
                value={nome} 
                onChange={(e) => setNome(e.target.value)} 
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email (não editável)</Label>
              <Input 
                id="email"
                value={usuario?.email || ""} 
                disabled 
                className="bg-muted text-muted-foreground"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving || !nome.trim()}>
            {isSaving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </CardContent>
      </Card>
    </div>
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
  const testConn = useServerFn(testEvolutionConnection);
  const [evolution, setEvolution] = useState({
    url: "",
    key: "",
    instance: ""
  });
  const [typebot, setTypebot] = useState({
    url: "",
    name: ""
  });
  
  const [connStatus, setConnStatus] = useState<"idle" | "testing" | "connected" | "disconnected" | "error">("idle");
  const [connMessage, setConnMessage] = useState("");

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
    setConnStatus("idle");
    setConnMessage("");
  };

  const handleTestEvolution = async () => {
    if (!evolution.url || !evolution.key || !evolution.instance) {
      toast.error("Preencha todos os campos da Evolution API antes de testar");
      return;
    }

    setConnStatus("testing");
    setConnMessage("Testando conexão...");

    try {
      const result = await testConn({ 
        data: {
          url: evolution.url,
          apiKey: evolution.key,
          instanceName: evolution.instance
        }
      });

      setConnStatus(result.status as any);
      setConnMessage(result.message);

      if (result.status === "connected") {
        toast.success(result.message);
      } else if (result.status === "disconnected") {
        toast.warning(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      setConnStatus("error");
      setConnMessage("Erro interno ao testar conexão");
      toast.error("Erro ao processar o teste de conexão");
    }
  };

  const handleSaveTypebot = async () => {
    await updateSettings({
      typebot_url: typebot.url,
      typebot_name: typebot.name
    });
  };

  const StatusDot = ({ status, message }: { status: string, message: string }) => {
    const colors = {
      idle: "bg-muted",
      testing: "bg-primary animate-pulse",
      connected: "bg-success",
      disconnected: "bg-warning",
      error: "bg-destructive"
    };

    const labels = {
      idle: "Não testado",
      testing: "Testando...",
      connected: "Conectado",
      disconnected: "Desconectado",
      error: "Erro"
    };

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help">
              <div className={cn("h-2.5 w-2.5 rounded-full transition-colors", colors[status as keyof typeof colors] || "bg-muted")} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {labels[status as keyof typeof colors] || status}
              </span>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p className="text-xs font-semibold mb-1">{labels[status as keyof typeof colors]}</p>
            <p className="text-xs opacity-90">{message || (status === "idle" ? "Clique em 'Testar conexão' para verificar." : "Sem detalhes disponíveis.")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <CardTitle>Evolution API</CardTitle>
              <StatusDot status={connStatus} message={connMessage} />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleTestEvolution} 
              disabled={connStatus === "testing" || !evolution.url || !evolution.key || !evolution.instance}
              className="h-8 gap-1.5"
            >
              {connStatus === "testing" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              Testar conexão
            </Button>
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
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate, isCreating, isUpdating, isDeleting } = useTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<Partial<TemplateMensagem> | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const handleSave = async () => {
    if (!selectedTemplate?.nome || !selectedTemplate?.conteudo) {
      toast.error("Nome e mensagem são obrigatórios");
      return;
    }

    try {
      if (selectedTemplate.id) {
        await updateTemplate({
          id: selectedTemplate.id,
          nome: selectedTemplate.nome,
          canal: selectedTemplate.canal || "WhatsApp",
          conteudo: selectedTemplate.conteudo,
        });
      } else {
        await createTemplate({
          nome: selectedTemplate.nome,
          canal: selectedTemplate.canal || "WhatsApp",
          conteudo: selectedTemplate.conteudo,
        });
        setSelectedTemplate(null);
      }
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTemplate(id);
      if (selectedTemplate?.id === id) {
        setSelectedTemplate(null);
      }
      setIsDeletingId(null);
    } catch (error) {
      // Erro já tratado no hook
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Templates</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setSelectedTemplate({ nome: "", canal: "WhatsApp", conteudo: "" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 mt-4">
          {templates.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhum template encontrado.
            </div>
          ) : (
            templates.map((t) => (
              <div key={t.id} className="group relative">
                <button 
                  onClick={() => setSelectedTemplate(t)}
                  className={cn(
                    "w-full rounded-md border p-3 text-left hover:bg-accent transition-colors pr-10",
                    selectedTemplate?.id === t.id && "bg-accent border-primary"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium truncate pr-2">{t.nome}</span>
                    <Badge variant="secondary" className="shrink-0">{t.canal}</Badge>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{t.conteudo}</p>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDeletingId(t.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        {!selectedTemplate ? (
          <div className="flex h-full flex-col items-center justify-center py-12 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground/20" />
            <h3 className="mt-4 text-lg font-medium">Editor de Template</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Selecione um template ao lado ou crie um novo para começar.
            </p>
          </div>
        ) : (
          <>
            <CardHeader>
              <CardTitle>{selectedTemplate.id ? "Editar Template" : "Novo Template"}</CardTitle>
              <CardDescription>
                Variáveis: {`{{clienteName}}`}, {`{{placa}}`}, {`{{modelo}}`}, {`{{valorTotal}}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome do Template</Label>
                  <Input 
                    placeholder="Ex: Boas-vindas"
                    value={selectedTemplate.nome || ""} 
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, nome: e.target.value })} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Canal</Label>
                  <Select 
                    value={selectedTemplate.canal || "WhatsApp"}
                    onValueChange={(val) => setSelectedTemplate({ ...selectedTemplate, canal: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                      <SelectItem value="Email">Email</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Mensagem</Label>
                <Textarea 
                  rows={8} 
                  placeholder="Escreva sua mensagem aqui..."
                  value={selectedTemplate.conteudo || ""} 
                  onChange={(e) => setSelectedTemplate({ ...selectedTemplate, conteudo: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={isCreating || isUpdating}
                >
                  {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar Template
                </Button>
              </div>
            </CardContent>
          </>
        )}
      </Card>

      <AlertDialog open={!!isDeletingId} onOpenChange={(open) => !open && setIsDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O template será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => isDeletingId && handleDelete(isDeletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function UsersTab() {
  const { usuarios, isLoading, invite, isInviting, updateUsuario, removeUsuario } = useUsuariosOficina();
  const { usuario: currentUser } = useAuth();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: string, nome: string } | null>(null);
  const [userToEdit, setUserToEdit] = useState<any>(null);
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

  const handleUpdate = async () => {
    if (!userToEdit) return;
    try {
      await updateUsuario({
        id: userToEdit.id,
        nome: userToEdit.nome,
        cargo: userToEdit.cargo,
        ativo: userToEdit.ativo
      });
      setEditDialogOpen(false);
      setUserToEdit(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      await removeUsuario(userToDelete.id);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
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
                  <Badge variant="secondary">{u.cargo}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={u.ativo ? "default" : "secondary"}>{u.ativo ? "Ativo" : "Inativo"}</Badge>
                </TableCell>
                {isAdmin && (
                  <TableCell>
                    {u.id !== currentUser?.id && (
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => {
                            setUserToEdit({ ...u });
                            setEditDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => {
                            setUserToDelete({ id: u.id, nome: u.nome });
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Atualize as informações de acesso e cargo deste membro da equipe.
            </DialogDescription>
          </DialogHeader>
          {userToEdit && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome Completo</Label>
                <Input 
                  id="edit-name" 
                  value={userToEdit.nome} 
                  onChange={(e) => setUserToEdit({ ...userToEdit, nome: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">E-mail</Label>
                <Input 
                  id="edit-email" 
                  value={userToEdit.email} 
                  disabled
                  className="bg-muted"
                />
                <p className="text-[10px] text-muted-foreground">O e-mail não pode ser alterado por aqui.</p>
              </div>
              <div className="space-y-2">
                <Label>Cargo</Label>
                <Select 
                  value={userToEdit.cargo} 
                  onValueChange={(v) => setUserToEdit({ ...userToEdit, cargo: v })}
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
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="user-active">Usuário Ativo</Label>
                <Switch 
                  id="user-active"
                  checked={userToEdit.ativo}
                  onCheckedChange={(checked) => setUserToEdit({ ...userToEdit, ativo: checked })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleUpdate}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{userToDelete?.nome}</strong> da oficina? Esta ação não pode ser desfeita e ele perderá acesso imediato ao sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sim, Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
