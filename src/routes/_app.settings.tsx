import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { GripVertical, Trash2, Plus } from "lucide-react";
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
import { useStore, store } from "@/lib/store";
import { toast } from "sonner";

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
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
        </TabsList>
        <TabsContent value="general" className="mt-4"><GeneralTab /></TabsContent>
        <TabsContent value="kanban" className="mt-4"><KanbanTab /></TabsContent>
        <TabsContent value="whatsapp" className="mt-4"><WhatsappTab /></TabsContent>
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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div><CardTitle>Colunas do Kanban</CardTitle><CardDescription>Reordene, edite ou adicione colunas e automações.</CardDescription></div>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Adicionar coluna</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {cols.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-md border bg-card p-3">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
            <span className="flex-1 text-sm font-medium">{c.name}</span>
            <Button variant="outline" size="sm">Automações</Button>
            <Button variant="outline" size="sm">Editar</Button>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Trash2 className="h-4 w-4 text-destructive" /></Button>
          </div>
        ))}
        <Separator className="my-3" />
        <div className="rounded-md border bg-muted/30 p-4">
          <h4 className="mb-2 text-sm font-medium">Exemplo de automação</h4>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div><Label className="text-xs">Trigger</Label><Input defaultValue="Ao Entrar" /></div>
            <div><Label className="text-xs">Ação</Label><Input defaultValue="Enviar WhatsApp" /></div>
            <div><Label className="text-xs">Template</Label><Input defaultValue="Notificação de status" /></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function WhatsappTab() {
  const url = useStore((s) => s.whaticketUrl);
  const [val, setVal] = useState(url);
  const [token, setToken] = useState("");
  const [iframe, setIframe] = useState(true);
  return (
    <Card className="max-w-2xl">
      <CardHeader><CardTitle>Whaticket</CardTitle><CardDescription>Configure a integração com seu Whaticket.</CardDescription></CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2"><Label>URL do Whaticket</Label><Input value={val} onChange={(e) => setVal(e.target.value)} placeholder="http://localhost:3333" /></div>
        <div className="space-y-2"><Label>Token de acesso (opcional)</Label><Input value={token} onChange={(e) => setToken(e.target.value)} type="password" /></div>
        <div className="flex items-center justify-between rounded-md border p-3">
          <div><Label>Abrir em iframe dentro do sistema</Label><p className="text-xs text-muted-foreground">Desative para abrir sempre em nova aba.</p></div>
          <Switch checked={iframe} onCheckedChange={setIframe} />
        </div>
        <Button onClick={() => {
          store.set({ whaticketUrl: val, whaticketConnected: !!val });
          toast.success(val ? "Conexão configurada com sucesso" : "URL removida");
        }}>Salvar e Testar Conexão</Button>
      </CardContent>
    </Card>
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
  const users = [
    { name: "Ana Ribeiro", email: "ana@oficina.com", role: "DONO", active: true },
    { name: "Carlos Mendes", email: "carlos@oficina.com", role: "MECÂNICO", active: true },
    { name: "Bruno Lima", email: "bruno@oficina.com", role: "MECÂNICO", active: true },
    { name: "Júlia Santos", email: "julia@oficina.com", role: "RECEPCIONISTA", active: false },
  ];
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Usuários</CardTitle>
          <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Convidar</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Email</TableHead><TableHead>Cargo</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.email}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Badge variant="secondary">{u.role}</Badge></TableCell>
                <TableCell><Badge variant={u.active ? "default" : "secondary"}>{u.active ? "Ativo" : "Inativo"}</Badge></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
