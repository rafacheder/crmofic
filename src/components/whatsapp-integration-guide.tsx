import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, ExternalLink, MessageCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { OficinaAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";

interface WhatsAppIntegrationGuideProps {
  oficina: OficinaAdmin;
}

export function WhatsAppIntegrationGuide({ oficina }: WhatsAppIntegrationGuideProps) {
  const [typebotSlug, setTypebotSlug] = useState(oficina.typebot_slug || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isCopied, setIsCopied] = useState<Record<string, boolean>>({});

  const portalUrl = "https://crmofic.lovable.app";
  const typebotServerUrl = "https://builder.lcrplay.com";
  const evolutionApiUrl = "https://evolution.lcrplay.com"; // Assuming a default or placeholder

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied({ ...isCopied, [id]: true });
    toast.success("Copiado para a área de transferência");
    setTimeout(() => {
      setIsCopied((prev) => ({ ...prev, [id]: false }));
    }, 2000);
  };

  const handleSaveSlug = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("oficinas")
        .update({ typebot_slug: typebotSlug })
        .eq("id", oficina.id);

      if (error) throw error;
      toast.success("Slug do Typebot salvo com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao salvar slug: " + error.message);
    } finally {
      setIsSaving(false);
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
                onClick={handleSaveSlug} 
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 shrink-0"
              >
                {isSaving ? "..." : "Salvar"}
              </Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Passo 3 — Evolution API",
      instruction: "Crie uma nova instância no Evolution API com o nome da oficina. Conecte o WhatsApp escaneando o QR Code.",
      isComplete: false, // Cannot verify automatically
      content: (
        <div className="pt-2">
          <Button 
            variant="outline" 
            className="w-full gap-2 border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            onClick={() => window.open(evolutionApiUrl, "_blank")}
          >
            Abrir Painel Evolution API <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      )
    },
    {
      id: 4,
      title: "Passo 4 — Conectar Evolution ao Typebot",
      instruction: "Na instância criada no Evolution API, configure o Typebot com a URL do servidor e o slug do bot salvo no passo 2.",
      isComplete: !!typebotSlug,
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
