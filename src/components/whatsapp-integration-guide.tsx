import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, ExternalLink, MessageCircle, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { OficinaAdmin, useAdmin } from "@/hooks/useAdmin";
import { testEvolutionConnection } from "@/lib/evolution.functions";
import { useServerFn } from "@tanstack/react-start";

interface WhatsAppIntegrationGuideProps {
  oficina: OficinaAdmin;
}

export function WhatsAppIntegrationGuide({ oficina }: WhatsAppIntegrationGuideProps) {
  const { editarOficina } = useAdmin();
  const testConn = useServerFn(testEvolutionConnection);

  const [typebotSlug, setTypebotSlug] = useState(oficina.typebot_slug || "");
  const [evolutionUrl, setEvolutionUrl] = useState(oficina.evolution_api_url || "");
  const [evolutionKey, setEvolutionKey] = useState(oficina.evolution_api_key || "");
  const [evolutionInstance, setEvolutionInstance] = useState(oficina.evolution_instance_name || "");
  
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});
  const [connectionStatus, setConnectionStatus] = useState<{
    status: "connected" | "disconnected" | "error" | "idle";
    message?: string;
  }>({ status: "idle" });

  const portalUrl = "https://crmofic.lovable.app";
  const typebotServerUrl = "https://builder.lcrplay.com";
  const managerUrl = "https://wpp.lcrplay.com/manager/";

  const copyToClipboard = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setIsCopied({ ...isCopied, [id]: true });
    toast.success("Copiado!");
    setTimeout(() => {
      setIsCopied((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleSaveField = async (field: "typebot_slug" | "evolution") => {
    setIsSaving(field);
    try {
      const payload: any = { oficina_id: oficina.id };
      if (field === "typebot_slug") {
        payload.typebot_slug = typebotSlug;
      } else {
        payload.evolution_api_url = evolutionUrl;
        payload.evolution_api_key = evolutionKey;
        payload.evolution_instance_name = evolutionInstance;
      }

      await editarOficina(payload);
      toast.success("Configurações salvas!");
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setIsSaving(null);
    }
  };

  const handleTestConnection = async () => {
    if (!evolutionUrl || !evolutionKey || !evolutionInstance) {
      toast.error("Preencha todos os campos da Evolution API primeiro.");
      return;
    }

    setConnectionStatus({ status: "idle" });
    try {
      const result = await testConn({
        data: {
          url: evolutionUrl,
          apiKey: evolutionKey,
          instanceName: evolutionInstance,
        }
      });
      
      setConnectionStatus({ 
        status: result.status as any, 
        message: result.message 
      });

      if (result.status === "connected") {
        toast.success("Conexão estabelecida com sucesso!");
      } else {
        toast.warning(result.message);
      }
    } catch (error: any) {
      setConnectionStatus({ status: "error", message: error.message });
      toast.error("Erro ao testar conexão");
    }
  };

  const steps = [
    {
      id: 1,
      title: "Passo 1 — Typebot",
      instruction: "Clone o fluxo base no Typebot e atualize as 3 variáveis abaixo:",
      isComplete: !!oficina.id && !!oficina.nome,
      content: (
        <div className="space-y-3">
          {[
            { label: "oficina_id", value: oficina.id },
            { label: "oficina_nome", value: oficina.nome },
            { label: "portal_url", value: portalUrl },
          ].map((item) => (
            <div key={item.label} className="space-y-1">
              <Label className="text-xs text-zinc-500">{item.label}</Label>
              <div className="flex gap-2">
                <code className="flex-1 bg-zinc-950 p-2 rounded text-xs text-emerald-400 break-all border border-zinc-800">
                  {item.value}
                </code>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="shrink-0 border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                  onClick={() => copyToClipboard(item.value, item.label)}
                >
                  {isCopied[item.label] ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 2,
      title: "Passo 2 — Typebot (continuação)",
      instruction: "No Typebot, vá em Compartilhar e copie o nome do bot (slug). Cole no campo abaixo e salve.",
      isComplete: !!typebotSlug,
      content: (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-zinc-300">Slug do Typebot</Label>
            <div className="flex gap-2">
              <Input
                value={typebotSlug}
                onChange={(e) => setTypebotSlug(e.target.value)}
                placeholder="ex: atendimento-oficina-x"
                className="border-zinc-700 bg-zinc-800 text-zinc-100"
              />
              <Button 
                onClick={() => handleSaveField("typebot_slug")} 
                disabled={isSaving === "typebot_slug"}
                className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
              >
                {isSaving === "typebot_slug" ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Passo 3 — Evolution API",
      instruction: "Configure as credenciais da Evolution API e verifique a conexão com o WhatsApp.",
      isComplete: connectionStatus.status === "connected",
      content: (
        <div className="space-y-3">
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-zinc-500">URL da API</Label>
              <Input
                value={evolutionUrl}
                onChange={(e) => setEvolutionUrl(e.target.value)}
                placeholder="https://api.seuservidor.com"
                className="text-xs border-zinc-800 bg-zinc-950"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-500">Global API Key</Label>
              <Input
                type="password"
                value={evolutionKey}
                onChange={(e) => setEvolutionKey(e.target.value)}
                placeholder="Sua chave de API"
                className="text-xs border-zinc-800 bg-zinc-950"
              />
            </div>
            <div>
              <Label className="text-xs text-zinc-500">Nome da Instância</Label>
              <Input
                value={evolutionInstance}
                onChange={(e) => setEvolutionInstance(e.target.value)}
                placeholder="oficina-sarandi"
                className="text-xs border-zinc-800 bg-zinc-950"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => handleSaveField("evolution")} 
              disabled={isSaving === "evolution"}
              variant="outline"
              className="flex-1 border-zinc-800 hover:bg-zinc-800"
            >
              {isSaving === "evolution" ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar Dados
            </Button>
            <Button 
              onClick={handleTestConnection}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Verificar Conexão
            </Button>
          </div>

          {connectionStatus.status !== "idle" && (
            <div className={`p-2 rounded border text-xs flex items-center gap-2 ${
              connectionStatus.status === "connected" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              connectionStatus.status === "disconnected" ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
              "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {connectionStatus.status === "connected" ? <Check className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
              {connectionStatus.message || "Status desconhecido"}
            </div>
          )}

          <Button 
            variant="ghost" 
            size="sm"
            className="w-full text-zinc-500 hover:text-zinc-300 text-[10px]"
            onClick={() => window.open(managerUrl, "_blank")}
          >
            Abrir Painel Evolution API <ExternalLink className="ml-1 h-3 w-3" />
          </Button>
        </div>
      )
    },
    {
      id: 4,
      title: "Passo 4 — Conectar Evolution ao Typebot",
      instruction: "Na instância criada no Evolution API, configure o Typebot com a URL do servidor e o slug do bot salvo no passo 2.",
      isComplete: !!typebotSlug && connectionStatus.status === "connected",
      content: (
        <div className="space-y-3">
          {[
            { label: "URL do servidor Typebot", value: typebotServerUrl, id: "server_url" },
            { label: "Slug do bot", value: typebotSlug || "[Aguardando Passo 2]", id: "bot_slug" },
          ].map((item) => (
            <div key={item.id} className="space-y-1">
              <Label className="text-xs text-zinc-500">{item.label}</Label>
              <div className="flex gap-2">
                <code className={`flex-1 bg-zinc-950 p-2 rounded text-xs break-all border border-zinc-800 ${!typebotSlug && item.id === 'bot_slug' ? 'text-zinc-600' : 'text-emerald-400'}`}>
                  {item.value}
                </code>
                <Button 
                  size="icon" 
                  variant="outline" 
                  className="shrink-0 border-zinc-800 bg-zinc-900 hover:bg-zinc-800"
                  disabled={!typebotSlug && item.id === 'bot_slug'}
                  onClick={() => copyToClipboard(item.value, item.id)}
                >
                  {isCopied[item.id] ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-4">
        <MessageCircle className="h-6 w-6 text-emerald-500" />
        <h2 className="text-xl font-bold text-zinc-100">Guia de Integração WhatsApp</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {steps.map((step) => (
          <Card key={step.id} className="border-zinc-800 bg-zinc-900/50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Passo {step.id}</span>
                {step.isComplete ? (
                  <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <Check className="h-3 w-3" /> Concluído
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[10px] font-medium text-zinc-500 bg-zinc-500/10 px-2 py-0.5 rounded-full border border-zinc-500/20">
                    <AlertCircle className="h-3 w-3" /> Pendente
                  </div>
                )}
              </div>
              <CardTitle className="text-lg text-zinc-100">{step.title}</CardTitle>
              <CardDescription className="text-zinc-400 text-sm leading-relaxed">
                {step.instruction}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {step.content}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
